import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Calendar, Users, MapPin, Clock } from 'lucide-react';

interface Conclave {
  id: number;
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

export default function ConclavesManager() {
  const [conclaves, setConclaves] = useState<Conclave[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingConclave, setEditingConclave] = useState<Conclave | null>(null);

  useEffect(() => {
    // Load from localStorage (temporary until Supabase is connected)
    const stored = localStorage.getItem('lawyerpedia_conclaves');
    if (stored) {
      setConclaves(JSON.parse(stored));
    } else {
      // Default data
      const defaultConclaves: Conclave[] = [
        {
          id: 1,
          title: "Legal Awareness Conclave 2026",
          date: "June 15, 2026",
          status: "upcoming",
          attendees: "Expected 600+",
          description: "A comprehensive event covering consumer rights, criminal law basics, and legal remedies for common issues.",
          fullDescription: "Join us for India's premier legal awareness conclave...",
          highlights: [
            "Expert panel discussions on consumer protection laws",
            "Interactive workshops on criminal law basics",
            "Legal aid clinic with free consultations"
          ],
          venue: "India Habitat Centre, New Delhi",
          time: "9:00 AM - 6:00 PM"
        }
      ];
      setConclaves(defaultConclaves);
      localStorage.setItem('lawyerpedia_conclaves', JSON.stringify(defaultConclaves));
    }
  }, []);

  const saveConclaves = (updatedConclaves: Conclave[]) => {
    setConclaves(updatedConclaves);
    localStorage.setItem('lawyerpedia_conclaves', JSON.stringify(updatedConclaves));
  };

  const handleAdd = () => {
    const newConclave: Conclave = {
      id: Date.now(),
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

  const handleSave = () => {
    if (!editingConclave) return;

    const existing = conclaves.find(c => c.id === editingConclave.id);
    let updated;

    if (existing) {
      updated = conclaves.map(c => c.id === editingConclave.id ? editingConclave : c);
    } else {
      updated = [...conclaves, editingConclave];
    }

    saveConclaves(updated);
    setIsEditing(false);
    setEditingConclave(null);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this conclave?')) {
      saveConclaves(conclaves.filter(c => c.id !== id));
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
            {conclaves.find(c => c.id === editingConclave.id) ? 'Edit' : 'Add'} Conclave
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
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black rounded-lg hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all"
            >
              <Save className="w-5 h-5" />
              Save Conclave
            </button>
          </div>
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
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black rounded-lg hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Conclave
        </button>
      </div>

      <div className="grid gap-6">
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
