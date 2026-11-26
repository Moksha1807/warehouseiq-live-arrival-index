import React, { useState } from 'react';
import {
  Plus,
  Shuffle,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  GitMerge,
  Sparkles,
  X,
} from 'lucide-react';
import { formatInterval, formatNumber } from '../../utils/formatters';

export default function LiveArrivalWidget({
  onAddPackage,
  onRandomArrival,
  onReset,
  onRestoreSample,
  lastTrace,
  notification,
  onDismissNotification,
  compact = false,
}) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = onAddPackage(inputValue);
    if (res.ok) {
      setInputValue('');
    }
  };

  const getNotificationStyle = (notif) => {
    if (!notif) return null;
    switch (notif.type) {
      case 'merge':
        return {
          wrap: 'border-teal-300 bg-teal-50 text-teal-950',
          icon: GitMerge,
          iconColor: 'text-teal-600',
        };
      case 'warning':
        return {
          wrap: 'border-amber-300 bg-amber-50 text-amber-950',
          icon: AlertCircle,
          iconColor: 'text-amber-600',
        };
      case 'error':
        return {
          wrap: 'border-rose-300 bg-rose-50 text-rose-950',
          icon: AlertCircle,
          iconColor: 'text-rose-600',
        };
      case 'info':
        return {
          wrap: 'border-slate-300 bg-slate-100 text-slate-900',
          icon: RotateCcw,
          iconColor: 'text-slate-600',
        };
      default:
        return {
          wrap: 'border-emerald-300 bg-emerald-50 text-emerald-950',
          icon: CheckCircle2,
          iconColor: 'text-emerald-600',
        };
    }
  };

  const notifStyle = getNotificationStyle(notification);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-teal-500 ring-4 ring-teal-500/20" />
            <h2 className="text-base font-bold text-slate-900">
              Live Package Arrival Terminal
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Enter any non-negative package ID (supports arbitrary gaps like{' '}
            <span className="font-mono font-semibold text-slate-700">1000000</span>).
          </p>
        </div>

        {/* Latest Received Package Pill */}
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-[#081123] px-3.5 py-2 text-white">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Latest ID
          </span>
          <span className="font-mono text-base font-bold text-cyan-300">
            {lastTrace ? formatNumber(lastTrace.id) : '—'}
          </span>
          {lastTrace && (
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                lastTrace.action === 'MERGE'
                  ? 'bg-teal-500/25 text-teal-300'
                  : lastTrace.action === 'DUPLICATE'
                    ? 'bg-amber-500/25 text-amber-300'
                    : 'bg-cyan-500/25 text-cyan-200'
              }`}
            >
              {lastTrace.actionLabel}
            </span>
          )}
        </div>
      </div>

      {/* Input & Action Buttons */}
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter Package ID (e.g., 4, 5, 19, 1000000)..."
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 font-mono text-sm text-slate-900 placeholder-slate-400 transition focus:border-teal-500 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-teal-500/15"
            aria-label="Package ID input"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-teal-700 active:scale-[0.99]"
          >
            <Plus className="h-4 w-4" />
            Add Package
          </button>
          <button
            type="button"
            onClick={() => onRandomArrival(1, 35)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0b1933] px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#13264c] active:scale-[0.99]"
          >
            <Shuffle className="h-4 w-4 text-cyan-300" />
            Random Arrival
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          {!compact && onRestoreSample && (
            <button
              type="button"
              onClick={onRestoreSample}
              className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-200 bg-cyan-50 px-3.5 py-2.5 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100"
            >
              <Sparkles className="h-4 w-4" />
              Sample Data
            </button>
          )}
        </div>
      </form>

      {/* Quick Test Trigger Chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-medium text-slate-500">Quick inject:</span>
        {[4, 5, 8, 9, 13, 14, 1000000].map((quickId) => (
          <button
            key={quickId}
            type="button"
            onClick={() => onAddPackage(quickId)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700 transition hover:border-teal-400 hover:bg-teal-50 hover:text-teal-800"
          >
            +{formatNumber(quickId)}
          </button>
        ))}
      </div>

      {/* Live Arrival Notification Banner */}
      {notification && notifStyle && (
        <div
          key={notification.id}
          className={`animate-slide-up mt-4 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${notifStyle.wrap}`}
        >
          <div className="flex items-start gap-2.5">
            <notifStyle.icon className={`mt-0.5 h-4 w-4 shrink-0 ${notifStyle.iconColor}`} />
            <div>
              <div className="font-semibold">
                {notification.message ? (
                  notification.message
                ) : notification.action === 'DUPLICATE' ? (
                  <>
                    Duplicate Package ID{' '}
                    <span className="font-mono">{formatNumber(notification.packageId)}</span>{' '}
                    ignored — already indexed in{' '}
                    <span className="font-mono">
                      {formatInterval(notification.affectedInterval)}
                    </span>
                    .
                  </>
                ) : notification.action === 'MERGE' ? (
                  <>
                    Bridge ID{' '}
                    <span className="font-mono">{formatNumber(notification.packageId)}</span>{' '}
                    merged{' '}
                    <span className="font-mono">
                      {formatInterval(notification.mergedFrom?.[0])}
                    </span>{' '}
                    +{' '}
                    <span className="font-mono">
                      {formatInterval(notification.mergedFrom?.[1])}
                    </span>{' '}
                    into{' '}
                    <span className="font-mono font-bold">
                      {formatInterval(notification.affectedInterval)}
                    </span>
                    !
                  </>
                ) : (
                  <>
                    Package ID{' '}
                    <span className="font-mono">{formatNumber(notification.packageId)}</span>{' '}
                    processed ({notification.actionLabel}) →{' '}
                    <span className="font-mono font-bold">
                      {formatInterval(notification.affectedInterval)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          {onDismissNotification && (
            <button
              type="button"
              onClick={onDismissNotification}
              className="rounded-md p-1 opacity-60 hover:opacity-100"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
