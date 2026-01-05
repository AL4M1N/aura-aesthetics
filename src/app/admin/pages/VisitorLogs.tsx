/**
 * WEBSITE VISITOR LOGS PAGE
 * Track and analyze website visitor activities
 */

import { useState, useEffect } from 'react';
import {
  Eye,
  Globe,
  Clock,
  TrendingUp,
  MapPin,
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  Download,
  Search,
} from 'lucide-react';
import { visitorLogService } from '../../../services/visitorLogService';
import type { VisitorLog, VisitorLogStats } from '../../../lib/types';

type DeviceFilter = 'all' | 'desktop' | 'mobile' | 'tablet';
type DateRangeFilter = 'today' | 'yesterday' | '7days' | '30days' | 'custom';

const defaultStats: VisitorLogStats = {
  total_visitors: 0,
  avg_duration: '0s',
  bounce_rate: '0%',
  unique_ips: 0,
};

const formatDuration = (seconds?: number | null) => {
  if (!seconds || seconds < 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins && secs) return `${mins}m ${secs}s`;
  if (mins) return `${mins}m`;
  return `${secs}s`;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Unknown';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

const buildLocationLabel = (visitor: VisitorLog) => {
  const pieces = [visitor.city, visitor.location].filter(Boolean);
  if (pieces.length > 0) {
    return pieces.join(', ');
  }
  if (visitor.country_code) {
    return visitor.country_code;
  }
  return 'Unknown location';
};

const buildVisitorStats = (
  statsData: Partial<VisitorLogStats> | undefined,
  records: VisitorLog[],
): VisitorLogStats => {
  const uniqueIps = new Set(records.map((record) => record.ip_address)).size;
  const avgSeconds =
    records.length === 0
      ? 0
      : Math.round(
          records.reduce((sum, record) => sum + (record.duration_seconds ?? 0), 0) /
            records.length,
        );

  return {
    total_visitors: statsData?.total_visitors ?? records.length,
    avg_duration: statsData?.avg_duration ?? formatDuration(avgSeconds),
    bounce_rate: statsData?.bounce_rate ?? '0%',
    unique_ips: statsData?.unique_ips ?? uniqueIps,
  };
};

export function VisitorLogs() {
  const [visitors, setVisitors] = useState<VisitorLog[]>([]);
  const [stats, setStats] = useState<VisitorLogStats>(defaultStats);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDevice, setFilterDevice] = useState<DeviceFilter>('all');
  const [dateRange, setDateRange] = useState<DateRangeFilter>('today');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    void loadVisitors();
  }, [currentPage, filterDevice, dateRange]);

  const loadVisitors = async () => {
    try {
      setLoading(true);
      setError('');
      const response: any = await visitorLogService.getLogs(currentPage, 15, {
        device: filterDevice !== 'all' ? filterDevice : undefined,
        date_range: dateRange,
      });

      if (typeof response?.success !== 'undefined' && response.success === false) {
        throw new Error(response.message || 'Failed to load visitor logs');
      }

      const root = response?.data ?? response;
      const payload = root?.data ?? root;
      const visitorsSource = Array.isArray(payload?.visitors)
        ? payload.visitors
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(root?.visitors)
            ? root.visitors
            : Array.isArray(root)
              ? root
              : [];

      const normalizedVisitors: VisitorLog[] = Array.isArray(visitorsSource)
        ? visitorsSource
        : [];
      setVisitors(normalizedVisitors);

      const pagination = payload?.pagination ?? root?.pagination ?? payload;
      const derivedLastPage =
        pagination?.last_page ??
        pagination?.total_pages ??
        pagination?.lastPage ??
        pagination?.pages ??
        1;
      const safeLastPage = Math.max(1, Number(derivedLastPage) || 1);
      setTotalPages(safeLastPage);
      if (currentPage > safeLastPage) {
        setCurrentPage(safeLastPage);
      }

      const statsData = payload?.stats ?? root?.stats;
      setStats(buildVisitorStats(statsData, normalizedVisitors));
    } catch (err: any) {
      console.error('Visitor logs error:', err);
      setError(err?.message || 'Failed to load visitor logs');
      setVisitors([]);
      setStats(defaultStats);
    } finally {
      setLoading(false);
    }
  };

  const filteredVisitors = visitors.filter((visitor) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return filterDevice === 'all' || visitor.device === filterDevice;
    }

    const locationText = buildLocationLabel(visitor).toLowerCase();
    const referrerText = (visitor.referrer || '').toLowerCase();
    const ipText = (visitor.ip_address || '').toLowerCase();
    const sessionText = (visitor.session_id || '').toLowerCase();
    const matchesDevice = filterDevice === 'all' || visitor.device === filterDevice;

    return (
      locationText.includes(query) ||
      referrerText.includes(query) ||
      ipText.includes(query) ||
      sessionText.includes(query)
    ) && matchesDevice;
  });

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop':
        return <Monitor size={18} className="text-[#D4AF77]" />;
      case 'mobile':
        return <Smartphone size={18} className="text-[#9B8B7E]" />;
      case 'tablet':
        return <Tablet size={18} className="text-[#C9A58D]" />;
      default:
        return <Monitor size={18} />;
    }
  };

  const exportVisitors = () => {
    console.log('Exporting visitor logs...');
    alert('Export functionality will be implemented with Laravel backend');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2D1B1B]">Website Visitors</h1>
          <p className="text-[#9B8B7E] mt-1">Track and analyze visitor behavior</p>
        </div>
        <button
          onClick={exportVisitors}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D4AF77]/30 text-[#2D1B1B] rounded-lg font-semibold hover:bg-[#FFF8F3] transition-all"
        >
          <Download size={20} />
          Export Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#9B8B7E] font-medium">Total Visitors</p>
              <p className="text-2xl font-bold text-[#2D1B1B] mt-1">{stats.total_visitors}</p>
            </div>
            <div className="p-3 bg-[#D4AF77]/10 rounded-lg">
              <Eye className="text-[#D4AF77]" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#9B8B7E] font-medium">Avg. Duration</p>
              <p className="text-2xl font-bold text-[#2D1B1B] mt-1">{stats.avg_duration}</p>
            </div>
            <div className="p-3 bg-[#9B8B7E]/10 rounded-lg">
              <Clock className="text-[#9B8B7E]" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#9B8B7E] font-medium">Bounce Rate</p>
              <p className="text-2xl font-bold text-[#2D1B1B] mt-1">{stats.bounce_rate}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#9B8B7E] font-medium">Unique IPs</p>
              <p className="text-2xl font-bold text-[#2D1B1B] mt-1">{stats.unique_ips}</p>
            </div>
            <div className="p-3 bg-[#C9A58D]/10 rounded-lg">
              <Globe className="text-[#C9A58D]" size={24} />
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
              placeholder="Search by location, IP, or referrer..."
              className="w-full pl-11 pr-4 py-2 border border-[#D4AF77]/30 rounded-lg focus:ring-2 focus:ring-[#D4AF77] focus:border-transparent outline-none bg-white text-[#2D1B1B] placeholder:text-[#9B8B7E]"
            />
          </div>

          <select
            value={filterDevice}
            onChange={(e) => {
              setFilterDevice(e.target.value as DeviceFilter);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-[#D4AF77]/30 rounded-lg focus:ring-2 focus:ring-[#D4AF77] outline-none bg-white text-[#2D1B1B]"
          >
            <option value="all">All Devices</option>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => {
              setDateRange(e.target.value as DateRangeFilter);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-[#D4AF77]/30 rounded-lg focus:ring-2 focus:ring-[#D4AF77] outline-none bg-white text-[#2D1B1B]"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Visitors Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#FFF8F3] border-b border-[#D4AF77]/20">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9B8B7E] uppercase tracking-wider">
                  Visitor Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9B8B7E] uppercase tracking-wider">
                  Device & Browser
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9B8B7E] uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9B8B7E] uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9B8B7E] uppercase tracking-wider">
                  Referrer
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF77]/10">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-[#D4AF77] border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-[#9B8B7E]">Loading visitor logs...</p>
                  </td>
                </tr>
              )}

              {!loading && filteredVisitors.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#9B8B7E]">
                    No visitors found for the selected filters.
                  </td>
                </tr>
              )}

              {!loading &&
                filteredVisitors.map((visitor) => {
                  const pageViews = visitor.page_views ?? [];
                  const visiblePages = pageViews.slice(0, 3);
                  const remainingPages = Math.max(0, pageViews.length - visiblePages.length);

                  return (
                    <tr key={visitor.id} className="hover:bg-[#FFF8F3] transition-colors">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-mono text-[#9B8B7E]">
                            {visitor.session_id}
                          </div>
                          <div className="text-xs text-[#9B8B7E]">
                            {visitor.ip_address}
                          </div>
                          <div className="text-xs text-[#9B8B7E]">
                            {formatDateTime(visitor.visited_at)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(visitor.device)}
                            <span className="text-sm capitalize font-medium text-[#2D1B1B]">
                              {visitor.device}
                            </span>
                          </div>
                          <div className="text-xs text-[#9B8B7E]">{visitor.browser}</div>
                          <div className="text-xs text-[#9B8B7E]">{visitor.os}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-[#2D1B1B]">
                          <MapPin size={14} className="text-[#9B8B7E]" />
                          {buildLocationLabel(visitor)}
                        </div>
                        <div className="text-xs text-[#9B8B7E] mt-1">
                          Current page: {visitor.current_page || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock size={14} className="text-[#9B8B7E]" />
                            <span className="font-medium text-[#2D1B1B]">
                              {formatDuration(visitor.duration_seconds)}
                            </span>
                          </div>
                          <div className="text-xs text-[#9B8B7E]">
                            {pageViews.length} page view{pageViews.length === 1 ? '' : 's'}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {visiblePages.map((view) => (
                              <span
                                key={view.id}
                                className="px-2 py-0.5 bg-[#FFF8F3] text-[#9B8B7E] text-xs rounded"
                              >
                                {view.page_url || view.page_title || 'Page'}
                              </span>
                            ))}
                            {remainingPages > 0 && (
                              <span className="px-2 py-0.5 bg-[#D4AF77]/10 text-[#9B8B7E] text-xs rounded">
                                +{remainingPages} more
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-[#2D1B1B]">
                          <ExternalLink size={14} className="text-[#9B8B7E]" />
                          <span className="truncate max-w-[220px]" title={visitor.referrer}>
                            {visitor.referrer || 'Direct'}
                          </span>
                        </div>
                        <div className="text-xs text-[#9B8B7E] mt-1 capitalize">
                          {visitor.referrer_source || 'unknown source'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 rounded-lg border border-[#D4AF77]/40 text-[#2D1B1B] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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
