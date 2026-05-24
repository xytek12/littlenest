export type RecipePromptInput = {
  language: 'en' | 'he' | 'ru';
  childAgeMonths: number;
  query?: string;
  refreshNonce?: number;
  today?: string;
};

const languageName = {
  en: 'English',
  he: 'Hebrew',
  ru: 'Russian',
} as const;

const localizedSearchPhrase = {
  en: (months: number) => `baby food recipes for a ${months} month old`,
  he: (months: number) => `מתכונים לתינוק בן ${months} חודשים`,
  ru: (months: number) => `рецепты для ребёнка ${months} месяцев`,
} as const;

const sourceLanguageInstruction = {
  en: 'All results MUST come from English-language recipe sites, and titles and descriptions MUST be written in natural English.',
  he: 'All results MUST come from Hebrew-language recipe sites, and titles and descriptions MUST be written in natural Hebrew. Do not pick specific sites for me — choose reputable Hebrew cooking sites yourself.',
  ru: 'All results MUST come from Russian-language recipe sites, and titles and descriptions MUST be written in natural Russian.',
} as const;

export function buildRecipeSearchPrompt(input: RecipePromptInput) {
  const today = input.today ?? new Date().toISOString().slice(0, 10);
  const refreshNonce = input.refreshNonce ?? 0;
  const query = (input.query ?? '').trim();

  return `
You are helping a parent find real, safe food recipes for their child.
Today's date is ${today}. Refresh nonce: ${refreshNonce}.
Return a daily-stable set: the same date and nonce must yield the same recipes, but a new nonce must yield a clearly different set of recipes.

Use Google Search grounding to find real, currently-live recipe pages.
Search using a phrase like: ${localizedSearchPhrase[input.language](input.childAgeMonths)}

Child age:
- Recipes must suit a child of exactly ${input.childAgeMonths} months old (texture, ingredients, and choking safety appropriate for ${input.childAgeMonths} months).

Language and sources:
- Respond in ${languageName[input.language]}.
- ${sourceLanguageInstruction[input.language]}

URL rules:
- Every "url" MUST be a real, direct, HTTPS link to a single recipe page that is likely to open right now.
- Do NOT return search-result, redirect, tracking, shortened, social-media, or aggregator URLs.
- Avoid Google, Bing, Yahoo, DuckDuckGo, and any link that is not a direct recipe page.

Content rules:
- Return real recipes or food preparation ideas only.
- Do not include growth guidance, growth charts, weight, height, or percentile content.
- Do not include sleep, feeding schedule, or daily schedule predictions.
- Do not provide diagnosis, treatment, medicine, allergy protocols, or medical advice. Keep any safety wording brief and tell the parent to follow doctor guidance for allergy, illness, choking, or medical concerns.

Parent recipe request (optional, may be empty): ${query}

Return exactly 6 recipes as a JSON array. Return ONLY valid JSON. Do not use markdown fences.
Use this shape exactly:
[
  {
    "title": "short recipe title",
    "description": "one or two short parent-friendly sentences about the recipe",
    "url": "https://direct-recipe-page.example/path",
    "ageRangeMonths": "e.g. 6-9",
    "category": "e.g. Breakfast, Lunch, Snack, Vegetable, Protein"
  }
]
`;
}
