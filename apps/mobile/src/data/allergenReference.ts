import type { AppLanguage } from '../types/domain';

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
  { id: 'bread', section: 'Wheat', name: 'Bread', testedCount: 0, ...fdaSource },
  { id: 'tofu', section: 'Soy', name: 'Tofu', testedCount: 0, ...fdaSource },
  { id: 'soy-yogurt', section: 'Soy', name: 'Soy yogurt', testedCount: 0, ...fdaSource },
  { id: 'edamame', section: 'Soy', name: 'Edamame', testedCount: 0, ...fdaSource },
  { id: 'tahini', section: 'Sesame', name: 'Tahini', testedCount: 0, ...fdaSource },
  { id: 'sesame-seed', section: 'Sesame', name: 'Sesame seed', testedCount: 0, ...fdaSource },
  { id: 'peanut', section: 'Peanut & Tree Nuts', name: 'Peanut', testedCount: 0, ...fdaSource },
  { id: 'almond', section: 'Peanut & Tree Nuts', name: 'Almond', testedCount: 0, ...fdaSource },
  { id: 'cashew', section: 'Peanut & Tree Nuts', name: 'Cashew', testedCount: 0, ...fdaSource },
  { id: 'hazelnut', section: 'Peanut & Tree Nuts', name: 'Hazelnut', testedCount: 0, ...fdaSource },
  { id: 'pecan', section: 'Peanut & Tree Nuts', name: 'Pecan', testedCount: 0, ...fdaSource },
  { id: 'pistachio', section: 'Peanut & Tree Nuts', name: 'Pistachio', testedCount: 0, ...fdaSource },
  { id: 'walnut', section: 'Peanut & Tree Nuts', name: 'Walnut', testedCount: 0, ...fdaSource },
  { id: 'brazil-nut', section: 'Peanut & Tree Nuts', name: 'Brazil nut', testedCount: 0, ...fdaSource },
  { id: 'macadamia', section: 'Peanut & Tree Nuts', name: 'Macadamia', testedCount: 0, ...fdaSource },
  { id: 'pine-nut', section: 'Peanut & Tree Nuts', name: 'Pine nut', testedCount: 0, ...fdaSource },
  { id: 'salmon', section: 'Fish', name: 'Salmon', testedCount: 0, ...fdaSource },
  { id: 'cod', section: 'Fish', name: 'Cod', testedCount: 0, ...fdaSource },
  { id: 'tuna', section: 'Fish', name: 'Tuna', testedCount: 0, ...fdaSource },
  { id: 'trout', section: 'Fish', name: 'Trout', testedCount: 0, ...fdaSource },
  { id: 'sardine', section: 'Fish', name: 'Sardine', testedCount: 0, ...fdaSource },
  { id: 'halibut', section: 'Fish', name: 'Halibut', testedCount: 0, ...fdaSource },
  { id: 'shrimp', section: 'Shellfish', name: 'Shrimp', testedCount: 0, ...fdaSource },
  { id: 'crab', section: 'Shellfish', name: 'Crab', testedCount: 0, ...fdaSource },
  { id: 'lobster', section: 'Shellfish', name: 'Lobster', testedCount: 0, ...fdaSource },
  { id: 'clam', section: 'Shellfish', name: 'Clam', testedCount: 0, ...fdaSource },
  { id: 'scallop', section: 'Shellfish', name: 'Scallop', testedCount: 0, ...fdaSource },
  { id: 'mussel', section: 'Shellfish', name: 'Mussel', testedCount: 0, ...fdaSource },
  { id: 'oyster', section: 'Shellfish', name: 'Oyster', testedCount: 0, ...fdaSource },
];

const sectionTranslations = {
  en: {
    Eggs: 'Eggs',
    'Milk / Dairy': 'Milk / Dairy',
    Wheat: 'Wheat',
    Soy: 'Soy',
    Sesame: 'Sesame',
    'Peanut & Tree Nuts': 'Peanut & Tree Nuts',
    Fish: 'Fish',
    Shellfish: 'Shellfish',
  },
  he: {
    Eggs: 'ביצים',
    'Milk / Dairy': 'חלב / מוצרי חלב',
    Wheat: 'חיטה',
    Soy: 'סויה',
    Sesame: 'שומשום',
    'Peanut & Tree Nuts': 'בוטנים ואגוזי עץ',
    Fish: 'דגים',
    Shellfish: 'פירות ים',
  },
  ru: {
    Eggs: 'Eggs',
    'Milk / Dairy': 'Milk / Dairy',
    Wheat: 'Wheat',
    Soy: 'Soy',
    Sesame: 'Sesame',
    'Peanut & Tree Nuts': 'Peanut & Tree Nuts',
    Fish: 'Fish',
    Shellfish: 'Shellfish',
  },
} as const;

const itemTranslations = {
  he: {
    egg: 'ביצה',
    milk: 'חלב',
    yogurt: 'יוגורט',
    cheese: 'גבינה',
    'wheat-cereal': 'דייסת חיטה',
    pasta: 'פסטה',
    bread: 'לחם',
    tofu: 'טופו',
    'soy-yogurt': 'יוגורט סויה',
    edamame: 'אדממה',
    tahini: 'טחינה',
    'sesame-seed': 'זרעי שומשום',
    peanut: 'בוטן',
    almond: 'שקד',
    cashew: 'קשיו',
    hazelnut: 'אגוז לוז',
    pecan: 'פקאן',
    pistachio: 'פיסטוק',
    walnut: 'אגוז מלך',
    'brazil-nut': 'אגוז ברזיל',
    macadamia: 'מקדמיה',
    'pine-nut': 'צנובר',
    salmon: 'סלמון',
    cod: 'בקלה',
    tuna: 'טונה',
    trout: 'פורל',
    sardine: 'סרדין',
    halibut: 'הליבוט',
    shrimp: 'שרימפס',
    crab: 'סרטן',
    lobster: 'לובסטר',
    clam: 'צדפה',
    scallop: 'סקאלופ',
    mussel: 'מולה',
    oyster: 'אויסטר',
  },
} as const;

export function getLocalizedAllergenSection(
  language: AppLanguage,
  section: AllergenReferenceItem['section'],
) {
  return sectionTranslations[language][section];
}

export function getLocalizedAllergenItem(language: AppLanguage, itemId: string, fallback: string) {
  if (language === 'he') {
    return itemTranslations.he[itemId as keyof typeof itemTranslations.he] ?? fallback;
  }

  return fallback;
}
