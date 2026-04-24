import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Calendar, Users, MapPin, Clock, FileDown, ClipboardList, GripVertical, Eye, Images, Star, Upload } from 'lucide-react';
import { apiFetch, apiJson, downloadBlob } from '../../api';

interface Conclave {
  id?: string;
  title: string;
  date: string;
  status: 'upcoming' | 'past';
  attendees: string;
  description: string;
  fullDescription: string;
  highlights: string[];
  venue: string;
  time: string;
}

type ConclaveFormFieldType = 'text' | 'email' | 'phone' | 'textarea' | 'select';

interface ConclaveFormField {
  key: string;
  label: string;
  type: ConclaveFormFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface ConclaveForm {
  enabled: boolean;
  title?: string;
  description?: string;
  fields: ConclaveFormField[];
}

interface ConclaveSubmission {
  id: string;
  createdAt: string;
  answers: Record<string, any>;
}

interface ConclaveImageItem {
  id: string;
  mediaId: string;
  url: string;
  isThumbnail: boolean;
  createdAt: string;
}

export default function ConclavesManager() {
  const [conclaves, setConclaves] = useState<Conclave[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingConclave, setEditingConclave] = useState<Conclave | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isFormEditing, setIsFormEditing] = useState(false);
  const [formConclave, setFormConclave] = useState<Conclave | null>(null);
  const [formDraft, setFormDraft] = useState<ConclaveForm | null>(null);
  const [isFormSaving, setIsFormSaving] = useState(false);

  const [isViewingRegs, setIsViewingRegs] = useState(false);
  const [regsConclave, setRegsConclave] = useState<Conclave | null>(null);
  const [regs, setRegs] = useState<ConclaveSubmission[]>([]);
  const [isRegsLoading, setIsRegsLoading] = useState(false);

  const [isImagesEditing, setIsImagesEditing] = useState(false);
  const [imagesConclave, setImagesConclave] = useState<Conclave | null>(null);
  const [images, setImages] = useState<ConclaveImageItem[]>([]);
  const [isImagesLoading, setIsImagesLoading] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await apiJson<{ items: Conclave[] }>('/api/admin/conclaves', { admin: true });
        setConclaves(res.items);
      } catch (err: any) {
        alert(err?.message || 'Failed to load conclaves');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleAdd = () => {
    const newConclave: Conclave = {
      title: '',
      date: '',
      status: 'upcoming',
      attendees: '',
      description: '',
      fullDescription: '',
      highlights: [''],
      venue: '',
      time: ''
    };
    setEditingConclave(newConclave);
    setIsEditing(true);
  };

  const handleEdit = (conclave: Conclave) => {
    setEditingConclave({ ...conclave });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editingConclave) return;

    setIsSaving(true);
    try {
      const payload = {
        title: editingConclave.title,
        date: editingConclave.date,
        status: editingConclave.status,
        attendees: editingConclave.attendees,
        description: editingConclave.description,
        fullDescription: editingConclave.fullDescription,
        highlights: editingConclave.highlights,
        venue: editingConclave.venue,
        time: editingConclave.time
      };

      if (editingConclave.id) {
        const res = await apiJson<{ item: Conclave }>(`/api/admin/conclaves/${editingConclave.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
          admin: true
        });
        setConclaves(prev => prev.map(c => (c.id === editingConclave.id ? res.item : c)));
      } else {
        const res = await apiJson<{ item: Conclave }>('/api/admin/conclaves', {
          method: 'POST',
          body: JSON.stringify(payload),
          admin: true
        });
        setConclaves(prev => [res.item, ...prev]);
      }

      setIsEditing(false);
      setEditingConclave(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to save conclave');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (confirm('Are you sure you want to delete this conclave?')) {
      try {
        await apiJson(`/api/admin/conclaves/${id}`, { method: 'DELETE', admin: true });
        setConclaves(prev => prev.filter(c => c.id !== id));
      } catch (err: any) {
        alert(err?.message || 'Failed to delete conclave');
      }
    }
  };

  const openFormEditor = async (conclave: Conclave) => {
    if (!conclave.id) return;
    setIsFormEditing(true);
    setFormConclave(conclave);
    setFormDraft(null);

    try {
      const res = await apiJson<{ form: any }>(`/api/admin/conclaves/${conclave.id}/form`, { admin: true });
      const form = res.form;
      if (form) {
        setFormDraft({
          enabled: !!form.enabled,
          title: form.title || '',
          description: form.description || '',
          fields: Array.isArray(form.fields) ? form.fields : []
        });
      } else {
        setFormDraft({
          enabled: true,
          title: 'Event Registration',
          description: 'Register for this event by filling the form below.',
          fields: [
            { key: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter your name' },
            { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@example.com' },
            { key: 'phone', label: 'Phone', type: 'phone', required: true, placeholder: '+91 98765 43210' }
          ]
        });
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to load conclave form');
      setIsFormEditing(false);
      setFormConclave(null);
    }
  };

  const saveForm = async () => {
    if (!formConclave?.id || !formDraft) return;
    setIsFormSaving(true);
    try {
      const payload = {
        enabled: formDraft.enabled,
        title: formDraft.title,
        description: formDraft.description,
        fields: formDraft.fields.map(f => ({
          key: f.key,
          label: f.label,
          type: f.type,
          required: !!f.required,
          placeholder: f.placeholder || null,
          options: f.type === 'select' ? (f.options || []).filter(Boolean) : []
        }))
      };
      await apiJson(`/api/admin/conclaves/${formConclave.id}/form`, {
        method: 'PUT',
        body: JSON.stringify(payload),
        admin: true
      });
      setIsFormEditing(false);
      setFormConclave(null);
      setFormDraft(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to save form');
    } finally {
      setIsFormSaving(false);
    }
  };

  const exportSubmissionsCsv = async (conclave: Conclave) => {
    if (!conclave.id) return;
    try {
      const res = await apiFetch(`/api/admin/conclaves/${conclave.id}/submissions.csv`, { admin: true });
      const blob = await res.blob();
      const safeTitle = (conclave.title || 'conclave').replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '');
      downloadBlob(blob, `${safeTitle}_submissions.csv`);
    } catch (err: any) {
      alert(err?.message || 'Failed to export CSV');
    }
  };

  const openRegistrations = async (conclave: Conclave) => {
    if (!conclave.id) return;
    setIsViewingRegs(true);
    setRegsConclave(conclave);
    setRegs([]);
    setIsRegsLoading(true);
    try {
      const res = await apiJson<{ items: ConclaveSubmission[] }>(`/api/admin/conclaves/${conclave.id}/submissions`, { admin: true });
      setRegs(res.items || []);
    } catch (err: any) {
      alert(err?.message || 'Failed to load registrations');
      setIsViewingRegs(false);
      setRegsConclave(null);
    } finally {
      setIsRegsLoading(false);
    }
  };

  const openImages = async (conclave: Conclave) => {
    if (!conclave.id) return;
    setIsImagesEditing(true);
    setImagesConclave(conclave);
    setImages([]);
    setIsImagesLoading(true);
    try {
      const res = await apiJson<{ items: ConclaveImageItem[] }>(`/api/admin/conclaves/${conclave.id}/images`, { admin: true });
      setImages(res.items || []);
    } catch (err: any) {
      alert(err?.message || 'Failed to load conclave images');
      setIsImagesEditing(false);
      setImagesConclave(null);
    } finally {
      setIsImagesLoading(false);
    }
  };

  const uploadImage = async (file: File, setThumbnail: boolean) => {
    if (!imagesConclave?.id) return;
    setIsImageUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('set_thumbnail', setThumbnail ? 'true' : 'false');

      const res = await apiFetch(`/api/admin/conclaves/${imagesConclave.id}/images`, {
        method: 'POST',
        body: form,
        admin: true
      });
      const payload = (await res.json()) as { item: ConclaveImageItem };
      setImages(prev => [payload.item, ...prev]);
    } catch (err: any) {
      alert(err?.message || 'Failed to upload image');
    } finally {
      setIsImageUploading(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    if (!imagesConclave?.id) return;
    if (!confirm('Delete this image?')) return;
    try {
      await apiJson(`/api/admin/conclaves/${imagesConclave.id}/images/${imageId}`, { method: 'DELETE', admin: true });
      setImages(prev => prev.filter(i => i.id !== imageId));
    } catch (err: any) {
      alert(err?.message || 'Failed to delete image');
    }
  };

  const setThumbnail = async (imageId: string) => {
    if (!imagesConclave?.id) return;
    try {
      await apiJson(`/api/admin/conclaves/${imagesConclave.id}/images/${imageId}/thumbnail`, { method: 'POST', admin: true });
      setImages(prev => prev.map(i => ({ ...i, isThumbnail: i.id === imageId })));
    } catch (err: any) {
      alert(err?.message || 'Failed to set thumbnail');
    }
  };

  const handleHighlightChange = (index: number, value: string) => {
    if (!editingConclave) return;
    const newHighlights = [...editingConclave.highlights];
    newHighlights[index] = value;
    setEditingConclave({ ...editingConclave, highlights: newHighlights });
  };

  const addHighlight = () => {
    if (!editingConclave) return;
    setEditingConclave({ ...editingConclave, highlights: [...editingConclave.highlights, ''] });
  };

  const removeHighlight = (index: number) => {
    if (!editingConclave) return;
    setEditingConclave({ ...editingConclave, highlights: editingConclave.highlights.filter((_, i) => i !== index) });
  };

  if (isEditing && editingConclave) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl text-[#F5F5F5]" style={{ fontFamily: 'Playfair Display, serif' }}>
            {editingConclave.id ? 'Edit' : 'Add'} Conclave
          </h2>
          <button
            onClick={() => { setIsEditing(false); setEditingConclave(null); }}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-[#F5F5F5] transition-colors"
          >
            <X className="w-5 h-5" />
            Cancel
          </button>
        </div>

        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 p-6 sm:p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Title *</label>
              <input
                type="text"
                value={editingConclave.title}
                onChange={(e) => setEditingConclave({ ...editingConclave, title: e.target.value })}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37]"
                placeholder="Event title"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Date *</label>
              <input
                type="text"
                value={editingConclave.date}
                onChange={(e) => setEditingConclave({ ...editingConclave, date: e.target.value })}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37]"
                placeholder="e.g., June 15, 2026"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Status *</label>
              <select
                value={editingConclave.status}
                onChange={(e) => setEditingConclave({ ...editingConclave, status: e.target.value as 'upcoming' | 'past' })}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Attendees *</label>
              <input
                type="text"
                value={editingConclave.attendees}
                onChange={(e) => setEditingConclave({ ...editingConclave, attendees: e.target.value })}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37]"
                placeholder="e.g., 500+ or Expected 600+"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Venue *</label>
              <input
                type="text"
                value={editingConclave.venue}
                onChange={(e) => setEditingConclave({ ...editingConclave, venue: e.target.value })}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37]"
                placeholder="Event venue"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Time *</label>
              <input
                type="text"
                value={editingConclave.time}
                onChange={(e) => setEditingConclave({ ...editingConclave, time: e.target.value })}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37]"
                placeholder="e.g., 9:00 AM - 6:00 PM"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Short Description *</label>
            <textarea
              value={editingConclave.description}
              onChange={(e) => setEditingConclave({ ...editingConclave, description: e.target.value })}
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37] resize-none"
              rows={2}
              placeholder="Brief description for card"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Full Description *</label>
            <textarea
              value={editingConclave.fullDescription}
              onChange={(e) => setEditingConclave({ ...editingConclave, fullDescription: e.target.value })}
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37] resize-none"
              rows={4}
              placeholder="Detailed description for event page"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-gray-400">Highlights</label>
              <button
                onClick={addHighlight}
                className="text-sm text-[#D4AF37] hover:text-[#F4D03F] transition-colors"
              >
                + Add Highlight
              </button>
            </div>
            <div className="space-y-3">
              {editingConclave.highlights.map((highlight, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) => handleHighlightChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37]"
                    placeholder="Event highlight"
                  />
                  {editingConclave.highlights.length > 1 && (
                    <button
                      onClick={() => removeHighlight(index)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black rounded-lg hover:shadow-[0_0_30px_rgba(122,86,46,0.3)] transition-all"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save Conclave'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isFormEditing && formConclave) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl text-[#F5F5F5]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Registration Form
            </h2>
            <p className="text-sm text-gray-400 mt-1">Customize the form for: {formConclave.title}</p>
          </div>
          <button
            onClick={() => { setIsFormEditing(false); setFormConclave(null); setFormDraft(null); }}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-[#F5F5F5] transition-colors"
          >
            <X className="w-5 h-5" />
            Close
          </button>
        </div>

        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 p-6 sm:p-8 space-y-6">
          {!formDraft ? (
            <div className="text-gray-400">Loading form...</div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formDraft.enabled}
                  onChange={(e) => setFormDraft({ ...formDraft, enabled: e.target.checked })}
                />
                <span className="text-gray-300 text-sm">Enable registration form</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Form Title</label>
                  <input
                    type="text"
                    value={formDraft.title || ''}
                    onChange={(e) => setFormDraft({ ...formDraft, title: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Form Description</label>
                  <input
                    type="text"
                    value={formDraft.description || ''}
                    onChange={(e) => setFormDraft({ ...formDraft, description: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg text-[#F5F5F5]" style={{ fontFamily: 'Playfair Display, serif' }}>Fields</h3>
                  <button
                    onClick={() => {
                      const nextIndex = (formDraft.fields.length + 1);
                      const key = `field_${nextIndex}`;
                      setFormDraft({
                        ...formDraft,
                        fields: [
                          ...formDraft.fields,
                          { key, label: `Field ${nextIndex}`, type: 'text', required: false, placeholder: '' }
                        ]
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0A0A0A] text-gray-300 rounded-lg border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Field
                  </button>
                </div>

                <div className="space-y-3">
                  {formDraft.fields.map((field, idx) => (
                    <div key={`${field.key}-${idx}`} className="bg-[#0A0A0A] border border-[#D4AF37]/10 rounded-xl p-4 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 text-gray-500">
                          <GripVertical className="w-4 h-4" />
                          <span className="text-xs">Field</span>
                        </div>
                        <button
                          onClick={() => setFormDraft({ ...formDraft, fields: formDraft.fields.filter((_, i) => i !== idx) })}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Key (unique)</label>
                          <input
                            type="text"
                            value={field.key}
                            onChange={(e) => {
                              const fields = [...formDraft.fields];
                              fields[idx] = { ...field, key: e.target.value };
                              setFormDraft({ ...formDraft, fields });
                            }}
                            className="w-full px-3 py-2 bg-black/20 border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37] text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Label</label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => {
                              const fields = [...formDraft.fields];
                              fields[idx] = { ...field, label: e.target.value };
                              setFormDraft({ ...formDraft, fields });
                            }}
                            className="w-full px-3 py-2 bg-black/20 border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37] text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Type</label>
                          <select
                            value={field.type}
                            onChange={(e) => {
                              const type = e.target.value as ConclaveFormFieldType;
                              const fields = [...formDraft.fields];
                              fields[idx] = { ...field, type, options: type === 'select' ? (field.options || ['Option 1']) : [] };
                              setFormDraft({ ...formDraft, fields });
                            }}
                            className="w-full px-3 py-2 bg-black/20 border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37] text-sm"
                          >
                            <option value="text">Text</option>
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                            <option value="textarea">Textarea</option>
                            <option value="select">Select</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Placeholder</label>
                          <input
                            type="text"
                            value={field.placeholder || ''}
                            onChange={(e) => {
                              const fields = [...formDraft.fields];
                              fields[idx] = { ...field, placeholder: e.target.value };
                              setFormDraft({ ...formDraft, fields });
                            }}
                            className="w-full px-3 py-2 bg-black/20 border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37] text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <label className="flex items-center gap-2 text-sm text-gray-400">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => {
                              const fields = [...formDraft.fields];
                              fields[idx] = { ...field, required: e.target.checked };
                              setFormDraft({ ...formDraft, fields });
                            }}
                          />
                          Required
                        </label>

                        {field.type === 'select' && (
                          <div className="flex-1 min-w-[240px]">
                            <label className="block text-xs text-gray-500 mb-1">Options (comma-separated)</label>
                            <input
                              type="text"
                              value={(field.options || []).join(', ')}
                              onChange={(e) => {
                                const options = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                const fields = [...formDraft.fields];
                                fields[idx] = { ...field, options };
                                setFormDraft({ ...formDraft, fields });
                              }}
                              className="w-full px-3 py-2 bg-black/20 border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37] text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {formDraft.fields.length === 0 && (
                    <div className="text-sm text-gray-400">No fields. Add a field to start.</div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={saveForm}
                  disabled={isFormSaving}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black rounded-lg hover:shadow-[0_0_30px_rgba(122,86,46,0.3)] transition-all disabled:opacity-60"
                >
                  <Save className="w-5 h-5" />
                  {isFormSaving ? 'Saving...' : 'Save Form'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (isViewingRegs && regsConclave) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl text-[#F5F5F5]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Registrations
            </h2>
            <p className="text-sm text-gray-400 mt-1">{regsConclave.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportSubmissionsCsv(regsConclave)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0A0A0A] text-gray-300 rounded-lg border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all text-sm"
              title="Export submissions (CSV)"
            >
              <FileDown className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => { setIsViewingRegs(false); setRegsConclave(null); setRegs([]); }}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-[#F5F5F5] transition-colors"
            >
              <X className="w-5 h-5" />
              Close
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 p-6 sm:p-8">
          {isRegsLoading ? (
            <div className="text-gray-400">Loading registrations...</div>
          ) : regs.length === 0 ? (
            <div className="text-gray-400">No registrations yet.</div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-400">Total: {regs.length}</div>
              <div className="grid gap-3">
                {regs.map((r) => (
                  <div key={r.id} className="bg-[#0A0A0A] border border-[#D4AF37]/10 rounded-xl p-4">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="text-sm text-gray-300 break-all">{r.id}</div>
                      <div className="text-xs text-gray-500">
                        {r.createdAt ? new Date(r.createdAt).toLocaleString('en-US') : ''}
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      {Object.entries(r.answers || {}).map(([k, v]) => (
                        <div key={k} className="text-gray-400">
                          <span className="text-gray-500">{k}:</span> <span className="text-gray-300">{String(v ?? '')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isImagesEditing && imagesConclave) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl text-[#F5F5F5]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Conclave Images
            </h2>
            <p className="text-sm text-gray-400 mt-1">{imagesConclave.title}</p>
          </div>
          <button
            onClick={() => { setIsImagesEditing(false); setImagesConclave(null); setImages([]); }}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-[#F5F5F5] transition-colors"
          >
            <X className="w-5 h-5" />
            Close
          </button>
        </div>

        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 p-6 sm:p-8 space-y-6">
          <div className="bg-[#0A0A0A] border border-[#D4AF37]/10 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Upload className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-400">
                <div className="text-[#F5F5F5] mb-1">Upload Images</div>
                <div>Upload multiple images; choose one as thumbnail.</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <label className="px-4 py-2 bg-[#0A0A0A] text-gray-300 rounded-lg border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all text-sm cursor-pointer inline-flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload
                <input
                  type="file"
                  accept="image/*"
                  disabled={isImageUploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadImage(f, images.length === 0);
                    e.target.value = '';
                  }}
                  className="hidden"
                />
              </label>
              <div className="text-xs text-gray-500 mt-1 sm:mt-3">
                {isImageUploading ? 'Uploading...' : ''}
              </div>
            </div>
          </div>

          {isImagesLoading ? (
            <div className="text-gray-400">Loading images...</div>
          ) : images.length === 0 ? (
            <div className="text-gray-400">No images yet.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img) => (
                <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-[#D4AF37]/20 bg-[#0A0A0A]">
                  <img src={img.url} alt="Conclave" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3 gap-2">
                    <button
                      onClick={() => setThumbnail(img.id)}
                      className={`px-3 py-2 rounded-lg text-xs border transition-all inline-flex items-center gap-2 ${
                        img.isThumbnail
                          ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                          : 'bg-black/40 text-gray-200 border-white/20 hover:border-white/40'
                      }`}
                      title="Set thumbnail"
                    >
                      <Star className="w-4 h-4" />
                      {img.isThumbnail ? 'Thumbnail' : 'Set'}
                    </button>
                    <button
                      onClick={() => deleteImage(img.id)}
                      className="px-3 py-2 rounded-lg text-xs bg-red-500/20 text-red-200 border border-red-500/30 hover:border-red-500/50 transition-all inline-flex items-center gap-2"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-[#F5F5F5]" style={{ fontFamily: 'Playfair Display, serif' }}>Conclaves Management</h2>
          <p className="text-sm text-gray-400 mt-1">Manage all events and conclaves</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black rounded-lg hover:shadow-[0_0_30px_rgba(122,86,46,0.3)] transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Conclave
        </button>
      </div>

      <div className="grid gap-6">
        {isLoading && (
          <div className="text-center py-12 text-gray-400">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>Loading conclaves...</p>
          </div>
        )}
        {conclaves.map((conclave) => (
          <div
            key={conclave.id}
            className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 p-6 hover:border-[#D4AF37]/40 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl text-[#F5F5F5]" style={{ fontFamily: 'Playfair Display, serif' }}>{conclave.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    conclave.status === 'upcoming'
                      ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30'
                      : 'bg-gray-500/10 text-gray-400 border border-gray-500/30'
                  }`}>
                    {conclave.status === 'upcoming' ? 'Upcoming' : 'Past Event'}
                  </span>
                </div>

                <p className="text-gray-400 text-sm">{conclave.description}</p>

                <div className="flex items-center gap-6 flex-wrap text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#D4AF37]" />
                    <span>{conclave.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#D4AF37]" />
                    <span>{conclave.attendees}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#D4AF37]" />
                    <span>{conclave.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#D4AF37]" />
                    <span>{conclave.time}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openFormEditor(conclave)}
                  className="p-2 text-gray-400 hover:bg-white/5 hover:text-[#F5F5F5] rounded-lg transition-all"
                  title="Edit registration form"
                >
                  <ClipboardList className="w-5 h-5" />
                </button>
                <button
                  onClick={() => openImages(conclave)}
                  className="p-2 text-gray-400 hover:bg-white/5 hover:text-[#F5F5F5] rounded-lg transition-all"
                  title="Manage images"
                >
                  <Images className="w-5 h-5" />
                </button>
                <button
                  onClick={() => openRegistrations(conclave)}
                  className="p-2 text-gray-400 hover:bg-white/5 hover:text-[#F5F5F5] rounded-lg transition-all"
                  title="View registrations"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => exportSubmissionsCsv(conclave)}
                  className="p-2 text-gray-400 hover:bg-white/5 hover:text-[#F5F5F5] rounded-lg transition-all"
                  title="Export submissions (CSV)"
                >
                  <FileDown className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleEdit(conclave)}
                  className="p-2 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-all"
                  title="Edit"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(conclave.id)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {conclaves.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No conclaves yet. Click "Add Conclave" to create one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
