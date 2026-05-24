import type { AppLanguage } from '../types/domain';

export type CuratedRecipeIdea = {
  id: string;
  title: string;
  summary: string;
  tag: string;
  imageUrl: string;
  source: { title: string; url: string };
};

type RecipeSeed = {
  id: string;
  minMonths: number;
  maxMonths: number;
  tags: string[];
  imageUrl: string;
  source: { title: string; url: string };
  copy: Record<AppLanguage, Pick<CuratedRecipeIdea, 'title' | 'summary' | 'tag'>>;
};

const recipeSeeds: RecipeSeed[] = [
  {
    id: 'avocado-puree',
    minMonths: 6,
    maxMonths: 12,
    tags: ['avocado', 'banana', 'puree', 'first taste', 'soft'],
    imageUrl:
      'https://images.unsplash.com/photo-1603046891744-76e6300f89ea?auto=format&fit=crop&w=1200&q=80',
    source: {
      title: 'Baby Foode',
      url: 'https://babyfoode.com/blog/avocado-for-baby-4-delicious-ways/',
    },
    copy: {
      en: {
        title: 'Avocado puree',
        summary: 'Soft first texture, healthy fats, and gentle spoon feeding.',
        tag: 'First tastes',
      },
      he: {
        title: 'מחית אבוקדו',
        summary: 'מרקם ראשון רך, שומן טוב והאכלה קלה בכפית.',
        tag: 'טעימות ראשונות',
      },
      ru: {
        title: 'Пюре из авокадо',
        summary: 'Мягкая первая текстура, полезные жиры и простая подача с ложки.',
        tag: 'Первый вкус',
      },
    },
  },
  {
    id: 'banana-pancakes',
    minMonths: 9,
    maxMonths: 24,
    tags: ['banana', 'pancakes', 'breakfast', 'finger food'],
    imageUrl:
      'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=1200&q=80',
    source: {
      title: 'Yummy Toddler Food',
      url: 'https://www.yummytoddlerfood.com/banana-oatmeal-pancakes/',
    },
    copy: {
      en: {
        title: 'Banana pancakes',
        summary: 'Fast breakfast idea with soft texture for self-feeding practice.',
        tag: 'Breakfast',
      },
      he: {
        title: 'פנקייק בננה',
        summary: 'רעיון מהיר לארוחת בוקר עם מרקם רך לתרגול אכילה עצמאית.',
        tag: 'ארוחת בוקר',
      },
      ru: {
        title: 'Банановые панкейки',
        summary: 'Быстрая идея для завтрака с мягкой текстурой для самостоятельного питания.',
        tag: 'Завтрак',
      },
    },
  },
  {
    id: 'baby-oatmeal',
    minMonths: 6,
    maxMonths: 18,
    tags: ['oatmeal', 'oats', 'iron', 'berries', 'breakfast'],
    imageUrl:
      'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1200&q=80',
    source: {
      title: 'MJ and Hungryman',
      url: 'https://www.mjandhungryman.com/vegetable-baby-oatmeal/',
    },
    copy: {
      en: {
        title: 'Baby oatmeal bowl',
        summary: 'Iron-friendly oatmeal base that works with fruit on top.',
        tag: 'Iron-rich',
      },
      he: {
        title: 'קערת שיבולת שועל לתינוק',
        summary: 'בסיס עשיר בברזל שאפשר להוסיף עליו פירות רכים.',
        tag: 'עשיר בברזל',
      },
      ru: {
        title: 'Овсяная каша для малыша',
        summary: 'Основа с железом, к которой легко добавить мягкие фрукты.',
        tag: 'Железо',
      },
    },
  },
  {
    id: 'sweet-potato',
    minMonths: 6,
    maxMonths: 18,
    tags: ['sweet potato', 'vegetable', 'lunch', 'mash'],
    imageUrl:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
    source: {
      title: 'Baby Foode',
      url: 'https://babyfoode.com/blog/sweet-potato-curry/',
    },
    copy: {
      en: {
        title: 'Roasted sweet potato',
        summary: 'Soft vegetable option that works for wedges, mash, or lunch bowls.',
        tag: 'Vegetable',
      },
      he: {
        title: 'בטטה צלויה',
        summary: 'אפשרות ירק רכה שמתאימה לפלחים, למחית או לארוחת צהריים.',
        tag: 'ירק',
      },
      ru: {
        title: 'Запеченный батат',
        summary: 'Мягкий овощной вариант для кусочков, пюре или обеда.',
        tag: 'Овощи',
      },
    },
  },
  {
    id: 'salmon-cakes',
    minMonths: 12,
    maxMonths: 24,
    tags: ['salmon', 'fish', 'omega', 'dinner', 'finger food'],
    imageUrl:
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80',
    source: {
      title: 'MJ and Hungryman',
      url: 'https://www.mjandhungryman.com/baked-salmon-cake-with-mango-yogurt-sauce/',
    },
    copy: {
      en: {
        title: 'Soft salmon cakes',
        summary: 'Omega-3 rich finger food for older babies and toddlers.',
        tag: 'Dinner',
      },
      he: {
        title: 'קציצות סלמון רכות',
        summary: 'אוכל אצבע עשיר באומגה 3 לתינוקות גדולים ולפעוטות.',
        tag: 'ארוחת ערב',
      },
      ru: {
        title: 'Мягкие котлетки из лосося',
        summary: 'Блюдо с омега-3 для детей постарше и малышей.',
        tag: 'Ужин',
      },
    },
  },
  {
    id: 'meal-ideas-18m',
    minMonths: 12,
    maxMonths: 24,
    tags: ['meal ideas', 'older baby', 'schedule', 'family meals'],
    imageUrl:
      'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=1200&q=80',
    source: {
      title: 'Bucket List Tummy',
      url: 'https://bucketlisttummy.com/what-do-18-month-olds-eat/',
    },
    copy: {
      en: {
        title: '18-month meal ideas',
        summary: 'Useful meal pattern examples for older babies and toddlers.',
        tag: 'Older baby',
      },
      he: {
        title: 'רעיונות לארוחות בגיל 18 חודשים',
        summary: 'דוגמאות שימושיות לארוחות עבור תינוקות גדולים ופעוטות.',
        tag: 'תינוק גדול',
      },
      ru: {
        title: 'Идеи еды в 18 месяцев',
        summary: 'Полезные примеры питания для детей постарше и малышей.',
        tag: 'Старший малыш',
      },
    },
  },
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function getDailyRecipeIdeas(input: {
  date?: Date;
  language: AppLanguage;
  childAgeMonths: number;
  query: string;
  refreshCount: number;
  limit?: number;
}) {
  const { date = new Date(), language, childAgeMonths, query, refreshCount, limit = 3 } = input;
  const normalizedQuery = normalize(query);
  const ageMatched = recipeSeeds.filter(
    (idea) => childAgeMonths >= idea.minMonths && childAgeMonths <= idea.maxMonths,
  );
  const candidates = (ageMatched.length > 0 ? ageMatched : recipeSeeds).filter((idea) => {
    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      idea.copy[language].title,
      idea.copy[language].summary,
      ...idea.tags,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
  const filtered = candidates.length > 0 ? candidates : ageMatched.length > 0 ? ageMatched : recipeSeeds;
  const dayKey = Number(date.toISOString().slice(8, 10)) || 1;
  const startIndex = (dayKey + refreshCount) % filtered.length;

  return Array.from({ length: Math.min(limit, filtered.length) }, (_, offset) => {
    const seed = filtered[(startIndex + offset) % filtered.length];
    return {
      id: `${seed.id}-${language}`,
      title: seed.copy[language].title,
      summary: seed.copy[language].summary,
      tag: seed.copy[language].tag,
      imageUrl: seed.imageUrl,
      source: seed.source,
    } satisfies CuratedRecipeIdea;
  });
}
