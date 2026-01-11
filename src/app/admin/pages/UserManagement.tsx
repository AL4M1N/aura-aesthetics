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
  Filter,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { userService } from '../../../services/userService';
import { roleService } from '../../../services/roleService';
import type { User, Role } from '../../../lib/types';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';
import { AdminDialogContent } from '../../components/ui/admin';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  
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

  // Form state for edit user
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role_id: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    loadRoles();
    const init = async () => {
      await loadUsers(true);
      setHasInitialized(true);
    };
    void init();
  }, []);

  useEffect(() => {
    if (!hasInitialized) return;
    void loadUsers();
  }, [currentPage, hasInitialized]);

  useEffect(() => {
    if (!hasInitialized) return;
    // Debounce search
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        void loadUsers();
      } else {
        setCurrentPage(1);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery, hasInitialized]);

  useEffect(() => {
    if (!hasInitialized) return;
    if (currentPage === 1) {
      void loadUsers();
    } else {
      setCurrentPage(1);
    }
  }, [selectedRole, hasInitialized]);

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

  const loadUsers = async (showPageLoader: boolean = false) => {
    try {
      if (showPageLoader) {
        setInitialLoading(true);
      } else {
        setTableLoading(true);
      }
      setError('');
      const roleFilter = selectedRole !== 'all' ? selectedRole : undefined;
      const response: any = await userService.getUsers(currentPage, 10, searchQuery, roleFilter);
      
      console.log('Users response:', response);
      
      // Handle both response formats
      if (response && typeof response === 'object') {
        if (response.success !== undefined) {
          // ApiResponse format
          if (response.success && response.data) {
            // Backend returns { users: [...], pagination: {...} }
            const usersData = response.data.users || response.data.data || [];
            const paginationData = response.data.pagination || {};
            setUsers(usersData);
            setTotalPages(paginationData.last_page || 1);
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
      if (showPageLoader) {
        setInitialLoading(false);
      } else {
        setTableLoading(false);
      }
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!formData.name || !formData.email || !formData.password || !formData.role_id) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (formData.password !== formData.password_confirmation) {
      toast.error('Passwords do not match');
      return;
    }
    
    try {
      setSubmitting(true);
      setFormErrors({});
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
        toast.success('User created successfully!');
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
        setShowPassword(false);
        setShowPasswordConfirmation(false);
        // Optimistically update list without full reload
        const createdUser = response.data?.data || response.data || null;
        if (createdUser) {
          setUsers((prev) => [createdUser, ...prev]);
        } else {
          loadUsers();
        }
      } else {
        toast.error(response.message || 'Failed to create user');
      }
    } catch (err: any) {
      console.error('Create user error:', err);
      const apiErrors = err?.response?.data?.errors as Record<string, string[]> | undefined;
      if (apiErrors) {
        const normalized: Record<string, string> = {};
        Object.entries(apiErrors).forEach(([k, v]) => { if (v?.length) normalized[k] = v[0]; });
        setFormErrors(normalized);
        if (normalized.email) toast.error(normalized.email); else toast.error(err.message || 'Failed to create user');
      } else {
        toast.error(err.message || 'Failed to create user');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedUser) return;
    
    try {
      setSubmitting(true);
      setEditFormErrors({});
      const response: any = await userService.updateUser(selectedUser.id, {
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
        role_id: parseInt(editFormData.role_id),
        status: editFormData.status,
      });
      
      if (response && (response.success !== false)) {
        toast.success('User updated successfully!');
        setShowEditModal(false);
        setSelectedUser(null);
        const updatedUser = response.data?.data || response.data || null;
        if (updatedUser) {
          setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
        } else {
          loadUsers();
        }
      } else {
        toast.error(response.message || 'Failed to update user');
      }
    } catch (err: any) {
      console.error('Update user error:', err);
      const apiErrors = err?.response?.data?.errors as Record<string, string[]> | undefined;
      if (apiErrors) {
        const normalized: Record<string, string> = {};
        Object.entries(apiErrors).forEach(([k, v]) => { if (v?.length) normalized[k] = v[0]; });
        setEditFormErrors(normalized);
        toast.error(Object.values(normalized)[0] || err.message || 'Failed to update user');
      } else {
        toast.error(err.message || 'Failed to update user');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setSubmitting(true);
      const response: any = await userService.deleteUser(selectedUser.id);
      
      if (response && (response.success !== false)) {
        toast.success('User deleted successfully!');
        setShowDeleteModal(false);
        setSelectedUser(null);
        setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      } else {
        toast.error(response.message || 'Failed to delete user');
      }
    } catch (err: any) {
      console.error('Delete user error:', err);
      toast.error(err.message || 'Failed to delete user');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditFormErrors({});
    setEditFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
  role_id: String(user.role?.id ?? (user as any).role_id ?? ''),
      status: user.status,
    });
    setShowEditModal(true);
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      selectedRole === 'all' ||
      user.role.slug === selectedRole ||
      user.role.name.toLowerCase() === selectedRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  // Loading state
  if (initialLoading) {
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
          onClick={() => { setFormErrors({}); setShowAddModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          <Plus size={20} />
          Add User
        </button>
      </div>

      {/* Filters and Search */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6"
      >
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
              onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
              placeholder="Search users by name or email..."
              className="w-full pl-11 pr-4 py-2 border border-[#D4AF77]/30 rounded-lg focus:ring-2 focus:ring-[#D4AF77] focus:border-transparent outline-none text-[#2D1B1B] bg-white"
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
              className="px-4 py-2 border border-[#D4AF77]/30 rounded-lg focus:ring-2 focus:ring-[#D4AF77] focus:border-transparent outline-none text-[#2D1B1B] bg-white"
            >
              <option value="all">All Roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.slug || role.name}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="relative bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 overflow-hidden">
        {tableLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <div className="inline-block w-10 h-10 border-4 border-[#D4AF77] border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-sm text-[#9B8B7E]">Refreshing users...</p>
          </div>
        )}
        <div className={`${tableLoading ? 'opacity-50 pointer-events-none' : ''}`}>
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
                  <td className="px-6 py-4 whitespace-normal break-words align-top max-w-[220px]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF77] to-[#C9A58D] rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-[#2D1B1B]">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-normal break-words align-top max-w-[280px]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-[#9B8B7E]">
                        <Mail size={14} />
                        <span className="break-all">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#9B8B7E]">
                        <Phone size={14} />
                        {user.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-normal break-words align-top">
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-[#D4AF77]" />
                      <span className="text-sm font-medium text-[#2D1B1B]">
                        {user.role.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-normal break-words align-top">
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
                  <td className="px-6 py-4 whitespace-normal break-words align-top text-sm text-[#9B8B7E]">
                    {user.last_login_at || 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right align-top">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openRoleModal(user)}
                        title="View role"
                        className="p-2 text-[#D4AF77] hover:bg-[#FFF8F3] rounded-lg transition-colors">
                        <Shield size={18} />
                      </button>
                      <button 
                        onClick={() => openEditModal(user)}
                        title="Edit user"
                        className="p-2 text-[#D4AF77] hover:bg-[#FFF8F3] rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(user)}
                        title="Delete user"
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
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
            Showing <span className="font-semibold">{users.length > 0 ? 1 : 0}</span> to{' '}
            <span className="font-semibold">{users.length}</span> of{' '}
            <span className="font-semibold">{users.length}</span> users
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-[#D4AF77]/30 rounded-lg text-sm hover:bg-[#FFF8F3] disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <button className="px-3 py-1 bg-[#D4AF77] text-white rounded-lg text-sm">
              {currentPage}
            </button>
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-[#D4AF77]/30 rounded-lg text-sm hover:bg-[#FFF8F3] disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <AdminDialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
                className="w-full px-3 py-2 border border-[#D4AF77]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF77] text-[#2D1B1B] bg-white"
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
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-[#2D1B1B] bg-white ${formErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-[#D4AF77]/30 focus:ring-[#D4AF77]'}`}
                placeholder="Enter email address"
                required
              />
              {formErrors.email && (
                <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
              )}
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
                className="w-full px-3 py-2 border border-[#D4AF77]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF77] text-[#2D1B1B] bg-white"
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
                className="w-full px-3 py-2 border border-[#D4AF77]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF77] text-[#2D1B1B] bg-white"
                aria-label="Select user role"
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 pr-10 border border-[#D4AF77]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF77] text-[#2D1B1B] bg-white"
                  placeholder="Enter password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B8B7E] hover:text-[#D4AF77]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[#2D1B1B] mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswordConfirmation ? 'text' : 'password'}
                  value={formData.password_confirmation}
                  onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                  className="w-full px-3 py-2 pr-10 border border-[#D4AF77]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF77] text-[#2D1B1B] bg-white"
                  placeholder="Confirm password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B8B7E] hover:text-[#D4AF77]"
                >
                  {showPasswordConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[#2D1B1B] mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-3 py-2 border border-[#D4AF77]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF77] text-[#2D1B1B] bg-white"
                aria-label="Select user status"
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
        </AdminDialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <AdminDialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#2D1B1B]">Edit User</DialogTitle>
            <DialogDescription className="text-[#9B8B7E]">
              Update user information
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditUser} className="space-y-4 mt-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[#2D1B1B] mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full px-3 py-2 border border-[#D4AF77]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF77] text-[#2D1B1B] bg-white"
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
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-[#2D1B1B] bg-white ${editFormErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-[#D4AF77]/30 focus:ring-[#D4AF77]'}`}
                placeholder="Enter email address"
                required
              />
              {editFormErrors.email && (
                <p className="text-sm text-red-600 mt-1">{editFormErrors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-[#2D1B1B] mb-1">
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-[#D4AF77]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF77] text-[#2D1B1B] bg-white"
                placeholder="Enter phone number"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-[#2D1B1B] mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={editFormData.role_id}
                onChange={(e) => setEditFormData({ ...editFormData, role_id: e.target.value })}
                className="w-full px-3 py-2 border border-[#D4AF77]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF77] text-[#2D1B1B] bg-white"
                aria-label="Select user role"
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

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[#2D1B1B] mb-1">
                Status
              </label>
              <select
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-3 py-2 border border-[#D4AF77]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF77] text-[#2D1B1B] bg-white"
                aria-label="Select user status"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-2">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
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
                {submitting ? 'Updating...' : 'Update User'}
              </button>
            </div>
          </form>
        </AdminDialogContent>
      </Dialog>

      {/* Role Details Modal */}
      <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
        <AdminDialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#2D1B1B]">User Role</DialogTitle>
            <DialogDescription className="text-[#9B8B7E]">
              Role and permission details
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 mt-4">
              <div className="bg-gradient-to-br from-[#FFF8F3] to-[#F5E6D3] rounded-lg p-6 border border-[#D4AF77]/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF77] to-[#C9A58D] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2D1B1B]">{selectedUser.name}</h3>
                    <p className="text-sm text-[#9B8B7E]">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-[#9B8B7E] uppercase tracking-wider">Role Name</label>
                    <p className="font-semibold text-[#2D1B1B] mt-1">{selectedUser.role.name}</p>
                  </div>

                  <div>
                    <label className="text-xs text-[#9B8B7E] uppercase tracking-wider">Role Slug</label>
                    <p className="font-mono text-sm text-[#2D1B1B] mt-1">{selectedUser.role.slug}</p>
                  </div>

                  {selectedUser.role.description && (
                    <div>
                      <label className="text-xs text-[#9B8B7E] uppercase tracking-wider">Description</label>
                      <p className="text-sm text-[#2D1B1B] mt-1">{selectedUser.role.description}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-[#9B8B7E] uppercase tracking-wider">System Role</label>
                    <p className="text-sm text-[#2D1B1B] mt-1">
                      {selectedUser.role.is_system ? 'Yes (Protected)' : 'No'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowRoleModal(false)}
                className="w-full px-4 py-2 bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white rounded-lg hover:shadow-lg transition-all"
              >
                Close
              </button>
            </div>
          )}
        </AdminDialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AdminDialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-600">Delete User</DialogTitle>
            <DialogDescription className="text-[#9B8B7E]">
              This action cannot be undone
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 mt-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-[#2D1B1B]">
                  Are you sure you want to delete <strong>{selectedUser.name}</strong>?
                  This will permanently remove the user and all associated data.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-[#D4AF77]/30 text-[#2D1B1B] rounded-lg hover:bg-[#FFF8F3] transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          )}
        </AdminDialogContent>
      </Dialog>
    </div>
  );
}
