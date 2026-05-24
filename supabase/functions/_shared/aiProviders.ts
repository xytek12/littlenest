import type { AiSource, ConfidenceLabel, ProviderAnswer } from './responseSchema.ts';

function requireSecret(name: string) {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing secret: ${name}`);
  }
  return value;
}

function normalizeConfidenceLabel(value: unknown): ConfidenceLabel {
  return value === 'High' || value === 'Medium' ? value : 'Low';
}

function normalizeSources(value: unknown): AiSource[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((source) => {
      if (!source || typeof source !== 'object') {
        return null;
      }

      const candidate = source as Record<string, unknown>;
      const title = candidate.title;
      const url = candidate.url;

      if (typeof title !== 'string' || typeof url !== 'string') {
        return null;
      }

      return { title, url };
    })
    .filter((source): source is AiSource => source !== null);
}

function stripCodeFence(text: string) {
  return text
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
}

function unwrapProviderPayload(value: unknown): Record<string, unknown> | null {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return unwrapProviderPayload(parseJsonObject(value));
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

  return typeof candidate.title === 'string' || typeof candidate.body === 'string'
    ? candidate
    : null;
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

function parseJsonObject(text: string) {
  const trimmed = stripCodeFence(text);

  try {
    return unwrapProviderPayload(JSON.parse(trimmed));
  } catch {
    for (const candidate of findBalancedJsonCandidates(trimmed)) {
      try {
        const parsed = unwrapProviderPayload(JSON.parse(candidate));

        if (parsed) {
          return parsed;
        }
      } catch {
        // Try the next balanced candidate.
      }
    }

    return null;
  }
}

function parseAnswer(provider: 'gemini' | 'openai', text: string, raw: unknown, fallbackSources: AiSource[] = []): ProviderAnswer {
  const parsed = parseJsonObject(text);

  if (parsed && typeof parsed === 'object') {
    const candidate = parsed as Record<string, unknown>;
    return {
      provider,
      title: typeof candidate.title === 'string' ? candidate.title : 'Suggestion',
      body: typeof candidate.body === 'string' ? candidate.body : text,
      confidenceLabel: normalizeConfidenceLabel(candidate.confidenceLabel),
      sources: normalizeSources(candidate.sources).length > 0 ? normalizeSources(candidate.sources) : fallbackSources,
      raw,
    };
  }

  return {
    provider,
    title: 'Suggestion',
    body:
      text
        .replace(/^```(?:json)?/i, '')
        .replace(/```$/i, '')
        .replace(/\\n/g, '\n')
        .replace(/\*\*/g, '')
        .trim() || 'No answer returned.',
    confidenceLabel: 'Low',
    sources: fallbackSources,
    raw,
  };
}

function extractGeminiSources(raw: Record<string, unknown>): AiSource[] {
  const candidates = raw.candidates;
  if (!Array.isArray(candidates)) {
    return [];
  }

  return candidates
    .flatMap((candidate) => {
      if (!candidate || typeof candidate !== 'object') {
        return [];
      }

      const groundingMetadata = (candidate as Record<string, unknown>).groundingMetadata;
      if (!groundingMetadata || typeof groundingMetadata !== 'object') {
        return [];
      }

      const chunks = (groundingMetadata as Record<string, unknown>).groundingChunks;
      if (!Array.isArray(chunks)) {
        return [];
      }

      return chunks.flatMap((chunk) => {
        if (!chunk || typeof chunk !== 'object') {
          return [];
        }

        const web = (chunk as Record<string, unknown>).web;
        if (!web || typeof web !== 'object') {
          return [];
        }

        const title = (web as Record<string, unknown>).title;
        const uri = (web as Record<string, unknown>).uri;

        return typeof title === 'string' && typeof uri === 'string'
          ? [{ title, url: uri }]
          : [];
      });
    })
    .filter(
      (source, index, sources) =>
        sources.findIndex((candidate) => candidate.url === source.url) === index,
    );
}

export async function callOpenAi(prompt: string): Promise<ProviderAnswer> {
  const apiKey = requireSecret('OPENAI_API_KEY');
  const model = Deno.env.get('OPENAI_MODEL') ?? 'gpt-5-mini';

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: prompt,
    }),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(`OpenAI failed: ${JSON.stringify(json)}`);
  }

  const text =
    typeof json.output_text === 'string'
      ? json.output_text
      : Array.isArray(json.output)
        ? json.output
            .flatMap((item: Record<string, unknown>) =>
              Array.isArray(item.content) ? item.content : [],
            )
            .map((content: Record<string, unknown>) =>
              typeof content.text === 'string' ? content.text : '',
            )
            .join('\n')
        : '';

  return parseAnswer('openai', text, json);
}

export async function callGemini(prompt: string, useSearch: boolean): Promise<ProviderAnswer> {
  const apiKey = requireSecret('GEMINI_API_KEY');
  const model = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: useSearch ? [{ google_search: {} }] : undefined,
      }),
    },
  );

  const json = await response.json();
  if (!response.ok) {
    throw new Error(`Gemini failed: ${JSON.stringify(json)}`);
  }

  const text =
    json.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? '')
      .join('') ?? '';
  const sources = extractGeminiSources(json as Record<string, unknown>);

  return parseAnswer('gemini', text, json, sources);
}
