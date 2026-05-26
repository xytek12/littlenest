import AsyncStorage from '@react-native-async-storage/async-storage';
import { hasSupabaseEnv, supabase } from '../services/supabase';
import type { AiRequestInput, AiRouterResponse } from './types';

export const MAX_RECIPE_FETCHES_PER_DAY = 5;

export class RecipeFetchLimitError extends Error {
  constructor() {
    super('Daily recipe fetch limit reached');
    this.name = 'RecipeFetchLimitError';
  }
}

export type StructuredRecipe = {
  title: string;
  description: string;
  url: string;
  ageRangeMonths: string;
  category: string;
  // Optional: the edge function derives a per-recipe Unsplash image URL.
  // Older cached responses won't include it, so callers must tolerate undefined.
  imageUrl?: string;
};

export type RecipeSearchInput = {
  childId: string;
  language: 'en' | 'he' | 'ru';
  childAgeMonths: number;
  refreshNonce: number;
  query?: string;
};

function requireSupabaseFunctions() {
  if (!hasSupabaseEnv()) {
    throw new Error('Missing Supabase public environment variables.');
  }
}

export async function requestAiGuidance(input: AiRequestInput): Promise<AiRouterResponse> {
  requireSupabaseFunctions();

  const { data, error } = await supabase.functions.invoke<AiRouterResponse>('ai-router', {
    body: input,
  });

  if (error) throw error;
  if (!data) throw new Error('AI returned no data');
  return data;
}

export function isoDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

// Bump this version any time we change recipe url normalization or the cached
// payload shape so older client caches do not surface stale (possibly 404)
// AI-fabricated direct URLs. v2 (2026-05-26): force search-url normalization
// on cached responses.
const RECIPE_CACHE_VERSION = 'v2';

export function recipeCacheKey(input: {
  childId: string;
  date: string;
  language: string;
  refreshNonce: number;
}) {
  return `recipes:${RECIPE_CACHE_VERSION}:${input.childId}:${input.date}:${input.language}:${input.refreshNonce}`;
}

/**
 * Build a guaranteed-working search URL for the given language and recipe title.
 *
 * Mirrors the server-side helper in `supabase/functions/_shared/recipePrompt.ts`.
 * Defensive duplicate so old cached payloads (which may still hold direct
 * AI-fabricated 404 URLs) get rewritten on the client too.
 */
export function buildClientSearchUrl(
  language: 'en' | 'he' | 'ru',
  title: string,
): string {
  const encoded = encodeURIComponent(title);
  if (language === 'he') {
    return `https://matkonia.co.il/?s=${encoded}`;
  }
  return `https://solidstarts.com/?s=${encoded}`;
}

function normalizeRecipeUrls(
  recipes: StructuredRecipe[],
  language: 'en' | 'he' | 'ru',
): StructuredRecipe[] {
  return recipes.map((r) => ({
    ...r,
    url: buildClientSearchUrl(language, r.title),
  }));
}

export function recipeFetchCountKey(childId: string, date = isoDate()) {
  return `recipes:fetchcount:${childId}:${date}`;
}

async function getFetchCount(childId: string, date = isoDate()): Promise<number> {
  const stored = await AsyncStorage.getItem(recipeFetchCountKey(childId, date));
  const value = stored ? Number(stored) : 0;
  return Number.isFinite(value) ? value : 0;
}

/**
 * Whether the child is still under the daily fresh-fetch cap.
 * Cached reads do not count against the cap, so this only gates fresh fetches.
 */
export async function canFetchRecipes(childId: string, date = isoDate()): Promise<boolean> {
  const count = await getFetchCount(childId, date);
  return count < MAX_RECIPE_FETCHES_PER_DAY;
}

async function incrementFetchCount(childId: string, date = isoDate()): Promise<void> {
  const count = await getFetchCount(childId, date);
  await AsyncStorage.setItem(recipeFetchCountKey(childId, date), String(count + 1));
}

/**
 * Fetch the daily recipe set for a child, cached per child/date/language/nonce.
 * - Cache hit: returns cached recipes without touching the network or the cap.
 * - Cache miss: enforces the 5/day fresh-fetch cap, calls the edge function,
 *   stores the result, increments the cap, and returns the recipes.
 */
export async function searchRecipes(input: RecipeSearchInput): Promise<StructuredRecipe[]> {
  const date = isoDate();
  const cacheKey = recipeCacheKey({
    childId: input.childId,
    date,
    language: input.language,
    refreshNonce: input.refreshNonce,
  });

  const cached = await AsyncStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as StructuredRecipe[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Defensive: even cached responses get url-normalized so any direct
        // AI-fabricated 404 paths get rewritten to a search URL on read.
        return normalizeRecipeUrls(parsed, input.language);
      }
    } catch {
      // Ignore corrupt cache and fall through to a fresh fetch.
    }
  }

  requireSupabaseFunctions();

  if (!(await canFetchRecipes(input.childId, date))) {
    throw new RecipeFetchLimitError();
  }

  const { data, error } = await supabase.functions.invoke<{
    recipes?: StructuredRecipe[];
    error?: string;
  }>('recipe-search', {
    body: {
      language: input.language,
      childAgeMonths: input.childAgeMonths,
      refreshNonce: input.refreshNonce,
      query: input.query ?? '',
    },
  });

  if (error) throw error;

  const recipes = data?.recipes ?? [];
  if (recipes.length === 0) {
    throw new Error(data?.error ?? 'Recipe search returned no results');
  }

  // Normalize URLs before caching so even cache reads stay safe across
  // future client/server schema drift.
  const normalized = normalizeRecipeUrls(recipes, input.language);
  await AsyncStorage.setItem(cacheKey, JSON.stringify(normalized));
  await incrementFetchCount(input.childId, date);

  return normalized;
}
