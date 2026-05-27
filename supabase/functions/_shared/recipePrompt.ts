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

// Allowed source domains per language. The model MUST only return URLs whose
// host (or a parent of it) matches one of these domains.
// - he: restricted to matkonia.co.il (per product decision).
// - en: 2-3 reputable English-language sites focused on 6-24 month babies.
// - ru: per product decision, Russian falls back to the English allow-list.
const ALLOWED_DOMAINS = {
  en: ['solidstarts.com', 'babyfoode.com', 'weelicious.com'],
  he: ['matkonia.co.il'],
  ru: ['solidstarts.com', 'babyfoode.com', 'weelicious.com'],
} as const;

// English search phrase is reused for Russian, so we get the same trusted
// English-language baby-food sites even when the UI language is Russian.
const localizedSearchPhrase = {
  en: (months: number) =>
    `baby food recipes for a ${months} month old site:solidstarts.com OR site:babyfoode.com OR site:weelicious.com`,
  he: (months: number) => `מתכונים לתינוק בן ${months} חודשים site:matkonia.co.il`,
  ru: (months: number) =>
    `baby food recipes for a ${months} month old site:solidstarts.com OR site:babyfoode.com OR site:weelicious.com`,
} as const;

function buildSourceInstruction(language: 'en' | 'he' | 'ru') {
  const domains = ALLOWED_DOMAINS[language];
  const domainList = domains.map((d) => `https://${d}`).join(', ');
  if (language === 'he') {
    return `All results MUST come ONLY from matkonia.co.il (${domainList}). Every "url" host MUST be matkonia.co.il (or a subdomain of it). Titles and descriptions MUST be written in natural Hebrew. Do NOT use any other site, including general Hebrew cooking sites.`;
  }
  if (language === 'ru') {
    return `All results MUST come ONLY from these English-language baby-food sites: ${domainList}. Every "url" host MUST be one of: ${domains.join(', ')} (or a subdomain). Titles and descriptions MUST be written in natural Russian (translate the English source content into natural Russian). Do NOT pull from any other site.`;
  }
  return `All results MUST come ONLY from these reputable baby-food sites: ${domainList}. Every "url" host MUST be one of: ${domains.join(', ')} (or a subdomain). Titles and descriptions MUST be written in natural English. Do NOT pull from any other site.`;
}

export function getAllowedRecipeDomains(language: 'en' | 'he' | 'ru'): readonly string[] {
  return ALLOWED_DOMAINS[language];
}

/**
 * Build a guaranteed-working search URL for the given language and a short
 * search query.
 *
 * AI-generated direct recipe URLs are often fabricated or stale, causing 404s.
 * Instead of linking to a specific (possibly non-existent) recipe page, we link
 * to the site's own search results page — these pages always exist and
 * gracefully show relevant results (or a "no results" message) instead of a
 * 404.
 *
 * IMPORTANT: matkonia.co.il is a WordPress site whose `?s=` search requires a
 * short Hebrew QUERY (2-3 words like "פירה" or "סלמון תינוק") to match real
 * recipes. Passing a long full recipe title returns 0-1 results and feels like
 * a dead-end to the user. The model is now prompted to return a short
 * `searchQuery` per recipe; callers should pass that here instead of the title.
 *
 * Supported search URL formats:
 *   - he    → https://matkonia.co.il/?s=<query>
 *   - en/ru → https://solidstarts.com/?s=<query>
 */
export function buildSourceUrl(language: 'en' | 'he' | 'ru', query: string): string {
  const encoded = encodeURIComponent(shortenSearchQuery(query));
  if (language === 'he') {
    return `https://matkonia.co.il/?s=${encoded}`;
  }
  // English and Russian both use the English baby-food sites; solidstarts.com is
  // the primary source in the allow-list.
  return `https://solidstarts.com/?s=${encoded}`;
}

/**
 * Defensive: trim a query down to the first 2-3 meaningful tokens so we never
 * fire a long, over-specific search at the recipe site. WordPress `?s=` search
 * is keyword-based; long phrases return few or zero matches.
 */
export function shortenSearchQuery(value: string): string {
  const cleaned = (value ?? '')
    .replace(/[.,!?:;"'()\[\]{}<>\\/|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return '';
  const tokens = cleaned.split(' ');
  // Keep up to 3 tokens — enough to disambiguate, short enough to match.
  return tokens.slice(0, 3).join(' ');
}

/**
 * Build a thematic image URL for a recipe card using Unsplash Source.
 *
 * The model returns `category` as a short English label (e.g. "Breakfast",
 * "Vegetable", "Snack") even when the recipe title/description are in Hebrew
 * or Russian. We extract ASCII keywords from `category`, fall back to a
 * generic "baby food" tag when nothing usable is left, and always append
 * "baby,food" so the photo stays on-theme.
 */
export function buildRecipeImageUrl(category: string | undefined): string {
  const raw = (category ?? '').toLowerCase();
  // Keep only ASCII letters / spaces / commas — Unsplash Source ignores
  // non-ASCII and we want predictable, food-themed photos.
  const cleaned = raw.replace(/[^a-z, ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const tokens = cleaned
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2);
  const keywords = (tokens.length > 0 ? tokens.slice(0, 2) : ['baby', 'food']).concat([
    'baby',
    'food',
  ]);
  const dedup = Array.from(new Set(keywords)).slice(0, 4).join(',');
  return `https://source.unsplash.com/600x400/?${encodeURIComponent(dedup)}`;
}

/**
 * Returns true if `url`'s host matches one of `allowedDomains` (or a subdomain).
 * Used to enforce the language -> source restriction server-side after model output.
 */
export function isUrlOnAllowedDomain(url: string, allowedDomains: readonly string[]): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return allowedDomains.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

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
- ${buildSourceInstruction(input.language)}

URL and searchQuery rules:
- Every "url" MUST be a real, direct, HTTPS link to a single recipe page on one of the allowed source domains listed above. Reject any candidate page whose host is not in the allow-list, even if its content looks relevant.
- Every recipe MUST also include a "searchQuery" field: a SHORT search phrase (2-3 keywords, NOT the full title) in the response language that is likely to return real matches when typed into the recipe site's on-site search box. Examples for Hebrew: "פירה", "סלמון תינוק", "בטטה". Examples for English: "salmon baby", "sweet potato puree", "banana pancakes". Do NOT include articles, prepositions, or filler words.
- Do NOT return search-result, redirect, tracking, shortened, social-media, or aggregator URLs as the "url".
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
    "searchQuery": "2-3 keyword phrase that returns matches on the recipe site search",
    "ageRangeMonths": "e.g. 6-9",
    "category": "e.g. Breakfast, Lunch, Snack, Vegetable, Protein"
  }
]
`;
}
