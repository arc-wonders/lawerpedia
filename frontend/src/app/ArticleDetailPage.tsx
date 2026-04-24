import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { apiJson } from './api';

type ArticleKind = 'article' | 'update';

interface ArticleItem {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  kind?: ArticleKind;
  thumbnailUrl?: string | null;
  externalUrl?: string | null;
  createdAt?: string;
}

export default function ArticleDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState<ArticleItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await apiJson<{ item: ArticleItem }>(`/api/articles/${id}`);
        setItem(res.item);
      } catch {
        setItem(null);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-muted-foreground">Not found.</p>
          <Link to="/articles" className="text-primary hover:underline">Back to all updates</Link>
        </div>
      </div>
    );
  }

  const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <Link to="/articles" className="text-sm text-primary hover:underline">All updates</Link>
          <Link to="/" className="text-sm text-primary hover:underline">Home</Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {item.thumbnailUrl && (
          <div className="h-56 sm:h-72 rounded-2xl overflow-hidden border border-border bg-muted mb-6">
            <img src={item.thumbnailUrl} alt={item.title} className="h-full w-full object-cover" />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
          <span className="px-2 py-0.5 rounded-full border border-border bg-card">
            {(item.kind || 'article') === 'update' ? 'Update' : 'Article'}
          </span>
          {date && <span>{date}</span>}
        </div>

        <h1 className="text-3xl sm:text-4xl mb-3" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>
          {item.title}
        </h1>
        {item.summary && <p className="text-muted-foreground mb-6">{item.summary}</p>}

        {item.externalUrl && (
          <a
            href={item.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 border border-primary/30 rounded-lg text-primary hover:bg-primary/10 transition-all mb-6"
          >
            <ExternalLink className="w-4 h-4" />
            Open external link
          </a>
        )}

        {item.content ? (
          <div className="space-y-4">
            {item.content.split('\n').map((line, idx) => (
              <p key={idx} className="text-foreground leading-relaxed">
                {line || '\u00A0'}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No content.</p>
        )}
      </div>
    </div>
  );
}
