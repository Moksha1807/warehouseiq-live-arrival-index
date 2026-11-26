import React, { useState } from 'react';
import { ScanSearch, CheckCircle2, XCircle, GitBranch } from 'lucide-react';
import { formatInterval, formatNumber, intervalLength, parsePackageId } from '../../utils/formatters';

export default function RangeSearchView({
  containsPackage,
  findMissingRanges,
  intervals,
}) {
  // Point Lookup State
  const [lookupId, setLookupId] = useState('11');
  const [lookupResult, setLookupResult] = useState(() => containsPackage(11));
  const [lookupError, setLookupError] = useState('');

  // Range Query State
  const [rangeStart, setRangeStart] = useState('5');
  const [rangeEnd, setRangeEnd] = useState('18');
  const [rangeResult, setRangeResult] = useState(() => {
    try {
      return findMissingRanges(5, 18);
    } catch {
      return null;
    }
  });
  const [rangeError, setRangeError] = useState('');

  const handlePointLookup = (e) => {
    e.preventDefault();
    const parsed = parsePackageId(lookupId);
    if (!parsed.valid) {
      setLookupError(parsed.error);
      return;
    }
    setLookupError('');
    setLookupResult({ id: parsed.value, ...containsPackage(parsed.value) });
  };

  const handleRangeSearch = (e) => {
    e.preventDefault();
    const pS = parsePackageId(rangeStart);
    const pE = parsePackageId(rangeEnd);
    if (!pS.valid) {
      setRangeError(`Start ID: ${pS.error}`);
      return;
    }
    if (!pE.valid) {
      setRangeError(`End ID: ${pE.error}`);
      return;
    }
    if (pS.value > pE.value) {
      setRangeError('Start ID must be less than or equal to End ID.');
      return;
    }
    setRangeError('');
    setRangeResult(findMissingRanges(pS.value, pE.value));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          Balanced AVL Range Search &amp; Point Lookup
        </h1>
        <p className="text-sm text-slate-500">
          Probe the AVL interval index for exact package membership or pruned range intersections, inspecting every tree node visited along the search path.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Point Lookup Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2">
            <ScanSearch className="h-4 w-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Point Lookup — <span className="font-mono text-teal-700">containsPackage(id)</span>
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Uses AVL predecessor search (<span className="font-mono">start &lt;= id</span>) in O(log k) time.
          </p>

          <form onSubmit={handlePointLookup} className="mt-4 flex gap-2.5">
            <input
              type="text"
              inputMode="numeric"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              placeholder="Enter Package ID..."
              className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 font-mono text-sm text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-hidden"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#081123] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#13264c]"
            >
              Search ID
            </button>
          </form>

          {lookupError && (
            <p className="mt-2 text-xs font-medium text-rose-600">{lookupError}</p>
          )}

          {lookupResult && (
            <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {lookupResult.found ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-amber-600" />
                  )}
                  <span className="text-sm font-bold text-slate-900">
                    {lookupResult.found ? 'Package Found in Index' : 'Package Not Received'}
                  </span>
                </div>
                {lookupResult.interval && (
                  <span className="rounded-lg bg-teal-600 px-2.5 py-1 font-mono text-xs font-bold text-white">
                    {formatInterval(lookupResult.interval)}
                  </span>
                )}
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  AVL Traversal Path ({lookupResult.path.length} node(s) visited of {intervals.length} total)
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {lookupResult.path.length === 0 ? (
                    <span className="text-xs text-slate-400">Tree is empty</span>
                  ) : (
                    lookupResult.path.map((node, i) => (
                      <React.Fragment key={`path-${node.start}-${i}`}>
                        <span className="rounded-md border border-slate-300 bg-white px-2 py-0.5 font-mono text-xs font-semibold text-slate-800">
                          {formatInterval(node)}
                        </span>
                        {i < lookupResult.path.length - 1 && (
                          <span className="text-xs text-slate-400">→</span>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interval Range Query Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-cyan-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Pruned AVL Range Query — <span className="font-mono text-cyan-700">[L, R]</span>
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Retrieves overlapping intervals and prunes out-of-bounds AVL subtrees automatically.
          </p>

          <form onSubmit={handleRangeSearch} className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <input
              type="text"
              inputMode="numeric"
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
              placeholder="Start L"
              className="rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 font-mono text-sm text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-hidden"
            />
            <input
              type="text"
              inputMode="numeric"
              value={rangeEnd}
              onChange={(e) => setRangeEnd(e.target.value)}
              placeholder="End R"
              className="rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 font-mono text-sm text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-hidden"
            />
            <button
              type="submit"
              className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Query Range
            </button>
          </form>

          {rangeError && (
            <p className="mt-2 text-xs font-medium text-rose-600">{rangeError}</p>
          )}

          {rangeResult && (
            <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate-700">
                  Coverage:{' '}
                  <strong className="font-mono text-teal-700">
                    {formatNumber(rangeResult.receivedInRange)} / {formatNumber(rangeResult.totalInRange)}
                  </strong>{' '}
                  ({rangeResult.coveragePercent}%)
                </span>
                <span className="rounded-md bg-[#081123] px-2 py-0.5 font-mono text-[11px] font-semibold text-cyan-300">
                  {rangeResult.visitedNodes.length} visited · {rangeResult.prunedSubtrees} pruned
                </span>
              </div>

              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, rangeResult.coveragePercent)}%` }}
                />
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Overlapping Intervals Returned
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {rangeResult.overlappingIntervals.length === 0 ? (
                    <span className="text-xs italic text-slate-400">None</span>
                  ) : (
                    rangeResult.overlappingIntervals.map((iv) => (
                      <span
                        key={`ov-${iv.start}`}
                        className="rounded-lg border border-teal-200 bg-white px-2.5 py-1 font-mono text-xs font-bold text-teal-800"
                      >
                        {formatInterval(iv)} ({formatNumber(intervalLength(iv))})
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Missing Sub-Ranges Inside [{formatNumber(rangeResult.rangeStart)}–{formatNumber(rangeResult.rangeEnd)}]
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {rangeResult.missingRanges.length === 0 ? (
                    <span className="text-xs font-semibold text-emerald-700">No gaps</span>
                  ) : (
                    rangeResult.missingRanges.map((gap) => (
                      <span
                        key={`gap-${gap.start}`}
                        className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 font-mono text-xs font-bold text-amber-800"
                      >
                        {formatInterval(gap)}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
