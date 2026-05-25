import type { FoodTestStatus } from '../types/domain';

export function nextFoodTestCount(currentCount: number): number {
  return Math.min(3, Math.max(0, currentCount) + 1);
}

export function getFoodTestStatus(count: number): FoodTestStatus {
  if (count >= 3) return 'Completed';
  if (count === 2) return '2/3 tested';
  if (count === 1) return '1/3 tested';
  return 'Not started';
}
