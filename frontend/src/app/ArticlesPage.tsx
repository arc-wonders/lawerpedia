import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import { articles } from './articlesData';

export default function ArticlesPage() {
  const navigate = useNavigate();
  const [_filter] = useState<'all'>('all');

  const filtered = useMemo(() => articles, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>
              Articles
            </h1>
            <p className="text-sm text-muted-foreground">Legal insights from TheLawyerpedia</p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-primary hover:underline">Back to Home</Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            No articles yet.
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((a) => {
            const date = new Date(a.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            return (
              <div key={a.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all">
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <BookOpen className="w-4 h-4 text-primary/70" />
                    <span>Article</span>
                    <span className="ml-auto">{date}</span>
                  </div>
                  <h3 className="text-lg text-foreground mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {a.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{a.summary}</p>
                  <button
                    onClick={() => navigate(`/articles/${a.id}`)}
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1.5"
                  >
                    Read Article <ChevronRight className="w-4 h-4" />
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
