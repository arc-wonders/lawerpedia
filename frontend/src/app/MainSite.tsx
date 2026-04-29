import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Menu, Scale, Briefcase, FileText, Users, Calendar, Instagram, Linkedin, Twitter, Mail, Phone, MapPin, Award, BookOpen, Video, Bell, ChevronRight, Gavel, Shield, Building2, UserCheck, ClipboardCheck } from 'lucide-react';
import mehakImage from '../imports/ms.jpg';
import logoImage from '../imports/logo.png';
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
  isFeatured?: boolean;
  createdAt: string;
}

interface ArticleItem {
  id: string;
  title: string;
  summary?: string | null;
  kind?: 'article' | 'update' | null;
  thumbnailUrl?: string | null;
  externalUrl?: string | null;
  createdAt?: string;
}

export default function MainSite() {
  const navigate = useNavigate();
  const [showConclavePopup, setShowConclavePopup] = useState(false);
  const [popupConclaveIndex, setPopupConclaveIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedConclave, setSelectedConclave] = useState<number | null>(null);
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [conclaves, setConclaves] = useState<Conclave[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [articles, setArticles] = useState<ArticleItem[]>([]);

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
    const load = async () => {
      try {
        const res = await apiJson<{ items: ArticleItem[] }>('/api/articles');
        setArticles(res.items || []);
      } catch {
        setArticles([]);
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

  const scrollToSection = (id: string, opts?: { fallbackPath?: string }) => {
    const el = document.getElementById(id);
    if (!el) {
      if (opts?.fallbackPath) navigate(opts.fallbackPath);
      else window.location.hash = `#${id}`;
      return;
    }

    setMobileMenuOpen(false);

    const prefersReducedMotion = (() => {
      try {
        return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
      } catch {
        return false;
      }
    })();

    el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });

    try {
      window.history.replaceState(null, '', `#${id}`);
    } catch {
      // ignore
    }
  };

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
                      className="px-10 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:shadow-[0_0_40px_rgba(122,86,46,0.25)] transition-all duration-300 hover:scale-105 border border-primary/30"
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
                      className="px-5 py-3 bg-card text-foreground border border-border rounded-lg hover:bg-muted transition-all droplet-btn"
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
            <div className="flex items-center gap-4">
              <img
                src={logoImage}
                alt="TheLawyerpedia"
                className="w-[60px] h-[60px] sm:w-[64px] sm:h-[64px] object-contain select-none rounded-xl"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', filter: 'brightness(0.8)', opacity: 1 }}
              />
              <span className="text-[22px] sm:text-2xl text-foreground tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>TheLawyerpedia</span>
            </div>

            <div className="hidden md:flex items-center gap-6 sm:p-5 sm:p-6 lg:p-8 lg:p-10">
              <a href="#home" className="text-muted-foreground hover:text-primary transition-colors text-[15px]">Home</a>
              <a href="#conclaves" className="text-muted-foreground hover:text-primary transition-colors text-[15px]">Conclaves</a>
              <a href="#gallery" className="text-muted-foreground hover:text-primary transition-colors text-[15px]">Gallery</a>
              <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors text-[15px]">Contact</a>
              <button
                onClick={() => setShowConsultationForm(true)}
                className="px-7 py-3 bg-transparent text-primary border border-primary/40 rounded-lg hover:bg-primary/10 hover:border-primary/60 transition-all duration-300"
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
              <a href="#conclaves" className="block text-muted-foreground hover:text-primary py-2 text-[15px]">Conclaves</a>
              <a href="#gallery" className="block text-muted-foreground hover:text-primary py-2 text-[15px]">Gallery</a>
              <a href="#contact" className="block text-muted-foreground hover:text-primary py-2 text-[15px]">Contact</a>
              <button
                onClick={() => { setShowConsultationForm(true); setMobileMenuOpen(false); }}
                className="w-full px-7 py-3 bg-transparent text-primary border border-primary/40 rounded-lg hover:bg-primary/10 hover:border-primary/60 transition-all"
              >
                Book Consultation
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section id="home" className="relative bg-background min-h-[80vh] py-[80px] flex flex-col items-center justify-center overflow-hidden z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-[40px] relative">
          <div className="max-w-[700px] mx-auto text-center">
            <div className="uppercase text-[13px] tracking-[2px] text-[#6B4C11]/70">
              FOR LAWYERS &amp; LAW STUDENTS
            </div>

            <div className="w-[80px] h-px bg-[#6B4C11]/90 mx-auto mt-[18px]" />

            <h1
              className="leading-[1.05] text-[#6B4C11] text-[46px] sm:text-[54px] lg:text-[58px] mt-[6px] lg:whitespace-nowrap max-w-[900px] mx-auto"
              style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600', letterSpacing: '-0.02em' }}
            >
              Where Legal Minds Connect
            </h1>

            <p className="mt-5 text-muted-foreground text-[16px] sm:text-[18px] leading-relaxed max-w-[520px] mx-auto">
              TheLawyerpedia brings lawyers and law students together to network, learn, and have meaningful conversations—making complex legal concepts simpler and more practical.
            </p>

            <div className="mt-7 flex justify-center">
              <button
                onClick={() => scrollToSection('conclaves')}
                className="px-10 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:shadow-[0_0_40px_rgba(122,86,46,0.25)] transition-all duration-300 hover:scale-105 inline-flex items-center justify-center gap-2 group droplet-btn"
              >
                <span>Join the Community</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT THE FOUNDER */}
      <section id="founder" className="pt-12 sm:pt-14 lg:pt-16 pb-16 sm:pb-20 lg:pb-24 bg-gradient-to-br from-[#0F0F0F] to-[#0A0A0A] relative overflow-hidden z-10">
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
                    alt="Mehak Ahuja (Adv) - Founder of TheLawyerpedia"
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
                  <span className="text-[#D4AF37] text-sm">Founder</span>
                </div>
                <h2 className="text-[#F5F5F5]" style={{ fontFamily: 'Playfair Display, serif', fontSize: '3.5rem', lineHeight: '1.1', fontWeight: '600' }}>
                  About the Founder
                </h2>
                <div className="w-24 h-px bg-gradient-to-r from-[#D4AF37] to-transparent" />
              </div>

              <div className="space-y-6">
                <p className="text-black text-base sm:text-lg leading-relaxed">
                  TheLawyerpedia is founded by Mehak Ahuja (Adv), BBA.LLB(H), LLM, who believes that the legal profession needs more accessible knowledge and authentic conversations.
                </p>
                <p className="text-black text-base sm:text-lg leading-relaxed">
                  As both a legal professional and a host, her vision has always been to create spaces where people feel comfortable sharing their experiences, asking questions, and learning without hesitation.
                </p>
                <p className="text-black text-base sm:text-lg leading-relaxed">
                  The focus is not just on teaching law, but on making it relatable, understandable, and connected to real-life experiences.
                </p>

                <div className="relative p-6 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 mt-8">
                  <div className="absolute -top-px left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
                  <p className="text-[#F5F5F5] text-lg sm:text-xl italic mb-4 leading-relaxed" style={{ fontFamily: 'Playfair Display, serif' }}>
                    "Making conversations that matter in law."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-[#D4AF37] to-transparent" />
                    <span className="text-[#D4AF37] text-sm" style={{ fontFamily: 'Playfair Display, serif' }}>Mehak Ahuja</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ABOUT THELAWYERPEDIA */}
      {false && (
      <section id="about" className="py-16 sm:py-24 lg:py-32 bg-[#0A0A0A] relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF37]/5 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 sm:mb-10 sm:mb-12 lg:mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37]/10 to-transparent rounded-full border border-[#D4AF37]/20 mb-6">
              <Scale className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-sm">Our Platform</span>
            </div>
            <h2 className="mb-6 text-[#F5F5F5] text-3xl sm:text-4xl lg:text-5xl" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>About TheLawyerpedia</h2>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-24 h-px bg-gradient-to-r from-transparent to-[#D4AF37]" />
              <div className="w-24 h-px bg-gradient-to-l from-transparent to-[#D4AF37]" />
            </div>
            <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
              TheLawyerpedia is built to bridge the gap between lawyers and law students by encouraging meaningful communication and breaking down complex legal concepts into simple, practical understanding.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-5 sm:p-6 lg:p-8 mb-10 sm:mb-12 lg:mb-16">
            <div className="p-6 sm:p-7 lg:p-8 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20">
              <h3 className="mb-4 text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Why it began</h3>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                Law as a profession is often perceived as rigid, hierarchical, and intimidating—meaningful conversations are rare. Many of us enter law school or the profession with questions, uncertainties, and ambition, but very few safe, open spaces to express them, learn from others, or simply feel understood.
              </p>
            </div>

            <div className="p-6 sm:p-7 lg:p-8 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20">
              <h3 className="mb-4 text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Our story</h3>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                TheLawyerpedia started with a simple thought: what if there was a space where legal minds could connect beyond courtrooms, classrooms, and formal settings—and complex laws were explained in very simple language? What began as an effort to teach and explain law in the easiest possible manner grew into webinars and interactive sessions, and eventually into a community.
              </p>
            </div>

            <div className="p-6 sm:p-7 lg:p-8 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20">
              <h3 className="mb-4 text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Our mission</h3>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-4">
                At its core, TheLawyerpedia stands for one simple idea:
                <span className="block mt-2 text-[#F5F5F5] italic" style={{ fontFamily: 'Playfair Display, serif' }}>
                  “Making conversations that matter in law.”
                </span>
              </p>
              <ul className="text-gray-400 text-sm sm:text-base leading-relaxed space-y-2 list-disc pl-5">
                <li>Bridge the gap between lawyers and law students</li>
                <li>Make legal knowledge simple, practical, and accessible</li>
                <li>Encourage open and meaningful discussions</li>
                <li>Create opportunities for learning beyond traditional methods</li>
                <li>Build a supportive and connected legal community</li>
              </ul>
            </div>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-[#F5F5F5] text-2xl sm:text-3xl" style={{ fontFamily: 'Playfair Display, serif' }}>What we do</h3>
            <p className="text-gray-400 max-w-3xl mx-auto mt-3 text-base leading-relaxed">
              We simplify law, host discussions, and create spaces where people learn through real conversations—not just lectures.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 sm:p-6 lg:p-8">
            <div className="text-center p-6 sm:p-5 sm:p-6 lg:p-8 lg:p-10 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] hover:scale-105 group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-2xl mb-6 group-hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all duration-300 border border-[#D4AF37]/30">
                <BookOpen className="w-10 h-10 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="mb-4 text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Simplify Law</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Breaking down complex legal concepts into easy, understandable insights.
              </p>
            </div>

            <div className="text-center p-6 sm:p-5 sm:p-6 lg:p-8 lg:p-10 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] hover:scale-105 group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-2xl mb-6 group-hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all duration-300 border border-[#D4AF37]/30">
                <Video className="w-10 h-10 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="mb-4 text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Webinars & Discussions</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Addressing important legal issues and real-world challenges through interactive sessions.
              </p>
            </div>

            <div className="text-center p-6 sm:p-5 sm:p-6 lg:p-8 lg:p-10 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] hover:scale-105 group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-2xl mb-6 group-hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all duration-300 border border-[#D4AF37]/30">
                <Calendar className="w-10 h-10 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="mb-4 text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>TLP Conclave</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Connecting legal minds across different stages of their journey through conversations and community.
              </p>
            </div>

            <div className="text-center p-6 sm:p-5 sm:p-6 lg:p-8 lg:p-10 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] hover:scale-105 group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-2xl mb-6 group-hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all duration-300 border border-[#D4AF37]/30">
                <Users className="w-10 h-10 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="mb-4 text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Meaningful Interactions</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Encouraging conversations that go beyond formal and surface-level networking.
              </p>
            </div>
          </div>

          <div className="mt-10 sm:mt-12 lg:mt-16 sm:p-6 lg:p-8">
            <div className="p-7 lg:p-10 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20">
              <h3 className="mb-4 text-[#F5F5F5] text-2xl sm:text-3xl" style={{ fontFamily: 'Playfair Display, serif' }}>Looking ahead</h3>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                TheLawyerpedia is more than just a platform—it is a growing movement. As the community grows, so does the commitment to making law simpler, more inclusive, and more connected for everyone. What began as conversations has now taken shape through conclaves, discussions, networking events, and collaborative spaces—each designed to make law more accessible, human, and connected.
              </p>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* PRACTICE AREAS / SERVICES */}
      <section id="practice" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-[#0F0F0F] to-[#0A0A0A] relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#D4AF37]/5 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-10 sm:mb-12 lg:mb-14">
            <h2 className="mb-6 text-[#F5F5F5] text-3xl sm:text-4xl lg:text-5xl" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>Practice Areas</h2>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-24 h-px bg-gradient-to-r from-transparent to-[#D4AF37]" />
              <div className="w-24 h-px bg-gradient-to-l from-transparent to-[#D4AF37]" />
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              TLP represents clients across multiple forums, including the Supreme Court of India, various High Courts, and specialized tribunals—handling a diverse range of matters with a practical and solution-oriented approach.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:p-6 lg:p-8">
            <div className="p-6 sm:p-5 sm:p-6 lg:p-8 lg:p-10 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] transition-all duration-300 hover:scale-105 group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all border border-[#D4AF37]/30">
                <Scale className="w-7 h-7 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="mb-4 text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Supreme Court & High Courts</h3>
              <ul className="text-gray-400 text-sm leading-relaxed space-y-2 list-disc pl-5">
                <li>Constitutional issues</li>
                <li>Civil and criminal appeals</li>
                <li>Writ petitions and Special Leave Petitions (SLPs)</li>
              </ul>
            </div>

            <div className="p-6 sm:p-5 sm:p-6 lg:p-8 lg:p-10 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] transition-all duration-300 hover:scale-105 group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all border border-[#D4AF37]/30">
                <ClipboardCheck className="w-7 h-7 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="mb-4 text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Arbitration & Dispute Resolution</h3>
              <ul className="text-gray-400 text-sm leading-relaxed space-y-2 list-disc pl-5">
                <li>Commercial and contractual disputes</li>
                <li>Domestic arbitration proceedings</li>
                <li>Enforcement of arbitral awards</li>
                <li>Pre-arbitration strategy and dispute management</li>
              </ul>
            </div>

            <div className="p-6 sm:p-5 sm:p-6 lg:p-8 lg:p-10 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] transition-all duration-300 hover:scale-105 group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all border border-[#D4AF37]/30">
                <Building2 className="w-7 h-7 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="mb-4 text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Tribunals & DRT</h3>
              <ul className="text-gray-400 text-sm leading-relaxed space-y-2 list-disc pl-5">
                <li>Debt Recovery Tribunal (DRT) and other quasi-judicial authorities</li>
                <li>Recovery proceedings and enforcement actions</li>
                <li>Banking and financial disputes</li>
              </ul>
            </div>

            <div className="p-6 sm:p-5 sm:p-6 lg:p-8 lg:p-10 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] transition-all duration-300 hover:scale-105 group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all border border-[#D4AF37]/30">
                <Award className="w-7 h-7 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="mb-4 text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Intellectual Property Rights (IPR)</h3>
              <ul className="text-gray-400 text-sm leading-relaxed space-y-2 list-disc pl-5">
                <li>Trademark registration and prosecution</li>
                <li>Objections and opposition proceedings</li>
                <li>Brand protection and infringement matters</li>
              </ul>
            </div>

            <div className="p-6 sm:p-5 sm:p-6 lg:p-8 lg:p-10 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] transition-all duration-300 hover:scale-105 group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all border border-[#D4AF37]/30">
                <Users className="w-7 h-7 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="mb-4 text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Matrimonial & Family Law</h3>
              <ul className="text-gray-400 text-sm leading-relaxed space-y-2 list-disc pl-5">
                <li>Divorce and separation</li>
                <li>Maintenance and alimony</li>
                <li>Child custody and family disputes</li>
              </ul>
            </div>

            <div className="p-6 sm:p-5 sm:p-6 lg:p-8 lg:p-10 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] transition-all duration-300 hover:scale-105 group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all border border-[#D4AF37]/30">
                <FileText className="w-7 h-7 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="mb-4 text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Civil & Criminal Litigation</h3>
              <ul className="text-gray-400 text-sm leading-relaxed space-y-2 list-disc pl-5">
                <li>Contractual and commercial matters, property disputes, injunctions, and recovery suits</li>
                <li>Bail applications, trial proceedings, and criminal complaints/defense</li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* BULLETIN BOARD */}
      <section id="articles" className="py-16 sm:py-20 lg:py-24 bg-[#0A0A0A] relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/8 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-10 sm:mb-12 lg:mb-14">
            <h2 className="mb-6 text-[#F5F5F5] text-3xl sm:text-4xl lg:text-5xl" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>Articles</h2>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-24 h-px bg-gradient-to-r from-transparent to-[#D4AF37]" />
              <div className="w-24 h-px bg-gradient-to-l from-transparent to-[#D4AF37]" />
            </div>


          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:p-6 lg:p-8">
            {articles.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-400">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>No updates yet.</p>
              </div>
            )}

            {articles.slice(0, 6).map((a) => {
              const kind = (a.kind || 'article') as 'article' | 'update';
              const Icon = kind === 'update' ? Bell : BookOpen;
              const date = a.createdAt
                ? new Date(a.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                : '';
              return (
                <div
                  key={a.id}
                  className="group bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] p-5 sm:p-6 lg:p-8 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] hover:scale-105"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all overflow-hidden">
                      {a.thumbnailUrl ? (
                        <img src={a.thumbnailUrl} alt={a.title} className="h-full w-full object-cover" />
                      ) : (
                        <Icon className="w-9 h-9 text-[#D4AF37]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        {date && <div className="text-xs text-gray-500">{date}</div>}
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#D4AF37]/10 rounded-full">
                          <span className="text-xs text-[#D4AF37]">{kind === 'update' ? 'Update' : 'Article'}</span>
                        </div>
                      </div>
                      <h4 className="mb-3 text-[#F5F5F5] leading-snug text-lg sm:text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {a.title}
                      </h4>
                      {a.summary && (
                        <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                          {a.summary}
                        </p>
                      )}
                      <button
                        onClick={() => {
                          if (a.externalUrl) window.open(a.externalUrl, '_blank', 'noopener,noreferrer');
                          else navigate(`/articles/${a.id}`);
                        }}
                        className="text-[#D4AF37] text-sm hover:underline inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all droplet-btn"
                      >
                        View <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* CONCLAVES SECTION */}
      <section id="conclaves" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-[#0F0F0F] to-[#0A0A0A] relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#D4AF37]/5 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-10 sm:mb-12 lg:mb-14">
            <h2 className="mb-6 text-[#F5F5F5] text-3xl sm:text-4xl lg:text-5xl" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>TLP Conclave</h2>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-24 h-px bg-gradient-to-r from-transparent to-[#D4AF37]" />
              <div className="w-24 h-px bg-gradient-to-l from-transparent to-[#D4AF37]" />
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              A signature initiative of TheLawyerpedia—designed to bring together lawyers and law students on a common platform for meaningful, engaging, and practical conversations.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10 lg:gap-12">
            <div className="pl-6 border-l border-[#D4AF37]/25 space-y-3">
              <h3 className="text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>About the conclave</h3>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                A relaxed, conversation-first gathering where lawyers and law students share real experiences beyond formal panels and courtrooms.
              </p>
            </div>

            <div className="pl-6 border-l border-[#D4AF37]/25 space-y-3">
              <h3 className="text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>What makes it different</h3>
              <ul className="text-gray-400 text-sm sm:text-base leading-relaxed space-y-2 list-disc pl-5">
                <li>Interactive, small-group discussions</li>
                <li>Practical, on-ground insights and stories</li>
                <li>Purposeful networking across experience levels</li>
              </ul>
            </div>

            <div className="pl-6 border-l border-[#D4AF37]/25 space-y-3">
              <h3 className="text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Purpose & vision</h3>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                Built to bridge theory and practice—and to create an approachable space for learning and connection.
              </p>
              <ul className="text-gray-400 text-sm sm:text-base leading-relaxed space-y-2 list-disc pl-5">
                <li>Learn from real journeys</li>
                <li>Build confidence to speak up</li>
                <li>Form lasting professional relationships</li>
              </ul>
            </div>
          </div>

          <div className="mt-16 sm:mt-20 lg:mt-24 grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                  className="group bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-[#D4AF37]/30 hover:shadow-[0_18px_60px_rgba(0,0,0,0.55)] transition-all duration-300 hover:-translate-y-1"
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
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(122,86,46,0.25)] hover:scale-105 border border-primary/30 droplet-btn'
                          : 'bg-card text-foreground border border-border hover:bg-muted droplet-btn'
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
      <section id="gallery" className="py-16 sm:py-20 lg:py-24 bg-[#0A0A0A] relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#D4AF37]/5 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-10 sm:mb-12 lg:mb-14">
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

            {(gallery.filter(g => g.isFeatured).length > 0 ? gallery.filter(g => g.isFeatured).slice(0, 4) : gallery.slice(0, 4)).map((image) => (
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

          {gallery.length > 4 && (
            <div className="text-center mt-12">
              <button
                onClick={() => navigate('/gallery')}
                className="px-10 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:shadow-[0_0_40px_rgba(122,86,46,0.25)] transition-all duration-300 hover:scale-105 border border-primary/30 droplet-btn"
              >
                View All Photos
              </button>
            </div>
          )}
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
                <span className="text-2xl text-[#F5F5F5]" style={{ fontFamily: 'Playfair Display, serif' }}>TheLawyerpedia</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-8 text-sm">
                A platform for lawyers and law students to network, learn, and build meaningful conversations—making law simpler, more accessible, and more human.
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
                <li><a href="#founder" className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm inline-flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all" />
                  <span>Founder</span>
                </a></li>
                <li><a href="#conclaves" className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm inline-flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all" />
                  <span>TLP Conclave</span>
                </a></li>
                <li><a href="#gallery" className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm inline-flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all" />
                  <span>Gallery</span>
                </a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm inline-flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all" />
                  <span>Contact</span>
                </a></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-6 text-[#F5F5F5] text-lg sm:text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Practice Areas</h3>
              <ul className="space-y-3">
                <li><a href="#practice" className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm inline-flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all" />
                  <span>Supreme Court & High Courts</span>
                </a></li>
                <li><a href="#practice" className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm inline-flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all" />
                  <span>Arbitration & Dispute Resolution</span>
                </a></li>
                <li><a href="#practice" className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm inline-flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all" />
                  <span>Tribunals & DRT</span>
                </a></li>
                <li><a href="#practice" className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm inline-flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all" />
                  <span>Intellectual Property Rights (IPR)</span>
                </a></li>
                <li><a href="#practice" className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm inline-flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all" />
                  <span>Matrimonial & Family Law</span>
                </a></li>
                <li><a href="#practice" className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm inline-flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all" />
                  <span>Civil & Criminal Litigation</span>
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
                © 2026 TheLawyerpedia. All rights reserved. | Owned by <span className="text-[#D4AF37]">Mehak Ahuja</span>
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
