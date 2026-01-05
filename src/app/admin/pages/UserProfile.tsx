/**
 * USER PROFILE PAGE
 * View and edit current user's profile and change password
 */

import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  Lock,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../../services/authService';
import type { User as UserType } from '../../../lib/types';

export function UserProfile() {
  const [user, setUser] = useState<UserType | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);

  // Profile form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Password form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const applyUserData = (profile: UserType) => {
    const profileWithExtra = profile as UserType & { phone_number?: string };
    const phoneValue = profile.phone ?? profileWithExtra.phone_number ?? '';
    const mergedUser: UserType = {
      ...(user || {} as UserType),
      ...profile,
      role: profile.role ?? user?.role,
    };

    setUser(mergedUser);
    setName(mergedUser.name);
    setEmail(mergedUser.email);
    setPhone(phoneValue);
  };

  const loadUserProfile = async () => {
    setIsFetchingProfile(true);
    try {
      const response = await authService.getProfile();
      console.log('Profile response:', response);
      
      // Handle response.data directly (not response.data.user)
      if (response?.success && response.data) {
        const userData = response.data.user || response.data;
        applyUserData(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        throw new Error(response?.message || 'Failed to load profile');
      }
    } catch (err: any) {
      console.error('Load profile error:', err);
      toast.error('Unable to load profile. Showing cached information.');
      const cachedUser = authService.getCurrentUser() as UserType | null;
      if (cachedUser) {
        applyUserData(cachedUser);
      }
    } finally {
      setIsFetchingProfile(false);
    }
  };

  useEffect(() => {
    void loadUserProfile();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setProfileSaving(true);

    try {
      const response: any = await authService.updateProfile({
        name,
        email,
        phone: phone || undefined,
      });
      
      console.log('Update profile response:', response);
      
      if (response && (response.success !== false)) {
        const updated = (response.data?.user || response.data || { name, email, phone }) as UserType;
        applyUserData(updated);
        localStorage.setItem('user', JSON.stringify(updated));
        toast.success('Profile updated successfully!');
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (err: any) {
      console.error('Update profile error:', err);
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    setPasswordSaving(true);

    try {
      const response: any = await authService.changePassword({
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        });
      
      console.log('Change password response:', response);
      
      if (response && (response.success !== false)) {
        toast.success('Password changed successfully!');
        setNewPassword('');
        setConfirmPassword('');
        if (confirm('Password changed. Do you want to logout now?')) {
          await authService.logout();
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/admin/login';
        }
      } else {
        toast.error(response.message || 'Failed to change password');
      }
    } catch (err: any) {
      console.error('Change password error:', err);
      toast.error(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (isFetchingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[#9B8B7E]">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[#9B8B7E]">No user data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#2D1B1B]">My Profile</h1>
        <p className="text-[#9B8B7E] mt-1">Manage your account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#D4AF77] to-[#C9A58D] rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
              {user?.name?.charAt(0) ?? ''}
            </div>
            <h2 className="text-xl font-bold text-[#2D1B1B]">{user?.name}</h2>
            <p className="text-[#9B8B7E] text-sm mt-1">{user.email}</p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-[#FFF8F3] rounded-full">
              <Shield size={16} className="text-[#D4AF77]" />
              <span className="text-sm font-medium text-[#2D1B1B]">
                {user.role?.name ?? 'Role not available'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6">
          <h3 className="text-lg font-semibold text-[#2D1B1B] mb-6">
            Profile Information
          </h3>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2D1B1B] mb-2">
                <User size={16} className="inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-[#D4AF77]/30 rounded-lg focus:ring-2 focus:ring-[#D4AF77] focus:border-transparent outline-none text-[#2D1B1B] bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D1B1B] mb-2">
                <Mail size={16} className="inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-[#D4AF77]/30 rounded-lg focus:ring-2 focus:ring-[#D4AF77] focus:border-transparent outline-none text-[#2D1B1B] bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D1B1B] mb-2">
                <Phone size={16} className="inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-[#D4AF77]/30 rounded-lg focus:ring-2 focus:ring-[#D4AF77] focus:border-transparent outline-none text-[#2D1B1B] bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={profileSaving}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Save size={18} />
              {profileSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6">
        <h3 className="text-lg font-semibold text-[#2D1B1B] mb-6">
          <Lock size={20} className="inline mr-2" />
          Change Password
        </h3>
        <form onSubmit={handlePasswordChange} className="max-w-2xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2D1B1B] mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 pr-12 border border-[#D4AF77]/30 rounded-lg focus:ring-2 focus:ring-[#D4AF77] focus:border-transparent outline-none text-[#2D1B1B] bg-white"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B8B7E] hover:text-[#2D1B1B]"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-[#9B8B7E] mt-1">
              Must be at least 8 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D1B1B] mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 pr-12 border border-[#D4AF77]/30 rounded-lg focus:ring-2 focus:ring-[#D4AF77] focus:border-transparent outline-none text-[#2D1B1B] bg-white"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B8B7E] hover:text-[#2D1B1B]"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordSaving}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Lock size={18} />
            {passwordSaving ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
