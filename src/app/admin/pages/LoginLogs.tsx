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
import type { LoginLog, LoginLogStats } from '../../../lib/types';

const defaultStats: LoginLogStats = {
  total: 0,
  successful: 0,
  failed: 0,
  today: 0,
};

const isToday = (value?: string) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

const formatTimestamp = (value?: string) => {
  if (!value) return 'Unknown';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

const buildStats = (statsData: Partial<LoginLogStats> | undefined, records: LoginLog[]) => {
  const fallback = {
    total: records.length,
    successful: records.filter((log) => log.status === 'success').length,
    failed: records.filter((log) => log.status === 'failed').length,
    today: records.filter((log) => isToday(log.attempted_at || log.created_at)).length,
  };

  return {
    total: statsData?.total ?? fallback.total,
    successful: statsData?.successful ?? fallback.successful,
    failed: statsData?.failed ?? fallback.failed,
    today: statsData?.today ?? fallback.today,
  };
};

export function LoginLogs() {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [stats, setStats] = useState<LoginLogStats>(defaultStats);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed'>('all');
  const [filterDevice, setFilterDevice] = useState<'all' | 'desktop' | 'mobile' | 'tablet'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    void loadLogs();
  }, [currentPage, filterStatus, filterDevice]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const response: any = await loginLogService.getLogs(currentPage, 15, {
        status: filterStatus !== 'all' ? filterStatus : undefined,
        device: filterDevice !== 'all' ? filterDevice : undefined,
      });

      if (typeof response?.success !== 'undefined' && response.success === false) {
        throw new Error(response.message || 'Failed to load logs');
      }

      const root = response?.data ?? response;
      const payload = root?.data ?? root;
      const logsSource = Array.isArray(payload?.logs)
        ? payload.logs
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(root?.logs)
            ? root.logs
            : Array.isArray(root)
              ? root
              : [];

      const normalizedLogs: LoginLog[] = Array.isArray(logsSource) ? logsSource : [];
      setLogs(normalizedLogs);

      const paginationData =
        payload?.pagination ?? payload?.meta ?? root?.pagination ?? root?.meta;
      const derivedTotalPages =
        paginationData?.last_page ??
        paginationData?.total_pages ??
        paginationData?.lastPage ??
        paginationData?.pages ??
        1;
      const total = Math.max(1, Number(derivedTotalPages) || 1);
      setTotalPages(total);

      const statsData = payload?.stats ?? root?.stats;
      setStats(buildStats(statsData, normalizedLogs));
    } catch (err: any) {
      console.error('Login logs error:', err);
      setError(err?.message || 'Failed to load logs');
      setLogs([]);
      setStats(defaultStats);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const userName = log.admin_user?.name || '';
    const email = log.email || log.admin_user?.email || '';
    const ipAddress = log.ip_address || '';
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      userName.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query) ||
      ipAddress.toLowerCase().includes(query);
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
    console.log('Exporting logs...');
    alert('Export functionality will be implemented with Laravel backend');
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    setCurrentPage((prev) => {
      if (direction === 'prev') {
        return Math.max(1, prev - 1);
      }
      return Math.min(totalPages, prev + 1);
    });
  };

  return (
    <div className="space-y-6">
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between gap-4">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadLogs}
            className="text-sm font-semibold text-red-700 underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#9B8B7E] font-medium">Total Logins</p>
              <p className="text-2xl font-bold text-[#2D1B1B] mt-1">{stats.total}</p>
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
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.successful}</p>
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
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.failed}</p>
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
              <p className="text-2xl font-bold text-[#D4AF77] mt-1">{stats.today}</p>
            </div>
            <div className="p-3 bg-[#D4AF77]/10 rounded-lg">
              <Calendar className="text-[#D4AF77]" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8B7E]" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or IP address..."
              className="w-full pl-11 pr-4 py-2 border border-[#D4AF77]/30 rounded-lg focus:ring-2 focus:ring-[#D4AF77] focus:border-transparent outline-none bg-white text-[#2D1B1B] placeholder:text-[#9B8B7E]"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as 'all' | 'success' | 'failed');
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-[#D4AF77]/30 rounded-lg focus:ring-2 focus:ring-[#D4AF77] outline-none bg-white text-[#2D1B1B]"
          >
            <option value="all">All Status</option>
            <option value="success">Success Only</option>
            <option value="failed">Failed Only</option>
          </select>

          <select
            value={filterDevice}
            onChange={(e) => {
              setFilterDevice(e.target.value as 'all' | 'desktop' | 'mobile' | 'tablet');
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-[#D4AF77]/30 rounded-lg focus:ring-2 focus:ring-[#D4AF77] outline-none bg-white text-[#2D1B1B]"
          >
            <option value="all">All Devices</option>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
          </select>
        </div>
      </div>

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
                filteredLogs.map((log) => {
                  const failureMessage = log.failure_reason || (log as any).reason;
                  return (
                    <tr key={log.id} className="hover:bg-[#FFF8F3] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-[#2D1B1B]">
                            {log.admin_user?.name || log.email}
                          </div>
                          <div className="text-sm text-[#9B8B7E]">
                            {log.email || log.admin_user?.email || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#2D1B1B]">
                          {formatTimestamp(log.attempted_at || log.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-[#2D1B1B]">
                            <MapPin size={14} />
                            {log.location || 'Unknown location'}
                          </div>
                          <div className="text-xs text-[#9B8B7E]">{log.ip_address || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-[#2D1B1B]">
                            {getDeviceIcon(log.device)}
                            <span className="capitalize">{log.device || 'unknown'}</span>
                          </div>
                          <div className="text-xs text-[#9B8B7E]">{log.browser || 'N/A'}</div>
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
                          {failureMessage && (
                            <div className="text-xs text-red-600">{failureMessage}</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-sm text-[#9B8B7E]">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handlePageChange('prev')}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 rounded-lg border border-[#D4AF77]/40 text-[#2D1B1B] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => handlePageChange('next')}
              disabled={currentPage === totalPages || loading}
              className="px-4 py-2 rounded-lg bg-[#2D1B1B] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
