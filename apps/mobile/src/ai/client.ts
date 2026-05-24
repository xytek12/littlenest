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

export function recipeCacheKey(input: {
  childId: string;
  date: string;
  language: string;
  refreshNonce: number;
}) {
  return `recipes:${input.childId}:${input.date}:${input.language}:${input.refreshNonce}`;
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
        return parsed;
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

  await AsyncStorage.setItem(cacheKey, JSON.stringify(recipes));
  await incrementFetchCount(input.childId, date);

  return recipes;
}
