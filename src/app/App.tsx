/**
 * MAIN APP COMPONENT
 * Laravel-ready React structure with routing
 * Can be converted to Blade templates
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const About = lazy(() => import('./pages/About').then(module => ({ default: module.About })));
const Services = lazy(() => import('./pages/Services').then(module => ({ default: module.Services })));
const Consent = lazy(() => import('./pages/Consent').then(module => ({ default: module.Consent })));
const Booking = lazy(() => import('./pages/Booking').then(module => ({ default: module.Booking })));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--aura-cream)]">
    <div className="text-center">
      <div className="inline-block w-16 h-16 border-4 border-[var(--aura-rose-gold)] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-['Inter'] text-sm tracking-wider text-[var(--aura-soft-taupe)]">Loading...</p>
    </div>
  </div>
);

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-['Montserrat']">
        <Header />
        
        <main className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/consent" element={<Consent />} />
              <Route path="/booking" element={<Booking />} />
            </Routes>
          </Suspense>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

