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

type FailureStage = 'gemini' | 'parse' | 'domain_filter' | 'unknown';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  let stage: FailureStage = 'unknown';

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

    stage = 'gemini';
    let text: string;
    try {
      const result = await fetchGeminiText(prompt, true);
      text = result.text;
    } catch (geminiError) {
      console.error('[recipe-search] gemini stage failed', {
        stage: 'gemini',
        language,
        childAgeMonths,
        hasQuery: Boolean(query),
        error: errorMessage(geminiError),
        stack: geminiError instanceof Error ? geminiError.stack : undefined,
        promptPreview: prompt.slice(0, 200),
      });
      return jsonResponse(
        {
          error: 'AI provider failed',
          stage: 'gemini',
          recipes: [],
        },
        502,
      );
    }

    stage = 'parse';
    const parsed = parseRecipes(text, 12);
    if (parsed.length === 0) {
      console.error('[recipe-search] parse stage produced 0 recipes', {
        stage: 'parse',
        language,
        textPreview: text.slice(0, 500),
        textLength: text.length,
      });
      return jsonResponse(
        {
          error: 'Could not parse recipe results',
          stage: 'parse',
          recipes: [],
        },
        502,
      );
    }

    stage = 'domain_filter';
    // Enforce the language -> source allow-list server-side. The model is
    // instructed in the prompt, but we still filter here to guarantee that
    // off-allow-list URLs never reach the client.
    const allowedDomains = getAllowedRecipeDomains(language);
    const filtered = parsed.filter((r) => isUrlOnAllowedDomain(r.url, allowedDomains));

    if (filtered.length === 0) {
      const hostsSeen = parsed
        .map((r) => {
          try {
            return new URL(r.url).hostname;
          } catch {
            return r.url;
          }
        })
        .slice(0, 12);
      console.error('[recipe-search] domain filter dropped all recipes', {
        stage: 'domain_filter',
        language,
        allowed: allowedDomains,
        hostsSeen,
        parsedCount: parsed.length,
      });
      return jsonResponse(
        {
          error: 'No recipes matched allowed source domains',
          stage: 'domain_filter',
          recipes: [],
        },
        502,
      );
    }

    const recipes = filtered
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

    return jsonResponse({ recipes });
  } catch (error) {
    console.error('[recipe-search] unhandled error', {
      stage,
      error: errorMessage(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      raw: error,
    });
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Recipe search failed',
        stage,
        recipes: [],
      },
      500,
    );
  }
});
