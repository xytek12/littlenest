import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { callGemini, callOpenAi } from '../_shared/aiProviders.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { buildBabyGuidancePrompt } from '../_shared/promptBuilder.ts';
import type { AiRouterResponse } from '../_shared/responseSchema.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const input = await req.json();
    const prompt = buildBabyGuidancePrompt(input);
    const useSearch = input.promptType === 'recipe' || input.promptType === 'food_tasting';

    const [gemini, openai] = await Promise.all([
      callGemini(prompt, useSearch),
      callOpenAi(prompt),
    ]);

    const recommended = gemini.confidenceLabel === 'High' ? gemini : openai;
    const body: AiRouterResponse = {
      recommended,
      comparison: [gemini, openai],
      safetyNote:
        'This is guidance, not medical diagnosis. Follow your doctor for medical concerns.',
    };

    return jsonResponse(body);
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'AI router failed',
      },
      500,
    );
  }
});
