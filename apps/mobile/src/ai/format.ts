import type { ProviderAnswer } from './types';

function stripCodeFence(value: string) {
  return value
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
}

function tryParseEmbeddedJson(value: string) {
  const stripped = stripCodeFence(value);
  const match = stripped.match(/\{[\s\S]*\}/);
  const candidate = match ? match[0] : stripped;

  try {
    return JSON.parse(candidate) as Partial<ProviderAnswer> & {
      confidenceLabel?: ProviderAnswer['confidenceLabel'];
    };
  } catch {
    return null;
  }
}

export function cleanAiText(value: string) {
  return stripCodeFence(value)
    .replace(/\\n/g, '\n')
    .replace(/\*\*/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function normalizeProviderAnswer(answer: ProviderAnswer): ProviderAnswer {
  const parsed = tryParseEmbeddedJson(answer.body);

  if (parsed) {
    return {
      ...answer,
      title: typeof parsed.title === 'string' ? parsed.title : answer.title,
      body:
        typeof parsed.body === 'string'
          ? cleanAiText(parsed.body)
          : cleanAiText(answer.body),
      confidenceLabel:
        parsed.confidenceLabel === 'High' || parsed.confidenceLabel === 'Medium'
          ? parsed.confidenceLabel
          : answer.confidenceLabel,
      sources: Array.isArray(parsed.sources) && parsed.sources.length > 0 ? parsed.sources : answer.sources,
    };
  }

  return {
    ...answer,
    body: cleanAiText(answer.body),
  };
}

export function formatSourceTitle(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'Source';
  }
}
