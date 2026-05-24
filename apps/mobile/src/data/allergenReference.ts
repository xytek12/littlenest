export type AllergenReferenceItem = {
  id: string;
  section: 'Eggs' | 'Dairy' | 'Wheat' | 'Soy' | 'Sesame' | 'Nuts' | 'Fish' | 'Shellfish';
  name: string;
  testedCount: number;
  sourceLabel?: string;
  sourceUrl?: string;
};

export const allergenReferenceItems: AllergenReferenceItem[] = [
  { id: 'egg', section: 'Eggs', name: 'Egg', testedCount: 1 },
  { id: 'yogurt', section: 'Dairy', name: 'Yogurt', testedCount: 2 },
  { id: 'wheat-oats', section: 'Wheat', name: 'Wheat cereal', testedCount: 0 },
  { id: 'soy-tofu', section: 'Soy', name: 'Soft tofu', testedCount: 0 },
  { id: 'sesame-tahini', section: 'Sesame', name: 'Tahini', testedCount: 0 },
  { id: 'almond', section: 'Nuts', name: 'Almond', testedCount: 0 },
  { id: 'peanut', section: 'Nuts', name: 'Peanut', testedCount: 1 },
  { id: 'salmon', section: 'Fish', name: 'Salmon', testedCount: 0 },
  { id: 'cod', section: 'Fish', name: 'Cod', testedCount: 0 },
  { id: 'shrimp', section: 'Shellfish', name: 'Shrimp', testedCount: 0 },
];
