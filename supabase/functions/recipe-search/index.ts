import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { fetchGeminiText } from '../_shared/aiProviders.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { buildRecipeSearchPrompt } from '../_shared/recipePrompt.ts';
import { parseRecipes } from '../_shared/recipeParser.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const { language, childAgeMonths, refreshNonce, query } = await req.json();
    const prompt = buildRecipeSearchPrompt({
      language,
      childAgeMonths,
      refreshNonce,
      query,
    });

    const { text } = await fetchGeminiText(prompt, true);
    const recipes = parseRecipes(text, 6);

    if (recipes.length === 0) {
      return jsonResponse(
        {
          error: 'Could not parse recipe results',
          recipes: [],
        },
        502,
      );
    }

    return jsonResponse({ recipes });
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Recipe search failed',
        recipes: [],
      },
      500,
    );
  }
});
