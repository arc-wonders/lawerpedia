import { useState, useEffect } from 'react';
import { X, Menu, Scale, Briefcase, FileText, Users, Calendar, Instagram, Linkedin, Twitter, Mail, Phone, MapPin, Award, BookOpen, Video, Bell, ChevronRight, Gavel, Shield, Building2, UserCheck, ClipboardCheck, TrendingUp, Eye } from 'lucide-react';
import mehakImage from '../imports/ms.jpg';
import ConsultationForm from './components/ConsultationForm';
import { apiJson } from './api';
import ConclaveRegistrationForm, { ConclaveForm } from './components/ConclaveRegistrationForm';

interface Conclave {
  id: string;
  title: string;
  date: string;
  status: string;
  attendees: string;
  description: string;
  fullDescription: string;
  highlights: string[];
  venue: string;
  time: string;
  imageUrls?: string[];
  thumbnailUrl?: string | null;
}

interface GalleryImage {
  id: string;
  title: string;
  url: string;
  createdAt: string;
}

export default function MainSite() {
  const [showConclavePopup, setShowConclavePopup] = useState(false);
  const [popupConclaveIndex, setPopupConclaveIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedConclave, setSelectedConclave] = useState<number | null>(null);
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [conclaves, setConclaves] = useState<Conclave[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);

  const [showConclaveRegistration, setShowConclaveRegistration] = useState(false);
  const [registrationForm, setRegistrationForm] = useState<ConclaveForm | null>(null);
  const [registrationConclaveIndex, setRegistrationConclaveIndex] = useState<number | null>(null);

  const [hoveredConclaveId, setHoveredConclaveId] = useState<string | null>(null);
  const [hoverSlideIndex, setHoverSlideIndex] = useState(0);
  const [detailsImageIndex, setDetailsImageIndex] = useState(0);

  useEffect(() => {
    if (!showConclavePopup) return;
    const t = setTimeout(() => setShowConclavePopup(false), 10_000);
    return () => clearTimeout(t);
  }, [showConclavePopup]);

  const getLastConclavePopupIndex = async (items: Conclave[]) => {
    const c = items[0];
    if (!c?.id) return null;
    if (c.status !== 'upcoming') return null;
    try {
      const res = await apiJson<{ form: ConclaveForm | null }>(`/api/conclaves/${c.id}/form`);
      if (res.form && res.form.enabled !== false) return 0;
    } catch {
      // ignore
    }
    return null;
  };

  useEffect(() => {
    setHoverSlideIndex(0);
    if (!hoveredConclaveId) return;
    const timer = setInterval(() => setHoverSlideIndex((i) => i + 1), 1200);
    return () => clearInterval(timer);
  }, [hoveredConclaveId]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiJson<{ items: Conclave[] }>('/api/conclaves');
        const items = res.items || [];
        setConclaves(items);

        const idx = await getLastConclavePopupIndex(items);
        if (idx !== null) {
          setPopupConclaveIndex(idx);
          setShowConclavePopup(true);
        } else {
          setPopupConclaveIndex(null);
          setShowConclavePopup(false);
        }
      } catch {
        setConclaves([]);
        setPopupConclaveIndex(null);
        setShowConclavePopup(false);
      }
    };
    load();
  }, []);

  const openRegistration = async (index: number) => {
    const conclave = conclaves[index];
    if (!conclave?.id) return;

    try {
      const res = await apiJson<{ form: ConclaveForm | null }>(`/api/conclaves/${conclave.id}/form`);
      if (!res.form || res.form.enabled === false) {
        alert('Registration is not available for this conclave.');
        return;
      }
      setRegistrationForm(res.form);
      setRegistrationConclaveIndex(index);
      setShowConclaveRegistration(true);
    } catch (err: any) {
      alert(err?.message || 'Failed to load registration form');
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiJson<{ items: GalleryImage[] }>('/api/gallery');
        setGallery(res.items);
      } catch {
        setGallery([]);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (selectedConclave !== null) {
      document.body.style.overflow = 'hidden';
      setDetailsImageIndex(0);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedConclave]);

  const popupConclave =
    showConclavePopup && popupConclaveIndex !== null ? conclaves[popupConclaveIndex] : null;
  const popupThumb = popupConclave?.thumbnailUrl || popupConclave?.imageUrls?.[0] || null;

  return (
      <div className="min-h-screen bg-background text-foreground relative" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* CONCLAVE DETAILS OVERLAY */}
      {selectedConclave !== null && conclaves[selectedConclave] && (
        <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
          <div className="min-h-screen">
            {/* Header with Back Button */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <button
                  onClick={() => setSelectedConclave(null)}
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
                >
                  <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
                  <span>Back to Conclaves</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
              <div className="space-y-12">
                {/* Hero Section */}
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-primary text-sm">
                      {conclaves[selectedConclave].status === 'upcoming' ? 'Upcoming Event' : 'Past Event'}
                    </span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl text-foreground leading-tight" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>
                    {conclaves[selectedConclave].title}
                  </h1>
                  <div className="flex items-center justify-center gap-8 flex-wrap text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span>{conclaves[selectedConclave].date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <span>{conclaves[selectedConclave].attendees} Attendees</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span>{conclaves[selectedConclave].venue}</span>
                    </div>
                  </div>
                </div>

                {/* Image Banner */}
                <div className="relative aspect-video bg-card rounded-2xl overflow-hidden border border-border">
                  {(() => {
                    const imgs = conclaves[selectedConclave].imageUrls || [];
                    const current = imgs.length > 0 ? imgs[detailsImageIndex % imgs.length] : null;
                    return current ? (
                      <img src={current} alt="Conclave" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Calendar className="w-32 h-32 text-primary/20" />
                      </div>
                    );
                  })()}

                  {((conclaves[selectedConclave].imageUrls || []).length > 1) && (
                    <>
                      <button
                        onClick={() => {
                          const len = (conclaves[selectedConclave].imageUrls || []).length;
                          setDetailsImageIndex((i) => (i - 1 + len) % len);
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 border border-white/20 text-white hover:bg-black/60 transition-all flex items-center justify-center"
                        title="Previous image"
                      >
                        <ChevronRight className="w-5 h-5 rotate-180" />
                      </button>
                      <button
                        onClick={() => {
                          const len = (conclaves[selectedConclave].imageUrls || []).length;
                          setDetailsImageIndex((i) => (i + 1) % len);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 border border-white/20 text-white hover:bg-black/60 transition-all flex items-center justify-center"
                        title="Next image"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Description */}
                <div className="bg-card rounded-2xl border border-border p-8 sm:p-10 lg:p-12">
                  <h2 className="text-2xl sm:text-3xl text-foreground mb-6" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>
                    About This Event
                  </h2>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8">
                    {conclaves[selectedConclave].fullDescription}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-6 mb-8">
                    <div className="flex items-center gap-3 p-4 bg-muted rounded-lg border border-border">
                      <MapPin className="w-6 h-6 text-primary flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Venue</div>
                        <div className="text-foreground">{conclaves[selectedConclave].venue}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-muted rounded-lg border border-border">
                      <Award className="w-6 h-6 text-primary flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Time</div>
                        <div className="text-foreground">{conclaves[selectedConclave].time}</div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl text-foreground mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Event Highlights
                  </h3>
                  <ul className="space-y-3">
                    {conclaves[selectedConclave].highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-400">
                        <ChevronRight className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                {conclaves[selectedConclave].status === 'upcoming' && (
                  <div className="text-center">
                    <button
                      onClick={() => openRegistration(selectedConclave)}
                      className="px-10 py-4 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black rounded-lg hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] transition-all duration-300 hover:scale-105"
                    >
                      Register for This Event
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONCLAVE REGISTRATION POPUP (latest active) */}
      {popupConclave && popupConclaveIndex !== null && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-background/50 backdrop-blur-md" />

          <div className="relative min-h-full flex items-end sm:items-center justify-center p-4">
            <div className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
              <div className="flex items-start gap-4 p-4 sm:p-6">
                <div className="h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 rounded-xl overflow-hidden border border-border bg-muted">
                  {popupThumb ? (
                    <img src={popupThumb} alt={popupConclave.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-primary/60" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">Open for registration</div>
                      <h3 className="text-lg sm:text-xl text-foreground mt-1 truncate" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>
                        {popupConclave.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowConclavePopup(false)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      aria-label="Close"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <div className="inline-flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary/70" />
                      <span className="truncate">{popupConclave.date}</span>
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary/70" />
                      <span className="truncate">{popupConclave.venue}</span>
                    </div>
                  </div>

                  {popupConclave.description && (
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      {popupConclave.description}
                    </p>
                  )}

                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        setShowConclavePopup(false);
                        openRegistration(popupConclaveIndex);
                      }}
                      className="px-5 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
                    >
                      Register
                    </button>
                    <button
                      onClick={() => {
                        setShowConclavePopup(false);
                        setSelectedConclave(popupConclaveIndex);
                      }}
                      className="px-5 py-3 bg-transparent text-primary border border-primary rounded-lg hover:bg-primary/10 transition-all"
                    >
                      View details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Scale className="w-9 h-9 text-primary" />
                <div className="absolute -inset-2 bg-primary/10 rounded-full blur-md -z-10" />
              </div>
              <span className="text-2xl text-foreground tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>LawyerPedia</span>
            </div>

            <div className="hidden md:flex items-center gap-6 sm:p-5 sm:p-6 lg:p-8 lg:p-10">
              <a href="#home" className="text-muted-foreground hover:text-primary transition-colors text-[15px]">Home</a>
              <a href="#about" className="text-muted-foreground hover:text-primary transition-colors text-[15px]">About</a>
              <a href="#articles" className="text-muted-foreground hover:text-primary transition-colors text-[15px]">Articles</a>
              <a href="#conclaves" className="text-muted-foreground hover:text-primary transition-colors text-[15px]">Conclaves</a>
              <a href="#gallery" className="text-muted-foreground hover:text-primary transition-colors text-[15px]">Gallery</a>
              <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors text-[15px]">Contact</a>
              <button
                onClick={() => setShowConsultationForm(true)}
                className="px-7 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(122,86,46,0.25)] transition-all duration-300 hover:scale-105"
              >
                Book Consultation
              </button>
            </div>

            <button
              className="md:hidden text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-4 py-6 space-y-4">
              <a href="#home" className="block text-muted-foreground hover:text-primary py-2 text-[15px]">Home</a>
              <a href="#about" className="block text-muted-foreground hover:text-primary py-2 text-[15px]">About</a>
              <a href="#articles" className="block text-muted-foreground hover:text-primary py-2 text-[15px]">Articles</a>
              <a href="#conclaves" className="block text-muted-foreground hover:text-primary py-2 text-[15px]">Conclaves</a>
              <a href="#gallery" className="block text-muted-foreground hover:text-primary py-2 text-[15px]">Gallery</a>
              <a href="#contact" className="block text-muted-foreground hover:text-primary py-2 text-[15px]">Contact</a>
              <button
                onClick={() => { setShowConsultationForm(true); setMobileMenuOpen(false); }}
                className="w-full px-7 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(122,86,46,0.25)] transition-all"
              >
                Book Consultation
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section id="home" className="relative bg-background py-16 sm:py-24 lg:py-40 overflow-hidden z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-5 sm:p-6 lg:p-8 sm:gap-12 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <span className="text-primary text-sm">Premium Legal Services</span>
              </div>

              <h1 className="text-foreground leading-[1.1] text-4xl sm:text-5xl lg:text-[4.5rem]" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600', letterSpacing: '-0.02em' }}>
                Empowering Legal
                <span className="block text-primary">Awareness</span>
              </h1>

              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-lg">
                LawyerPedia is your trusted partner in legal education and advocacy. We bridge the gap between complex legal concepts and public understanding through expert articles, engaging content, and transformative conclaves.
              </p>

              <div className="flex items-center gap-4 sm:gap-5 sm:p-6 lg:p-8 pt-4 flex-wrap sm:flex-nowrap">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl mb-1 text-primary" style={{ fontFamily: 'Playfair Display, serif' }}>500K+</div>
                  <div className="text-gray-500 text-xs sm:text-sm">Followers Reached</div>
                </div>
                <div className="w-px h-10 sm:h-12 bg-border" />
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl mb-1 text-primary" style={{ fontFamily: 'Playfair Display, serif' }}>1M+</div>
                  <div className="text-gray-500 text-xs sm:text-sm">Content Views</div>
                </div>
                <div className="w-px h-10 sm:h-12 bg-border" />
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl mb-1 text-primary" style={{ fontFamily: 'Playfair Display, serif' }}>25+</div>
                  <div className="text-gray-500 text-xs sm:text-sm">Events Hosted</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button className="px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:shadow-[0_0_40px_rgba(122,86,46,0.25)] transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 group">
                  <span>Explore Articles</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 bg-transparent text-primary border border-primary rounded-lg hover:bg-primary/10 transition-all duration-300">
                  Join Conclave
                </button>
              </div>
            </div>

            <div className="relative lg:h-[600px] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 via-transparent to-transparent rounded-full blur-3xl" />
              <div className="relative aspect-[3/4] w-full max-w-md bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-3xl overflow-hidden border border-[#D4AF37]/20 shadow-[0_20px_80px_rgba(212,175,55,0.2)]">
                <div className="absolute -inset-px bg-gradient-to-br from-[#D4AF37]/30 via-transparent to-transparent opacity-50 rounded-3xl" />
                <div className="h-full flex items-center justify-center p-12 relative">
                  <div className="text-center space-y-6">
                    <div className="w-48 h-48 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-full mx-auto flex items-center justify-center border border-[#D4AF37]/30">
                      <Scale className="w-24 h-24 text-[#D4AF37]" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[#F5F5F5] text-xl italic leading-relaxed" style={{ fontFamily: 'Playfair Display, serif' }}>
                        "Justice delayed is justice denied"
                      </p>
                      <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl -z-10" />
              <div className="absolute -top-5 sm:p-6 lg:p-8 -right-8 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT MEHAK AHUJA */}
      <section id="about" className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-[#0F0F0F] to-[#0A0A0A] relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#D4AF37]/5 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-5 sm:p-6 lg:p-8 sm:gap-12 lg:gap-20 items-center">
            <div className="relative order-2 lg:order-1 max-w-sm mx-auto lg:mx-0">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 via-transparent to-transparent rounded-full blur-3xl" />
              <div className="relative aspect-[3/4] bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-3xl overflow-hidden border border-[#D4AF37]/20 shadow-[0_20px_80px_rgba(212,175,55,0.25)]">
                <div className="absolute -inset-px bg-gradient-to-br from-[#D4AF37]/30 via-transparent to-transparent opacity-40 rounded-3xl" />
                <div className="h-full relative overflow-hidden">
                  <img
                    src={mehakImage}
                    alt="Mehak Ahuja - Founder & Legal Expert"
                    className="w-full h-full object-cover select-none"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' }}
                  />
                </div>
              </div>
              <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl -z-10" />
              <div className="absolute -top-5 sm:p-6 lg:p-8 -left-8 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-2xl -z-10" />
            </div>

            <div className="space-y-8 order-1 lg:order-2">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37]/10 to-transparent rounded-full border border-[#D4AF37]/20">
                  <Award className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-[#D4AF37] text-sm">Founder & Legal Expert</span>
                </div>
                <h2 className="text-[#F5F5F5]" style={{ fontFamily: 'Playfair Display, serif', fontSize: '3.5rem', lineHeight: '1.1', fontWeight: '600' }}>
                  About Mehak Ahuja
                </h2>
                <div className="w-24 h-px bg-gradient-to-r from-[#D4AF37] to-transparent" />
              </div>

              <div className="space-y-6">
                <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                  Mehak Ahuja is a distinguished legal professional with a passion for democratizing legal knowledge. With years of experience in diverse practice areas, she founded LawyerPedia with a vision to make legal awareness accessible to all.
                </p>
                <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                  Her expertise spans corporate law, civil disputes, and legal compliance. Through her innovative approach combining traditional legal practice with modern digital outreach, she has empowered thousands to understand their legal rights and responsibilities.
                </p>

                <div className="relative p-6 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 mt-8">
                  <div className="absolute -top-px left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
                  <p className="text-[#F5F5F5] text-lg sm:text-xl italic mb-4 leading-relaxed" style={{ fontFamily: 'Playfair Display, serif' }}>
                    "My mission is to empower every individual with the knowledge of their legal rights, creating a more just and informed society."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-[#D4AF37] to-transparent" />
                    <span className="text-[#D4AF37] text-sm" style={{ fontFamily: 'Playfair Display, serif' }}>Mehak Ahuja</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4">
                <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] hover:scale-105">
                  <div className="text-2xl sm:text-3xl lg:text-4xl mb-2 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] bg-clip-text text-transparent" style={{ fontFamily: 'Playfair Display, serif' }}>10+</div>
                  <div className="text-gray-500 text-xs sm:text-sm">Years Experience</div>
                </div>
                <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] hover:scale-105">
                  <div className="text-2xl sm:text-3xl lg:text-4xl mb-2 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] bg-clip-text text-transparent" style={{ fontFamily: 'Playfair Display, serif' }}>500+</div>
                  <div className="text-gray-500 text-xs sm:text-sm">Cases Handled</div>
                </div>
                <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] hover:scale-105">
                  <div className="text-2xl sm:text-3xl lg:text-4xl mb-2 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] bg-clip-text text-transparent" style={{ fontFamily: 'Playfair Display, serif' }}>25+</div>
                  <div className="text-gray-500 text-xs sm:text-sm">Conclaves</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT LAWYERPEDIA */}
      <section className="py-16 sm:py-24 lg:py-32 bg-[#0A0A0A] relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF37]/5 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 sm:mb-10 sm:mb-12 lg:mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37]/10 to-transparent rounded-full border border-[#D4AF37]/20 mb-6">
              <Scale className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-sm">Our Platform</span>
            </div>
            <h2 className="mb-6 text-[#F5F5F5] text-3xl sm:text-4xl lg:text-5xl" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>About LawyerPedia</h2>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-24 h-px bg-gradient-to-r from-transparent to-[#D4AF37]" />
              <div className="w-24 h-px bg-gradient-to-l from-transparent to-[#D4AF37]" />
            </div>
            <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
              LawyerPedia is a comprehensive legal awareness platform dedicated to spreading knowledge through articles, digital content, and transformative events. We believe in making legal education accessible, engaging, and actionable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 sm:p-6 lg:p-8">
            <div className="text-center p-6 sm:p-5 sm:p-6 lg:p-8 lg:p-10 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] hover:scale-105 group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-2xl mb-6 group-hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all duration-300 border border-[#D4AF37]/30">
                <BookOpen className="w-10 h-10 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="mb-4 text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Articles</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Expert-written legal articles covering diverse topics, making complex laws understandable for everyone.
              </p>
            </div>

            <div className="text-center p-6 sm:p-5 sm:p-6 lg:p-8 lg:p-10 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] hover:scale-105 group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-2xl mb-6 group-hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all duration-300 border border-[#D4AF37]/30">
                <Video className="w-10 h-10 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="mb-4 text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Legal Reels</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Engaging short-form video content on Instagram, breaking down legal concepts in digestible formats.
              </p>
            </div>

            <div className="text-center p-6 sm:p-5 sm:p-6 lg:p-8 lg:p-10 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] hover:scale-105 group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-2xl mb-6 group-hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all duration-300 border border-[#D4AF37]/30">
                <Calendar className="w-10 h-10 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="mb-4 text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Conclaves</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Interactive legal awareness events bringing together experts, students, and the public.
              </p>
            </div>

            <div className="text-center p-6 sm:p-5 sm:p-6 lg:p-8 lg:p-10 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] hover:scale-105 group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-2xl mb-6 group-hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all duration-300 border border-[#D4AF37]/30">
                <Users className="w-10 h-10 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="mb-4 text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Community</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                A growing community of legal enthusiasts, professionals, and individuals seeking legal awareness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRACTICE AREAS / SERVICES */}
      <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-[#0F0F0F] to-[#0A0A0A] relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#D4AF37]/5 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 sm:mb-10 sm:mb-12 lg:mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37]/10 to-transparent rounded-full border border-[#D4AF37]/20 mb-6">
              <Briefcase className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-sm">Expertise</span>
            </div>
            <h2 className="mb-6 text-[#F5F5F5] text-3xl sm:text-4xl lg:text-5xl" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>Practice Areas</h2>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-24 h-px bg-gradient-to-r from-transparent to-[#D4AF37]" />
              <div className="w-24 h-px bg-gradient-to-l from-transparent to-[#D4AF37]" />
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Comprehensive legal services across multiple domains, delivered with expertise and integrity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:p-6 lg:p-8">
            <div className="p-6 sm:p-5 sm:p-6 lg:p-8 lg:p-10 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] transition-all duration-300 hover:scale-105 group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all border border-[#D4AF37]/30">
                <Building2 className="w-7 h-7 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="mb-4 text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Corporate Law</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Business formations, contracts, mergers & acquisitions, and corporate governance advisory.
              </p>
            </div>

            <div className="p-6 sm:p-5 sm:p-6 lg:p-8 lg:p-10 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] transition-all duration-300 hover:scale-105 group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all border border-[#D4AF37]/30">
                <Gavel className="w-7 h-7 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="mb-4 text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Criminal Law</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Defense representation, bail applications, and comprehensive criminal litigation services.
              </p>
            </div>

            <div className="p-6 sm:p-5 sm:p-6 lg:p-8 lg:p-10 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] transition-all duration-300 hover:scale-105 group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all border border-[#D4AF37]/30">
                <FileText className="w-7 h-7 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="mb-4 text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Civil Disputes</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Property disputes, family law matters, and civil litigation across various courts.
              </p>
            </div>

            <div className="p-6 sm:p-5 sm:p-6 lg:p-8 lg:p-10 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] transition-all duration-300 hover:scale-105 group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all border border-[#D4AF37]/30">
                <UserCheck className="w-7 h-7 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="mb-4 text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Legal Consulting</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Strategic legal advice, risk assessment, and consultation for individuals and businesses.
              </p>
            </div>

            <div className="p-6 sm:p-5 sm:p-6 lg:p-8 lg:p-10 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] transition-all duration-300 hover:scale-105 group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all border border-[#D4AF37]/30">
                <ClipboardCheck className="w-7 h-7 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="mb-4 text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Compliance</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Regulatory compliance, audits, and ensuring adherence to legal standards and frameworks.
              </p>
            </div>

            <div className="p-6 sm:p-5 sm:p-6 lg:p-8 lg:p-10 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] transition-all duration-300 hover:scale-105 group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all border border-[#D4AF37]/30">
                <Shield className="w-7 h-7 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="mb-4 text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Consumer Rights</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Protection of consumer rights, dispute resolution, and advocacy against unfair practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BULLETIN BOARD */}
      <section id="articles" className="py-16 sm:py-24 lg:py-32 bg-[#0A0A0A] relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/8 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 sm:mb-10 sm:mb-12 lg:mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37]/10 to-transparent rounded-full border border-[#D4AF37]/20 mb-6">
              <Bell className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-sm">Stay Updated</span>
            </div>
            <h2 className="mb-6 text-[#F5F5F5] text-3xl sm:text-4xl lg:text-5xl" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>Live Updates</h2>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-24 h-px bg-gradient-to-r from-transparent to-[#D4AF37]" />
              <div className="w-24 h-px bg-gradient-to-l from-transparent to-[#D4AF37]" />
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Latest articles, Instagram reels, and important announcements from the legal world.
            </p>

            <div className="flex items-center justify-center gap-5 sm:p-6 lg:p-8 mt-12">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" />
                <span className="text-gray-400 text-sm">Live Content Feed</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                <span>Updated Daily</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:p-6 lg:p-8">
            <div className="group bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] p-5 sm:p-6 lg:p-8 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] hover:scale-105">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all">
                  <BookOpen className="w-9 h-9 text-[#D4AF37]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-xs text-gray-500">2 hours ago</div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Eye className="w-3 h-3" />
                      <span>12.5K</span>
                    </div>
                  </div>
                  <h4 className="mb-3 text-[#F5F5F5] leading-snug text-lg sm:text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Understanding Your Rights in Consumer Disputes</h4>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">A comprehensive guide to consumer protection laws in India...</p>
                  <a href="#" className="text-[#D4AF37] text-sm hover:underline inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                    Read More <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] p-5 sm:p-6 lg:p-8 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] hover:scale-105">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all">
                  <Video className="w-9 h-9 text-[#D4AF37]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-xs text-gray-500">5 hours ago</div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Eye className="w-3 h-3" />
                      <span>28.3K</span>
                    </div>
                  </div>
                  <h4 className="mb-3 text-[#F5F5F5] leading-snug text-lg sm:text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>New Reel: What is Section 498A?</h4>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">Quick explainer on domestic violence laws in 60 seconds...</p>
                  <a href="#" className="text-[#D4AF37] text-sm hover:underline inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                    Watch Now <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] p-5 sm:p-6 lg:p-8 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] hover:scale-105">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all">
                  <Bell className="w-9 h-9 text-[#D4AF37]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-xs text-gray-500">1 day ago</div>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#D4AF37]/10 rounded-full">
                      <span className="text-xs text-[#D4AF37]">Featured</span>
                    </div>
                  </div>
                  <h4 className="mb-3 text-[#F5F5F5] leading-snug text-lg sm:text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Announcement: Free Legal Aid Camp</h4>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">Join us this weekend for a free legal consultation drive...</p>
                  <a href="#" className="text-[#D4AF37] text-sm hover:underline inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                    Learn More <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] p-5 sm:p-6 lg:p-8 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] hover:scale-105">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all">
                  <FileText className="w-9 h-9 text-[#D4AF37]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-xs text-gray-500">2 days ago</div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Eye className="w-3 h-3" />
                      <span>9.2K</span>
                    </div>
                  </div>
                  <h4 className="mb-3 text-[#F5F5F5] leading-snug text-lg sm:text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Corporate Law Update: New Compliance Requirements</h4>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">Latest changes in corporate compliance you need to know...</p>
                  <a href="#" className="text-[#D4AF37] text-sm hover:underline inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                    Read More <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] p-5 sm:p-6 lg:p-8 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] hover:scale-105">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all">
                  <Instagram className="w-9 h-9 text-[#D4AF37]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-xs text-gray-500">3 days ago</div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Eye className="w-3 h-3" />
                      <span>45.7K</span>
                    </div>
                  </div>
                  <h4 className="mb-3 text-[#F5F5F5] leading-snug text-lg sm:text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Instagram Series: Know Your Rights</h4>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">New 5-part series covering fundamental rights in India...</p>
                  <a href="#" className="text-[#D4AF37] text-sm hover:underline inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                    View Series <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] p-5 sm:p-6 lg:p-8 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] hover:scale-105">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all">
                  <Award className="w-9 h-9 text-[#D4AF37]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-xs text-gray-500">1 week ago</div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Eye className="w-3 h-3" />
                      <span>18.1K</span>
                    </div>
                  </div>
                  <h4 className="mb-3 text-[#F5F5F5] leading-snug text-lg sm:text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>LawyerPedia Wins Legal Awareness Award</h4>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">Recognized for outstanding contribution to legal education...</p>
                  <a href="#" className="text-[#D4AF37] text-sm hover:underline inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                    Read More <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <button className="px-10 py-4 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black rounded-lg hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] transition-all duration-300 hover:scale-105">
              View All Updates
            </button>
          </div>
        </div>
      </section>

      {/* CONCLAVES SECTION */}
      <section id="conclaves" className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-[#0F0F0F] to-[#0A0A0A] relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#D4AF37]/5 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 sm:mb-10 sm:mb-12 lg:mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37]/10 to-transparent rounded-full border border-[#D4AF37]/20 mb-6">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-sm">Events & Gatherings</span>
            </div>
            <h2 className="mb-6 text-[#F5F5F5] text-3xl sm:text-4xl lg:text-5xl" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>Conclaves & Events</h2>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-24 h-px bg-gradient-to-r from-transparent to-[#D4AF37]" />
              <div className="w-24 h-px bg-gradient-to-l from-transparent to-[#D4AF37]" />
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Join our transformative legal awareness conclaves and connect with experts, students, and legal enthusiasts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:p-6 lg:p-8">
            {conclaves.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-400">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>No conclaves available yet.</p>
              </div>
            )}

            {conclaves.map((conclave, index) => {
              const isUpcoming = conclave.status === 'upcoming';
              const imgs = conclave.imageUrls || [];
              const isHovered = hoveredConclaveId === conclave.id;
              const slideUrl = imgs.length > 0 ? imgs[hoverSlideIndex % imgs.length] : null;
              const coverUrl = isHovered ? slideUrl : (conclave.thumbnailUrl || imgs[0] || null);
              return (
                <div
                  key={conclave.id}
                  onMouseEnter={() => setHoveredConclaveId(conclave.id)}
                  onMouseLeave={() => setHoveredConclaveId((prev) => (prev === conclave.id ? null : prev))}
                  className="group bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl overflow-hidden border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 hover:shadow-[0_0_50px_rgba(212,175,55,0.25)] transition-all duration-300 hover:scale-105"
                >
                  <div
                    className={`relative h-56 flex items-center justify-center overflow-hidden ${
                      isUpcoming
                        ? 'bg-gradient-to-br from-[#D4AF37] to-[#F4D03F]'
                        : 'bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border-b border-[#D4AF37]/20'
                    }`}
                  >
                    {coverUrl ? (
                      <img src={coverUrl} alt={conclave.title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <Calendar className={`w-24 h-24 relative z-10 ${isUpcoming ? 'text-white/90' : 'text-[#D4AF37]'}`} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent pointer-events-none" />
                    <div className="absolute top-4 right-4 z-20">
                      <div
                        className={`px-3 py-1.5 backdrop-blur-md rounded-lg border ${
                          isUpcoming
                            ? 'bg-white/20 border-white/30'
                          : 'bg-[#1A1A1A]/80 border-[#D4AF37]/30'
                        }`}
                      >
                        <span className={`text-sm ${isUpcoming ? 'text-white' : 'text-gray-400'}`}>
                          {isUpcoming ? 'Upcoming' : 'Past Event'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 lg:p-8">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm mb-4 ${
                        isUpcoming
                          ? 'bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/5 border-[#D4AF37]/30 text-[#D4AF37]'
                          : 'bg-[#1A1A1A] border-[#D4AF37]/30 text-gray-400'
                      }`}
                    >
                      {isUpcoming ? <Award className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                      <span>{isUpcoming ? (index === 0 ? 'Featured Event' : 'Upcoming Event') : conclave.attendees}</span>
                    </div>

                    <h3 className="mb-4 text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {conclave.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">{conclave.description}</p>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                      <Calendar className="w-4 h-4 text-[#D4AF37]" />
                      <span>{conclave.date}</span>
                    </div>

                    <button
                      onClick={() => setSelectedConclave(index)}
                      className={`w-full px-6 py-3.5 rounded-lg transition-all duration-300 ${
                        isUpcoming
                          ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-105'
                          : 'bg-transparent text-[#D4AF37] border border-[#D4AF37] hover:bg-[#D4AF37]/10'
                      }`}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section id="gallery" className="py-16 sm:py-24 lg:py-32 bg-[#0A0A0A] relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#D4AF37]/5 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 sm:mb-10 sm:mb-12 lg:mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37]/10 to-transparent rounded-full border border-[#D4AF37]/20 mb-6">
              <Award className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-sm">Moments & Memories</span>
            </div>
            <h2 className="mb-6 text-[#F5F5F5] text-3xl sm:text-4xl lg:text-5xl" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>Gallery</h2>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-24 h-px bg-gradient-to-r from-transparent to-[#D4AF37]" />
              <div className="w-24 h-px bg-gradient-to-l from-transparent to-[#D4AF37]" />
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Moments from our conclaves, speaking engagements, and community events.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {gallery.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-400">
                <Scale className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>No gallery images yet.</p>
              </div>
            )}

            {gallery.map((image) => (
              <div
                key={image.id}
                className="group aspect-square bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl overflow-hidden cursor-pointer border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 hover:shadow-[0_0_40px_rgba(212,175,55,0.25)] transition-all duration-300 hover:scale-105 relative"
                title={image.title}
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <p className="text-white text-sm line-clamp-2">{image.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="bg-gradient-to-br from-[#0F0F0F] to-[#0A0A0A] text-white py-12 sm:py-16 lg:py-20 relative overflow-hidden border-t border-[#D4AF37]/10 z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF37]/5 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-10 sm:mb-12 lg:mb-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <Scale className="w-9 h-9 text-[#D4AF37]" />
                  <div className="absolute -inset-2 bg-[#D4AF37]/10 rounded-full blur-md -z-10" />
                </div>
                <span className="text-2xl text-[#F5F5F5]" style={{ fontFamily: 'Playfair Display, serif' }}>LawyerPedia</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-8 text-sm">
                Empowering individuals through legal awareness and expert guidance. Your trusted partner in understanding and accessing justice.
              </p>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/thelawyerpediaofficial/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border border-[#D4AF37]/20 rounded-xl flex items-center justify-center hover:border-[#D4AF37]/40 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all duration-300 hover:scale-110">
                  <Instagram className="w-5 h-5 text-[#D4AF37]" />
                </a>
                <a href="#" className="w-12 h-12 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border border-[#D4AF37]/20 rounded-xl flex items-center justify-center hover:border-[#D4AF37]/40 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all duration-300 hover:scale-110">
                  <Linkedin className="w-5 h-5 text-[#D4AF37]" />
                </a>
                <a href="#" className="w-12 h-12 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border border-[#D4AF37]/20 rounded-xl flex items-center justify-center hover:border-[#D4AF37]/40 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all duration-300 hover:scale-110">
                  <Twitter className="w-5 h-5 text-[#D4AF37]" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="mb-6 text-[#F5F5F5] text-lg sm:text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Quick Links</h3>
              <ul className="space-y-3">
                <li><a href="#home" className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm inline-flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all" />
                  <span>Home</span>
                </a></li>
                <li><a href="#about" className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm inline-flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all" />
                  <span>About Mehak</span>
                </a></li>
                <li><a href="#articles" className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm inline-flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all" />
                  <span>Articles</span>
                </a></li>
                <li><a href="#conclaves" className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm inline-flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all" />
                  <span>Conclaves</span>
                </a></li>
                <li><a href="#gallery" className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm inline-flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all" />
                  <span>Gallery</span>
                </a></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-6 text-[#F5F5F5] text-lg sm:text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Practice Areas</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm inline-flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all" />
                  <span>Corporate Law</span>
                </a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm inline-flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all" />
                  <span>Criminal Law</span>
                </a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm inline-flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all" />
                  <span>Civil Disputes</span>
                </a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm inline-flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all" />
                  <span>Legal Consulting</span>
                </a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm inline-flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all" />
                  <span>Compliance</span>
                </a></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-6 text-[#F5F5F5] text-lg sm:text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Contact Info</h3>
              <ul className="space-y-5">
                <li className="flex items-start gap-3 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-lg flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all">
                    <Mail className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm hover:text-[#D4AF37] transition-colors">contact@lawyerpedia.com</p>
                    <p className="text-gray-400 text-sm hover:text-[#D4AF37] transition-colors">mehak@lawyerpedia.com</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-lg flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all">
                    <Phone className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <p className="text-gray-400 text-sm hover:text-[#D4AF37] transition-colors mt-2">+91 98765 43210</p>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-lg flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all">
                    <MapPin className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <p className="text-gray-400 text-sm hover:text-[#D4AF37] transition-colors mt-2">New Delhi, India</p>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#D4AF37]/10 pt-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-gray-500 text-sm">
                © 2026 LawyerPedia. All rights reserved. | Owned by <span className="text-[#D4AF37]">Mehak Ahuja</span>
              </p>
              <div className="flex gap-5 sm:p-6 lg:p-8 text-sm">
                <a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">Disclaimer</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* CONSULTATION FORM MODAL */}
      {showConsultationForm && (
        <ConsultationForm onClose={() => setShowConsultationForm(false)} />
      )}

      {/* CONCLAVE REGISTRATION FORM */}
      {showConclaveRegistration && registrationForm && registrationConclaveIndex !== null && conclaves[registrationConclaveIndex] && (
        <ConclaveRegistrationForm
          conclaveId={conclaves[registrationConclaveIndex].id}
          conclaveTitle={conclaves[registrationConclaveIndex].title}
          form={registrationForm}
          onClose={() => {
            setShowConclaveRegistration(false);
            setRegistrationForm(null);
            setRegistrationConclaveIndex(null);
          }}
        />
      )}
    </div>
  );
}
