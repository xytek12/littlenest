import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { fetchGeminiText } from '../_shared/aiProviders.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import {
  buildRecipeImageUrl,
  buildRecipeSearchPrompt,
  buildSourceUrl,
  getAllowedRecipeDomains,
  isUrlOnAllowedDomain,
} from '../_shared/recipePrompt.ts';
import { parseRecipes } from '../_shared/recipeParser.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = await req.json();
    const language: 'en' | 'he' | 'ru' =
      body.language === 'he' || body.language === 'ru' ? body.language : 'en';
    const { childAgeMonths, refreshNonce, query } = body;
    const prompt = buildRecipeSearchPrompt({
      language,
      childAgeMonths,
      refreshNonce,
      query,
    });

    const { text } = await fetchGeminiText(prompt, true);
    const parsed = parseRecipes(text, 12);

    // Enforce the language -> source allow-list server-side. The model is
    // instructed in the prompt, but we still filter here to guarantee that
    // off-allow-list URLs never reach the client.
    const allowedDomains = getAllowedRecipeDomains(language);
    const recipes = parsed
      .filter((r) => isUrlOnAllowedDomain(r.url, allowedDomains))
      .slice(0, 6)
      // Replace AI-generated recipe URLs with guaranteed-working search URLs.
      // The model often fabricates or hallucinates specific recipe paths that
      // return 404. We prefer the model's short `searchQuery` (2-3 keywords)
      // because matkonia.co.il / solidstarts.com `?s=` returns very few or
      // zero results for long full recipe titles. Fall back to the title when
      // the model didn't provide a search query (older payloads).
      // Also derive a per-recipe image URL using Unsplash Source so each card
      // has a thematic photo instead of one shared fallback image.
      .map((r) => ({
        ...r,
        url: buildSourceUrl(language, r.searchQuery || r.title),
        imageUrl: buildRecipeImageUrl(r.category),
      }));

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
