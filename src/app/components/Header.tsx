import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Consent', path: '/consent' },
    { name: 'Book Now', path: '/booking', cta: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-[var(--aura-rose-gold)]/5' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link 
            to="/" 
            className="relative group"
          >
            <img 
              src="/logo.png" 
              alt="Aura Aesthetics" 
              className="h-12 lg:h-16 w-auto transition-all duration-300"
            />
            <div className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-[var(--aura-rose-gold)] to-transparent group-hover:w-full transition-all duration-500" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-12">
            {navItems.map((item) => (
              item.cta ? (
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
            className="lg:hidden p-2 text-[var(--aura-deep-brown)]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`lg:hidden fixed inset-0 top-24 bg-white/98 backdrop-blur-xl transition-all duration-500 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col items-center justify-center h-full gap-8 px-6">
          {navItems.map((item) => (
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
          ))}
        </nav>
      </div>
    </header>
  );
}
