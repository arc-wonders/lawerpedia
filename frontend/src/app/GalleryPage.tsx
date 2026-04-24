import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Image as ImageIcon } from 'lucide-react';
import { apiJson } from './api';

interface GalleryImage {
  id: string;
  title: string;
  url: string;
  isFeatured?: boolean;
  createdAt: string;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFeaturedFirst, setShowFeaturedFirst] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await apiJson<{ items: GalleryImage[] }>('/api/gallery');
        setItems(res.items || []);
      } catch {
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const ordered = useMemo(() => {
    if (!showFeaturedFirst) return items;
    const featured = items.filter(i => i.isFeatured);
    const rest = items.filter(i => !i.isFeatured);
    return [...featured, ...rest];
  }, [items, showFeaturedFirst]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>
              Gallery
            </h1>
            <p className="text-sm text-muted-foreground">All photos</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFeaturedFirst(v => !v)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                showFeaturedFirst ? 'bg-primary text-primary-foreground border-primary/30' : 'bg-card border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              Featured first
            </button>
            <Link to="/" className="text-sm text-primary hover:underline">Back to Home</Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && <div className="py-16 text-center text-muted-foreground">Loading...</div>}

        {!isLoading && ordered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
            No photos yet.
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {ordered.map((img) => (
            <div
              key={img.id}
              className="group aspect-square bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all"
              title={img.title}
            >
              <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

