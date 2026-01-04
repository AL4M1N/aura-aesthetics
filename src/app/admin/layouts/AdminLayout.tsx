/**
 * ADMIN LAYOUT COMPONENT
 * Modern, intuitive admin panel layout with sidebar navigation
 */

import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  Eye,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  User,
} from 'lucide-react';

interface MenuItem {
  title: string;
  icon: any;
  path?: string;
  submenu?: { title: string; path: string }[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin/dashboard',
  },
  {
    title: 'Admin Menu',
    icon: Settings,
    submenu: [
      { title: 'User Management', path: '/admin/users' },
      { title: 'Roles Management', path: '/admin/roles' },
      { title: 'Login Logs', path: '/admin/login-logs' },
      { title: 'Website Visitors', path: '/admin/visitor-logs' },
    ],
  },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Admin Menu']);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const toggleMenu = (title: string) => {
    setExpandedMenus((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const handleLogout = () => {
    // Will integrate with Laravel API
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#D4AF77] to-[#C9A58D] rounded-lg"></div>
            <span className="font-semibold text-lg text-[#2D1B1B]">Aura Aesthetics</span>
          </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* User Profile Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="hidden md:flex items-center gap-3 px-4 py-2 bg-[#FFF8F3] rounded-lg hover:bg-[#FFF0E6] transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#D4AF77] to-[#C9A58D] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  A
                </div>
                <div className="text-sm">
                  <div className="font-medium text-[#2D1B1B]">Admin User</div>
                  <div className="text-[#9B8B7E] text-xs">Super Admin</div>
                </div>
                <ChevronDown size={16} className="text-[#9B8B7E]" />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link
                    to="/admin/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-[#2D1B1B] hover:bg-[#FFF8F3] transition-colors"
                  >
                    <User size={18} />
                    <span>My Profile</span>
                  </Link>
                  <hr className="my-2 border-gray-200" />
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Logout Button */}
            <button
              onClick={handleLogout}
              className="md:hidden flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-16 left-0 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden`}
      >
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <div key={item.title}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className="w-full flex items-center justify-between px-4 py-3 text-[#2D1B1B] hover:bg-[#FFF8F3] rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    {expandedMenus.includes(item.title) ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                  {expandedMenus.includes(item.title) && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.path}
                          to={subitem.path}
                          className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                            isActive(subitem.path)
                              ? 'bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white'
                              : 'text-[#9B8B7E] hover:bg-[#FFF8F3]'
                          }`}
                        >
                          {subitem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path!}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path!)
                      ? 'bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white'
                      : 'text-[#2D1B1B] hover:bg-[#FFF8F3]'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.title}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main
        className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
