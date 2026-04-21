import { useState } from 'react';
import { Scale, Lock, User } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (username === 'admin' && password === 'admin123') {
      onLogin();
    } else {
      setError('Invalid credentials');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative">
              <Scale className="w-12 h-12 text-[#D4AF37]" />
              <div className="absolute -inset-2 bg-[#D4AF37]/10 rounded-full blur-md -z-10" />
            </div>
            <span className="text-3xl text-[#F5F5F5]" style={{ fontFamily: 'Playfair Display, serif' }}>LawyerPedia</span>
          </div>
          <h1 className="text-2xl text-[#F5F5F5] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Admin Dashboard</h1>
          <p className="text-gray-400 text-sm">Please login to continue</p>
        </div>

        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37] transition-colors"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#D4AF37] transition-colors"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black rounded-lg hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-300 hover:scale-105"
            >
              Login
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          For authorized personnel only
        </p>
      </div>
    </div>
  );
}
