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
  Calendar,
} from 'lucide-react';
import { visitorLogService } from '../../../services/visitorLogService';
import type { VisitorLog } from '../../../lib/types';

export function VisitorLogs() {
  const [visitors, setVisitors] = useState<VisitorLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDevice, setFilterDevice] = useState<'all' | 'desktop' | 'mobile' | 'tablet'>('all');
  const [dateRange, setDateRange] = useState('today');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadVisitors();
  }, [currentPage, filterDevice]);

  const loadVisitors = async () => {
    try {
      setLoading(true);
      setError('');
      const response: any = await visitorLogService.getLogs(currentPage, 15, {
        device: filterDevice !== 'all' ? filterDevice : undefined,
      });
      
      console.log('Visitor logs API response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      
      // Axios returns response.data directly
      if (response && typeof response === 'object') {
        // Check for ApiResponse with success/data structure
        if (response.success !== undefined && response.data) {
          console.log('Using ApiResponse format - data:', response.data);
          // Handle paginated data structure
          if (Array.isArray(response.data.data)) {
            setVisitors(response.data.data);
            setTotalPages(response.data.last_page || 1);
          } else if (Array.isArray(response.data)) {
            setVisitors(response.data);
            setTotalPages(1);
          } else {
            setVisitors([]);
            console.warn('No array data found in response');
          }
        }
        // Check for direct paginated Laravel format: { data: [], last_page: 1, ... }
        else if (Array.isArray(response.data)) {
          console.log('Using direct paginated format');
          setVisitors(response.data);
          setTotalPages(response.last_page || 1);
        }
        // Check for direct array
        else if (Array.isArray(response)) {
          console.log('Using direct array format');
          setVisitors(response);
          setTotalPages(1);
        }
        else {
          console.error('Unexpected response structure:', response);
          setError('Invalid response format from server');
          setVisitors([]);
        }
      } else {
        setError('No data received from server');
        setVisitors([]);
      }
    } catch (err: any) {
      console.error('Visitor logs error:', err);
      setError(err.message || 'Failed to load visitor logs');
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVisitors = (visitors || []).filter((visitor) => {
    const matchesSearch =
      visitor.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visitor.ip_address.includes(searchQuery) ||
      visitor.referrer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDevice = filterDevice === 'all' || visitor.device === filterDevice;
    return matchesSearch && matchesDevice;
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

  // Loading state
  if (loading && visitors.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#D4AF77] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#9B8B7E]">Loading visitor logs...</p>
        </div>
      </div>
    );
  }

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
              <p className="text-2xl font-bold text-[#2D1B1B] mt-1">
                {visitors.length}
              </p>
            </div>
            <div className="p-3 bg-[#D4AF77]/10 rounded-lg">
              <Eye className="text-[#D4AF77]" size={24} />
            </div>
          </div>
          <p className="text-xs text-green-600 font-semibold mt-2">+15% from yesterday</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#9B8B7E] font-medium">Avg. Duration</p>
              <p className="text-2xl font-bold text-[#2D1B1B] mt-1">5m 47s</p>
            </div>
            <div className="p-3 bg-[#9B8B7E]/10 rounded-lg">
              <Clock className="text-[#9B8B7E]" size={24} />
            </div>
          </div>
          <p className="text-xs text-green-600 font-semibold mt-2">+8% from yesterday</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#9B8B7E] font-medium">Bounce Rate</p>
              <p className="text-2xl font-bold text-[#2D1B1B] mt-1">38%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
          <p className="text-xs text-green-600 font-semibold mt-2">-5% from yesterday</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#9B8B7E] font-medium">Unique IPs</p>
              <p className="text-2xl font-bold text-[#2D1B1B] mt-1">
                {new Set(visitors.map((v) => v.ip_address)).size}
              </p>
            </div>
            <div className="p-3 bg-[#C9A58D]/10 rounded-lg">
              <Globe className="text-[#C9A58D]" size={24} />
            </div>
          </div>
          <p className="text-xs text-green-600 font-semibold mt-2">+12% from yesterday</p>
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
              className="w-full pl-11 pr-4 py-2 border border-[#D4AF77]/30 rounded-lg focus:ring-2 focus:ring-[#D4AF77] focus:border-transparent outline-none"
            />
          </div>

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

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-[#D4AF77]/30 rounded-lg focus:ring-2 focus:ring-[#D4AF77] outline-none"
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
              {filteredVisitors.map((visitor) => (
                <tr key={visitor.id} className="hover:bg-[#FFF8F3] transition-colors">
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-mono text-[#9B8B7E]">
                        {visitor.session_id}
                      </div>
                      <div className="text-xs text-[#9B8B7E]">{visitor.timestamp}</div>
                      <div className="text-xs text-[#9B8B7E]">{visitor.ip_address}</div>
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
                      {visitor.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={14} className="text-[#9B8B7E]" />
                        <span className="font-medium text-[#2D1B1B]">
                          {visitor.duration}
                        </span>
                      </div>
                      <div className="text-xs text-[#9B8B7E]">
                        {visitor.pages_visited.length} pages visited
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {visitor.pages_visited.map((page: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-[#FFF8F3] text-[#9B8B7E] text-xs rounded"
                          >
                            {page}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-[#2D1B1B]">
                      <ExternalLink size={14} className="text-[#9B8B7E]" />
                      {visitor.referrer}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
