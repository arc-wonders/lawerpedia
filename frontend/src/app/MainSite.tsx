import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Menu, Scale, FileText, Users, Calendar, Instagram, Linkedin, Twitter, Mail, Phone, MapPin, Award, BookOpen, ChevronRight, Building2, ClipboardCheck, MessageCircle, Send } from 'lucide-react';
import { motion, useInView } from 'motion/react';
import mehakImage from '../imports/ms.jpg';
import logoImage from '../imports/logo.png';
import { articles } from './articlesData';

function FadeIn({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

function SlideIn({ children, className, direction = 'left', delay = 0 }: { children: React.ReactNode; className?: string; direction?: 'left' | 'right'; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const x = direction === 'left' ? -50 : 50;
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, x }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

function ScaleIn({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

export default function MainSite() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) {
      window.location.hash = `#${id}`;
      return;
    }
    setMobileMenuOpen(false);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    try { window.history.replaceState(null, '', `#${id}`); } catch {}
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative" style={{ fontFamily: 'Inter, sans-serif' }}>

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
                style={{ userSelect: 'none', filter: 'brightness(0.8)' }}
              />
              <span className="text-[22px] sm:text-2xl text-foreground tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>TheLawyerpedia</span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <a href="#home" className="text-muted-foreground hover:text-primary transition-colors text-[15px]">Home</a>
              <a href="#articles" className="text-muted-foreground hover:text-primary transition-colors text-[15px]">Articles</a>
              <a href="#conclaves" className="text-muted-foreground hover:text-primary transition-colors text-[15px]">Conclaves</a>
              <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors text-[15px]">Contact</a>
            </div>

            <button className="md:hidden text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu size={24} />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-4 py-6 space-y-4">
              <a href="#home" className="block text-muted-foreground hover:text-primary py-2 text-[15px]">Home</a>
              <a href="#articles" className="block text-muted-foreground hover:text-primary py-2 text-[15px]">Articles</a>
              <a href="#conclaves" className="block text-muted-foreground hover:text-primary py-2 text-[15px]">Conclaves</a>
              <a href="#contact" className="block text-muted-foreground hover:text-primary py-2 text-[15px]">Contact</a>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section id="home" className="relative bg-background overflow-hidden z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-6 items-center py-16 sm:py-20 lg:py-28">

            {/* Left — Text */}
            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-[15px] text-primary/80 mb-3"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}
              >
                Adv. Mehak Ahuja
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-foreground text-[40px] sm:text-[50px] lg:text-[56px] leading-[1.1]"
                style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600', letterSpacing: '-0.02em' }}
              >
                Corporate, Commercial &{' '}
                <span className="text-primary">Matrimonial</span>{' '}
                Lawyer
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55 }}
                className="mt-6 text-muted-foreground text-[17px] leading-relaxed"
              >
                Practical legal solutions for individuals and businesses.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.75 }}
                className="mt-8 flex flex-wrap items-center gap-4"
              >
                <button
                  onClick={() => scrollToSection('consultation')}
                  className="px-8 py-3.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:shadow-[0_0_40px_rgba(122,86,46,0.25)] transition-all duration-300 hover:scale-105 inline-flex items-center justify-center gap-2"
                  style={{ fontWeight: '500' }}
                >
                  Book a Consultation
                </button>
                <a
                  href="https://wa.me/918750694783?text=Hi%2C%20I%20would%20like%20to%20discuss%20a%20legal%20matter%20with%20you."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3.5 text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-all duration-300 inline-flex items-center gap-2"
                  style={{ fontWeight: '500' }}
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp Me
                </a>
              </motion.div>
            </div>

            {/* Right — Animated brandmark */}
            <div className="relative hidden lg:flex items-center justify-center">
              {/* Slow rotating ring */}
              <motion.div
                className="absolute w-[340px] h-[340px] rounded-full border border-primary/10"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/30" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary/20" />
              </motion.div>

              <motion.div
                className="absolute w-[260px] h-[260px] rounded-full border border-primary/8"
                animate={{ rotate: -360 }}
                transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
              >
                <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary/25" />
              </motion.div>

              {/* Scale icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative z-10 flex flex-col items-center"
              >
                {/* SVG scale of justice */}
                <motion.svg
                  width="120"
                  height="120"
                  viewBox="0 0 120 120"
                  fill="none"
                  className="text-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.6 }}
                >
                  {/* Pillar */}
                  <motion.line
                    x1="60" y1="20" x2="60" y2="100"
                    stroke="currentColor" strokeWidth="2"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, delay: 0.7, ease: 'easeInOut' }}
                  />
                  {/* Base */}
                  <motion.line
                    x1="40" y1="100" x2="80" y2="100"
                    stroke="currentColor" strokeWidth="2"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 1.6, ease: 'easeOut' }}
                  />
                  {/* Beam */}
                  <motion.line
                    x1="20" y1="30" x2="100" y2="30"
                    stroke="currentColor" strokeWidth="2"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 1.0, ease: 'easeInOut' }}
                  />
                  {/* Left pan strings */}
                  <motion.line x1="20" y1="30" x2="15" y2="55" stroke="currentColor" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 1.5 }} />
                  <motion.line x1="20" y1="30" x2="35" y2="55" stroke="currentColor" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 1.5 }} />
                  {/* Left pan */}
                  <motion.path
                    d="M10 55 Q25 70 40 55"
                    stroke="currentColor" strokeWidth="1.5" fill="none"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 1.8, ease: 'easeOut' }}
                  />
                  {/* Right pan strings */}
                  <motion.line x1="100" y1="30" x2="85" y2="55" stroke="currentColor" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 1.5 }} />
                  <motion.line x1="100" y1="30" x2="105" y2="55" stroke="currentColor" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 1.5 }} />
                  {/* Right pan */}
                  <motion.path
                    d="M80 55 Q95 70 110 55"
                    stroke="currentColor" strokeWidth="1.5" fill="none"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 1.8, ease: 'easeOut' }}
                  />
                  {/* Top ornament */}
                  <motion.circle
                    cx="60" cy="20" r="4"
                    stroke="currentColor" strokeWidth="1.5" fill="none"
                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 2.2 }}
                  />
                </motion.svg>

                {/* Brand name below */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 2.0 }}
                  className="mt-6 text-center"
                >
                  <div className="text-2xl text-primary tracking-tight" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>
                    TheLawyerpedia
                  </div>
                  <div className="w-12 h-px bg-primary/40 mx-auto mt-3" />
                  <div className="text-[10px] uppercase tracking-[3px] text-muted-foreground mt-3">
                    Est. 2024
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="border-t border-border py-8 grid grid-cols-3 gap-6 text-center"
          >
            <div>
              <div className="text-2xl sm:text-3xl text-foreground" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>6+</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Practice Areas</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl text-foreground" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>Pan-India</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Court Presence</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl text-foreground" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>TLP</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Conclave Initiative</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ABOUT THE FOUNDER */}
      <section id="founder" className="pt-12 sm:pt-14 lg:pt-16 pb-16 sm:pb-20 lg:pb-24 bg-gradient-to-br from-[#0F0F0F] to-[#0A0A0A] relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#D4AF37]/5 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-5 sm:gap-12 lg:gap-20 items-center">
            <SlideIn direction="left" className="relative order-2 lg:order-1 max-w-sm mx-auto lg:mx-0">
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
                    style={{ userSelect: 'none' }}
                  />
                </div>
              </div>
              <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl -z-10" />
            </SlideIn>

            <SlideIn direction="right" className="space-y-8 order-1 lg:order-2">
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
            </SlideIn>
          </div>
        </div>
      </section>

      {/* PRACTICE AREAS */}
      <section id="practice" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-[#0F0F0F] to-[#0A0A0A] relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#D4AF37]/5 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeIn className="text-center mb-10 sm:mb-12 lg:mb-14">
            <h2 className="mb-6 text-[#F5F5F5] text-3xl sm:text-4xl lg:text-5xl" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>Practice Areas</h2>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-24 h-px bg-gradient-to-r from-transparent to-[#D4AF37]" />
              <div className="w-24 h-px bg-gradient-to-l from-transparent to-[#D4AF37]" />
            </div>
            <p className="text-black max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              TLP represents clients across multiple forums, including the Supreme Court of India, various High Courts, and specialized tribunals—handling a diverse range of matters with a practical and solution-oriented approach.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: Scale, title: 'Supreme Court & High Courts', items: ['Constitutional issues', 'Civil and criminal appeals', 'Writ petitions and Special Leave Petitions (SLPs)'] },
              { icon: ClipboardCheck, title: 'Arbitration & Dispute Resolution', items: ['Commercial and contractual disputes', 'Domestic arbitration proceedings', 'Enforcement of arbitral awards', 'Pre-arbitration strategy and dispute management'] },
              { icon: Building2, title: 'Tribunals & DRT', items: ['Debt Recovery Tribunal (DRT) and other quasi-judicial authorities', 'Recovery proceedings and enforcement actions', 'Banking and financial disputes'] },
              { icon: Award, title: 'Intellectual Property Rights (IPR)', items: ['Trademark registration and prosecution', 'Objections and opposition proceedings', 'Brand protection and infringement matters'] },
              { icon: Users, title: 'Matrimonial & Family Law', items: ['Divorce and separation', 'Maintenance and alimony', 'Child custody and family disputes'] },
              { icon: FileText, title: 'Civil & Criminal Litigation', items: ['Contractual and commercial matters, property disputes, injunctions, and recovery suits', 'Bail applications, trial proceedings, and criminal complaints/defense'] },
            ].map((area, i) => (
              <ScaleIn key={area.title} delay={i * 0.08}>
                <div className="group bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-[#D4AF37]/20 transition-colors duration-200">
                  <div className="p-6 sm:p-8 lg:p-10 space-y-6 border-b border-white/5">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-xl flex items-center justify-center border border-[#D4AF37]/30">
                      <area.icon className="w-7 h-7 text-[#D4AF37]" />
                    </div>
                    <div>
                      <h3 className="mb-4 text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>{area.title}</h3>
                      <ul className="text-gray-400 text-sm leading-relaxed space-y-2 list-disc pl-5">
                        {area.items.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* ARTICLES */}
      <section id="articles" className="py-16 sm:py-20 lg:py-24 bg-[#0A0A0A] relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/8 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeIn className="text-center mb-10 sm:mb-12 lg:mb-14">
            <h2 className="mb-6 text-[#F5F5F5] text-3xl sm:text-4xl lg:text-5xl" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>Articles</h2>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-24 h-px bg-gradient-to-r from-transparent to-[#D4AF37]" />
              <div className="w-24 h-px bg-gradient-to-l from-transparent to-[#D4AF37]" />
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((a, i) => {
              const date = new Date(a.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
              return (
                <FadeIn key={a.id} delay={i * 0.12}>
                  <div
                    className="group bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] p-5 sm:p-6 lg:p-8 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] cursor-pointer"
                    onClick={() => navigate(`/articles/${a.id}`)}
                  >
                    <div className="flex items-start gap-5">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all overflow-hidden">
                        <BookOpen className="w-9 h-9 text-[#D4AF37]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="text-xs text-gray-500">{date}</div>
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#D4AF37]/10 rounded-full">
                            <span className="text-xs text-[#D4AF37]">Article</span>
                          </div>
                        </div>
                        <h4 className="mb-3 text-[#F5F5F5] leading-snug text-lg sm:text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                          {a.title}
                        </h4>
                        <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-3">
                          {a.summary}
                        </p>
                        <span className="text-[#D4AF37] text-sm hover:underline inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                          Read Article <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>

          <FadeIn delay={0.4} className="text-center mt-10">
            <button
              onClick={() => navigate('/articles')}
              className="px-10 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:shadow-[0_0_40px_rgba(122,86,46,0.25)] transition-all duration-300 hover:scale-105 border border-primary/30 droplet-btn"
            >
              View All Articles
            </button>
          </FadeIn>
        </div>
      </section>

      {/* CONCLAVES */}
      <section id="conclaves" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-[#0F0F0F] to-[#0A0A0A] relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#D4AF37]/5 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeIn className="text-center mb-10 sm:mb-12 lg:mb-14">
            <h2 className="mb-6 text-[#F5F5F5] text-3xl sm:text-4xl lg:text-5xl" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>TLP Conclave</h2>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-24 h-px bg-gradient-to-r from-transparent to-[#D4AF37]" />
              <div className="w-24 h-px bg-gradient-to-l from-transparent to-[#D4AF37]" />
            </div>
            <p className="text-black max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              A signature initiative of TheLawyerpedia—designed to bring together lawyers and law students on a common platform for meaningful, engaging, and practical conversations.
            </p>
          </FadeIn>

          <div className="grid lg:grid-cols-3 gap-10 lg:gap-12">
            {[
              { title: 'About the conclave', content: <p className="text-gray-400 text-sm sm:text-base leading-relaxed">A relaxed, conversation-first gathering where lawyers and law students share real experiences beyond formal panels and courtrooms.</p> },
              { title: 'What makes it different', content: <ul className="text-gray-400 text-sm sm:text-base leading-relaxed space-y-2 list-disc pl-5"><li>Interactive, small-group discussions</li><li>Practical, on-ground insights and stories</li><li>Purposeful networking across experience levels</li></ul> },
              { title: 'Purpose & vision', content: <><p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-2">Built to bridge theory and practice—and to create an approachable space for learning and connection.</p><ul className="text-gray-400 text-sm sm:text-base leading-relaxed space-y-2 list-disc pl-5"><li>Learn from real journeys</li><li>Build confidence to speak up</li><li>Form lasting professional relationships</li></ul></> },
            ].map((col, i) => (
              <FadeIn key={col.title} delay={i * 0.15}>
                <div className="pl-6 border-l border-[#D4AF37]/25 space-y-3">
                  <h3 className="text-[#F5F5F5] text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>{col.title}</h3>
                  {col.content}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CONSULTATION FORM */}
      <section id="consultation" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-background to-muted/20 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl text-foreground mb-4" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>
              Tell us about your legal issue
            </h2>
            <p className="text-muted-foreground text-[16px]">
              Fill out the form below and we'll get back to you within 24 hours
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <form className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">Name</label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="area" className="block text-sm font-medium text-foreground mb-2">Area of Law</label>
                <select
                  id="area"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  <option value="">Select an area</option>
                  <option value="corporate">Corporate Law</option>
                  <option value="commercial">Commercial Law</option>
                  <option value="matrimonial">Matrimonial & Family Law</option>
                  <option value="arbitration">Arbitration & Dispute Resolution</option>
                  <option value="ipr">Intellectual Property Rights</option>
                  <option value="civil">Civil Litigation</option>
                  <option value="criminal">Criminal Litigation</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">Briefly describe your matter</label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                  placeholder="Please provide a brief overview of your legal issue..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:shadow-[0_0_40px_rgba(122,86,46,0.25)] transition-all duration-300 inline-flex items-center justify-center gap-2 group"
                style={{ fontWeight: '500' }}
              >
                <span>Request Consultation</span>
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="bg-gradient-to-br from-[#0F0F0F] to-[#0A0A0A] text-white py-12 sm:py-16 lg:py-20 relative overflow-hidden border-t border-[#D4AF37]/10 z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF37]/5 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-10 sm:mb-12 lg:mb-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Scale className="w-9 h-9 text-[#D4AF37]" />
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
                {['Home', 'Founder', 'Articles', 'TLP Conclave', 'Contact'].map((label) => (
                  <li key={label}><a href={`#${label === 'TLP Conclave' ? 'conclaves' : label.toLowerCase()}`} className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm">{label}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-6 text-[#F5F5F5] text-lg sm:text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Practice Areas</h3>
              <ul className="space-y-3">
                {['Supreme Court & High Courts', 'Arbitration & Dispute Resolution', 'Tribunals & DRT', 'Intellectual Property Rights (IPR)', 'Matrimonial & Family Law', 'Civil & Criminal Litigation'].map((area) => (
                  <li key={area}><a href="#practice" className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm">{area}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-6 text-[#F5F5F5] text-lg sm:text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Contact Info</h3>
              <ul className="space-y-5">
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-lg flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30">
                    <Mail className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm hover:text-[#D4AF37] transition-colors">Thelawyerpedia@gmail.com</p>
                    <p className="text-gray-400 text-sm hover:text-[#D4AF37] transition-colors">Advocatemehakahuja@gmail.com</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-lg flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30">
                    <Phone className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <p className="text-gray-400 text-sm hover:text-[#D4AF37] transition-colors mt-2">+91 8750694783</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-lg flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30">
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
                &copy; 2026 TheLawyerpedia. All rights reserved. | Owned by <span className="text-[#D4AF37]">Mehak Ahuja</span>
              </p>
              <div className="flex gap-5 text-sm">
                <a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">Disclaimer</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
