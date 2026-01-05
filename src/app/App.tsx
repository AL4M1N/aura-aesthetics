/**
 * MAIN APP COMPONENT
 * Laravel-ready React structure with routing
 * Can be converted to Blade templates
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { useVisitorTracking } from '../hooks/useVisitorTracking';
import { Toaster } from './components/ui/sonner';
import { WebsiteSettingsProvider } from './context/WebsiteSettingsContext';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const About = lazy(() => import('./pages/About').then(module => ({ default: module.About })));
const Services = lazy(() => import('./pages/Services').then(module => ({ default: module.Services })));
const Consent = lazy(() => import('./pages/Consent').then(module => ({ default: module.Consent })));
const Booking = lazy(() => import('./pages/Booking').then(module => ({ default: module.Booking })));

// Admin pages
const AdminLogin = lazy(() => import('./admin/pages/Login').then(module => ({ default: module.AdminLogin })));
const VerifyOTP = lazy(() => import('./admin/pages/VerifyOTP').then(module => ({ default: module.VerifyOTP })));
const ForgotPassword = lazy(() => import('./admin/pages/ForgotPassword').then(module => ({ default: module.ForgotPassword })));
const AdminLayout = lazy(() => import('./admin/layouts/AdminLayout').then(module => ({ default: module.AdminLayout })));
const Dashboard = lazy(() => import('./admin/pages/Dashboard').then(module => ({ default: module.Dashboard })));
const UserManagement = lazy(() => import('./admin/pages/UserManagement').then(module => ({ default: module.UserManagement })));
const RolesManagement = lazy(() => import('./admin/pages/RolesManagement').then(module => ({ default: module.RolesManagement })));
const LoginLogs = lazy(() => import('./admin/pages/LoginLogs').then(module => ({ default: module.LoginLogs })));
const VisitorLogs = lazy(() => import('./admin/pages/VisitorLogs').then(module => ({ default: module.VisitorLogs })));
const UserProfile = lazy(() => import('./admin/pages/UserProfile').then(module => ({ default: module.UserProfile })));
const WebsiteManagement = lazy(() => import('./admin/pages/WebsiteManagement').then(module => ({ default: module.WebsiteManagement })));
const HomePages = lazy(() => import('./admin/pages/HomePages').then(module => ({ default: module.HomePages })));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--aura-cream)]">
    <div className="text-center">
      <div className="inline-block w-16 h-16 border-4 border-[var(--aura-rose-gold)] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-['Inter'] text-sm tracking-wider text-[var(--aura-soft-taupe)]">Loading...</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('auth_token');
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

// App wrapper with visitor tracking
function AppContent() {
  // Track all page visits
  useVisitorTracking();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <div className="min-h-screen flex flex-col font-['Montserrat']">
          <Header />
          <main className="flex-1">
            <Home />
          </main>
          <Footer />
        </div>
      } />
      <Route path="/about" element={
        <div className="min-h-screen flex flex-col font-['Montserrat']">
          <Header />
          <main className="flex-1">
            <About />
          </main>
          <Footer />
        </div>
      } />
      <Route path="/services" element={
        <div className="min-h-screen flex flex-col font-['Montserrat']">
          <Header />
          <main className="flex-1">
            <Services />
          </main>
          <Footer />
        </div>
      } />
      <Route path="/consent" element={
        <div className="min-h-screen flex flex-col font-['Montserrat']">
          <Header />
          <main className="flex-1">
            <Consent />
          </main>
          <Footer />
        </div>
      } />
      <Route path="/booking" element={
        <div className="min-h-screen flex flex-col font-['Montserrat']">
          <Header />
          <main className="flex-1">
            <Booking />
          </main>
          <Footer />
        </div>
      } />

      {/* Admin Authentication Routes (Public) */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/verify-otp" element={<VerifyOTP />} />
      <Route path="/admin/forgot-password" element={<ForgotPassword />} />

      {/* Admin Protected Routes */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="roles" element={<RolesManagement />} />
        <Route path="login-logs" element={<LoginLogs />} />
        <Route path="visitor-logs" element={<VisitorLogs />} />
        <Route path="website-management" element={<WebsiteManagement />} />
        <Route path="pages/home" element={<HomePages />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <WebsiteSettingsProvider>
          <AppContent />
          <Toaster position="top-right" />
        </WebsiteSettingsProvider>
      </Suspense>
    </Router>
  );
}

