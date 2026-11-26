import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  ArrowUpRight,
  Cpu,
  Clock,
  GitMerge,
  Network,
  SearchX,
} from 'lucide-react';
import StatsCards from '../common/StatsCards';
import LiveArrivalWidget from '../common/LiveArrivalWidget';
import IntervalMergeVisualizer from '../common/IntervalMergeVisualizer';
import { formatInterval, formatNumber, formatTime, intervalLength } from '../../utils/formatters';

export default function DashboardView({
  stats,
  intervals,
  history,
  lastTrace,
  notification,
  onDismissNotification,
  onAddPackage,
  onRandomArrival,
  onReset,
  onRestoreSample,
  onNavigate,
  onTriggerDemoMerge,
}) {
  const chartData = intervals.slice(0, 14).map((iv, index) => {
    const next = intervals[index + 1];
    return {
      name: formatInterval(iv, true),
      packages: intervalLength(iv),
      gapAfter: next ? next.start - iv.end - 1 : 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Executive Dark Navy Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#071124] via-[#0c1b38] to-[#0b2942] p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-teal-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-300">
              <Cpu className="h-3.5 w-3.5" />
              Problem Statement 09 · Balanced Searching &amp; Ordered Indexing
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              WarehouseIQ — Live Arrival Index
            </h1>
            <p className="text-sm leading-relaxed text-slate-300">
              Real-time package ID tracking powered by a self-balancing{' '}
              <span className="font-semibold text-cyan-300">AVL Interval Tree</span>.
              Arrivals in arbitrary order are coalesced incrementally into sorted,
              non-overlapping intervals with <span className="font-mono text-teal-300">O(log k)</span>{' '}
              lookups, automatic bridge merging, and instant missing-range detection.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('algorithm')}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-teal-500/20 transition hover:bg-teal-400"
            >
              <Network className="h-4 w-4" />
              Inspect AVL Tree
            </button>
            <button
              type="button"
              onClick={() => onNavigate('missing')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-cyan-400 hover:bg-slate-800"
            >
              <SearchX className="h-4 w-4 text-cyan-300" />
              Find Missing Ranges
            </button>
          </div>
        </div>
      </section>

      {/* 4 KPI Statistics Cards */}
      <StatsCards stats={stats} />

      {/* Live Arrival Input Control */}
      <LiveArrivalWidget
        onAddPackage={onAddPackage}
        onRandomArrival={onRandomArrival}
        onReset={onReset}
        onRestoreSample={onRestoreSample}
        lastTrace={lastTrace}
        notification={notification}
        onDismissNotification={onDismissNotification}
      />

      {/* Interval Visualization + Chart Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <IntervalMergeVisualizer
            intervals={intervals}
            lastTrace={lastTrace}
            showBeforeAfter={true}
            onTriggerDemoMerge={onTriggerDemoMerge}
          />
        </div>

        <div className="space-y-6 xl:col-span-5">
          {/* Interval Distribution Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Interval Density &amp; Gap Overview
                </h3>
                <p className="text-xs text-slate-500">
                  Consecutive packages per interval vs. gap to next interval
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('reports')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                Full Report
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 h-60 w-full">
              {chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                  Insert packages to view interval distribution
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#475569' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#475569' }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#081123',
                        borderColor: '#1e293b',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="packages"
                      name="Consecutive IDs"
                      fill="#0d9488"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="gapAfter"
                      name="Gap After Interval"
                      fill="#f59e0b"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recent Arrival Stream */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Recent Package Arrivals
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('arrivals')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                View All
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {history.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">
                  No arrivals recorded yet.
                </p>
              ) : (
                history.slice(0, 6).map((item) => (
                  <div
                    key={`${item.seq}-${item.id}`}
                    className="flex items-center justify-between gap-3 py-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[11px] text-slate-400">
                        #{item.seq}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono font-bold text-slate-900">
                        {formatNumber(item.id)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          item.action === 'MERGE'
                            ? 'bg-teal-100 text-teal-800'
                            : item.action === 'DUPLICATE'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-cyan-100 text-cyan-800'
                        }`}
                      >
                        {item.action === 'MERGE' && <GitMerge className="h-2.5 w-2.5" />}
                        {item.actionLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <span className="font-mono font-medium text-slate-700">
                        {formatInterval(item.affectedInterval)}
                      </span>
                      <span className="hidden text-[11px] text-slate-400 sm:inline">
                        {formatTime(item.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
