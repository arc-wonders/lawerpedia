import { Link, useParams } from 'react-router-dom';
import { articles } from './articlesData';

export default function ArticleDetailPage() {
  const { id } = useParams();
  const item = articles.find((a) => a.id === id);

  if (!item) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-muted-foreground">Article not found.</p>
          <Link to="/articles" className="text-primary hover:underline">Back to all articles</Link>
        </div>
      </div>
    );
  }

  const date = new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <Link to="/articles" className="text-sm text-primary hover:underline">All Articles</Link>
          <Link to="/" className="text-sm text-primary hover:underline">Home</Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
          <span className="px-2 py-0.5 rounded-full border border-border bg-card">Article</span>
          <span>{date}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl mb-3" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>
          {item.title}
        </h1>
        <p className="text-muted-foreground mb-6">{item.summary}</p>

        <div className="space-y-4">
          {item.content.split('\n').map((line, idx) => (
            <p key={idx} className="text-foreground leading-relaxed">
              {line || ' '}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
