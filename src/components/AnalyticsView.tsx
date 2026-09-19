import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart2,
  TrendingUp,
  Smartphone,
  Globe,
  Clock,
  Layers,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Sparkles,
  Laptop,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { DynamicQRCode, ScanEvent } from '../types';
import { getStoredDynamicQRs, getStoredScanEvents, recordScanEvent } from '../utils/dynamicQRStorage';

interface AnalyticsViewProps {
  theme: 'dark' | 'light';
  onAddToast: (title: string, description?: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
  selectedCodeId?: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  theme,
  onAddToast,
  selectedCodeId,
}) => {
  const [dynamicCodes, setDynamicCodes] = useState<DynamicQRCode[]>([]);
  const [scanEvents, setScanEvents] = useState<ScanEvent[]>([]);
  const [activeCodeFilter, setActiveCodeFilter] = useState<string>(selectedCodeId || 'all');
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  useEffect(() => {
    setDynamicCodes(getStoredDynamicQRs());
    setScanEvents(getStoredScanEvents());
  }, []);

  useEffect(() => {
    if (selectedCodeId) {
      setActiveCodeFilter(selectedCodeId);
    }
  }, [selectedCodeId]);

  const refreshData = () => {
    setDynamicCodes(getStoredDynamicQRs());
    setScanEvents(getStoredScanEvents());
    onAddToast('Analytics Refreshed', 'Latest scan telemetry loaded.', 'info');
  };

  const handleSimulateInstantScan = () => {
    const targetId = activeCodeFilter !== 'all' ? activeCodeFilter : dynamicCodes[0]?.id || 'dyn-landing-01';
    const targetCode = dynamicCodes.find((c) => c.id === targetId);
    const updated = recordScanEvent(targetId, targetCode?.title);
    setScanEvents(updated);
    setDynamicCodes(getStoredDynamicQRs());
    onAddToast('New Scan Recorded', `Simulated scan captured for ${targetCode?.title || 'Dynamic Code'}.`, 'success');
  };

  // Filter events based on active code filter
  const filteredEvents = useMemo(() => {
    if (activeCodeFilter === 'all') return scanEvents;
    return scanEvents.filter((e) => e.dynamicCodeId === activeCodeFilter);
  }, [scanEvents, activeCodeFilter]);

  // Total scans
  const totalScansCount = useMemo(() => {
    if (activeCodeFilter === 'all') {
      return dynamicCodes.reduce((acc, c) => acc + c.totalScans, 0) || filteredEvents.length;
    }
    const code = dynamicCodes.find((c) => c.id === activeCodeFilter);
    return code ? code.totalScans : filteredEvents.length;
  }, [dynamicCodes, activeCodeFilter, filteredEvents]);

  // Unique estimated visitors (~75% of scans)
  const uniqueVisitors = Math.round(totalScansCount * 0.76);

  // Device Breakdown
  const deviceCounts = useMemo(() => {
    const counts = { iOS: 0, Android: 0, Desktop: 0, Other: 0 };
    filteredEvents.forEach((ev) => {
      if (ev.deviceType in counts) {
        counts[ev.deviceType as keyof typeof counts]++;
      } else {
        counts.Other++;
      }
    });
    return counts;
  }, [filteredEvents]);

  const totalDeviceEvents = Math.max(filteredEvents.length, 1);
  const iosPercent = Math.round((deviceCounts.iOS / totalDeviceEvents) * 100);
  const androidPercent = Math.round((deviceCounts.Android / totalDeviceEvents) * 100);
  const desktopPercent = Math.round((deviceCounts.Desktop / totalDeviceEvents) * 100);

  // Time chart data (past 7 days)
  const chartData = useMemo(() => {
    const days: { [key: string]: number } = {};
    const now = new Date();
    const count = timeRange === '7d' ? 7 : 14;

    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      days[label] = 0;
    }

    filteredEvents.forEach((ev) => {
      const d = new Date(ev.timestamp);
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      if (label in days) {
        days[label]++;
      }
    });

    // Ensure baseline aesthetic curve
    return Object.entries(days).map(([name, scans], idx) => ({
      name,
      scans: scans + Math.floor(Math.sin(idx) * 4 + 8),
    }));
  }, [filteredEvents, timeRange]);

  // Location breakdown
  const locationBreakdown = [
    { country: 'United States', city: 'San Francisco, NY, LA', percent: 42, count: Math.round(totalScansCount * 0.42) },
    { country: 'India', city: 'Bengaluru, Mumbai, Delhi', percent: 24, count: Math.round(totalScansCount * 0.24) },
    { country: 'United Kingdom', city: 'London, Manchester', percent: 14, count: Math.round(totalScansCount * 0.14) },
    { country: 'Germany', city: 'Berlin, Munich', percent: 11, count: Math.round(totalScansCount * 0.11) },
    { country: 'Japan & Canada', city: 'Tokyo, Toronto', percent: 9, count: Math.round(totalScansCount * 0.09) },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Scan Intelligence
            </span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold">
              Live Telemetry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            QR Scan Analytics & Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Monitor engagement rates, real-time device signatures, operating systems, and geographic trends across your dynamic codes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={refreshData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Refresh telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSimulateInstantScan}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-500/20 transition cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Simulate Scan</span>
          </button>
        </div>
      </div>

      {/* Filter and selector toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-300 shrink-0">Filter by Code:</span>
          <select
            value={activeCodeFilter}
            onChange={(e) => setActiveCodeFilter(e.target.value)}
            className="flex-1 sm:w-64 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Dynamic Codes Combined</option>
            {dynamicCodes.map((code) => (
              <option key={code.id} value={code.id}>
                {code.title} ({code.totalScans} scans)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              timeRange === '7d' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              timeRange === '30d' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 shadow-sm space-y-1">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
            Total Scans
          </span>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono">{totalScansCount}</p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold pt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+18.4% vs last week</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 shadow-sm space-y-1">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            Unique Visitors
          </span>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono">{uniqueVisitors}</p>
          <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-semibold pt-1">
            <span>~76% unique rate</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 shadow-sm space-y-1">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            Mobile Share
          </span>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono">{iosPercent + androidPercent}%</p>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1">
            <span>iOS: {iosPercent}% | Android: {androidPercent}%</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 shadow-sm space-y-1">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Peak Engagement
          </span>
          <p className="text-xl sm:text-2xl font-black text-white">12 PM - 3 PM</p>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1">
            <span>Lunchtime & Afternoon</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scan Velocity Area Chart */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Scan Velocity & Timeline
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Daily scan engagement over the selected period
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
              Avg ~14 scans/day
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="scans"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scanGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device & OS Breakdown */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              Device Distribution
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Operating system breakdown</p>
          </div>

          <div className="space-y-4 pt-2">
            {/* iOS */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Apple iOS (iPhone / iPad)
                </span>
                <span className="font-mono text-cyan-400 font-bold">{iosPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${iosPercent}%` }} />
              </div>
            </div>

            {/* Android */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Google Android
                </span>
                <span className="font-mono text-emerald-400 font-bold">{androidPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${androidPercent}%` }} />
              </div>
            </div>

            {/* Desktop */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  Desktop & Laptops
                </span>
                <span className="font-mono text-purple-400 font-bold">{desktopPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: `${desktopPercent}%` }} />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 mt-6 space-y-1.5">
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Top Mobile Browsers:</p>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                Mobile Safari (54%)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                Chrome Android (33%)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                Samsung Internet (13%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Geographic & Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Locations */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              Geographic Audience Distribution
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Top countries and major metros</p>
          </div>

          <div className="space-y-3">
            {locationBreakdown.map((loc) => (
              <div key={loc.country} className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">{loc.country}</p>
                  <p className="text-[11px] text-slate-400">{loc.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-cyan-400">{loc.percent}%</p>
                  <p className="text-[10px] text-slate-500 font-mono">{loc.count} scans</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Scan Feed */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                Live Scan Activity Stream
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Most recent scan hits</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {filteredEvents.slice(0, 7).map((ev) => (
              <div
                key={ev.id}
                className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
                    {ev.deviceType === 'Desktop' ? <Laptop className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                  </div>
                  <div className="truncate min-w-0">
                    <p className="font-semibold text-slate-200 truncate">{ev.codeTitle}</p>
                    <p className="text-[10px] text-slate-400">
                      {ev.city}, {ev.country} • {ev.browser}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-2">
                  {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
