import { getAgeInMonths, getAgeLabel } from '../src/utils/age';

describe('age utilities', () => {
  it('calculates completed age in months', () => {
    expect(getAgeInMonths('2025-10-22', new Date('2026-05-22T12:00:00Z'))).toBe(7);
  });

  it('waits for the UTC birth day before adding the next month', () => {
    expect(getAgeInMonths('2025-10-23', new Date('2026-05-22T12:00:00Z'))).toBe(6);
  });

  it('clamps future birth dates to zero months', () => {
    expect(getAgeInMonths('2026-06-22', new Date('2026-05-22T12:00:00Z'))).toBe(0);
  });

  it('returns a friendly age label', () => {
    expect(getAgeLabel('2025-11-22', new Date('2026-05-22T12:00:00Z'))).toBe('6 months');
  });

  it('returns a singular age label for one month', () => {
    expect(getAgeLabel('2026-04-22', new Date('2026-05-22T12:00:00Z'))).toBe('1 month');
  });
});
