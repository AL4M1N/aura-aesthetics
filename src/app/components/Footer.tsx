import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, Clock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[var(--aura-deep-brown)] text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <img 
              src="/logo.png" 
              alt="Aura Aesthetics" 
              className="h-16 lg:h-20 w-auto mb-6"
            />
            <p className="font-['Inter'] text-white/70 leading-relaxed mb-8 max-w-md">
              CPD-accredited aesthetic practitioner specializing in natural-looking enhancements. 
              Trained by Rejuvenate with a commitment to safety and excellence.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              <a 
                href="#" 
                className="w-12 h-12 border border-white/20 flex items-center justify-center hover:bg-[var(--aura-rose-gold)] hover:border-[var(--aura-rose-gold)] transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-12 h-12 border border-white/20 flex items-center justify-center hover:bg-[var(--aura-rose-gold)] hover:border-[var(--aura-rose-gold)] transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-['Inter'] text-sm tracking-[0.2em] uppercase mb-6 text-[var(--aura-rose-gold)]">
              Navigate
            </h4>
            <ul className="space-y-4">
              {['Home', 'About', 'Services', 'Consent', 'Booking'].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`}
                    className="font-['Inter'] text-sm text-white/70 hover:text-[var(--aura-rose-gold)] transition-colors duration-300"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-['Inter'] text-sm tracking-[0.2em] uppercase mb-6 text-[var(--aura-rose-gold)]">
              Contact
            </h4>
            <ul className="space-y-4 font-['Inter'] text-sm text-white/70">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[var(--aura-rose-gold)] flex-shrink-0 mt-0.5" />
                <span>Ilford, London<br />United Kingdom</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[var(--aura-rose-gold)] flex-shrink-0" />
                <a href="mailto:info@auraaesthetics.co.uk" className="hover:text-[var(--aura-rose-gold)] transition-colors">
                  info@auraaesthetics.co.uk
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[var(--aura-rose-gold)] flex-shrink-0" />
                <a href="tel:+447XXX123456" className="hover:text-[var(--aura-rose-gold)] transition-colors">
                  +44 7XXX 123456
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[var(--aura-rose-gold)] flex-shrink-0 mt-0.5" />
                <span>By Appointment Only</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/50 font-['Inter']">
            <p>
              © {new Date().getFullYear()} Aura Aesthetics. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-[var(--aura-rose-gold)] transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-[var(--aura-rose-gold)] transition-colors">
                Terms & Conditions
              </Link>
            </div>
          </div>
          <p className="text-xs text-white/30 font-['Inter'] text-center mt-4">
            Medical Disclaimer: Results vary per individual. All treatments require consultation.
          </p>
        </div>
      </div>
    </footer>
  );
}
