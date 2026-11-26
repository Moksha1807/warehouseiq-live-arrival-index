import React from 'react';
import { ArrowRight, GitMerge, Layers, Sparkles } from 'lucide-react';
import { formatInterval, formatNumber, intervalLength } from '../../utils/formatters';

export default function IntervalMergeVisualizer({
  intervals,
  lastTrace,
  showBeforeAfter = true,
  onTriggerDemoMerge,
}) {
  const maxSpan = intervals.reduce((acc, iv) => Math.max(acc, intervalLength(iv)), 1);

  const isAffected = (iv) =>
    lastTrace?.affectedInterval &&
    iv.start === lastTrace.affectedInterval.start &&
    iv.end === lastTrace.affectedInterval.end;

  return (
    <div className="space-y-5">
      {/* Before & After Animated Transition Card */}
      {showBeforeAfter && lastTrace && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#081123] text-cyan-300">
                <GitMerge className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Incremental State Transition (Before vs. After)
                </h3>
                <p className="text-xs text-slate-500">
                  Incoming ID{' '}
                  <span className="font-mono font-bold text-teal-700">
                    {formatNumber(lastTrace.id)}
                  </span>{' '}
                  triggered{' '}
                  <span className="font-semibold text-slate-800">{lastTrace.actionLabel}</span>
                </p>
              </div>
            </div>

            {onTriggerDemoMerge && (
              <button
                type="button"
                onClick={onTriggerDemoMerge}
                className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 transition hover:bg-teal-100"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Run Bridge Merge Demo ([1–3], [5–7] + 4)
              </button>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 lg:grid-cols-[1fr_auto_1fr]">
            {/* BEFORE */}
            <div>
              <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <span>Before Arrival</span>
                <span>{lastTrace.beforeIntervals.length} interval(s)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {lastTrace.beforeIntervals.length === 0 ? (
                  <span className="text-xs italic text-slate-400">Empty AVL Index</span>
                ) : (
                  lastTrace.beforeIntervals.map((iv) => {
                    const isMergedSource = lastTrace.mergedFrom?.some(
                      (m) => m.start === iv.start && m.end === iv.end
                    );
                    const isNeighbor =
                      (lastTrace.pred &&
                        lastTrace.pred.start === iv.start &&
                        lastTrace.pred.end === iv.end) ||
                      (lastTrace.succ &&
                        lastTrace.succ.start === iv.start &&
                        lastTrace.succ.end === iv.end);

                    return (
                      <span
                        key={`before-${iv.start}`}
                        className={`rounded-lg border px-2.5 py-1 font-mono text-xs font-semibold transition-all ${
                          isMergedSource
                            ? 'border-amber-300 bg-amber-100 text-amber-900 ring-2 ring-amber-400/30'
                            : isNeighbor
                              ? 'border-cyan-300 bg-cyan-50 text-cyan-900'
                              : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        {formatInterval(iv)}
                      </span>
                    );
                  })
                )}
              </div>
            </div>

            {/* CONNECTOR */}
            <div className="flex flex-col items-center justify-center gap-1 px-2">
              <span className="rounded-full bg-[#081123] px-3 py-1 font-mono text-xs font-bold text-cyan-300 shadow-xs">
                + {formatNumber(lastTrace.id)}
              </span>
              <ArrowRight className="h-4 w-4 rotate-90 text-teal-600 lg:rotate-0" />
            </div>

            {/* AFTER */}
            <div>
              <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <span>After AVL Update</span>
                <span>{lastTrace.afterIntervals.length} interval(s)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {lastTrace.afterIntervals.map((iv) => {
                  const active = isAffected(iv);
                  return (
                    <span
                      key={`after-${iv.start}-${iv.end}-${lastTrace.totalArrivals}`}
                      className={`rounded-lg border px-2.5 py-1 font-mono text-xs font-semibold transition-all ${
                        active && lastTrace.action === 'MERGE'
                          ? 'animate-merge-pulse border-teal-500 bg-teal-600 text-white shadow-sm'
                          : active && lastTrace.action === 'DUPLICATE'
                            ? 'border-amber-400 bg-amber-100 text-amber-900'
                            : active
                              ? 'animate-merge-pulse border-cyan-500 bg-cyan-600 text-white shadow-sm'
                              : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      {formatInterval(iv)}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Sorted Interval Cards & Range Bars */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Active Sorted Non-Overlapping Intervals
            </h3>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-semibold text-slate-700">
            {intervals.length} AVL node(s)
          </span>
        </div>

        {intervals.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm font-semibold text-slate-700">
              No intervals indexed yet
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Add a package ID above or load a preset to populate the AVL Tree index.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {intervals.map((iv, idx) => {
              const len = intervalLength(iv);
              const widthPct = Math.max(10, Math.min(100, Math.round((len / maxSpan) * 100)));
              const active = isAffected(iv);
              const nextIv = intervals[idx + 1];
              const gapAfter = nextIv ? nextIv.start - iv.end - 1 : 0;

              return (
                <div key={`${iv.start}-${iv.end}`} className="space-y-1.5">
                  <div
                    className={`rounded-xl border p-3.5 transition-all duration-300 ${
                      active
                        ? 'animate-merge-pulse border-teal-400 bg-teal-50/60 ring-2 ring-teal-500/15'
                        : 'border-slate-200 bg-slate-50/50 hover:border-cyan-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#081123] font-mono text-[11px] font-bold text-cyan-300">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-sm font-bold text-slate-900">
                          {formatInterval(iv)}
                        </span>
                        {active && (
                          <span className="rounded-full bg-teal-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                            {lastTrace.action === 'MERGE' ? 'Merged' : 'Updated'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        <span>
                          Count:{' '}
                          <strong className="font-mono text-slate-900">
                            {formatNumber(len)}
                          </strong>
                        </span>
                        <span className="hidden font-mono text-slate-400 sm:inline">
                          key={formatNumber(iv.start)}
                        </span>
                      </div>
                    </div>

                    {/* Visual Horizontal Range Bar */}
                    <div className="mt-2.5 flex items-center gap-3">
                      <span className="w-16 shrink-0 font-mono text-[11px] font-medium text-slate-500">
                        {formatNumber(iv.start)}
                      </span>
                      <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-slate-200/80">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            active
                              ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-400 animate-bridge-flow'
                              : 'bg-gradient-to-r from-[#0f2247] to-teal-600'
                          }`}
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                      <span className="w-16 shrink-0 text-right font-mono text-[11px] font-medium text-slate-500">
                        {formatNumber(iv.end)}
                      </span>
                    </div>
                  </div>

                  {/* Gap Indicator between consecutive intervals */}
                  {nextIv && (
                    <div className="flex items-center justify-center gap-2 py-0.5 text-[11px] text-slate-400">
                      <span className="h-px flex-1 border-t border-dashed border-slate-200" />
                      <span className="rounded-md bg-amber-50 px-2 py-0.5 font-mono font-medium text-amber-700">
                        Gap: [{formatNumber(iv.end + 1)}–{formatNumber(nextIv.start - 1)}] (
                        {formatNumber(gapAfter)} missing)
                      </span>
                      <span className="h-px flex-1 border-t border-dashed border-slate-200" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
