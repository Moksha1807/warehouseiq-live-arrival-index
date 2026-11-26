import React, { useState, useRef, useEffect } from 'react';
import { Play, Sparkles, GitMerge, ArrowRight } from 'lucide-react';
import IntervalMergeVisualizer from '../common/IntervalMergeVisualizer';
import { formatInterval } from '../../utils/formatters';

export default function ArrivalIntervalsView({
  intervals,
  lastTrace,
  onLoadSequence,
  onAddPackage,
}) {
  const [demoStatus, setDemoStatus] = useState(null);
  const timersRef = useRef([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  // Two-step bridge demo from [1, 3, 7, 2, 6] -> [1-3], [6-7], then +4 -> [1-4], [6-7], then +5 -> [1-7]
  const runFullBridgeDemo = () => {
    clearTimers();
    setDemoStatus('Step 1/3: Loaded arrivals [1, 3, 7, 2, 6] → [1–3] and [6–7]');
    onLoadSequence([1, 3, 7, 2, 6], 'Demo Baseline Loaded');

    const t1 = setTimeout(() => {
      setDemoStatus('Step 2/3: Package 4 arrived → extended [1–3] into [1–4]');
      onAddPackage(4);
    }, 1200);

    const t2 = setTimeout(() => {
      setDemoStatus('Step 3/3: Connecting Package 5 arrived → MERGED [1–4] + [6–7] into [1–7]!');
      onAddPackage(5);
    }, 2500);

    timersRef.current = [t1, t2];
  };

  // Single-step instant bridge merge: [1-3] and [5-7] bridged by 4 -> [1-7]
  const runInstantBridgeDemo = () => {
    clearTimers();
    setDemoStatus('Loaded [1–3] and [5–7]; inserting bridge ID 4 in 1s...');
    onLoadSequence([1, 2, 3, 5, 6, 7], 'Bridge Setup Loaded');

    const t1 = setTimeout(() => {
      setDemoStatus('Package 4 arrived → MERGED [1–3] and [5–7] into [1–7]!');
      onAddPackage(4);
    }, 1000);

    timersRef.current = [t1];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Arrival Intervals &amp; Merge Visualizer
          </h1>
          <p className="text-sm text-slate-500">
            Watch consecutive package IDs coalesce into sorted horizontal range bars and merge automatically.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={runInstantBridgeDemo}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-teal-700"
          >
            <Sparkles className="h-4 w-4" />
            Animate [1–3] + [5–7] + 4 → [1–7]
          </button>
          <button
            type="button"
            onClick={runFullBridgeDemo}
            className="inline-flex items-center gap-2 rounded-xl bg-[#081123] px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-[#13264c]"
          >
            <Play className="h-4 w-4 text-cyan-300" />
            Animate [1,3,7,2,6] → +4 → +5
          </button>
        </div>
      </div>

      {demoStatus && (
        <div className="flex items-center gap-2.5 rounded-xl border border-teal-300 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-900">
          <GitMerge className="h-4 w-4 shrink-0 text-teal-600" />
          <span>{demoStatus}</span>
        </div>
      )}

      {/* Compact Horizontal Chain Strip */}
      <div className="rounded-2xl border border-slate-200 bg-[#081123] p-5 text-white shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-cyan-300">
            Ordered In-Order AVL Chain
          </span>
          <span className="font-mono">{intervals.length} interval node(s)</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {intervals.length === 0 ? (
            <span className="text-xs text-slate-400">Empty tree</span>
          ) : (
            intervals.map((iv, idx) => (
              <React.Fragment key={`chain-${iv.start}`}>
                <span className="rounded-lg border border-teal-400/30 bg-teal-500/15 px-3 py-1.5 font-mono text-sm font-bold text-teal-200">
                  {formatInterval(iv)}
                </span>
                {idx < intervals.length - 1 && (
                  <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                )}
              </React.Fragment>
            ))
          )}
        </div>
      </div>

      <IntervalMergeVisualizer
        intervals={intervals}
        lastTrace={lastTrace}
        showBeforeAfter={true}
        onTriggerDemoMerge={runInstantBridgeDemo}
      />
    </div>
  );
}
