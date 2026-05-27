export type StructuredRecipe = {
  title: string;
  description: string;
  url: string;
  ageRangeMonths: string;
  category: string;
  /**
   * Short 2-3 keyword search phrase. Used to build the recipe-site search URL
   * (matkonia.co.il / solidstarts.com `?s=` param). Falls back to title when
   * absent (older cached responses).
   */
  searchQuery?: string;
};

function stripCodeFence(text: string) {
  return text
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
}

function findJsonArray(text: string): string | null {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return text.slice(start, end + 1);
}

function asString(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return '';
}

function isHttpsUrl(value: string) {
  return /^https:\/\/\S+$/i.test(value);
}

function normalizeRecipe(value: unknown): StructuredRecipe | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const title = asString(candidate.title);
  const url = asString(candidate.url);

  if (!title || !isHttpsUrl(url)) {
    return null;
  }

  const searchQuery = asString(candidate.searchQuery);
  return {
    title,
    description: asString(candidate.description),
    url,
    ageRangeMonths: asString(candidate.ageRangeMonths),
    category: asString(candidate.category),
    searchQuery: searchQuery || undefined,
  };
}

/**
 * Parse Gemini output into a structured list of recipes.
 * Handles markdown fences and surrounding prose by extracting the JSON array.
 * Returns up to `limit` valid recipes (default 6). Empty array if nothing parses.
 */
export function parseRecipes(text: string, limit = 6): StructuredRecipe[] {
  const candidates: string[] = [];
  const stripped = stripCodeFence(text);
  candidates.push(stripped);

  const extracted = findJsonArray(stripped);
  if (extracted) {
    candidates.push(extracted);
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      const array = Array.isArray(parsed)
        ? parsed
        : Array.isArray((parsed as Record<string, unknown>)?.recipes)
          ? (parsed as Record<string, unknown>).recipes
          : null;

      if (!Array.isArray(array)) {
        continue;
      }

      const recipes = array
        .map((item) => normalizeRecipe(item))
        .filter((recipe): recipe is StructuredRecipe => recipe !== null);

      if (recipes.length > 0) {
        return recipes.slice(0, limit);
      }
    } catch {
      // Try the next candidate.
    }
  }

  return [];
}
