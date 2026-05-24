import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { callGemini } from '../_shared/aiProviders.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { buildRecipeSearchPrompt } from '../_shared/recipePrompt.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const { language, childAgeMonths, query } = await req.json();
    const prompt = buildRecipeSearchPrompt({ language, childAgeMonths, query });
    const answer = await callGemini(prompt, true);
    return jsonResponse({ results: [answer] });
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Recipe search failed',
      },
      500,
    );
  }
});
