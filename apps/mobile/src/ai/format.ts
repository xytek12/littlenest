import type { ProviderAnswer } from './types';

function friendlyProviderName(provider: ProviderAnswer['provider']) {
  return provider === 'openai' ? 'OpenAI' : provider === 'gemini' ? 'Gemini' : provider;
}

function mapProviderFailure(answer: ProviderAnswer): ProviderAnswer | null {
  const body = answer.body.toLowerCase();

  if (
    body.includes('insufficient_quota') ||
    body.includes('exceeded your current quota') ||
    body.includes('billing details')
  ) {
    const providerName = friendlyProviderName(answer.provider);

    return {
      ...answer,
      title: `${providerName} is unavailable right now`,
      body: `${providerName} could not answer this request. Check the API billing or model setup, then try again.`,
      confidenceLabel: 'Low',
      sources: [],
    };
  }

  if (body.includes('openai failed:') || body.includes('gemini failed:')) {
    const providerName = friendlyProviderName(answer.provider);

    return {
      ...answer,
      title: `${providerName} needs attention`,
      body: `${providerName} could not answer this request. Review the provider configuration and try the comparison again.`,
      confidenceLabel: 'Low',
      sources: [],
    };
  }

  return null;
}

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

export function compactAiText(value: string, maxLength = 220) {
  const cleaned = cleanAiText(value)
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  const clipped = cleaned.slice(0, Math.max(0, maxLength - 1));
  const lastSentence = Math.max(
    clipped.lastIndexOf('. '),
    clipped.lastIndexOf('! '),
    clipped.lastIndexOf('? '),
  );
  const readable = lastSentence > maxLength * 0.45 ? clipped.slice(0, lastSentence + 1) : clipped;

  return `${readable.trim()}…`;
}

export function normalizeProviderAnswer(answer: ProviderAnswer): ProviderAnswer {
  const failure = mapProviderFailure(answer);

  if (failure) {
    return failure;
  }

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

export function formatAiRequestError(error: unknown) {
  const message = error instanceof Error ? error.message : 'AI request failed.';
  const lower = message.toLowerCase();

  if (lower.includes('insufficient_quota') || lower.includes('billing')) {
    return 'OpenAI could not answer because the provider billing or quota needs attention.';
  }

  if (lower.includes('missing supabase public environment variables')) {
    return 'The app is missing its Supabase public connection settings.';
  }

  return 'The AI comparison could not finish. Check the provider setup and try again.';
}
