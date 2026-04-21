import { useState, useEffect } from 'react';
import { MessageSquare, Trash2, CheckCircle, Clock, Mail, Phone, User } from 'lucide-react';
import { apiJson } from '../../api';

interface Consultation {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

export default function ConsultationsManager() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await apiJson<{ items: Consultation[] }>('/api/admin/consultations', { admin: true });
        setConsultations(res.items);
      } catch (err: any) {
        alert(err?.message || 'Failed to load consultations');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const toggleStatus = async (id: string) => {
    const current = consultations.find(c => c.id === id);
    if (!current) return;

    const nextStatus = current.status === 'pending' ? 'completed' : 'pending';
    try {
      const res = await apiJson<{ item: Consultation }>(`/api/admin/consultations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
        admin: true
      });
      setConsultations(prev => prev.map(c => (c.id === id ? res.item : c)));
    } catch (err: any) {
      alert(err?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this consultation request?')) {
      try {
        await apiJson(`/api/admin/consultations/${id}`, { method: 'DELETE', admin: true });
        setConsultations(prev => prev.filter(c => c.id !== id));
      } catch (err: any) {
        alert(err?.message || 'Failed to delete consultation');
      }
    }
  };

  const filteredConsultations = consultations.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const stats = {
    total: consultations.length,
    pending: consultations.filter(c => c.status === 'pending').length,
    completed: consultations.filter(c => c.status === 'completed').length
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-[#F5F5F5]" style={{ fontFamily: 'Playfair Display, serif' }}>Consultation Requests</h2>
        <p className="text-sm text-gray-400 mt-1">Manage consultation form submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-xl border border-[#D4AF37]/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Requests</p>
              <p className="text-3xl text-[#F5F5F5]" style={{ fontFamily: 'Playfair Display, serif' }}>{stats.total}</p>
            </div>
            <MessageSquare className="w-10 h-10 text-[#D4AF37]/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-xl border border-yellow-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Pending</p>
              <p className="text-3xl text-yellow-500" style={{ fontFamily: 'Playfair Display, serif' }}>{stats.pending}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-500/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-xl border border-green-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Completed</p>
              <p className="text-3xl text-green-500" style={{ fontFamily: 'Playfair Display, serif' }}>{stats.completed}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500/30" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            filter === 'all'
              ? 'bg-[#D4AF37] text-black'
              : 'bg-[#1A1A1A] text-gray-400 hover:text-[#F5F5F5]'
          }`}
        >
          All ({stats.total})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            filter === 'pending'
              ? 'bg-yellow-500 text-black'
              : 'bg-[#1A1A1A] text-gray-400 hover:text-[#F5F5F5]'
          }`}
        >
          Pending ({stats.pending})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            filter === 'completed'
              ? 'bg-green-500 text-black'
              : 'bg-[#1A1A1A] text-gray-400 hover:text-[#F5F5F5]'
          }`}
        >
          Completed ({stats.completed})
        </button>
      </div>

      {/* Consultations List */}
      <div className="grid gap-4">
        {isLoading && (
          <div className="text-center py-12 text-gray-400">
            <User className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>Loading consultations...</p>
          </div>
        )}
        {filteredConsultations.map((consultation) => (
          <div
            key={consultation.id}
            className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-xl border border-[#D4AF37]/20 p-6 hover:border-[#D4AF37]/40 transition-all"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg text-[#F5F5F5]">{consultation.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    consultation.status === 'pending'
                      ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'
                      : 'bg-green-500/10 text-green-500 border border-green-500/30'
                  }`}>
                    {consultation.status === 'pending' ? 'Pending' : 'Completed'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${consultation.email}`} className="hover:text-[#D4AF37]">{consultation.email}</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${consultation.phone}`} className="hover:text-[#D4AF37]">{consultation.phone}</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(consultation.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-300"><span className="text-gray-400">Subject:</span> {consultation.subject}</p>
                  <p className="text-sm text-gray-400">{consultation.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleStatus(consultation.id)}
                  className={`p-2 rounded-lg transition-all ${
                    consultation.status === 'pending'
                      ? 'text-green-400 hover:bg-green-500/10'
                      : 'text-yellow-400 hover:bg-yellow-500/10'
                  }`}
                  title={consultation.status === 'pending' ? 'Mark as completed' : 'Mark as pending'}
                >
                  {consultation.status === 'pending' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(consultation.id)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredConsultations.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No {filter !== 'all' ? filter : ''} consultation requests.</p>
          </div>
        )}
      </div>
    </div>
  );
}
