import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { callGemini, callOpenAi } from '../_shared/aiProviders.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { buildBabyGuidancePrompt } from '../_shared/promptBuilder.ts';
import type { AiRouterResponse, ProviderAnswer, ProviderName } from '../_shared/responseSchema.ts';

function providerErrorAnswer(provider: ProviderName, error: unknown): ProviderAnswer {
  return {
    provider,
    title: `${provider === 'gemini' ? 'Gemini' : 'OpenAI'} needs attention`,
    body:
      error instanceof Error
        ? error.message
        : 'The provider did not return a usable response.',
    confidenceLabel: 'Low',
    sources: [],
    raw: null,
  };
}

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

    const [geminiResult, openaiResult] = await Promise.allSettled([
      callGemini(prompt, useSearch),
      callOpenAi(prompt),
    ]);

    const gemini =
      geminiResult.status === 'fulfilled'
        ? geminiResult.value
        : providerErrorAnswer('gemini', geminiResult.reason);
    const openai =
      openaiResult.status === 'fulfilled'
        ? openaiResult.value
        : providerErrorAnswer('openai', openaiResult.reason);

    const recommended =
      gemini.confidenceLabel === 'High' || openai.confidenceLabel === 'Low' ? gemini : openai;
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
