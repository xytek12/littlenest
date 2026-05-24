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
