import { describe, expect, it } from '@jest/globals';
import { normalizeProviderAnswer } from '../src/ai/format';

describe('AI answer formatting', () => {
  it('extracts fenced JSON into a readable provider answer', () => {
    const answer = normalizeProviderAnswer({
      provider: 'gemini',
      title: 'Suggestion',
      body:
        '```json\n{"title":"Recipe ideas","body":"First line\\n\\nSecond line with **bold**","confidenceLabel":"High","sources":[{"title":"AAP","url":"https://example.com"}]}\n```',
      confidenceLabel: 'Low',
      sources: [],
    });

    expect(answer.title).toBe('Recipe ideas');
    expect(answer.body).toBe('First line\n\nSecond line with bold');
    expect(answer.confidenceLabel).toBe('High');
    expect(answer.sources).toEqual([{ title: 'AAP', url: 'https://example.com' }]);
  });
});
