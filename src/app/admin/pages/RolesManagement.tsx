/**
 * ROLES MANAGEMENT PAGE
 * Manage admin roles and permissions
 */

import { useEffect, useMemo, useState } from 'react';
import { Shield, Plus, Edit, Trash2, Users, Check, Eye, X } from 'lucide-react';
import { toast } from 'sonner';
import { roleService } from '../../../services/roleService';
import type { Role, PermissionGroup, Permission } from '../../../lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';

type RoleFormState = {
  name: string;
  description: string;
  color: string;
  permissions: number[];
};

const defaultColor = '#D4AF77';

const initialFormState: RoleFormState = {
  name: '',
  description: '',
  color: defaultColor,
  permissions: [],
};

const normalizePermissionGroups = (data: any): PermissionGroup[] => {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data;
  }
  if (typeof data === 'object') {
    return Object.entries(data).map(([group, permissions]) => ({
      group,
      permissions: Array.isArray(permissions) ? permissions : [],
    }));
  }
  return [];
};

const hexToRgba = (hex: string, alpha: number) => {
  let sanitized = hex.replace('#', '');
  if (sanitized.length === 3) {
    sanitized = sanitized
      .split('')
      .map((char) => char + char)
      .join('');
  }
  const r = parseInt(sanitized.substring(0, 2), 16);
  const g = parseInt(sanitized.substring(2, 4), 16);
  const b = parseInt(sanitized.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getColorStyles = (color?: string) => {
  const safeColor = color && /^#([0-9a-f]{3}){1,2}$/i.test(color) ? color : defaultColor;
  return {
    borderColor: safeColor,
    color: safeColor,
    backgroundColor: hexToRgba(safeColor, 0.12),
  };
};

export function RolesManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<RoleFormState>(initialFormState);
  const [editFormData, setEditFormData] = useState<RoleFormState>(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setInitialLoading(true);
      setError('');
      const [rolesResponse, permissionsResponse] = await Promise.all([
        roleService.getRoles(),
        roleService.getPermissions(),
      ]);

      handleRolesResponse(rolesResponse, true);
      handlePermissionsResponse(permissionsResponse);
    } catch (err: any) {
      console.error('Initialization error:', err);
      setError(err?.message || 'Failed to load roles data');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleRolesResponse = (response: any, replace: boolean = true) => {
    if (response?.success === false) {
      setError(response.message || 'Failed to load roles');
      return;
    }

    const payload = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
    if (Array.isArray(payload)) {
      setRoles((prev) => (replace ? payload : prev));
    } else {
      setError('Invalid roles data received');
    }
  };

  const handlePermissionsResponse = (response: any) => {
    if (response?.success === false) {
      toast.error(response.message || 'Failed to load permissions');
      return;
    }
    const payload = response?.data ?? response;
    setPermissionGroups(normalizePermissionGroups(payload));
  };

  const refreshRoles = async () => {
    try {
      setTableLoading(true);
      const response = await roleService.getRoles();
      handleRolesResponse(response);
    } catch (err: any) {
      console.error('Refresh roles error:', err);
      toast.error(err?.message || 'Unable to refresh roles');
    } finally {
      setTableLoading(false);
    }
  };

  const permissionMap = useMemo(() => {
    const map = new Map<number, Permission>();
    permissionGroups.forEach((group) => {
      (group.permissions || []).forEach((permission) => {
        map.set(permission.id, permission);
      });
    });
    return map;
  }, [permissionGroups]);

  const resetFormState = () => {
    setFormErrors({});
    setFormData(initialFormState);
  };

  const resetEditState = () => {
    setEditFormErrors({});
    setEditFormData(initialFormState);
    setSelectedRole(null);
  };

  const openAddModal = () => {
    resetFormState();
    setShowAddModal(true);
  };

  const openEditModal = (role: Role) => {
    setSelectedRole(role);
    setEditFormErrors({});
    setEditFormData({
      name: role.name,
      description: role.description || '',
      color: role.color || defaultColor,
      permissions: (role.permissions || []).map((permission) => permission.id),
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (role: Role) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const openDetailModal = (role: Role) => {
    setSelectedRole(role);
    setShowDetailModal(true);
  };

  const togglePermission = (permissionId: number, isEdit: boolean = false) => {
    const setState = isEdit ? setEditFormData : setFormData;
    setState((prev) => {
      const exists = prev.permissions.includes(permissionId);
      const permissions = exists
        ? prev.permissions.filter((id) => id !== permissionId)
        : [...prev.permissions, permissionId];
      return { ...prev, permissions };
    });
  };

  const toggleGroupPermissions = (groupPermissions: Permission[], isEdit: boolean = false) => {
    if (!groupPermissions?.length) return;
    const setState = isEdit ? setEditFormData : setFormData;
    setState((prev) => {
      const allSelected = groupPermissions.every((permission) => prev.permissions.includes(permission.id));
      if (allSelected) {
        return {
          ...prev,
          permissions: prev.permissions.filter((id) => !groupPermissions.find((permission) => permission.id === id)),
        };
      }
      const merged = new Set([...prev.permissions, ...groupPermissions.map((permission) => permission.id)]);
      return { ...prev, permissions: Array.from(merged) };
    });
  };

  const extractErrors = (err: any) => {
    const apiErrors = err?.response?.data?.errors as Record<string, string[]> | undefined;
    if (!apiErrors) return null;
    const normalized: Record<string, string> = {};
    Object.entries(apiErrors).forEach(([field, messages]) => {
      if (messages?.length) normalized[field] = messages[0];
    });
    return normalized;
  };

  const handleCreateRole = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormErrors({});

    if (!formData.permissions.length) {
      setFormErrors((prev) => ({ ...prev, permissions: 'Select at least one permission' }));
      toast.error('Select at least one permission');
      return;
    }

    try {
      setSubmitting(true);
      const response = await roleService.createRole({
        name: formData.name,
        description: formData.description || undefined,
        color: formData.color,
        permissions: formData.permissions,
      });

      if (response?.success === false) {
        toast.error(response.message || 'Failed to create role');
        return;
      }

      toast.success('Role created successfully');
      const createdRole = response?.data?.data || response?.data || null;
      if (createdRole) {
        setRoles((prev) => [createdRole, ...prev]);
      } else {
        void refreshRoles();
      }
      setShowAddModal(false);
      resetFormState();
    } catch (err: any) {
      console.error('Create role error:', err);
      const normalized = extractErrors(err);
      if (normalized) {
        setFormErrors(normalized);
        toast.error(Object.values(normalized)[0]);
      } else {
        toast.error(err?.message || 'Failed to create role');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRole = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedRole) return;
    setEditFormErrors({});

    if (!editFormData.permissions.length) {
      setEditFormErrors((prev) => ({ ...prev, permissions: 'Select at least one permission' }));
      toast.error('Select at least one permission');
      return;
    }

    try {
      setSubmitting(true);
      const response = await roleService.updateRole(selectedRole.id, {
        name: editFormData.name,
        description: editFormData.description || undefined,
        color: editFormData.color,
        permissions: editFormData.permissions,
      });

      if (response?.success === false) {
        toast.error(response.message || 'Failed to update role');
        return;
      }

      toast.success('Role updated successfully');
      const updatedRole = response?.data?.data || response?.data || null;
      if (updatedRole) {
        setRoles((prev) => prev.map((role) => (role.id === updatedRole.id ? updatedRole : role)));
      } else {
        void refreshRoles();
      }
      setShowEditModal(false);
      resetEditState();
    } catch (err: any) {
      console.error('Update role error:', err);
      const normalized = extractErrors(err);
      if (normalized) {
        setEditFormErrors(normalized);
        toast.error(Object.values(normalized)[0]);
      } else {
        toast.error(err?.message || 'Failed to update role');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    try {
      setSubmitting(true);
      const response = await roleService.deleteRole(selectedRole.id);
      if (response?.success === false) {
        toast.error(response.message || 'Failed to delete role');
        return;
      }
      toast.success('Role deleted successfully');
      setRoles((prev) => prev.filter((role) => role.id !== selectedRole.id));
      setShowDeleteModal(false);
      setSelectedRole(null);
    } catch (err: any) {
      console.error('Delete role error:', err);
      toast.error(err?.message || 'Failed to delete role');
    } finally {
      setSubmitting(false);
    }
  };

  const rolesGrid = (
    <div className="relative">
      {tableLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="w-10 h-10 border-4 border-[#D4AF77] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm text-[#9B8B7E]">Updating roles...</p>
        </div>
      )}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${tableLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        {roles.map((role) => {
          const permissions = role.permissions || [];
          const userCount = (role as any).admin_users_count ?? role.user_count ?? 0;
          const isSystem = role.is_system;
          const canModify = !isSystem;

          return (
            <div
              key={role.id}
              className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg border" style={getColorStyles(role.color)}>
                    <Shield size={24} className="text-current" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-[#2D1B1B]">{role.name}</h3>
                      {isSystem && (
                        <span className="text-xs uppercase tracking-wider bg-[#2D1B1B]/5 text-[#2D1B1B] px-2 py-0.5 rounded-full">
                          System
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-[#9B8B7E] mt-1">
                      <Users size={14} />
                      <span>{userCount} {userCount === 1 ? 'user' : 'users'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openDetailModal(role)}
                    title="View details"
                    className="p-2 text-[#9B8B7E] hover:bg-[#FFF8F3] rounded-lg transition-colors"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => openEditModal(role)}
                    disabled={!canModify}
                    title={canModify ? 'Edit role' : 'System roles cannot be edited'}
                    className="p-2 text-[#D4AF77] hover:bg-[#FFF8F3] rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(role)}
                    disabled={!canModify}
                    title={canModify ? 'Delete role' : 'System roles cannot be deleted'}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <p className="text-sm text-[#9B8B7E] mb-4 min-h-[48px]">{role.description || 'No description provided'}</p>

              <div>
                <div className="text-xs font-semibold text-[#9B8B7E] mb-2 uppercase tracking-wider">
                  Permissions
                </div>
                <div className="flex flex-wrap gap-2">
                  {permissions.length === 0 && (
                    <span className="px-3 py-1 bg-[#FFF8F3] text-[#9B8B7E] text-xs rounded-full">
                      No permissions assigned
                    </span>
                  )}
                  {permissions.slice(0, 4).map((permission) => (
                    <span
                      key={permission.id}
                      className="px-3 py-1 bg-[#FFF8F3] text-[#9B8B7E] text-xs font-medium rounded-full"
                    >
                      {permission.name}
                    </span>
                  ))}
                  {permissions.length > 4 && (
                    <span className="px-3 py-1 bg-[#D4AF77]/15 text-[#9B8B7E] text-xs font-medium rounded-full">
                      +{permissions.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {!roles.length && !tableLoading && (
          <div className="col-span-full bg-white border border-dashed border-[#D4AF77]/50 rounded-xl p-8 text-center">
            <p className="text-lg font-semibold text-[#2D1B1B]">No roles yet</p>
            <p className="text-[#9B8B7E] mt-2">Create your first role to manage permissions.</p>
            <button
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white rounded-lg"
            >
              <Plus size={16} /> Add Role
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#D4AF77] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#9B8B7E]">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2D1B1B]">Roles Management</h1>
          <p className="text-[#9B8B7E] mt-1">Define roles and their permissions</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          <Plus size={20} />
          Add Role
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {rolesGrid}

      <div className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#2D1B1B]">Available Permissions</h2>
            <p className="text-[#9B8B7E] text-sm">Assign specific permissions to tailor each role</p>
          </div>
          <button
            onClick={() => void refreshRoles()}
            className="text-sm text-[#D4AF77] font-semibold hover:underline"
          >
            Refresh Roles
          </button>
        </div>

        {!permissionGroups.length && (
          <div className="border border-dashed border-[#D4AF77]/40 rounded-lg p-6 text-center text-[#9B8B7E]">
            No permission metadata available. Contact an administrator.
          </div>
        )}

        <div className="space-y-6">
          {permissionGroups.map((group) => (
            <div key={group.group} className="border border-[#D4AF77]/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#2D1B1B] flex items-center gap-2">
                  <Shield size={18} className="text-[#D4AF77]" />
                  {group.group}
                </h3>
                <span className="text-xs text-[#9B8B7E] uppercase tracking-widest">
                  {group.permissions?.length || 0} permissions
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                {(group.permissions || []).map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center gap-2 p-3 border border-[#D4AF77]/20 rounded-lg"
                  >
                    <div className="flex items-center justify-center w-5 h-5 rounded bg-[#D4AF77]/10">
                      <Check size={14} className="text-[#D4AF77]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#2D1B1B]">{permission.name}</p>
                      <p className="text-xs text-[#9B8B7E]">{permission.slug}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={showAddModal} onOpenChange={(open) => { setShowAddModal(open); if (!open && !submitting) resetFormState(); }}>
        <DialogContent className="max-w-3xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#2D1B1B]">Create Role</DialogTitle>
            <DialogDescription className="text-[#9B8B7E]">
              Define a new role and assign detailed permissions
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRole} className="space-y-5 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2D1B1B] mb-1">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-[#2D1B1B] bg-white ${formErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-[#D4AF77]/30 focus:ring-[#D4AF77]'}`}
                  placeholder="Enter role name"
                  required
                />
                {formErrors.name && <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D1B1B] mb-1">
                  Accent Color <span className="text-red-500">*</span>
                </label>
                <div className={`flex items-center gap-3 border rounded-lg px-3 py-2 ${formErrors.color ? 'border-red-500' : 'border-[#D4AF77]/30'}`}>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-10 h-10 border border-[#D4AF77]/30 rounded"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 focus:outline-none"
                  />
                </div>
                {formErrors.color && <p className="text-sm text-red-600 mt-1">{formErrors.color}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D1B1B] mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-[#D4AF77]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF77] text-[#2D1B1B] bg-white"
                rows={3}
                placeholder="Add a short summary for this role"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#2D1B1B]">
                  Permissions <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-[#9B8B7E]">
                  {formData.permissions.length} selected
                </span>
              </div>
              <div className={`mt-2 max-h-[320px] overflow-y-auto rounded-xl border ${formErrors.permissions ? 'border-red-500' : 'border-[#D4AF77]/20'}`}>
                {!permissionGroups.length && (
                  <p className="p-4 text-sm text-[#9B8B7E]">No permissions available.</p>
                )}
                {permissionGroups.map((group) => (
                  <div key={group.group} className="border-b border-[#D4AF77]/10 last:border-b-0">
                    <div className="flex items-center justify-between px-4 py-3 bg-[#FFF8F3]">
                      <div>
                        <p className="font-semibold text-[#2D1B1B]">{group.group}</p>
                        <p className="text-xs text-[#9B8B7E]">{group.permissions?.length || 0} permissions</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleGroupPermissions(group.permissions || [], false)}
                        className="text-sm font-semibold text-[#D4AF77] hover:underline"
                      >
                        {group.permissions?.every((permission) => formData.permissions.includes(permission.id)) ? 'Clear' : 'Select all'}
                      </button>
                    </div>
                    <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {(group.permissions || []).map((permission) => (
                        <label key={permission.id} className="flex items-center gap-2 text-sm text-[#2D1B1B]">
                          <input
                            type="checkbox"
                            className="rounded border-[#D4AF77]/40 text-[#D4AF77] focus:ring-[#D4AF77]"
                            checked={formData.permissions.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                          />
                          <span>{permission.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {formErrors.permissions && <p className="text-sm text-red-600 mt-1">{formErrors.permissions}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowAddModal(false); resetFormState(); }}
                className="flex-1 px-4 py-2 border border-[#D4AF77]/30 text-[#2D1B1B] rounded-lg hover:bg-[#FFF8F3]"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white rounded-lg disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create Role'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={(open) => { setShowEditModal(open); if (!open && !submitting) resetEditState(); }}>
        <DialogContent className="max-w-3xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#2D1B1B]">Edit Role</DialogTitle>
            <DialogDescription className="text-[#9B8B7E]">
              Update role information and permissions
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditRole} className="space-y-5 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2D1B1B] mb-1">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-[#2D1B1B] bg-white ${editFormErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-[#D4AF77]/30 focus:ring-[#D4AF77]'}`}
                  required
                />
                {editFormErrors.name && <p className="text-sm text-red-600 mt-1">{editFormErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D1B1B] mb-1">
                  Accent Color <span className="text-red-500">*</span>
                </label>
                <div className={`flex items-center gap-3 border rounded-lg px-3 py-2 ${editFormErrors.color ? 'border-red-500' : 'border-[#D4AF77]/30'}`}>
                  <input
                    type="color"
                    value={editFormData.color}
                    onChange={(e) => setEditFormData({ ...editFormData, color: e.target.value })}
                    className="w-10 h-10 border border-[#D4AF77]/30 rounded"
                  />
                  <input
                    type="text"
                    value={editFormData.color}
                    onChange={(e) => setEditFormData({ ...editFormData, color: e.target.value })}
                    className="flex-1 focus:outline-none"
                  />
                </div>
                {editFormErrors.color && <p className="text-sm text-red-600 mt-1">{editFormErrors.color}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D1B1B] mb-1">Description</label>
              <textarea
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                className="w-full px-3 py-2 border border-[#D4AF77]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF77] text-[#2D1B1B] bg-white"
                rows={3}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#2D1B1B]">
                  Permissions <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-[#9B8B7E]">
                  {editFormData.permissions.length} selected
                </span>
              </div>
              <div className={`mt-2 max-h-[320px] overflow-y-auto rounded-xl border ${editFormErrors.permissions ? 'border-red-500' : 'border-[#D4AF77]/20'}`}>
                {permissionGroups.map((group) => (
                  <div key={group.group} className="border-b border-[#D4AF77]/10 last:border-b-0">
                    <div className="flex items-center justify-between px-4 py-3 bg-[#FFF8F3]">
                      <div>
                        <p className="font-semibold text-[#2D1B1B]">{group.group}</p>
                        <p className="text-xs text-[#9B8B7E]">{group.permissions?.length || 0} permissions</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleGroupPermissions(group.permissions || [], true)}
                        className="text-sm font-semibold text-[#D4AF77] hover:underline"
                      >
                        {group.permissions?.every((permission) => editFormData.permissions.includes(permission.id)) ? 'Clear' : 'Select all'}
                      </button>
                    </div>
                    <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {(group.permissions || []).map((permission) => (
                        <label key={permission.id} className="flex items-center gap-2 text-sm text-[#2D1B1B]">
                          <input
                            type="checkbox"
                            className="rounded border-[#D4AF77]/40 text-[#D4AF77] focus:ring-[#D4AF77]"
                            checked={editFormData.permissions.includes(permission.id)}
                            onChange={() => togglePermission(permission.id, true)}
                          />
                          <span>{permission.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {editFormErrors.permissions && <p className="text-sm text-red-600 mt-1">{editFormErrors.permissions}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowEditModal(false); resetEditState(); }}
                className="flex-1 px-4 py-2 border border-[#D4AF77]/30 text-[#2D1B1B] rounded-lg hover:bg-[#FFF8F3]"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white rounded-lg disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update Role'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailModal} onOpenChange={(open) => { setShowDetailModal(open); if (!open) setSelectedRole(null); }}>
        <DialogContent className="max-w-2xl bg-white max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#2D1B1B]">Role Details</DialogTitle>
            <DialogDescription className="text-[#9B8B7E]">
              Full permission breakdown for this role
            </DialogDescription>
          </DialogHeader>

          {selectedRole && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-[#FFF8F3] rounded-xl border border-[#D4AF77]/20">
                <div className="p-3 rounded-lg border" style={getColorStyles(selectedRole.color)}>
                  <Shield size={28} className="text-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-[#2D1B1B]">{selectedRole.name}</h3>
                    {selectedRole.is_system && (
                      <span className="text-xs uppercase tracking-wider bg-[#2D1B1B]/5 text-[#2D1B1B] px-2 py-0.5 rounded-full">
                        System
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#9B8B7E]">{selectedRole.description || 'No description provided'}</p>
                </div>
              </div>

              <div className="space-y-3">
                {(selectedRole.permissions || []).length === 0 && (
                  <p className="text-sm text-[#9B8B7E]">No permissions assigned.</p>
                )}
                {Object.entries(
                  (selectedRole.permissions || []).reduce<Record<string, Permission[]>>((acc, permission) => {
                    const key = permission.group || 'General';
                    acc[key] = acc[key] || [];
                    acc[key].push(permission);
                    return acc;
                  }, {})
                ).map(([groupName, permissions]) => (
                  <div key={groupName} className="border border-[#D4AF77]/20 rounded-xl p-4">
                    <h4 className="font-semibold text-[#2D1B1B] flex items-center gap-2 mb-3">
                      <Shield size={16} className="text-[#D4AF77]" />
                      {groupName}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {permissions.map((permission) => (
                        <span
                          key={permission.id}
                          className="px-3 py-1 bg-[#FFF8F3] text-[#2D1B1B] text-xs rounded-full"
                        >
                          {permission.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full px-4 py-2 bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white rounded-lg"
              >
                Close
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteModal} onOpenChange={(open) => { setShowDeleteModal(open); if (!open) setSelectedRole(null); }}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-600">Delete Role</DialogTitle>
            <DialogDescription className="text-[#9B8B7E]">
              This action cannot be undone
            </DialogDescription>
          </DialogHeader>

          {selectedRole && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-[#2D1B1B]">
                  Are you sure you want to delete <strong>{selectedRole.name}</strong>? This role will be removed permanently.
                </p>
                <p className="text-xs text-[#9B8B7E] mt-2">
                  Roles attached to users cannot be deleted.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowDeleteModal(false); setSelectedRole(null); }}
                  className="flex-1 px-4 py-2 border border-[#D4AF77]/30 text-[#2D1B1B] rounded-lg hover:bg-[#FFF8F3]"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteRole}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Deleting...' : 'Delete Role'}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
