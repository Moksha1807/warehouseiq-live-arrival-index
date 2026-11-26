import React from 'react';
import { PackageCheck, GitCommitHorizontal, AlertTriangle, CopySlash } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';

export default function StatsCards({ stats }) {
  const cards = [
    {
      label: 'Total Packages Received',
      value: formatNumber(stats.uniqueCount),
      subtext: `${formatNumber(stats.totalArrivals)} total scan events`,
      icon: PackageCheck,
      accentBg: 'bg-teal-50',
      accentText: 'text-teal-700',
      borderHover: 'hover:border-teal-300',
      badge: stats.minId !== null ? `Span ${formatNumber(stats.minId)}–${formatNumber(stats.maxId)}` : 'Empty index',
    },
    {
      label: 'Total Continuous Intervals',
      value: formatNumber(stats.totalIntervals),
      subtext: `AVL height ${stats.treeHeight} · ${stats.mergeCount} merges`,
      icon: GitCommitHorizontal,
      accentBg: 'bg-cyan-50',
      accentText: 'text-cyan-700',
      borderHover: 'hover:border-cyan-300',
      badge: 'Sorted & disjoint',
    },
    {
      label: 'Missing Package IDs',
      value: formatNumber(stats.missingWithinSpan),
      subtext:
        stats.minId !== null
          ? `Inside [${formatNumber(stats.minId)}–${formatNumber(stats.maxId)}]`
          : 'No active span yet',
      icon: AlertTriangle,
      accentBg: 'bg-amber-50',
      accentText: 'text-amber-700',
      borderHover: 'hover:border-amber-300',
      badge: `${stats.missingSpanRanges?.length || 0} gap range(s)`,
    },
    {
      label: 'Duplicate Arrivals',
      value: formatNumber(stats.duplicateCount),
      subtext: 'Ignored without altering intervals',
      icon: CopySlash,
      accentBg: 'bg-slate-100',
      accentText: 'text-slate-700',
      borderHover: 'hover:border-slate-300',
      badge: 'Idempotent O(log k)',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${card.borderHover}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {card.label}
                </p>
                <p className="mt-2 font-mono text-3xl font-bold tracking-tight text-slate-900">
                  {card.value}
                </p>
              </div>
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.accentBg} ${card.accentText}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
              <span className="truncate text-slate-500">{card.subtext}</span>
              <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
