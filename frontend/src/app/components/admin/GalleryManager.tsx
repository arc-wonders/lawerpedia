import { useRef, useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Trash2, Upload, Star } from 'lucide-react';
import { apiFetch, apiJson } from '../../api';

interface GalleryImage {
  id: string;
  title: string;
  url: string;
  isFeatured?: boolean;
  createdAt: string;
}

export default function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await apiJson<{ items: GalleryImage[] }>('/api/admin/gallery', { admin: true });
        setImages(res.items);
      } catch (err: any) {
        alert(err?.message || 'Failed to load gallery');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleAdd = async () => {
    const title = prompt('Enter image title:');
    if (!title) return;

    const url = prompt('Enter image URL:');
    if (!url) return;

    try {
      const res = await apiJson<{ item: GalleryImage }>('/api/admin/gallery', {
        method: 'POST',
        body: JSON.stringify({ title, url }),
        admin: true
      });
      setImages(prev => [res.item, ...prev]);
    } catch (err: any) {
      alert(err?.message || 'Failed to add image');
    }
  };

  const handleUpload = async (files: FileList | File[]) => {
    const list = Array.from(files || []);
    if (list.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of list) {
        const form = new FormData();
        form.append('file', file);
        form.append('title', uploadTitle || file.name);

        const res = await apiFetch('/api/admin/gallery/upload', {
          method: 'POST',
          body: form,
          admin: true
        });
        const payload = (await res.json()) as { item: GalleryImage };
        setImages(prev => [payload.item, ...prev]);
      }
      setUploadTitle('');
    } catch (err: any) {
      alert(err?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      try {
        await apiJson(`/api/admin/gallery/${id}`, { method: 'DELETE', admin: true });
        setImages(prev => prev.filter(img => img.id !== id));
      } catch (err: any) {
        alert(err?.message || 'Failed to delete image');
      }
    }
  };

  const toggleFeatured = async (img: GalleryImage) => {
    const next = !img.isFeatured;
    const featuredCount = images.filter(i => i.isFeatured).length;
    if (next && featuredCount >= 4) {
      alert('You can feature only 4 images on the homepage. Unfeature one first.');
      return;
    }

    try {
      const res = await apiJson<{ item: GalleryImage }>(`/api/admin/gallery/${img.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isFeatured: next }),
        admin: true
      });
      setImages(prev => prev.map(i => (i.id === img.id ? res.item : i)));
    } catch (err: any) {
      alert(err?.message || 'Failed to update featured status');
    }
  };

  const featuredCount = images.filter(i => i.isFeatured).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-[#F5F5F5]" style={{ fontFamily: 'Playfair Display, serif' }}>Gallery Management</h2>
          <p className="text-sm text-gray-400 mt-1">Manage event photos and gallery images</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            disabled={isUploading}
            onChange={(e) => {
              const files = e.target.files;
              if (files) handleUpload(files);
              e.target.value = '';
            }}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="group droplet-btn flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg border border-primary/30 shadow-sm hover:bg-primary/90 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed"
            title="Upload photos"
          >
            {isUploading ? (
              <div className="w-5 h-5 rounded-full border-2 border-primary-foreground/70 border-t-transparent animate-spin" />
            ) : (
              <Upload className="w-5 h-5 text-primary-foreground transition-transform group-hover:-translate-y-0.5 group-hover:scale-110" />
            )}
            <span>{isUploading ? 'Uploading…' : 'Upload Photos'}</span>
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black rounded-lg hover:shadow-[0_0_30px_rgba(122,86,46,0.3)] transition-all"
          >
            <Plus className="w-5 h-5" />
            Add by URL
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-xl border border-[#D4AF37]/20 p-4 flex items-center justify-between gap-4">
        <div className="text-sm text-gray-400">
          Homepage featured: <span className="text-[#F5F5F5]">{featuredCount}</span>/4
        </div>
        <div className="text-xs text-gray-500">Use the star on images to choose which 4 show on the landing page.</div>
      </div>

      {/* Upload */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-xl border border-[#D4AF37]/20 p-6">
        <div className="grid sm:grid-cols-3 gap-4 items-end">
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-400 mb-2">Title (optional)</label>
            <input
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37]"
              placeholder="Gallery image title"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Drop / Select</label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (isUploading) return;
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleUpload(e.dataTransfer.files);
                }
              }}
              className="w-full rounded-lg border border-[#D4AF37]/20 bg-[#0A0A0A]/30 px-4 py-3 text-sm text-gray-300"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Upload className="w-4 h-4 text-[#D4AF37]" />
                  <span className="truncate">Drop images here or click Upload</span>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="group droplet-btn px-3 py-1.5 rounded-md border border-primary/30 text-primary hover:bg-primary/10 hover:shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  Choose
                </button>
              </div>
            </div>
            {isUploading && <div className="text-xs text-gray-500 mt-2">Uploading...</div>}
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>Loading gallery...</p>
          </div>
        )}
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-square bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl overflow-hidden border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all"
          >
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/400?text=Image+Not+Found';
              }}
            />

            <button
              onClick={() => toggleFeatured(image)}
              className={`absolute top-3 left-3 z-10 p-2 rounded-lg backdrop-blur-md border transition-all ${
                image.isFeatured
                  ? 'bg-[#D4AF37]/25 border-[#D4AF37]/40 text-[#D4AF37]'
                  : 'bg-black/30 border-white/15 text-white/80 hover:text-white'
              }`}
              title={image.isFeatured ? 'Featured on homepage' : 'Not featured'}
            >
              <Star className={`w-4 h-4 ${image.isFeatured ? 'fill-current' : ''}`} />
            </button>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
              <p className="text-white text-sm mb-3 line-clamp-2">{image.title}</p>
              <button
                onClick={() => handleDelete(image.id)}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-all text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}

        {images.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No images in gallery. Click "Upload Photos" to add some.</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-xl border border-[#D4AF37]/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Total Images</p>
            <p className="text-3xl text-[#F5F5F5]" style={{ fontFamily: 'Playfair Display, serif' }}>{images.length}</p>
          </div>
          <ImageIcon className="w-10 h-10 text-[#D4AF37]/30" />
        </div>
      </div>
    </div>
  );
}
