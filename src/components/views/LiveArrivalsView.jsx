import React, { useState } from 'react';
import { Play, Pause, Send, Shuffle, Zap } from 'lucide-react';
import LiveArrivalWidget from '../common/LiveArrivalWidget';
import { formatInterval, formatNumber, formatTime } from '../../utils/formatters';

export default function LiveArrivalsView({
  intervals,
  history,
  lastTrace,
  notification,
  onDismissNotification,
  onAddPackage,
  onAddBatchPackages,
  onRandomArrival,
  onReset,
  onRestoreSample,
  isAutoStreaming,
  onToggleAutoStream,
}) {
  const [batchInput, setBatchInput] = useState('1, 3, 7, 2, 6');
  const [randomMin, setRandomMin] = useState('1');
  const [randomMax, setRandomMax] = useState('100');

  const handleBatchSubmit = (e) => {
    e.preventDefault();
    onAddBatchPackages(batchInput);
  };

  const handleCustomRandom = () => {
    onRandomArrival(Number(randomMin) || 0, Number(randomMax) || 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Live Package Arrivals
          </h1>
          <p className="text-sm text-slate-500">
            Stream single IDs, batch arrival sequences, or randomized warehouse scans into the AVL index.
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleAutoStream}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-xs transition ${
            isAutoStreaming
              ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
              : 'bg-[#081123] text-white hover:bg-[#112244]'
          }`}
        >
          {isAutoStreaming ? (
            <>
              <Pause className="h-4 w-4" />
              Pause Auto-Stream
            </>
          ) : (
            <>
              <Play className="h-4 w-4 text-teal-400" />
              Start Live Auto-Stream
            </>
          )}
        </button>
      </div>

      <LiveArrivalWidget
        onAddPackage={onAddPackage}
        onRandomArrival={onRandomArrival}
        onReset={onReset}
        onRestoreSample={onRestoreSample}
        lastTrace={lastTrace}
        notification={notification}
        onDismissNotification={onDismissNotification}
      />

      {/* Batch & Custom Random Controls */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Batch Importer */}
        <form
          onSubmit={handleBatchSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
        >
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Batch Sequence Arrival
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Process comma- or space-separated package IDs sequentially in arrival order.
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              placeholder="e.g. 1, 3, 7, 2, 6, 4, 5"
              className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 font-mono text-sm text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-hidden"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Ingest Batch
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => setBatchInput('1, 3, 7, 2, 6')}
              className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-slate-700 hover:bg-slate-200"
            >
              [1, 3, 7, 2, 6]
            </button>
            <button
              type="button"
              onClick={() => setBatchInput('1, 3, 5, 2, 4')}
              className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-slate-700 hover:bg-slate-200"
            >
              [1, 3, 5, 2, 4]
            </button>
            <button
              type="button"
              onClick={() => setBatchInput('10, 1000000, 999999')}
              className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-slate-700 hover:bg-slate-200"
            >
              [10, 1000000, 999999]
            </button>
          </div>
        </form>

        {/* Custom Range Random Generator */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-cyan-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Configurable Random Arrival Generator
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Simulate arrivals from tight dock bins or huge sparse warehouse namespaces.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-500">
                Min ID
              </label>
              <input
                type="number"
                min="0"
                value={randomMin}
                onChange={(e) => setRandomMin(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-500">
                Max ID
              </label>
              <input
                type="number"
                min="0"
                value={randomMax}
                onChange={(e) => setRandomMax(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-hidden"
              />
            </div>
            <div className="col-span-2 flex items-end sm:col-span-1">
              <button
                type="button"
                onClick={handleCustomRandom}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#081123] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#13264c]"
              >
                <Shuffle className="h-4 w-4 text-cyan-300" />
                Generate
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setRandomMin('1');
                setRandomMax('25');
              }}
              className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700 hover:bg-slate-200"
            >
              Dense Dock (1–25)
            </button>
            <button
              type="button"
              onClick={() => {
                setRandomMin('1');
                setRandomMax('1000000');
              }}
              className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700 hover:bg-slate-200"
            >
              Sparse Namespace (1–1M)
            </button>
          </div>
        </div>
      </div>

      {/* Current Intervals Ribbon + Arrival History Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-900">
            Live Arrival Event Log ({history.length} events)
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {intervals.slice(0, 8).map((iv) => (
              <span
                key={`pill-${iv.start}`}
                className="rounded-md bg-teal-50 px-2 py-0.5 font-mono text-xs font-semibold text-teal-800 ring-1 ring-teal-200"
              >
                {formatInterval(iv)}
              </span>
            ))}
            {intervals.length > 8 && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                +{intervals.length - 8} more
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-2.5 pr-4">Seq</th>
                <th className="py-2.5 pr-4">Package ID</th>
                <th className="py-2.5 pr-4">AVL Operation</th>
                <th className="py-2.5 pr-4">Target / Merged Interval</th>
                <th className="py-2.5 pr-4">Total Intervals</th>
                <th className="py-2.5 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    No arrival events recorded. Add a package ID above to begin.
                  </td>
                </tr>
              ) : (
                history.map((row) => (
                  <tr key={`${row.seq}-${row.id}`} className="hover:bg-slate-50/80">
                    <td className="py-2.5 pr-4 font-mono text-xs text-slate-400">
                      #{row.seq}
                    </td>
                    <td className="py-2.5 pr-4 font-mono font-bold text-slate-900">
                      {formatNumber(row.id)}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          row.action === 'MERGE'
                            ? 'bg-teal-100 text-teal-800'
                            : row.action === 'DUPLICATE'
                              ? 'bg-amber-100 text-amber-800'
                              : row.action === 'INSERT_NEW'
                                ? 'bg-cyan-100 text-cyan-800'
                                : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {row.actionLabel}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-slate-700">
                      {row.action === 'MERGE' && row.mergedFrom
                        ? `${formatInterval(row.mergedFrom[0])} + ${formatInterval(
                            row.mergedFrom[1]
                          )} → ${formatInterval(row.affectedInterval)}`
                        : formatInterval(row.affectedInterval)}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-slate-600">
                      {row.intervalCount}
                    </td>
                    <td className="py-2.5 text-right font-mono text-xs text-slate-400">
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
