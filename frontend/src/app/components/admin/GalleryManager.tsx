import { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Trash2, Upload } from 'lucide-react';

interface GalleryImage {
  id: number;
  title: string;
  url: string;
  createdAt: string;
}

export default function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    // Load from localStorage (temporary until Supabase is connected)
    const stored = localStorage.getItem('lawyerpedia_gallery');
    if (stored) {
      setImages(JSON.parse(stored));
    }
  }, []);

  const saveImages = (updated: GalleryImage[]) => {
    setImages(updated);
    localStorage.setItem('lawyerpedia_gallery', JSON.stringify(updated));
  };

  const handleAdd = () => {
    const title = prompt('Enter image title:');
    if (!title) return;

    const url = prompt('Enter image URL:');
    if (!url) return;

    const newImage: GalleryImage = {
      id: Date.now(),
      title,
      url,
      createdAt: new Date().toISOString()
    };

    saveImages([...images, newImage]);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this image?')) {
      saveImages(images.filter(img => img.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-[#F5F5F5]" style={{ fontFamily: 'Playfair Display, serif' }}>Gallery Management</h2>
          <p className="text-sm text-gray-400 mt-1">Manage event photos and gallery images</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black rounded-lg hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Image
        </button>
      </div>

      {/* Note about Supabase Storage */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Upload className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-blue-400 mb-1">Image Upload Feature</p>
            <p className="text-gray-400">
              Connect Supabase to enable direct image uploads with automatic storage. Currently using external image URLs.
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
            <p>No images in gallery. Click "Add Image" to upload one.</p>
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
