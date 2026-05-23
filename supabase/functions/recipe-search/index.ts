import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { callGemini } from '../_shared/aiProviders.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const { language, childAgeMonths, query } = await req.json();
    const prompt = `
Find baby food or recipe ideas for a ${childAgeMonths}-month-old child.
Respond in ${language}.
Use trusted medical, health, parenting, and child nutrition sources first.
General recipe sites are allowed only as inspiration and must be labeled as inspiration.
Include source links.
Question: ${query}
Return only valid JSON. Do not use markdown fences.
Use this shape exactly:
{
  "title": "short title",
  "body": "short parent-friendly explanation with 3-5 recipe ideas",
  "confidenceLabel": "Low" | "Medium" | "High",
  "sources": [{ "title": "source name", "url": "https://..." }]
}
`;
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
