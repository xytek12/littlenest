import { describe, expect, it } from '@jest/globals';
import { allergenReferenceItems } from '../src/data/allergenReference';

describe('allergen reference items', () => {
  it('covers the major allergen groups with specific nuts, fish, and shellfish', () => {
    const names = allergenReferenceItems.map((item) => item.name);

    expect(names).toEqual(
      expect.arrayContaining([
        'Egg',
        'Milk',
        'Yogurt',
        'Wheat cereal',
        'Tofu',
        'Tahini',
        'Peanut',
        'Almond',
        'Cashew',
        'Hazelnut',
        'Pecan',
        'Pistachio',
        'Walnut',
        'Salmon',
        'Cod',
        'Tuna',
        'Trout',
        'Shrimp',
        'Crab',
        'Lobster',
        'Clam',
        'Scallop',
      ]),
    );
  });
});
