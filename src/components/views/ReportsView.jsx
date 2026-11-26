import React, { useState, useMemo } from 'react';
import { Download, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import {
  downloadCsv,
  formatInterval,
  formatNumber,
  formatTime,
  intervalLength,
  parsePackageId,
} from '../../utils/formatters';

export default function ReportsView({
  intervals,
  stats,
  history,
  findMissingRanges,
}) {
  const [rangeStart, setRangeStart] = useState(() =>
    stats.minId !== null ? String(stats.minId) : '1'
  );
  const [rangeEnd, setRangeEnd] = useState(() =>
    stats.maxId !== null ? String(stats.maxId) : '25'
  );

  const missingReport = useMemo(() => {
    const pS = parsePackageId(rangeStart);
    const pE = parsePackageId(rangeEnd);
    if (!pS.valid || !pE.valid || pS.value > pE.value) {
      return { valid: false, error: 'Enter valid Start <= End IDs for missing-range analysis.' };
    }
    return { valid: true, ...findMissingRanges(pS.value, pE.value) };
  }, [rangeStart, rangeEnd, findMissingRanges, intervals]);

  const handleExportCsv = () => {
    const rows = [
      ['WarehouseIQ - Live Arrival Index Report'],
      ['Generated At', new Date().toISOString()],
      [],
      ['Summary Metric', 'Value'],
      ['Total Unique Package IDs', stats.uniqueCount],
      ['Total Raw Scan Events', stats.totalArrivals],
      ['Total Duplicates Ignored', stats.duplicateCount],
      ['Total Continuous Intervals', stats.totalIntervals],
      ['AVL Tree Height', stats.treeHeight],
      ['Total Interval Merges', stats.mergeCount],
      ['Total AVL Rotations', stats.rotationCount],
      [],
      ['Sorted Continuous Intervals'],
      ['Index', 'Start ID', 'End ID', 'Interval Notation', 'Package Count'],
      ...intervals.map((iv, idx) => [
        idx + 1,
        iv.start,
        iv.end,
        formatInterval(iv),
        intervalLength(iv),
      ]),
      [],
      [
        `Missing Ranges for [${rangeStart} - ${rangeEnd}]`,
        missingReport.valid ? `${missingReport.missingInRange} missing IDs` : 'Invalid range',
      ],
      ['Gap Index', 'Missing Start', 'Missing End', 'Range Notation', 'Missing Count'],
      ...(missingReport.valid
        ? missingReport.missingRanges.map((gap, idx) => [
            idx + 1,
            gap.start,
            gap.end,
            formatInterval(gap),
            intervalLength(gap),
          ])
        : []),
      [],
      ['Recent Package Arrival History'],
      ['Seq', 'Package ID', 'AVL Action', 'Target / Merged Interval', 'Timestamp'],
      ...history.map((h) => [
        h.seq,
        h.id,
        h.actionLabel,
        formatInterval(h.affectedInterval),
        formatTime(h.timestamp),
      ]),
    ];

    downloadCsv(`warehouseiq-report-${Date.now()}.csv`, rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Index Audit &amp; CSV Reports
          </h1>
          <p className="text-sm text-slate-500">
            Complete operational summary of sorted intervals, duplicates, missing boundaries, and arrival telemetry.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-teal-700"
        >
          <Download className="h-4 w-4" />
          Export Report as CSV
        </button>
      </div>

      {/* Summary KPI Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold uppercase text-slate-500">
            Total Unique Packages
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-slate-900">
            {formatNumber(stats.uniqueCount)}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold uppercase text-slate-500">
            Total Duplicates
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-amber-600">
            {formatNumber(stats.duplicateCount)}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold uppercase text-slate-500">
            Total Intervals
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-teal-700">
            {formatNumber(stats.totalIntervals)}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-[#081123] p-4 text-white shadow-xs">
          <div className="text-xs font-semibold uppercase text-cyan-300">
            AVL Height / Rotations
          </div>
          <div className="mt-1 font-mono text-2xl font-bold">
            h={stats.treeHeight} · {stats.rotationCount}
          </div>
        </div>
      </div>

      {/* Sorted Intervals + Missing Range Report */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* All Sorted Intervals */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900">
              All Current Sorted Intervals ({intervals.length})
            </h2>
          </div>

          <div className="mt-3 max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500">
                  <th className="py-2 pr-3">#</th>
                  <th className="py-2 pr-3">Interval</th>
                  <th className="py-2 pr-3">Start</th>
                  <th className="py-2 pr-3">End</th>
                  <th className="py-2 text-right">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {intervals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center font-sans text-xs text-slate-400">
                      No intervals present.
                    </td>
                  </tr>
                ) : (
                  intervals.map((iv, idx) => (
                    <tr key={`rep-iv-${iv.start}`} className="hover:bg-slate-50">
                      <td className="py-2 pr-3 text-slate-400">{idx + 1}</td>
                      <td className="py-2 pr-3 font-bold text-teal-700">
                        {formatInterval(iv)}
                      </td>
                      <td className="py-2 pr-3 text-slate-700">{formatNumber(iv.start)}</td>
                      <td className="py-2 pr-3 text-slate-700">{formatNumber(iv.end)}</td>
                      <td className="py-2 text-right font-semibold text-slate-900">
                        {formatNumber(intervalLength(iv))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Missing Ranges for Selected Range */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900">
            Missing Ranges for Selected Boundary
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-500">
                Start ID
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 font-mono text-sm focus:border-teal-500 focus:bg-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-500">
                End ID
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 font-mono text-sm focus:border-teal-500 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {!missingReport.valid ? (
            <p className="mt-3 text-xs font-medium text-rose-600">{missingReport.error}</p>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700">
                <span>Missing Total: {formatNumber(missingReport.missingInRange)}</span>
                <span>Coverage: {missingReport.coveragePercent}%</span>
              </div>

              {missingReport.missingRanges.length === 0 ? (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Complete continuity across [{formatNumber(missingReport.rangeStart)}–{formatNumber(missingReport.rangeEnd)}].
                </div>
              ) : (
                <div className="max-h-52 space-y-2 overflow-y-auto">
                  {missingReport.missingRanges.map((gap) => (
                    <div
                      key={`rep-gap-${gap.start}`}
                      className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2 font-mono text-xs"
                    >
                      <span className="font-bold text-amber-900">{formatInterval(gap)}</span>
                      <span className="text-amber-700">
                        {formatNumber(intervalLength(gap))} missing
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Arrival History */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900">
          Recent Package Arrival History ({history.length} logged)
        </h2>
        <div className="mt-3 max-h-72 overflow-y-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500">
                <th className="py-2 pr-4">Seq</th>
                <th className="py-2 pr-4">Package ID</th>
                <th className="py-2 pr-4">Action</th>
                <th className="py-2 pr-4">Resulting Interval</th>
                <th className="py-2 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-xs text-slate-400">
                    No arrival history available.
                  </td>
                </tr>
              ) : (
                history.map((row) => (
                  <tr key={`rep-h-${row.seq}`} className="hover:bg-slate-50">
                    <td className="py-2 pr-4 font-mono text-slate-400">#{row.seq}</td>
                    <td className="py-2 pr-4 font-mono font-bold text-slate-900">
                      {formatNumber(row.id)}
                    </td>
                    <td className="py-2 pr-4 font-medium text-slate-700">{row.actionLabel}</td>
                    <td className="py-2 pr-4 font-mono text-teal-700">
                      {formatInterval(row.affectedInterval)}
                    </td>
                    <td className="py-2 text-right font-mono text-slate-400">
                      {formatTime(row.timestamp)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
