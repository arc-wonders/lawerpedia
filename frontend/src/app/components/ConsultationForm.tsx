import { useState } from 'react';
import { X, Send, User, Mail, Phone, FileText } from 'lucide-react';
import { apiJson } from '../api';

interface ConsultationFormProps {
  onClose: () => void;
}

export default function ConsultationForm({ onClose }: ConsultationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiJson('/api/consultations', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setIsSuccess(true);
    } catch (err: any) {
      alert(err?.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }

    // Auto close after 2 seconds
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
        <div className="relative bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl shadow-2xl max-w-md w-full p-10 border border-[#D4AF37]/20 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-full mb-6 border border-green-500/30">
            <Send className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="mb-4 text-[#F5F5F5] text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Request Submitted!</h2>
          <p className="text-gray-400 mb-6">
            Thank you for your consultation request. We'll get back to you within 24 hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl shadow-2xl max-w-2xl w-full my-8 border border-[#D4AF37]/20">
        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

        <div className="p-8 sm:p-10">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl text-[#F5F5F5] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Book a Consultation
              </h2>
              <p className="text-gray-400 text-sm">Fill out the form and we'll get back to you shortly</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-[#D4AF37] transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37] transition-colors"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37] transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37] transition-colors"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Subject *</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37] transition-colors"
                    placeholder="Brief subject"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                rows={5}
                placeholder="Describe your legal consultation requirement..."
                required
              />
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-gray-400">
              <p>
                <strong className="text-blue-400">Note:</strong> Your request is saved securely to the backend. If submission fails, check that the API server is running.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black rounded-lg hover:shadow-[0_0_30px_rgba(122,86,46,0.3)] transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Request</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-4 bg-transparent text-gray-400 border border-[#D4AF37]/20 rounded-lg hover:border-[#D4AF37]/40 hover:text-[#F5F5F5] transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
