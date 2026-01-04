/**
 * LOGIN LOGS PAGE
 * Track admin user login activities
 */

import { useState, useEffect } from 'react';
import {
  LogIn,
  Calendar,
  MapPin,
  Monitor,
  Smartphone,
  Tablet,
  AlertCircle,
  CheckCircle,
  Search,
  Download,
} from 'lucide-react';
import { loginLogService } from '../../../services/loginLogService';
import type { LoginLog } from '../../../lib/types';

export function LoginLogs() {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed'>('all');
  const [filterDevice, setFilterDevice] = useState<'all' | 'desktop' | 'mobile' | 'tablet'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadLogs();
  }, [currentPage, filterStatus, filterDevice]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const response: any = await loginLogService.getLogs(currentPage, 15, {
        status: filterStatus !== 'all' ? filterStatus : undefined,
        device: filterDevice !== 'all' ? filterDevice : undefined,
      });
      
      console.log('Login logs API response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      
      // Axios returns response.data directly
      if (response && typeof response === 'object') {
        // Check for ApiResponse with success/data structure
        if (response.success !== undefined && response.data) {
          console.log('Using ApiResponse format - data:', response.data);
          // Handle paginated data structure
          if (Array.isArray(response.data.data)) {
            setLogs(response.data.data);
            setTotalPages(response.data.last_page || 1);
          } else if (Array.isArray(response.data)) {
            setLogs(response.data);
            setTotalPages(1);
          } else {
            setLogs([]);
            console.warn('No array data found in response');
          }
        }
        // Check for direct paginated Laravel format: { data: [], last_page: 1, ... }
        else if (Array.isArray(response.data)) {
          console.log('Using direct paginated format');
          setLogs(response.data);
          setTotalPages(response.last_page || 1);
        }
        // Check for direct array
        else if (Array.isArray(response)) {
          console.log('Using direct array format');
          setLogs(response);
          setTotalPages(1);
        }
        else {
          console.error('Unexpected response structure:', response);
          setError('Invalid response format from server');
          setLogs([]);
        }
      } else {
        setError('No data received from server');
        setLogs([]);
      }
    } catch (err: any) {
      console.error('Login logs error:', err);
      setError(err.message || 'Failed to load logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip_address.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    const matchesDevice = filterDevice === 'all' || log.device === filterDevice;
    return matchesSearch && matchesStatus && matchesDevice;
  });

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop':
        return <Monitor size={18} />;
      case 'mobile':
        return <Smartphone size={18} />;
      case 'tablet':
        return <Tablet size={18} />;
      default:
        return <Monitor size={18} />;
    }
  };

  const exportLogs = () => {
    // TODO: Implement export functionality
    console.log('Exporting logs...');
    alert('Export functionality will be implemented with Laravel backend');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2D1B1B]">Login Logs</h1>
          <p className="text-[#9B8B7E] mt-1">Monitor admin authentication activities</p>
        </div>
        <button
          onClick={exportLogs}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D4AF77]/30 text-[#2D1B1B] rounded-lg font-semibold hover:bg-[#FFF8F3] transition-all"
        >
          <Download size={20} />
          Export Logs
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#9B8B7E] font-medium">Total Logins</p>
              <p className="text-2xl font-bold text-[#2D1B1B] mt-1">
                {logs.length}
              </p>
            </div>
            <div className="p-3 bg-[#D4AF77]/10 rounded-lg">
              <LogIn className="text-[#D4AF77]" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#9B8B7E] font-medium">Successful</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {logs.filter((l) => l.status === 'success').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#9B8B7E] font-medium">Failed</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {logs.filter((l) => l.status === 'failed').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#9B8B7E] font-medium">Today</p>
              <p className="text-2xl font-bold text-[#D4AF77] mt-1">
                {logs.filter((l) => l.timestamp.startsWith('2026-01-04')).length}
              </p>
            </div>
            <div className="p-3 bg-[#D4AF77]/10 rounded-lg">
              <Calendar className="text-[#D4AF77]" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8B7E]"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or IP address..."
              className="w-full pl-11 pr-4 py-2 border border-[#D4AF77]/30 rounded-lg focus:ring-2 focus:ring-[#D4AF77] focus:border-transparent outline-none"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-[#D4AF77]/30 rounded-lg focus:ring-2 focus:ring-[#D4AF77] outline-none"
          >
            <option value="all">All Status</option>
            <option value="success">Success Only</option>
            <option value="failed">Failed Only</option>
          </select>

          <select
            value={filterDevice}
            onChange={(e) => setFilterDevice(e.target.value as any)}
            className="px-4 py-2 border border-[#D4AF77]/30 rounded-lg focus:ring-2 focus:ring-[#D4AF77] outline-none"
          >
            <option value="all">All Devices</option>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#FFF8F3] border-b border-[#D4AF77]/20">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9B8B7E] uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9B8B7E] uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9B8B7E] uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9B8B7E] uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9B8B7E] uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF77]/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-[#D4AF77] border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-[#9B8B7E]">Loading logs...</p>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#9B8B7E]">
                    No login logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FFF8F3] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-[#2D1B1B]">{log.user_name}</div>
                        <div className="text-sm text-[#9B8B7E]">{log.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#2D1B1B]">{log.timestamp}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-[#2D1B1B]">
                          <MapPin size={14} />
                          {log.location}
                        </div>
                        <div className="text-xs text-[#9B8B7E]">{log.ip_address}</div>
                      </div>
                    </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-[#2D1B1B]">
                        {getDeviceIcon(log.device)}
                        <span className="capitalize">{log.device}</span>
                      </div>
                      <div className="text-xs text-[#9B8B7E]">{log.browser}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          log.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {log.status}
                      </span>
                      {log.reason && (
                        <div className="text-xs text-red-600">{log.reason}</div>
                      )}
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
