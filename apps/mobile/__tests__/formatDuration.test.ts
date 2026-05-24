import { describe, expect, it } from '@jest/globals';
import { formatDurationSeconds } from '../src/utils/formatDuration';

describe('formatDurationSeconds', () => {
  it('formats sub-hour values as MM:SS by default', () => {
    expect(formatDurationSeconds(45)).toBe('00:45');
    expect(formatDurationSeconds(125)).toBe('02:05');
  });

  it('formats with hours when includeHours is true', () => {
    expect(formatDurationSeconds(3725, true)).toBe('01:02:05');
    expect(formatDurationSeconds(0, true)).toBe('00:00:00');
  });

  it('clamps negative input to zero', () => {
    expect(formatDurationSeconds(-10)).toBe('00:00');
    expect(formatDurationSeconds(-10, true)).toBe('00:00:00');
  });

  it('floors fractional seconds', () => {
    expect(formatDurationSeconds(45.9)).toBe('00:45');
  });
});
