import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { entriesInLast24h, entriesInLast90Days } from '../src/utils/historyFilters';

type Item = { id: string; at: string };

const getISO = (item: Item) => item.at;

describe('historyFilters', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-24T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('keeps only entries within the last 24 hours, newest first', () => {
    const items: Item[] = [
      { id: 'old', at: '2026-05-22T12:00:00.000Z' },
      { id: 'mid', at: '2026-05-24T06:00:00.000Z' },
      { id: 'new', at: '2026-05-24T11:30:00.000Z' },
      { id: 'edge', at: '2026-05-23T12:00:00.000Z' },
    ];

    const result = entriesInLast24h(items, getISO);

    expect(result.map((item) => item.id)).toEqual(['new', 'mid', 'edge']);
  });

  it('keeps only entries within the last 90 days, newest first', () => {
    const items: Item[] = [
      { id: 'ancient', at: '2026-01-01T12:00:00.000Z' },
      { id: 'recent', at: '2026-05-20T12:00:00.000Z' },
      { id: 'today', at: '2026-05-24T09:00:00.000Z' },
    ];

    const result = entriesInLast90Days(items, getISO);

    expect(result.map((item) => item.id)).toEqual(['today', 'recent']);
  });

  it('ignores entries with unparseable dates', () => {
    const items: Item[] = [
      { id: 'good', at: '2026-05-24T11:00:00.000Z' },
      { id: 'bad', at: 'not-a-date' },
    ];

    expect(entriesInLast24h(items, getISO).map((item) => item.id)).toEqual(['good']);
    expect(entriesInLast90Days(items, getISO).map((item) => item.id)).toEqual(['good']);
  });

  it('does not mutate the input array', () => {
    const items: Item[] = [
      { id: 'a', at: '2026-05-24T06:00:00.000Z' },
      { id: 'b', at: '2026-05-24T11:00:00.000Z' },
    ];

    entriesInLast24h(items, getISO);

    expect(items.map((item) => item.id)).toEqual(['a', 'b']);
  });
});
