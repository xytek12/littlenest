export type AllergenReferenceItem = {
  id: string;
  section:
    | 'Eggs'
    | 'Milk / Dairy'
    | 'Wheat'
    | 'Soy'
    | 'Sesame'
    | 'Peanut & Tree Nuts'
    | 'Fish'
    | 'Shellfish';
  name: string;
  testedCount: number;
  sourceLabel?: string;
  sourceUrl?: string;
};

const fdaSource = {
  sourceLabel: 'FDA',
  sourceUrl: 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies',
};

export const allergenReferenceItems: AllergenReferenceItem[] = [
  { id: 'egg', section: 'Eggs', name: 'Egg', testedCount: 0, ...fdaSource },
  { id: 'milk', section: 'Milk / Dairy', name: 'Milk', testedCount: 0, ...fdaSource },
  { id: 'yogurt', section: 'Milk / Dairy', name: 'Yogurt', testedCount: 0, ...fdaSource },
  { id: 'cheese', section: 'Milk / Dairy', name: 'Cheese', testedCount: 0, ...fdaSource },
  { id: 'wheat-cereal', section: 'Wheat', name: 'Wheat cereal', testedCount: 0, ...fdaSource },
  { id: 'pasta', section: 'Wheat', name: 'Pasta', testedCount: 0, ...fdaSource },
  { id: 'tofu', section: 'Soy', name: 'Tofu', testedCount: 0, ...fdaSource },
  { id: 'soy-yogurt', section: 'Soy', name: 'Soy yogurt', testedCount: 0, ...fdaSource },
  { id: 'tahini', section: 'Sesame', name: 'Tahini', testedCount: 0, ...fdaSource },
  { id: 'sesame-seed', section: 'Sesame', name: 'Sesame seed', testedCount: 0, ...fdaSource },
  { id: 'peanut', section: 'Peanut & Tree Nuts', name: 'Peanut', testedCount: 0, ...fdaSource },
  { id: 'almond', section: 'Peanut & Tree Nuts', name: 'Almond', testedCount: 0, ...fdaSource },
  { id: 'cashew', section: 'Peanut & Tree Nuts', name: 'Cashew', testedCount: 0, ...fdaSource },
  { id: 'hazelnut', section: 'Peanut & Tree Nuts', name: 'Hazelnut', testedCount: 0, ...fdaSource },
  { id: 'pecan', section: 'Peanut & Tree Nuts', name: 'Pecan', testedCount: 0, ...fdaSource },
  { id: 'pistachio', section: 'Peanut & Tree Nuts', name: 'Pistachio', testedCount: 0, ...fdaSource },
  { id: 'walnut', section: 'Peanut & Tree Nuts', name: 'Walnut', testedCount: 0, ...fdaSource },
  { id: 'salmon', section: 'Fish', name: 'Salmon', testedCount: 0, ...fdaSource },
  { id: 'cod', section: 'Fish', name: 'Cod', testedCount: 0, ...fdaSource },
  { id: 'tuna', section: 'Fish', name: 'Tuna', testedCount: 0, ...fdaSource },
  { id: 'trout', section: 'Fish', name: 'Trout', testedCount: 0, ...fdaSource },
  { id: 'shrimp', section: 'Shellfish', name: 'Shrimp', testedCount: 0, ...fdaSource },
  { id: 'crab', section: 'Shellfish', name: 'Crab', testedCount: 0, ...fdaSource },
  { id: 'lobster', section: 'Shellfish', name: 'Lobster', testedCount: 0, ...fdaSource },
  { id: 'clam', section: 'Shellfish', name: 'Clam', testedCount: 0, ...fdaSource },
  { id: 'scallop', section: 'Shellfish', name: 'Scallop', testedCount: 0, ...fdaSource },
];
