import { useMemo, useState } from 'react';
import { X, Send } from 'lucide-react';
import { apiJson } from '../api';

type FieldType = 'text' | 'email' | 'phone' | 'textarea' | 'select';

export interface ConclaveFormField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string | null;
  options?: string[];
}

export interface ConclaveForm {
  enabled: boolean;
  title?: string | null;
  description?: string | null;
  fields: ConclaveFormField[];
}

interface Props {
  conclaveId: string;
  conclaveTitle: string;
  form: ConclaveForm;
  onClose: () => void;
}

export default function ConclaveRegistrationForm({ conclaveId, conclaveTitle, form, onClose }: Props) {
  const initial = useMemo(() => {
    const ans: Record<string, any> = {};
    for (const f of form.fields || []) ans[f.key] = '';
    return ans;
  }, [form.fields]);

  const [answers, setAnswers] = useState<Record<string, any>>(initial);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const set = (key: string, value: any) => setAnswers(prev => ({ ...prev, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiJson(`/api/conclaves/${conclaveId}/submissions`, {
        method: 'POST',
        body: JSON.stringify({ answers })
      });
      setIsSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (err: any) {
      alert(err?.message || 'Failed to submit registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
        <div className="relative bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl shadow-2xl max-w-md w-full p-10 border border-[#D4AF37]/20 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-full mb-6 border border-green-500/30">
            <Send className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="mb-4 text-[#F5F5F5] text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Registration Submitted!</h2>
          <p className="text-gray-400 mb-2">You’re registered for {conclaveTitle}.</p>
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
                {form.title || 'Event Registration'}
              </h2>
              <p className="text-gray-400 text-sm">{form.description || `Register for ${conclaveTitle}`}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-[#D4AF37] transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={submit} className="space-y-6">
            {(form.fields || []).map((field) => (
              <div key={field.key}>
                <label className="block text-sm text-gray-400 mb-2">
                  {field.label} {field.required ? '*' : ''}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    value={answers[field.key] ?? ''}
                    onChange={(e) => set(field.key, e.target.value)}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                    rows={5}
                    placeholder={field.placeholder || ''}
                    required={!!field.required}
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={answers[field.key] ?? ''}
                    onChange={(e) => set(field.key, e.target.value)}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37] transition-colors"
                    required={!!field.required}
                  >
                    <option value="" disabled>
                      Select...
                    </option>
                    {(field.options || []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type === 'phone' ? 'tel' : field.type}
                    value={answers[field.key] ?? ''}
                    onChange={(e) => set(field.key, e.target.value)}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37] transition-colors"
                    placeholder={field.placeholder || ''}
                    required={!!field.required}
                  />
                )}
              </div>
            ))}

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
                    <span>Submit Registration</span>
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
