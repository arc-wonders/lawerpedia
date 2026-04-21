import { useState } from 'react';
import { Scale, LogOut, Calendar, MessageSquare, Image, Home } from 'lucide-react';
import ConclavesManager from './ConclavesManager';
import ConsultationsManager from './ConsultationsManager';
import GalleryManager from './GalleryManager';

interface AdminDashboardProps {
  onLogout: () => void;
  onBackToSite: () => void;
}

export default function AdminDashboard({ onLogout, onBackToSite }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'conclaves' | 'consultations' | 'gallery'>('conclaves');

  return (
    <div className="min-h-screen bg-[#0A0A0A]" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border-b border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Scale className="w-8 h-8 text-[#D4AF37]" />
                <div className="absolute -inset-2 bg-[#D4AF37]/10 rounded-full blur-md -z-10" />
              </div>
              <div>
                <h1 className="text-xl text-[#F5F5F5]" style={{ fontFamily: 'Playfair Display, serif' }}>LawyerPedia Admin</h1>
                <p className="text-xs text-gray-400">Content Management Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onBackToSite}
                className="flex items-center gap-2 px-4 py-2 bg-[#0A0A0A] text-gray-400 rounded-lg border border-[#D4AF37]/20 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-all"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Site</span>
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gradient-to-br from-[#0F0F0F] to-[#0A0A0A] border-b border-[#D4AF37]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('conclaves')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'conclaves'
                  ? 'border-[#D4AF37] text-[#D4AF37]'
                  : 'border-transparent text-gray-400 hover:text-[#F5F5F5]'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Conclaves</span>
            </button>
            <button
              onClick={() => setActiveTab('consultations')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'consultations'
                  ? 'border-[#D4AF37] text-[#D4AF37]'
                  : 'border-transparent text-gray-400 hover:text-[#F5F5F5]'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span>Consultations</span>
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'gallery'
                  ? 'border-[#D4AF37] text-[#D4AF37]'
                  : 'border-transparent text-gray-400 hover:text-[#F5F5F5]'
              }`}
            >
              <Image className="w-5 h-5" />
              <span>Gallery</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'conclaves' && <ConclavesManager />}
        {activeTab === 'consultations' && <ConsultationsManager />}
        {activeTab === 'gallery' && <GalleryManager />}
      </div>

      {/* Supabase Notice */}
      <div className="fixed bottom-6 right-6 max-w-sm">
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border border-[#D4AF37]/20 rounded-lg p-4 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0 animate-pulse" />
            <div>
              <p className="text-sm text-[#F5F5F5] mb-1">Demo Mode</p>
              <p className="text-xs text-gray-400">
                Connect Supabase from Make settings to enable real-time data persistence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
