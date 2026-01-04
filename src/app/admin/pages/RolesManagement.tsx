/**
 * ROLES MANAGEMENT PAGE
 * Manage admin roles and permissions
 */

import { useState } from 'react';
import { Shield, Plus, Edit, Trash2, Users, Check } from 'lucide-react';

interface Role {
  id: number;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  color: string;
}

const mockRoles: Role[] = [
  {
    id: 1,
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    userCount: 1,
    permissions: ['all'],
    color: 'purple',
  },
  {
    id: 2,
    name: 'Admin',
    description: 'Manage users, content, and settings',
    userCount: 3,
    permissions: ['users.view', 'users.create', 'users.edit', 'content.manage', 'settings.view'],
    color: 'blue',
  },
  {
    id: 3,
    name: 'Editor',
    description: 'Edit and manage content',
    userCount: 5,
    permissions: ['content.view', 'content.edit', 'content.create'],
    color: 'green',
  },
  {
    id: 4,
    name: 'Viewer',
    description: 'View-only access to dashboard',
    userCount: 8,
    permissions: ['dashboard.view', 'reports.view'],
    color: 'gray',
  },
];

const availablePermissions = [
  { group: 'Dashboard', permissions: ['dashboard.view', 'dashboard.manage'] },
  { group: 'Users', permissions: ['users.view', 'users.create', 'users.edit', 'users.delete'] },
  { group: 'Roles', permissions: ['roles.view', 'roles.create', 'roles.edit', 'roles.delete'] },
  { group: 'Content', permissions: ['content.view', 'content.create', 'content.edit', 'content.delete'] },
  { group: 'Settings', permissions: ['settings.view', 'settings.edit'] },
  { group: 'Reports', permissions: ['reports.view', 'reports.export'] },
  { group: 'Logs', permissions: ['logs.view', 'logs.delete'] },
];

export function RolesManagement() {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [showAddModal, setShowAddModal] = useState(false);

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      purple: 'bg-[#D4AF77]/10 text-[#D4AF77] border-[#D4AF77]/20',
      blue: 'bg-[#9B8B7E]/10 text-[#9B8B7E] border-[#9B8B7E]/20',
      green: 'bg-[#C9A58D]/10 text-[#C9A58D] border-[#C9A58D]/20',
      gray: 'bg-[#FFF8F3] text-[#9B8B7E] border-[#D4AF77]/10',
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2D1B1B]">Roles Management</h1>
          <p className="text-[#9B8B7E] mt-1">Define roles and their permissions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          <Plus size={20} />
          Add Role
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6 hover:shadow-md transition-shadow"
          >
            {/* Role Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${getColorClasses(role.color).replace('border-', 'bg-')}`}>
                  <Shield size={24} className="text-current" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#2D1B1B]">{role.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-[#9B8B7E] mt-1">
                    <Users size={14} />
                    <span>{role.userCount} users</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="p-2 text-[#D4AF77] hover:bg-[#FFF8F3] rounded-lg transition-colors">
                  <Edit size={18} />
                </button>
                {role.name !== 'Super Admin' && (
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-[#9B8B7E] mb-4">{role.description}</p>

            {/* Permissions */}
            <div>
              <div className="text-xs font-semibold text-[#9B8B7E] mb-2 uppercase tracking-wider">
                Permissions
              </div>
              <div className="flex flex-wrap gap-2">
                {role.permissions[0] === 'all' ? (
                  <span className="px-3 py-1 bg-[#D4AF77]/10 text-[#D4AF77] text-xs font-medium rounded-full">
                    All Permissions
                  </span>
                ) : (
                  role.permissions.slice(0, 4).map((permission) => (
                    <span
                      key={permission}
                      className="px-3 py-1 bg-[#FFF8F3] text-[#9B8B7E] text-xs font-medium rounded-full"
                    >
                      {permission.split('.')[1]}
                    </span>
                  ))
                )}
                {role.permissions.length > 4 && role.permissions[0] !== 'all' && (
                  <span className="px-3 py-1 bg-[#D4AF77]/20 text-[#9B8B7E] text-xs font-medium rounded-full">
                    +{role.permissions.length - 4} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Permissions Reference Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6">
        <h2 className="text-xl font-bold text-[#2D1B1B] mb-4">
          Available Permissions
        </h2>
        <p className="text-[#9B8B7E] mb-6">
          These are all available permissions that can be assigned to roles
        </p>

        <div className="space-y-6">
          {availablePermissions.map((group) => (
            <div key={group.group}>
              <h3 className="font-semibold text-[#2D1B1B] mb-3 flex items-center gap-2">
                <Shield size={18} className="text-[#D4AF77]" />
                {group.group}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {group.permissions.map((permission) => (
                  <div
                    key={permission}
                    className="flex items-center gap-2 p-3 border border-[#D4AF77]/20 rounded-lg hover:border-[#D4AF77] transition-colors"
                  >
                    <div className="flex items-center justify-center w-5 h-5 rounded bg-[#D4AF77]/10">
                      <Check size={14} className="text-[#D4AF77]" />
                    </div>
                    <span className="text-sm text-[#9B8B7E]">{permission}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
