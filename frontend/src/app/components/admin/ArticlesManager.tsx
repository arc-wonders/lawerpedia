import { useEffect, useState } from 'react';
import { FileText, Plus, Trash2, Edit3, ExternalLink, X, Save } from 'lucide-react';
import { apiJson } from '../../api';

type ArticleKind = 'article' | 'update';
type ArticleStatus = 'published' | 'draft';

interface ArticleItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  kind: ArticleKind;
  status: ArticleStatus;
  thumbnailUrl?: string | null;
  externalUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const emptyDraft: Omit<ArticleItem, 'id'> = {
  title: '',
  summary: '',
  content: '',
  kind: 'article',
  status: 'published',
  thumbnailUrl: '',
  externalUrl: ''
};

export default function ArticlesManager() {
  const [items, setItems] = useState<ArticleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Omit<ArticleItem, 'id'>>(emptyDraft);

  const isEditing = editingId !== null;
  const editingTitle = isEditing ? 'Edit Article' : 'Add Article';

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await apiJson<{ items: ArticleItem[] }>('/api/admin/articles', { admin: true });
      setItems(res.items || []);
    } catch (err: any) {
      alert(err?.message || 'Failed to load articles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startAdd = () => {
    setEditingId(null);
    setDraft(emptyDraft);
    setIsEditorOpen(true);
  };

  const startEdit = (item: ArticleItem) => {
    setEditingId(item.id);
    setDraft({
      title: item.title || '',
      summary: item.summary || '',
      content: item.content || '',
      kind: item.kind || 'article',
      status: item.status || 'published',
      thumbnailUrl: item.thumbnailUrl || '',
      externalUrl: item.externalUrl || ''
    });
    setIsEditorOpen(true);
  };

  const cancel = () => {
    setIsEditorOpen(false);
    setEditingId(null);
    setDraft(emptyDraft);
  };

  const save = async () => {
    if (!draft.title.trim()) {
      alert('Title is required');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...draft,
        thumbnailUrl: draft.thumbnailUrl?.trim() || null,
        externalUrl: draft.externalUrl?.trim() || null,
        summary: draft.summary || '',
        content: draft.content || ''
      };

      if (isEditing && editingId) {
        const res = await apiJson<{ item: ArticleItem }>(`/api/admin/articles/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
          admin: true
        });
        setItems(prev => prev.map(i => (i.id === editingId ? res.item : i)));
      } else {
        const res = await apiJson<{ item: ArticleItem }>(`/api/admin/articles`, {
          method: 'POST',
          body: JSON.stringify(payload),
          admin: true
        });
        setItems(prev => [res.item, ...prev]);
      }

      cancel();
    } catch (err: any) {
      alert(err?.message || 'Failed to save article');
    } finally {
      setIsSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    try {
      await apiJson(`/api/admin/articles/${id}`, { method: 'DELETE', admin: true });
      setItems(prev => prev.filter(i => i.id !== id));
      if (editingId === id) cancel();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete article');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-[#F5F5F5]" style={{ fontFamily: 'Playfair Display, serif' }}>Articles</h2>
          <p className="text-sm text-gray-400 mt-1">Create and manage articles & updates shown on the site</p>
        </div>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black rounded-lg hover:shadow-[0_0_30px_rgba(122,86,46,0.3)] transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Article
        </button>
      </div>

      {/* Editor */}
      {isEditorOpen && (
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg text-[#F5F5F5]" style={{ fontFamily: 'Playfair Display, serif' }}>{editingTitle}</h3>
            <button
              onClick={cancel}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-[#F5F5F5] transition-colors"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Title *</label>
              <input
                value={draft.title}
                onChange={(e) => setDraft(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37]"
                placeholder="Article title"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Kind</label>
              <select
                value={draft.kind}
                onChange={(e) => setDraft(prev => ({ ...prev, kind: e.target.value as ArticleKind }))}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="article">Article</option>
                <option value="update">Update</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Status</label>
              <select
                value={draft.status}
                onChange={(e) => setDraft(prev => ({ ...prev, status: e.target.value as ArticleStatus }))}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Summary</label>
              <textarea
                value={draft.summary}
                onChange={(e) => setDraft(prev => ({ ...prev, summary: e.target.value }))}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37] min-h-[90px]"
                placeholder="Short summary (shown on cards)"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Content</label>
              <textarea
                value={draft.content}
                onChange={(e) => setDraft(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37] min-h-[160px]"
                placeholder="Full content (plain text for now)"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Thumbnail URL (optional)</label>
              <input
                value={draft.thumbnailUrl || ''}
                onChange={(e) => setDraft(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37]"
                placeholder="https://..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">External URL (optional)</label>
              <input
                value={draft.externalUrl || ''}
                onChange={(e) => setDraft(prev => ({ ...prev, externalUrl: e.target.value }))}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37]"
                placeholder="If set, clicking will open this link"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={save}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black rounded-lg hover:shadow-[0_0_30px_rgba(122,86,46,0.3)] transition-all disabled:opacity-60"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={cancel}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-black/20 text-gray-300 rounded-lg border border-white/10 hover:border-white/20 transition-all"
            >
              <X className="w-5 h-5" />
              Close
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {isLoading && (
          <div className="text-center py-12 text-gray-400">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>Loading articles...</p>
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No articles yet.</p>
          </div>
        )}

        {items.map((a) => (
          <div
            key={a.id}
            className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-xl border border-[#D4AF37]/20 p-5 hover:border-[#D4AF37]/40 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[#F5F5F5]" style={{ fontFamily: 'Playfair Display, serif' }}>{a.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full border border-[#D4AF37]/20 text-gray-300">
                    {a.kind}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    a.status === 'published' ? 'border-green-500/30 text-green-300' : 'border-yellow-500/30 text-yellow-300'
                  }`}>
                    {a.status}
                  </span>
                  {a.externalUrl && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                      <ExternalLink className="w-3 h-3" />
                      external
                    </span>
                  )}
                </div>
                {a.summary && <p className="text-sm text-gray-400">{a.summary}</p>}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => startEdit(a)}
                  className="p-2 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-all"
                  title="Edit"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => del(a.id)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
