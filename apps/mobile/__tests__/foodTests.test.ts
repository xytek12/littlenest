import { getFoodTestStatus, nextFoodTestCount } from '../src/utils/foodTests';

describe('food allergy test helpers', () => {
  it('caps food tests at three observations', () => {
    expect(nextFoodTestCount(0)).toBe(1);
    expect(nextFoodTestCount(2)).toBe(3);
    expect(nextFoodTestCount(3)).toBe(3);
  });

  it('describes test progress', () => {
    expect(getFoodTestStatus(0)).toBe('Not started');
    expect(getFoodTestStatus(1)).toBe('1/3 tested');
    expect(getFoodTestStatus(2)).toBe('2/3 tested');
    expect(getFoodTestStatus(3)).toBe('Completed');
  });
});
