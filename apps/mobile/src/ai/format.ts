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
      body: `${providerName} could not answer this request right now. Try the comparison again later.`,
      confidenceLabel: 'Low',
      sources: [],
    };
  }

  if (body.includes('openai failed:') || body.includes('gemini failed:')) {
    const providerName = friendlyProviderName(answer.provider);

    return {
      ...answer,
      title: `${providerName} needs attention`,
      body: `${providerName} could not answer this request right now. Try the comparison again later.`,
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

function tryParseJson(candidate: string): unknown {
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

function unwrapProviderPayload(value: unknown): (Partial<ProviderAnswer> & {
  confidenceLabel?: ProviderAnswer['confidenceLabel'];
}) | null {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return unwrapProviderPayload(tryParseJson(value));
  }

  if (Array.isArray(value)) {
    return unwrapProviderPayload(value.find((item) => item && typeof item === 'object'));
  }

  if (typeof value !== 'object') {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  if (Array.isArray(candidate.results)) {
    return unwrapProviderPayload(candidate.results);
  }

  if (candidate.recommended && typeof candidate.recommended === 'object') {
    return unwrapProviderPayload(candidate.recommended);
  }

  if (typeof candidate.title === 'string' || typeof candidate.body === 'string') {
    return candidate as Partial<ProviderAnswer> & {
      confidenceLabel?: ProviderAnswer['confidenceLabel'];
    };
  }

  return null;
}

function findBalancedJsonCandidates(value: string) {
  const candidates: string[] = [];
  const pairs: Record<string, string> = { '{': '}', '[': ']' };

  for (let start = 0; start < value.length; start += 1) {
    const opener = value[start];
    const closer = pairs[opener];

    if (!closer) {
      continue;
    }

    const stack = [closer];
    let inString = false;
    let escaped = false;

    for (let index = start + 1; index < value.length; index += 1) {
      const char = value[index];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === '\\') {
        escaped = inString;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (inString) {
        continue;
      }

      if (pairs[char]) {
        stack.push(pairs[char]);
        continue;
      }

      if (char === stack[stack.length - 1]) {
        stack.pop();
      }

      if (stack.length === 0) {
        candidates.push(value.slice(start, index + 1));
        break;
      }
    }
  }

  return candidates;
}

function tryParseEmbeddedJson(value: string) {
  const stripped = stripCodeFence(value);
  const direct = unwrapProviderPayload(tryParseJson(stripped));

  if (direct) {
    return direct;
  }

  for (const candidate of findBalancedJsonCandidates(stripped)) {
    const parsed = unwrapProviderPayload(tryParseJson(candidate));

    if (parsed) {
      return parsed;
    }
  }

  return null;
}

function isSearchOrRedirectSource(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    const path = parsed.pathname.toLowerCase();

    if (
      host === 'google.com' ||
      host.endsWith('.google.com') ||
      host === 'bing.com' ||
      host === 'search.yahoo.com' ||
      host === 'duckduckgo.com'
    ) {
      return true;
    }

    if (path.includes('/search') || path.includes('/url') || path.includes('/redirect')) {
      return true;
    }

    return ['url', 'u', 'target', 'redirect'].some((param) => parsed.searchParams.has(param));
  } catch {
    return true;
  }
}

function normalizeSources(value: unknown, fallback: ProviderAnswer['sources']) {
  const toDirectSources = (sources: unknown) =>
    (Array.isArray(sources) ? sources : [])
    .map((source) => {
      if (!source || typeof source !== 'object') {
        return null;
      }

      const candidate = source as Record<string, unknown>;

      if (typeof candidate.url !== 'string') {
        return null;
      }

      return {
        title: typeof candidate.title === 'string' ? candidate.title : formatSourceTitle(candidate.url),
        url: candidate.url,
      };
    })
    .filter((source): source is ProviderAnswer['sources'][number] => source !== null)
    .filter((source, index, allSources) => allSources.findIndex((item) => item.url === source.url) === index)
    .filter((source) => !isSearchOrRedirectSource(source.url));

  const directSources = toDirectSources(value);

  return directSources.length > 0 ? directSources : toDirectSources(fallback);
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

  return `${readable.trim()}...`;
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
      sources: normalizeSources(parsed.sources, answer.sources),
    };
  }

  return {
    ...answer,
    body: cleanAiText(answer.body),
    sources: normalizeSources(answer.sources, []),
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
    return 'OpenAI could not answer this request right now. Try again later.';
  }

  if (lower.includes('missing supabase public environment variables')) {
    return 'The app is missing its Supabase public connection settings.';
  }

  return 'The AI comparison could not finish. Check the provider setup and try again.';
}

export function formatRecipeSearchError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Recipe search failed.';
  const lower = message.toLowerCase();

  if (
    lower.includes('failed:') ||
    lower.includes('insufficient_quota') ||
    lower.includes('quota') ||
    lower.includes('billing') ||
    lower.includes('{') ||
    lower.includes('}')
  ) {
    return 'Recipe ideas could not refresh right now. Try again later.';
  }

  if (lower.includes('missing supabase public environment variables')) {
    return 'The app is missing its Supabase public connection settings.';
  }

  return 'Recipe ideas could not refresh right now. Try again later.';
}
