import React from 'react';
import {
  LayoutDashboard,
  PackagePlus,
  GitMerge,
  SearchX,
  ScanSearch,
  Network,
  FileSpreadsheet,
  Boxes,
  X,
  CheckCircle2,
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
  { id: 'arrivals', label: 'Live Package Arrivals', icon: PackagePlus, badge: 'Live' },
  { id: 'intervals', label: 'Arrival Intervals', icon: GitMerge, badgeKey: 'totalIntervals' },
  { id: 'missing', label: 'Missing Packages', icon: SearchX, badgeKey: 'missingWithinSpan' },
  { id: 'range-search', label: 'Range Search', icon: ScanSearch, badge: null },
  { id: 'algorithm', label: 'Algorithm Visualization', icon: Network, badge: 'AVL' },
  { id: 'reports', label: 'Reports', icon: FileSpreadsheet, badge: 'CSV' },
];

export default function Sidebar({
  activeTab,
  onSelectTab,
  stats,
  mobileOpen,
  onCloseMobile,
}) {
  const renderBadge = (item) => {
    if (item.badgeKey === 'totalIntervals') {
      return (
        <span className="ml-auto rounded-full bg-teal-500/20 px-2 py-0.5 font-mono text-[11px] font-semibold text-teal-300">
          {stats.totalIntervals}
        </span>
      );
    }
    if (item.badgeKey === 'missingWithinSpan') {
      return (
        <span className="ml-auto rounded-full bg-amber-500/20 px-2 py-0.5 font-mono text-[11px] font-semibold text-amber-300">
          {stats.missingWithinSpan}
        </span>
      );
    }
    if (item.badge) {
      return (
        <span className="ml-auto rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
          {item.badge}
        </span>
      );
    }
    return null;
  };

  const content = (
    <div className="flex h-full flex-col bg-[#081123] text-slate-200">
      {/* Brand Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 text-slate-950 shadow-lg shadow-teal-500/20">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-white">
                WarehouseIQ
              </span>
            </div>
            <p className="text-[11px] font-medium tracking-wide text-cyan-300/90">
              Live Arrival Index
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="Close navigation menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Problem Statement Pill */}
      <div className="mx-4 mt-4 rounded-xl border border-slate-800 bg-[#0d1930] px-3.5 py-2.5">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          <span>Problem 09</span>
          <span className="text-teal-400">AVL Balanced</span>
        </div>
        <p className="mt-1 text-xs font-medium text-slate-200">
          Broken Number Ranges
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Operations &amp; Index
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/10 text-white shadow-sm ring-1 ring-teal-400/30'
                  : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-cyan-300'
                }`}
              />
              <span className="truncate">{item.label}</span>
              {renderBadge(item)}
            </button>
          );
        })}
      </nav>

      {/* AVL Engine Health Footer */}
      <div className="border-t border-slate-800/80 p-4">
        <div className="rounded-xl border border-slate-800 bg-[#0d1930] p-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <CheckCircle2 className="h-4 w-4 text-teal-400" />
            <span>AVL Tree Engine Active</span>
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-lg bg-slate-900/80 px-2.5 py-1.5">
              <div className="text-slate-400">Tree Height</div>
              <div className="font-mono text-sm font-bold text-cyan-300">
                h = {stats.treeHeight}
              </div>
            </div>
            <div className="rounded-lg bg-slate-900/80 px-2.5 py-1.5">
              <div className="text-slate-400">AVL Nodes (k)</div>
              <div className="font-mono text-sm font-bold text-teal-300">
                {stats.totalIntervals}
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Rotations: {stats.rotationCount}</span>
            <span>Merges: {stats.mergeCount}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-slate-800 lg:block">
        <div className="sticky top-0 h-screen">{content}</div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-72 max-w-[85vw] shadow-2xl">{content}</div>
        </div>
      )}
    </>
  );
}
