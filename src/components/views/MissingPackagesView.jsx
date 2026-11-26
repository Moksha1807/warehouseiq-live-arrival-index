import React, { useState } from 'react';
import { SearchX, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { formatInterval, formatNumber, intervalLength, parsePackageId } from '../../utils/formatters';

export default function MissingPackagesView({ stats, findMissingRanges, onAddPackage }) {
  const [startInput, setStartInput] = useState('1');
  const [endInput, setEndInput] = useState('25');
  const [error, setError] = useState('');
  const [result, setResult] = useState(() => {
    try {
      return findMissingRanges(1, 25);
    } catch {
      return null;
    }
  });

  const runSearch = (rawStart = startInput, rawEnd = endInput) => {
    const pStart = parsePackageId(rawStart);
    const pEnd = parsePackageId(rawEnd);

    if (!pStart.valid) {
      setError(`Start ID: ${pStart.error}`);
      return;
    }
    if (!pEnd.valid) {
      setError(`End ID: ${pEnd.error}`);
      return;
    }
    if (pStart.value > pEnd.value) {
      setError('Starting Package ID must be less than or equal to Ending Package ID.');
      return;
    }

    setError('');
    setResult(findMissingRanges(pStart.value, pEnd.value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch();
  };

  const applyPreset = (s, e) => {
    setStartInput(String(s));
    setEndInput(String(e));
    runSearch(String(s), String(e));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          Missing Package Finder
        </h1>
        <p className="text-sm text-slate-500">
          Query any package ID boundary <span className="font-mono">[Start, End]</span> to extract missing intervals in{' '}
          <span className="font-mono font-semibold text-teal-700">O(log k + m)</span> time without iterating ID-by-ID.
        </p>
      </div>

      {/* Query Form Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Starting Package ID
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={startInput}
              onChange={(e) => setStartInput(e.target.value)}
              placeholder="e.g. 1"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-teal-500/15"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ending Package ID
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={endInput}
              onChange={(e) => setEndInput(e.target.value)}
              placeholder="e.g. 25"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-teal-500/15"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-teal-700"
            >
              <SearchX className="h-4 w-4" />
              Find Missing Packages
            </button>
          </div>
        </div>

        {/* Quick Range Presets */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-medium text-slate-500">Quick boundaries:</span>
          <button
            type="button"
            onClick={() => applyPreset(1, 7)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-slate-700 hover:border-teal-400 hover:bg-teal-50"
          >
            [1–7]
          </button>
          <button
            type="button"
            onClick={() => applyPreset(1, 25)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-slate-700 hover:border-teal-400 hover:bg-teal-50"
          >
            [1–25]
          </button>
          {stats.minId !== null && (
            <button
              type="button"
              onClick={() => applyPreset(stats.minId, stats.maxId)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-slate-700 hover:border-teal-400 hover:bg-teal-50"
            >
              Active Span [{formatNumber(stats.minId)}–{formatNumber(stats.maxId)}]
            </button>
          )}
          <button
            type="button"
            onClick={() => applyPreset(1, 1000000)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-slate-700 hover:border-teal-400 hover:bg-teal-50"
          >
            Sparse [1–1,000,000]
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-800">
            {error}
          </div>
        )}
      </form>

      {/* Results Panel */}
      {result && (
        <div className="space-y-6">
          {/* Summary Strip */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="text-xs font-semibold uppercase text-slate-500">
                Queried Range Span
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-900">
                [{formatNumber(result.rangeStart)}–{formatNumber(result.rangeEnd)}]
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {formatNumber(result.totalInRange)} total IDs
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="text-xs font-semibold uppercase text-slate-500">
                Received in Range
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-teal-700">
                {formatNumber(result.receivedInRange)}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {result.coveragePercent}% boundary coverage
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="text-xs font-semibold uppercase text-slate-500">
                Missing Packages
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-amber-600">
                {formatNumber(result.missingInRange)}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Across {result.missingRanges.length} missing range(s)
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[#081123] p-4 text-white shadow-xs">
              <div className="text-xs font-semibold uppercase text-cyan-300">
                AVL Tree Efficiency
              </div>
              <div className="mt-1 font-mono text-lg font-bold">
                {result.visitedNodes.length} visited
              </div>
              <div className="mt-1 text-xs text-slate-300">
                {result.prunedSubtrees} subtree(s) pruned
              </div>
            </div>
          </div>

          {/* Missing vs Received Breakdown */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Missing Ranges */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Missing Package Ranges
                  </h2>
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-mono text-xs font-semibold text-amber-800">
                  {result.missingRanges.length} gap(s)
                </span>
              </div>

              {result.missingRanges.length === 0 ? (
                <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Zero missing packages in [{formatNumber(result.rangeStart)}–{formatNumber(result.rangeEnd)}]!
                </div>
              ) : (
                <div className="mt-4 space-y-2.5">
                  {result.missingRanges.map((gap) => {
                    const count = intervalLength(gap);
                    return (
                      <div
                        key={`miss-${gap.start}-${gap.end}`}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-2.5"
                      >
                        <div>
                          <span className="font-mono text-sm font-bold text-amber-950">
                            {formatInterval(gap)}
                          </span>
                          <span className="ml-2 text-xs text-amber-800">
                            ({formatNumber(count)} missing)
                          </span>
                        </div>
                        {count <= 5 && (
                          <button
                            type="button"
                            onClick={() => {
                              for (let id = gap.start; id <= gap.end; id += 1) {
                                onAddPackage(id);
                              }
                              setResult(findMissingRanges(result.rangeStart, result.rangeEnd));
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-amber-700"
                          >
                            Fill Gap
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Received Intervals inside Query Range */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Received Intervals in Requested Range
                  </h2>
                </div>
                <span className="rounded-full bg-teal-100 px-2.5 py-0.5 font-mono text-xs font-semibold text-teal-800">
                  {result.clampedIntervals.length} interval(s)
                </span>
              </div>

              {result.clampedIntervals.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs text-slate-500">
                  No received packages fall within [{formatNumber(result.rangeStart)}–{formatNumber(result.rangeEnd)}].
                </div>
              ) : (
                <div className="mt-4 space-y-2.5">
                  {result.clampedIntervals.map((iv, idx) => (
                    <div
                      key={`rec-${iv.start}-${iv.end}`}
                      className="flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50/50 px-3.5 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-teal-950">
                          {formatInterval(iv)}
                        </span>
                        {result.overlappingIntervals[idx] &&
                          (result.overlappingIntervals[idx].start !== iv.start ||
                            result.overlappingIntervals[idx].end !== iv.end) && (
                            <span className="text-[11px] text-slate-500">
                              (full: {formatInterval(result.overlappingIntervals[idx])})
                            </span>
                          )}
                      </div>
                      <span className="font-mono text-xs font-semibold text-teal-800">
                        {formatNumber(intervalLength(iv))} received
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
