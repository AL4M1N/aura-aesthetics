/**
 * ADMIN DASHBOARD
 * Overview with visitor analytics and key metrics
 */

import { useState, useEffect } from 'react';
import {
  Users,
  Eye,
  TrendingUp,
  Clock,
  Calendar,
  MousePointerClick,
  Globe,
  Activity,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { dashboardService } from '../../../services/dashboardService';
import type { DashboardStats } from '../../../lib/types';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');
      const response: any = await dashboardService.getStats();
      
      console.log('Dashboard API response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      
      // Axios interceptor returns response.data directly
      // So we expect the data to be in the format: { success: true, data: {...stats} }
      // OR directly: {...stats}
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data structure
        if (response.success !== undefined && response.data) {
          console.log('Using ApiResponse format - data:', response.data);
          setStats(response.data);
        } 
        // Check if it's direct stats data (has expected properties)
        else if ('total_visitors' in response || 'total_users' in response) {
          console.log('Using direct DashboardStats format');
          setStats(response);
        }
        else {
          console.error('Unexpected response structure:', response);
          setError('Invalid response format from server');
        }
      } else {
        setError('No data received from server');
      }
    } catch (err: any) {
      console.error('Dashboard error:', err);
      setError(err.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#D4AF77] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#9B8B7E]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">Error loading dashboard</div>
          <p className="text-[#9B8B7E] mb-4">{error}</p>
          <button
            onClick={loadDashboardStats}
            className="px-4 py-2 bg-[#D4AF77] text-white rounded-lg hover:bg-[#C9A58D]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[#9B8B7E]">No dashboard data available</p>
      </div>
    );
  }

  // Safe fallback object to avoid runtime crashes while rendering
  const s: DashboardStats = {
    total_visitors: stats?.total_visitors ?? 0,
    visitors_change: stats?.visitors_change ?? 0,
    total_users: stats?.total_users ?? 0,
    users_change: stats?.users_change ?? 0,
    total_logins: stats?.total_logins ?? 0,
    logins_change: stats?.logins_change ?? 0,
    active_sessions: stats?.active_sessions ?? 0,
    sessions_change: stats?.sessions_change ?? 0,
    monthly_visitors: stats?.monthly_visitors ?? [],
    device_stats: stats?.device_stats ?? [],
    page_views: stats?.page_views ?? [],
    top_locations: stats?.top_locations ?? [],
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#2D1B1B]">Dashboard</h1>
        <p className="text-[#9B8B7E] mt-1">Welcome back! Here's your overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Visitors"
          value={s.total_visitors.toLocaleString()}
          change={`${s.visitors_change > 0 ? '+' : ''}${s.visitors_change}%`}
          icon={Users}
          color="rosegold"
        />
        <StatCard
          title="Total Users"
          value={s.total_users.toLocaleString()}
          change={`${s.users_change > 0 ? '+' : ''}${s.users_change}%`}
          icon={Eye}
          color="taupe"
        />
        <StatCard
          title="Total Logins"
          value={s.total_logins.toLocaleString()}
          change={`${s.logins_change > 0 ? '+' : ''}${s.logins_change}%`}
          icon={Clock}
          color="accent"
        />
        <StatCard
          title="Active Sessions"
          value={s.active_sessions.toLocaleString()}
          change={`${s.sessions_change > 0 ? '+' : ''}${s.sessions_change}%`}
          icon={TrendingUp}
          color="brown"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visitor Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[#2D1B1B]">
                Visitor Trends
              </h3>
              <p className="text-sm text-[#9B8B7E]">Last 30 days</p>
            </div>
            <Calendar className="text-[#9B8B7E]" size={20} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={s.monthly_visitors}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF77" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4AF77" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke="#D4AF77"
                fillOpacity={1}
                fill="url(#colorVisitors)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Device Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[#2D1B1B]">
                Device Types
              </h3>
              <p className="text-sm text-[#9B8B7E]">Distribution</p>
            </div>
            <Globe className="text-[#9B8B7E]" size={20} />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={stats.device_stats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {s.device_stats.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {s.device_stats.map((device: any) => (
              <div key={device.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: device.color }}
                  />
                  <span className="text-sm text-[#2D1B1B]">{device.name}</span>
                </div>
                <span className="text-sm font-semibold text-[#2D1B1B]">
                  {device.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Pages */}
        <div className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[#2D1B1B]">
                Popular Pages
              </h3>
              <p className="text-sm text-[#9B8B7E]">Most visited pages</p>
            </div>
            <MousePointerClick className="text-[#9B8B7E]" size={20} />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={s.page_views} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="page" type="category" stroke="#9ca3af" width={80} />
              <Tooltip />
              <Bar dataKey="views" fill="#D4AF77" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Locations */}
        <div className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[#2D1B1B]">
                Top Locations
              </h3>
              <p className="text-sm text-[#9B8B7E]">Visitor geography</p>
            </div>
            <Activity className="text-[#9B8B7E]" size={20} />
          </div>
          <div className="space-y-4">
            {s.top_locations.map((location: any, index: number) => (
              <div key={location.country}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#FFF8F3] text-[#D4AF77] text-xs font-semibold">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-[#2D1B1B]">
                      {location.country}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-[#2D1B1B]">
                      {location.visitors.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#9B8B7E] ml-2">
                      ({location.percentage}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-[#FFF8F3] rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] h-2 rounded-full transition-all"
                    style={{ width: `${location.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: any;
  color: 'rosegold' | 'taupe' | 'accent' | 'brown';
  isDecrease?: boolean;
}

function StatCard({ title, value, change, icon: Icon, color, isDecrease }: StatCardProps) {
  const colorClasses = {
    rosegold: 'from-[#D4AF77] to-[#C9A58D]',
    taupe: 'from-[#9B8B7E] to-[#C9A58D]',
    accent: 'from-[#C9A58D] to-[#F5E6D3]',
    brown: 'from-[#2D1B1B] to-[#9B8B7E]',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#D4AF77]/20 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
          <Icon className="text-white" size={24} />
        </div>
        <span
          className={`text-sm font-semibold ${
            isDecrease ? 'text-green-600' : 'text-green-600'
          }`}
        >
          {change}
        </span>
      </div>
      <h3 className="text-[#9B8B7E] text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-[#2D1B1B]">{value}</p>
    </div>
  );
}
