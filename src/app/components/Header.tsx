import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useWebsiteSettings } from '../context/WebsiteSettingsContext';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const location = useLocation();
  const { settings } = useWebsiteSettings();
  const branding = settings.branding ?? {};
  const siteTitle = branding.site_title || 'Aura Aesthetics';
  const ctaLabel = branding.header_cta_label?.trim() || 'Book Now';
  const ctaLink = branding.header_cta_link?.trim() || '/booking';
  const isExternalCta = /^https?:\/\//i.test(ctaLink);
  const logoSrc = branding.logo_url || '/logo.png';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = useMemo(() => ([
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Consent', path: '/consent' },
    { name: ctaLabel, path: ctaLink, cta: true, external: isExternalCta },
  ]), [ctaLabel, ctaLink, isExternalCta]);

  const isActive = (path: string) => location.pathname === path;

  const isHomePage = location.pathname === '/';
  const isTransparentHeader = !scrolled && isHomePage && !mobileMenuOpen;
  const headerBgClass = mobileMenuOpen
    ? 'bg-white/95 lg:bg-white/95'
    : `bg-white/90 ${isTransparentHeader && isDesktop ? 'lg:bg-transparent' : 'lg:bg-white/90'}`;

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 isolate transform-gpu ${headerBgClass} transition-shadow duration-300 ${
          scrolled ? 'shadow-lg shadow-[var(--aura-rose-gold)]/10' : 'shadow-sm shadow-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-24">
            {/* Logo */}
            <Link 
              to="/" 
              className="relative group z-50"
            >
              <img 
                src={logoSrc || '/logo.png'} 
                alt={siteTitle} 
                className="h-12 lg:h-16 w-auto transition-all duration-300"
              />
              <div className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-[var(--aura-rose-gold)] to-transparent group-hover:w-full transition-all duration-500" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-12">
              {navItems.map((item) => (
                item.cta ? (
                  item.external ? (
                    <a
                      key={`${item.path}-desktop`}
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative px-8 py-3 bg-[var(--aura-rose-gold)] text-white font-['Inter'] text-sm tracking-wide overflow-hidden group"
                    >
                      <span className="relative z-10">{item.name}</span>
                      <div className="absolute inset-0 bg-[var(--aura-deep-brown)] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                      <span className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
                        {item.name}
                      </span>
                    </a>
                  ) : (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="relative px-8 py-3 bg-[var(--aura-rose-gold)] text-white font-['Inter'] text-sm tracking-wide overflow-hidden group"
                    >
                      <span className="relative z-10">{item.name}</span>
                      <div className="absolute inset-0 bg-[var(--aura-deep-brown)] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                      <span className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
                        {item.name}
                      </span>
                    </Link>
                  )
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="relative font-['Inter'] text-sm tracking-wider text-[var(--aura-deep-brown)] transition-colors group"
                  >
                    {item.name}
                    <span className={`absolute -bottom-1 left-0 h-px bg-[var(--aura-rose-gold)] transition-all duration-300 ${
                      isActive(item.path) ? 'w-full' : 'w-0 group-hover:w-full'
                    }`} />
                  </Link>
                )
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-[var(--aura-deep-brown)] z-50 relative"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu (full-screen overlay) */}
      <div 
        className={`lg:hidden fixed inset-0 bg-white transition-all duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        } z-[65] isolate transform-gpu`}
        aria-hidden={!mobileMenuOpen}
      >
        <button
          aria-label="Close menu"
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-4 right-4 z-[70] p-3 text-[#d91f1f] bg-transparent"
        >
          <X size={22} />
        </button>

        <nav className="flex flex-col items-center justify-center h-full gap-8 px-6">
          {navItems.map((item) => (
            item.external ? (
              <a
                key={`${item.path}-mobile`}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className={`font-['Cormorant_Garamond'] text-3xl transition-all duration-300 ${
                  item.cta 
                    ? 'px-12 py-4 bg-[var(--aura-rose-gold)] text-white'
                    : 'text-[var(--aura-deep-brown)] hover:text-[var(--aura-rose-gold)]'
                }`}
              >
                {item.name}
              </a>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`font-['Cormorant_Garamond'] text-3xl transition-all duration-300 ${
                  item.cta 
                    ? 'px-12 py-4 bg-[var(--aura-rose-gold)] text-white'
                    : isActive(item.path)
                    ? 'text-[var(--aura-rose-gold)]'
                    : 'text-[var(--aura-deep-brown)] hover:text-[var(--aura-rose-gold)]'
                }`}
              >
                {item.name}
              </Link>
            )
          ))}
        </nav>
      </div>
    </>
  );
}
