import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { callGemini, callOpenAi } from '../_shared/aiProviders.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { buildBabyGuidancePrompt } from '../_shared/promptBuilder.ts';
import type { AiRouterResponse, ProviderAnswer, ProviderName } from '../_shared/responseSchema.ts';

const safetyNotes = {
  en: 'This is guidance, not medical diagnosis. Follow your doctor for medical concerns.',
  he: '\u05d6\u05d5 \u05d4\u05db\u05d5\u05d5\u05e0\u05d4 \u05db\u05dc\u05dc\u05d9\u05ea \u05d5\u05dc\u05d0 \u05d0\u05d1\u05d7\u05e0\u05d4 \u05e8\u05e4\u05d5\u05d0\u05d9\u05ea. \u05d1\u05db\u05dc \u05d7\u05e9\u05e9 \u05e8\u05e4\u05d5\u05d0\u05d9 \u05d9\u05e9 \u05dc\u05e4\u05e0\u05d5\u05ea \u05dc\u05e8\u05d5\u05e4\u05d0.',
  ru: '\u042d\u0442\u043e \u043e\u0431\u0449\u0430\u044f \u0440\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0430\u0446\u0438\u044f, \u0430 \u043d\u0435 \u043c\u0435\u0434\u0438\u0446\u0438\u043d\u0441\u043a\u0438\u0439 \u0434\u0438\u0430\u0433\u043d\u043e\u0437. \u041f\u0440\u0438 \u043c\u0435\u0434\u0438\u0446\u0438\u043d\u0441\u043a\u0438\u0445 \u0432\u043e\u043f\u0440\u043e\u0441\u0430\u0445 \u043e\u0431\u0440\u0430\u0442\u0438\u0442\u0435\u0441\u044c \u043a \u0432\u0440\u0430\u0447\u0443.',
} as const;

function providerErrorAnswer(provider: ProviderName, error: unknown): ProviderAnswer {
  console.error(`${provider} provider failed`, error);

  return {
    provider,
    title: `${provider === 'gemini' ? 'Gemini' : 'OpenAI'} needs attention`,
    body: `${provider === 'gemini' ? 'Gemini' : 'OpenAI'} could not answer this request right now. Try the comparison again later.`,
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
      safetyNote: safetyNotes[input.language as keyof typeof safetyNotes] ?? safetyNotes.en,
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
