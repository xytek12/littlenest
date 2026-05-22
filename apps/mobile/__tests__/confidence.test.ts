import { toConfidenceLabel } from '../src/utils/confidence';

describe('confidence labels', () => {
  it('maps scores to parent-friendly labels', () => {
    expect(toConfidenceLabel(0.25)).toBe('Low');
    expect(toConfidenceLabel(0.58)).toBe('Medium');
    expect(toConfidenceLabel(0.83)).toBe('High');
  });

  it('includes exact threshold scores in the higher label', () => {
    expect(toConfidenceLabel(0.45)).toBe('Medium');
    expect(toConfidenceLabel(0.75)).toBe('High');
  });
});
