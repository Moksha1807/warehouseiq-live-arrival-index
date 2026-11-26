export function formatNumber(num) {
  if (num === null || num === undefined || Number.isNaN(num)) return '0';
  return Number(num).toLocaleString('en-US');
}

export function formatInterval(interval, collapseSingle = false) {
  if (!interval) return '—';
  if (collapseSingle && interval.start === interval.end) {
    return `[${formatNumber(interval.start)}]`;
  }
  return `[${formatNumber(interval.start)}–${formatNumber(interval.end)}]`;
}

export function intervalLength(interval) {
  if (!interval) return 0;
  return interval.end - interval.start + 1;
}

export function parsePackageId(raw) {
  const trimmed = String(raw ?? '').trim();
  if (!trimmed) {
    return { valid: false, error: 'Please enter a package ID.' };
  }
  if (!/^\d+$/.test(trimmed)) {
    return {
      valid: false,
      error: 'Package ID must be a non-negative whole integer (0 or greater).',
    };
  }
  const num = Number(trimmed);
  if (!Number.isSafeInteger(num)) {
    return {
      valid: false,
      error: 'Package ID exceeds JavaScript safe integer range (9,007,199,254,740,991).',
    };
  }
  return { valid: true, value: num };
}

export function parseBatchIds(raw) {
  const tokens = String(raw ?? '')
    .split(/[\s,;]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    return { valid: false, ids: [], error: 'Enter one or more comma or space-separated package IDs.' };
  }

  const ids = [];
  for (const token of tokens) {
    const parsed = parsePackageId(token);
    if (!parsed.valid) {
      return { valid: false, ids: [], error: `Invalid ID "${token}": ${parsed.error}` };
    }
    ids.push(parsed.value);
  }
  return { valid: true, ids, error: null };
}

export function escapeCsvCell(value) {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function downloadCsv(filename, rows) {
  const csvContent = rows
    .map((row) => row.map(escapeCsvCell).join(','))
    .join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatTime(isoOrDate) {
  const d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
  return d.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
