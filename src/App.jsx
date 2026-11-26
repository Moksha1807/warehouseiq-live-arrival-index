import React, { useState, useRef, useEffect } from 'react';
import { Menu, Activity, Layers } from 'lucide-react';
import Sidebar, { NAV_ITEMS } from './components/layout/Sidebar';
import DashboardView from './components/views/DashboardView';
import LiveArrivalsView from './components/views/LiveArrivalsView';
import ArrivalIntervalsView from './components/views/ArrivalIntervalsView';
import MissingPackagesView from './components/views/MissingPackagesView';
import RangeSearchView from './components/views/RangeSearchView';
import AlgorithmVizView from './components/views/AlgorithmVizView';
import ReportsView from './components/views/ReportsView';
import { useWarehouseIndex } from './hooks/useWarehouseIndex';
import { formatNumber } from './utils/formatters';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const demoTimersRef = useRef([]);

  const {
    intervals,
    treeSnapshot,
    stats,
    history,
    lastTrace,
    notification,
    setNotification,
    isAutoStreaming,
    setIsAutoStreaming,
    addPackage,
    addBatchPackages,
    addRandomArrival,
    loadSequence,
    resetIndex,
    restoreSampleData,
    findMissingRanges,
    containsPackage,
  } = useWarehouseIndex();

  useEffect(() => {
    return () => {
      demoTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  const triggerBridgeMergeDemo = () => {
    demoTimersRef.current.forEach(clearTimeout);
    loadSequence([1, 2, 3, 5, 6, 7], 'Merge Demo Setup ([1–3], [5–7])');
    const t = setTimeout(() => {
      addPackage(4);
    }, 850);
    demoTimersRef.current = [t];
  };

  const currentNav = NAV_ITEMS.find((n) => n.id === activeTab) || NAV_ITEMS[0];

  return (
    <div className="flex min-h-screen bg-[#f4f7fb] text-slate-900">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        stats={stats}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Application Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 sm:text-base">
                    {currentNav.label}
                  </span>
                  <span className="hidden rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 sm:inline">
                    AVL Interval Index
                  </span>
                </div>
                <p className="hidden text-xs text-slate-500 sm:block">
                  WarehouseIQ · Real-Time Broken Number Range Consolidation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs sm:flex">
                <Layers className="h-3.5 w-3.5 text-teal-600" />
                <span className="text-slate-500">Intervals:</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatNumber(stats.totalIntervals)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl bg-[#081123] px-3 py-1.5 text-xs font-semibold text-white">
                <Activity
                  className={`h-3.5 w-3.5 ${
                    isAutoStreaming ? 'animate-pulse text-amber-400' : 'text-teal-400'
                  }`}
                />
                <span>{isAutoStreaming ? 'Streaming' : 'AVL Ready'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              intervals={intervals}
              history={history}
              lastTrace={lastTrace}
              notification={notification}
              onDismissNotification={() => setNotification(null)}
              onAddPackage={addPackage}
              onRandomArrival={addRandomArrival}
              onReset={resetIndex}
              onRestoreSample={restoreSampleData}
              onNavigate={setActiveTab}
              onTriggerDemoMerge={triggerBridgeMergeDemo}
            />
          )}

          {activeTab === 'arrivals' && (
            <LiveArrivalsView
              intervals={intervals}
              history={history}
              lastTrace={lastTrace}
              notification={notification}
              onDismissNotification={() => setNotification(null)}
              onAddPackage={addPackage}
              onAddBatchPackages={addBatchPackages}
              onRandomArrival={addRandomArrival}
              onReset={resetIndex}
              onRestoreSample={restoreSampleData}
              isAutoStreaming={isAutoStreaming}
              onToggleAutoStream={() => setIsAutoStreaming((prev) => !prev)}
            />
          )}

          {activeTab === 'intervals' && (
            <ArrivalIntervalsView
              intervals={intervals}
              lastTrace={lastTrace}
              onLoadSequence={loadSequence}
              onAddPackage={addPackage}
            />
          )}

          {activeTab === 'missing' && (
            <MissingPackagesView
              stats={stats}
              findMissingRanges={findMissingRanges}
              onAddPackage={addPackage}
            />
          )}

          {activeTab === 'range-search' && (
            <RangeSearchView
              containsPackage={containsPackage}
              findMissingRanges={findMissingRanges}
              intervals={intervals}
            />
          )}

          {activeTab === 'algorithm' && (
            <AlgorithmVizView
              treeSnapshot={treeSnapshot}
              lastTrace={lastTrace}
              onAddPackage={addPackage}
              onLoadSequence={loadSequence}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              intervals={intervals}
              stats={stats}
              history={history}
              findMissingRanges={findMissingRanges}
            />
          )}
        </main>
      </div>
    </div>
  );
}
