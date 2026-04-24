import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, BookOpen, ChevronRight } from 'lucide-react';
import { apiJson } from './api';

type ArticleKind = 'article' | 'update';

interface ArticleItem {
  id: string;
  title: string;
  summary?: string;
  kind?: ArticleKind;
  thumbnailUrl?: string | null;
  externalUrl?: string | null;
  createdAt?: string;
}

export default function ArticlesPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ArticleItem[]>([]);
  const [filter, setFilter] = useState<'all' | ArticleKind>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await apiJson<{ items: ArticleItem[] }>('/api/articles');
        setItems(res.items || []);
      } catch {
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter(i => (i.kind || 'article') === filter);
  }, [items, filter]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>
              Articles & Updates
            </h1>
            <p className="text-sm text-muted-foreground">All posts from LawyerPedia</p>
          </div>
          <Link to="/" className="text-sm text-primary hover:underline">Back to Home</Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg border transition-all ${
              filter === 'all' ? 'bg-primary text-primary-foreground border-primary/30' : 'bg-card border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('article')}
            className={`px-4 py-2 rounded-lg border transition-all ${
              filter === 'article' ? 'bg-primary text-primary-foreground border-primary/30' : 'bg-card border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            Articles
          </button>
          <button
            onClick={() => setFilter('update')}
            className={`px-4 py-2 rounded-lg border transition-all ${
              filter === 'update' ? 'bg-primary text-primary-foreground border-primary/30' : 'bg-card border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            Updates
          </button>
        </div>

        {isLoading && (
          <div className="py-16 text-center text-muted-foreground">
            Loading...
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            No posts yet.
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((a) => {
            const Icon = (a.kind || 'article') === 'update' ? Bell : BookOpen;
            const date = a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
            return (
              <div key={a.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all">
                {a.thumbnailUrl && (
                  <div className="h-40 bg-muted">
                    <img src={a.thumbnailUrl} alt={a.title} className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Icon className="w-4 h-4 text-primary/70" />
                    <span>{(a.kind || 'article') === 'update' ? 'Update' : 'Article'}</span>
                    {date && <span className="ml-auto">{date}</span>}
                  </div>
                  <h3 className="text-lg text-foreground mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {a.title}
                  </h3>
                  {a.summary && <p className="text-sm text-muted-foreground mb-4">{a.summary}</p>}
                  <button
                    onClick={() => {
                      if (a.externalUrl) window.open(a.externalUrl, '_blank', 'noopener,noreferrer');
                      else navigate(`/articles/${a.id}`);
                    }}
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1.5"
                  >
                    View <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

