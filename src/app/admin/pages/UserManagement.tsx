/**
 * USER MANAGEMENT PAGE
 * CRUD operations for admin users
 */

import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  Shield,
  MoreVertical,
  Filter,
  X,
} from 'lucide-react';
import { userService } from '../../../services/userService';
import { roleService } from '../../../services/roleService';
import type { User, Role } from '../../../lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state for add user
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    role_id: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [currentPage, searchQuery]);

  const loadRoles = async () => {
    try {
      const response: any = await roleService.getRoles();
      console.log('Roles response:', response);
      
      if (response && typeof response === 'object') {
        if (response.success !== undefined && response.data) {
          setRoles(Array.isArray(response.data) ? response.data : []);
        } else if (Array.isArray(response)) {
          setRoles(response);
        } else if (Array.isArray(response.data)) {
          setRoles(response.data);
        } else {
          console.warn('No roles data found');
          setRoles([]);
        }
      }
    } catch (err: any) {
      console.error('Load roles error:', err);
      setRoles([]);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response: any = await userService.getUsers(currentPage, 10, searchQuery);
      
      console.log('Users response:', response);
      
      // Handle both response formats
      if (response && typeof response === 'object') {
        if (response.success !== undefined) {
          // ApiResponse format
          if (response.success && response.data) {
            setUsers(response.data.data || []);
            setTotalPages(response.data.last_page || 1);
          } else {
            setError(response.message || 'Failed to load users');
          }
        } 
        else if (response.data && Array.isArray(response.data)) {
          // Direct data format
          setUsers(response.data);
          setTotalPages(response.last_page || 1);
        }
        else {
          setError('Invalid response format');
          console.error('Invalid users response:', response);
        }
      } else {
        setError('No data received');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
      console.error('Users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.role_id) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (formData.password !== formData.password_confirmation) {
      alert('Passwords do not match');
      return;
    }
    
    try {
      setSubmitting(true);
      const response: any = await userService.createUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        role_id: parseInt(formData.role_id),
        status: formData.status,
      });
      
      console.log('Create user response:', response);
      
      if (response && (response.success !== false)) {
        alert('User created successfully!');
        setShowAddModal(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          password_confirmation: '',
          role_id: '',
          status: 'active',
        });
        loadUsers(); // Reload the list
      } else {
        alert(response.message || 'Failed to create user');
      }
    } catch (err: any) {
      console.error('Create user error:', err);
      alert(err.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role.name === selectedRole;
    return matchesSearch && matchesRole;
  });

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#D4AF77] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#9B8B7E]">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2D1B1B]">User Management</h1>
          <p className="text-[#9B8B7E] mt-1">Manage admin users and permissions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          <Plus size={20} />
          Add User
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8B7E]"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name or email..."
              className="w-full pl-11 pr-4 py-2 border border-[#D4AF77]/30 rounded-lg focus:ring-2 focus:ring-[#D4AF77] focus:border-transparent outline-none"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-[#9B8B7E]" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              title="Filter by role"
              aria-label="Filter by role"
              className="px-4 py-2 border border-[#D4AF77]/30 rounded-lg focus:ring-2 focus:ring-[#D4AF77] focus:border-transparent outline-none"
            >
              <option value="all">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Admin">Admin</option>
              <option value="Editor">Editor</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#FFF8F3] border-b border-[#D4AF77]/20">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9B8B7E] uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9B8B7E] uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9B8B7E] uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9B8B7E] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9B8B7E] uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-[#9B8B7E] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF77]/10">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#FFF8F3] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF77] to-[#C9A58D] rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-[#2D1B1B]">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-[#9B8B7E]">
                        <Mail size={14} />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#9B8B7E]">
                        <Phone size={14} />
                        {user.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-[#D4AF77]" />
                      <span className="text-sm font-medium text-[#2D1B1B]">
                        {user.role.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#9B8B7E]">
                    {user.last_login_at || 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        title="Edit user"
                        className="p-2 text-[#D4AF77] hover:bg-[#FFF8F3] rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                      <button 
                        title="Delete user"
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                      <button 
                        title="More options"
                        className="p-2 text-[#9B8B7E] hover:bg-[#FFF8F3] rounded-lg transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[#D4AF77]/20 flex items-center justify-between">
          <div className="text-sm text-[#9B8B7E]">
            Showing <span className="font-semibold">1</span> to{' '}
            <span className="font-semibold">{filteredUsers.length}</span> of{' '}
            <span className="font-semibold">{users.length}</span> users
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-[#D4AF77]/30 rounded-lg text-sm hover:bg-[#FFF8F3]">
              Previous
            </button>
            <button className="px-3 py-1 bg-[#D4AF77] text-white rounded-lg text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-[#D4AF77]/30 rounded-lg text-sm hover:bg-[#FFF8F3]">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#2D1B1B]">Add New User</DialogTitle>
            <DialogDescription className="text-[#9B8B7E]">
              Create a new admin user account
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddUser} className="space-y-4 mt-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[#2D1B1B] mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-[#D4AF77]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF77]"
                placeholder="Enter full name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#2D1B1B] mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-[#D4AF77]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF77]"
                placeholder="Enter email address"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-[#2D1B1B] mb-1">
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-[#D4AF77]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF77]"
                placeholder="Enter phone number"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-[#2D1B1B] mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role_id}
                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                className="w-full px-3 py-2 border border-[#D4AF77]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF77]"
                required
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#2D1B1B] mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-[#D4AF77]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF77]"
                placeholder="Enter password"
                required
                minLength={8}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[#2D1B1B] mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.password_confirmation}
                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                className="w-full px-3 py-2 border border-[#D4AF77]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF77]"
                placeholder="Confirm password"
                required
                minLength={8}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[#2D1B1B] mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-3 py-2 border border-[#D4AF77]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF77]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-[#D4AF77]/30 text-[#2D1B1B] rounded-lg hover:bg-[#FFF8F3] transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
