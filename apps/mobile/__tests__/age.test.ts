import { getAgeInMonths, getAgeLabel } from '../src/utils/age';

describe('age utilities', () => {
  it('calculates completed age in months', () => {
    expect(getAgeInMonths('2025-10-22', new Date('2026-05-22T12:00:00Z'))).toBe(7);
  });

  it('returns a friendly age label', () => {
    expect(getAgeLabel('2025-11-22', new Date('2026-05-22T12:00:00Z'))).toBe('6 months');
  });
});
