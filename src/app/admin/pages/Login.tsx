/**
 * ADMIN LOGIN PAGE
 * Secure login with email/password authentication
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { authService } from '../../../services/authService';
import type { ApiError } from '../../../lib/types';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({ email, password });

      if (response.success) {
        // Store temp token and email for OTP verification
        localStorage.setItem('temp_token', response.data.temp_token);
        localStorage.setItem('temp_email', email);
        
        // Show OTP in console for development
        if (response.data.otp_code) {
          console.log('🔐 OTP Code (DEV ONLY):', response.data.otp_code);
        }

        // Navigate to OTP verification
        navigate('/admin/verify-otp', { state: { email, tempToken: response.data.temp_token } });
      } else {
        setError(response.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'An error occurred. Please try again.');
      
      // Show validation errors if any
      if (apiError.errors) {
        const firstError = Object.values(apiError.errors)[0];
        if (firstError && firstError.length > 0) {
          setError(firstError[0]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F3] via-white to-[#F5E6D3] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#D4AF77] to-[#C9A58D] rounded-2xl mb-4">
            <LogIn className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-[#2D1B1B] mb-2">Admin Login</h1>
          <p className="text-[#9B8B7E]">Welcome back to Aura Aesthetics</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-[#2D1B1B] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8B7E]"
                  size={20}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-[#D4AF77]/30 rounded-lg focus:ring-2 focus:ring-[#D4AF77] focus:border-transparent outline-none transition-all bg-white"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-[#2D1B1B] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8B7E]"
                  size={20}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 border border-[#D4AF77]/30 rounded-lg focus:ring-2 focus:ring-[#D4AF77] focus:border-transparent outline-none transition-all bg-white"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B8B7E] hover:text-[#D4AF77]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#D4AF77] text-[#D4AF77] focus:ring-[#D4AF77]"
                />
                <span className="text-sm text-[#9B8B7E]">Remember me</span>
              </label>
              <Link
                to="/admin/forgot-password"
                className="text-sm text-[#D4AF77] hover:text-[#C9A58D] font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-[#9B8B7E]">
          <p>Secured Admin Access Only</p>
        </div>
      </div>
    </div>
  );
}
