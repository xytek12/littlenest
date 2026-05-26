const DAY_MS = 24 * 60 * 60 * 1000;

function sortNewestFirst<T>(items: T[], getISO: (item: T) => string): T[] {
  return [...items].sort((a, b) => Date.parse(getISO(b)) - Date.parse(getISO(a)));
}

function entriesWithinMs<T>(items: T[], getISO: (item: T) => string, windowMs: number): T[] {
  const now = Date.now();
  const filtered = items.filter((item) => {
    const time = Date.parse(getISO(item));
    if (Number.isNaN(time)) {
      return false;
    }
    return now - time <= windowMs;
  });

  return sortNewestFirst(filtered, getISO);
}

export function entriesInLast24h<T>(items: T[], getISO: (item: T) => string): T[] {
  return entriesWithinMs(items, getISO, DAY_MS);
}

export function entriesInLast90Days<T>(items: T[], getISO: (item: T) => string): T[] {
  return entriesWithinMs(items, getISO, 90 * DAY_MS);
}

export function entriesInLastDays<T>(
  items: T[],
  getISO: (item: T) => string,
  days: number,
): T[] {
  return entriesWithinMs(items, getISO, days * DAY_MS);
}

function dayKey(iso: string): string {
  // YYYY-MM-DD in local time so entries land in the user-visible day.
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export type HistoryDayGroup<T> = {
  /** YYYY-MM-DD local-time key, used for stable React keys. */
  dayKey: string;
  /** ISO of any entry on this day — for header date formatting. */
  representativeIso: string;
  entries: T[];
};

/**
 * Group a list of entries (already filtered to a time window) by their local
 * calendar day, newest day first. Inside each day the entries are sorted
 * newest first too. Use with `entriesInLastDays` to power the date-grouped
 * inline history cards on Sleep / Nursing / Growth.
 */
export function groupEntriesByDay<T>(
  items: T[],
  getISO: (item: T) => string,
): HistoryDayGroup<T>[] {
  const sorted = sortNewestFirst(items, getISO);
  const groups = new Map<string, HistoryDayGroup<T>>();
  for (const item of sorted) {
    const iso = getISO(item);
    const key = dayKey(iso);
    let bucket = groups.get(key);
    if (!bucket) {
      bucket = { dayKey: key, representativeIso: iso, entries: [] };
      groups.set(key, bucket);
    }
    bucket.entries.push(item);
  }
  // Map insertion order follows the sortedNewestFirst order, so day order is
  // already newest-day-first. But to be defensive:
  return Array.from(groups.values()).sort(
    (a, b) => (a.dayKey < b.dayKey ? 1 : a.dayKey > b.dayKey ? -1 : 0),
  );
}
