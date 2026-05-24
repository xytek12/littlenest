export type RecipePromptInput = {
  language: 'en' | 'he' | 'ru';
  childAgeMonths: number;
  query: string;
};

const languageName = {
  en: 'English',
  he: 'Hebrew',
  ru: 'Russian',
} as const;

export function buildRecipeSearchPrompt(input: RecipePromptInput) {
  return `
Find real food recipe ideas only for a ${input.childAgeMonths}-month-old child.
Respond in ${languageName[input.language]} with parent-safe, concise title and body text.
If the selected language is Hebrew, write natural Hebrew text.

Scope:
- Return real recipes or food preparation ideas only.
- Do not include growth guidance, growth charts, weight, height, or percentile content.
- Do not include sleep, feeding, or daily schedule predictions.
- Do not provide diagnosis, treatment, medicine, allergy protocols, or medical advice.
- Keep safety wording brief and tell the parent to follow doctor guidance for allergy, illness, choking, or medical concerns.

Sources:
- Prefer direct canonical recipe URLs from recipe pages that are likely to open.
- Do not return search result, redirect, tracking, or aggregator URLs.
- Avoid Google, Bing, Yahoo, DuckDuckGo, shortened links, and social-media redirect links.

Parent recipe request:
${input.query}

Return only valid JSON. Do not use markdown fences.
Use this shape exactly:
{
  "title": "short recipe-focused title",
  "body": "short parent-friendly explanation with 3-5 real food recipe ideas",
  "confidenceLabel": "Low" | "Medium" | "High",
  "sources": [{ "title": "recipe page name", "url": "https://direct-recipe-page.example/path" }]
}
`;
}
