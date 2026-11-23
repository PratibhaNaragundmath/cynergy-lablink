import React, { useState, useEffect } from 'react';
import { 
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
  LineChart, 
  Line, 
  Legend 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Cpu, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Calendar
} from 'lucide-react';
import { storageService } from '../services/storageService';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState(() => storageService.getAnalytics());

  useEffect(() => {
    const handleUpdate = () => setAnalytics(storageService.getAnalytics());
    window.addEventListener('lablink_storage_update', handleUpdate);
    return () => window.removeEventListener('lablink_storage_update', handleUpdate);
  }, []);

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Resource Utilisation & Campus Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time interdepartmental laboratory metrics, booking frequency trends, and operational efficiency rates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Campus Utilisation: {analytics.overallUtilisationRate}%
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Equipment</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{analytics.totalResources}</p>
          <span className="text-[10px] text-emerald-600 font-medium">6 departments</span>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Now</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{analytics.availableResources}</p>
          <span className="text-[10px] text-slate-400">Ready to book</span>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Currently In-Use</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{analytics.inUseResources}</p>
          <span className="text-[10px] text-amber-600 font-medium">Active sessions</span>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Maintenance</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{analytics.maintenanceResources}</p>
          <span className="text-[10px] text-slate-400">Calibrating</span>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approved Bookings</p>
          <p className="text-2xl font-black text-brand-600 mt-1">{analytics.approvedBookings}</p>
          <span className="text-[10px] text-brand-600 font-medium">Verified by faculty</span>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Review</p>
          <p className="text-2xl font-black text-amber-500 mt-1">{analytics.pendingRequests}</p>
          <span className="text-[10px] text-slate-400">Awaiting decision</span>
        </div>
      </div>

      {/* Charts Section 1: Department Utilisation & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department-wise Utilisation Bar Chart */}
        <div className="lg:col-span-8 rounded-3xl bg-white p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Department-Wise Laboratory Utilisation</h3>
              <p className="text-[11px] text-slate-500">
                Formula: (Approved Booked Hours ÷ Available Operational Hours) × 100
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">Hours Booked</span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.departmentStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(val: any, name: any) => [`${val} hours`, 'Booked Duration']}
                  labelFormatter={(code) => {
                    const d = analytics.departmentStats.find((s) => s.name === code);
                    return d?.fullName || code;
                  }}
                />
                <Bar dataKey="bookedHours" fill="#1b56f0" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="lg:col-span-4 rounded-3xl bg-white p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Request Status Breakdown</h3>
            <p className="text-[11px] text-slate-500">Distribution of all submitted requests</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analytics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100">
            {analytics.statusDistribution.map((entry, idx) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-slate-600">{entry.name}:</span>
                <span className="font-bold text-slate-900">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section 2: Weekly Trends & Peak Booking Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend Line Chart */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Weekly Booking Velocity</h3>
              <p className="text-[11px] text-slate-500">Request volume vs approved reservations</p>
            </div>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="requests" stroke="#f59e0b" strokeWidth={2.5} name="Total Requests" />
                <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2.5} name="Approved Bookings" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Demanded Equipment */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Top Requested Campus Equipment</h3>
              <p className="text-[11px] text-slate-500">High-contention hardware requiring fair allocation</p>
            </div>
            <Cpu className="h-4 w-4 text-brand-600" />
          </div>

          <div className="space-y-3">
            {analytics.mostRequested.map((item, index) => (
              <div key={index} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 line-clamp-1">{item.name}</span>
                  <span className="font-bold text-brand-700 font-mono shrink-0 ml-2">
                    {item.count} requests ({item.hours}h)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600 rounded-full"
                    style={{ width: `${Math.min(100, item.count * 25)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
