import { hasSupabaseEnv, supabase } from '../services/supabase';
import type { AiRequestInput, AiRouterResponse, ProviderAnswer } from './types';

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

export async function searchRecipes(input: {
  language: 'en' | 'he' | 'ru';
  childAgeMonths: number;
  query: string;
}) {
  requireSupabaseFunctions();

  const { data, error } = await supabase.functions.invoke<{ results: ProviderAnswer[] }>(
    'recipe-search',
    {
      body: input,
    },
  );

  if (error) throw error;
  return data?.results ?? [];
}
