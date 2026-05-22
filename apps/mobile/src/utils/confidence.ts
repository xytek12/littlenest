import type { ConfidenceLabel } from '../types/domain';

export function toConfidenceLabel(score: number): ConfidenceLabel {
  if (score >= 0.75) return 'High';
  if (score >= 0.45) return 'Medium';
  return 'Low';
}
