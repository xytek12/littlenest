import { describe, expect, it } from '@jest/globals';
import { compactAiText, normalizeProviderAnswer } from '../src/ai/format';

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

  it('replaces raw quota/provider failure text with a friendly provider status', () => {
    const answer = normalizeProviderAnswer({
      provider: 'openai',
      title: 'OpenAI needs attention',
      body:
        'OpenAI failed: {"error":{"message":"You exceeded your current quota","type":"insufficient_quota","code":"insufficient_quota"}}',
      confidenceLabel: 'Low',
      sources: [],
    });

    expect(answer.title).toBe('OpenAI is unavailable right now');
    expect(answer.body).toMatch(/could not answer this request/i);
    expect(answer.body).not.toMatch(/insufficient_quota/i);
  });

  it('compacts long provider guidance for mobile cards', () => {
    const compact = compactAiText(
      'Sleep Guidance:\n* Total Sleep: Most toddlers need a long body of text.\n* Nap Schedule: Usually one nap in the early afternoon.\n* Night Sleep: Aim for consistent bedtime.\n\nFeeding Guidance: another long paragraph that should not flood the card.',
      140,
    );

    expect(compact.length).toBeLessThanOrEqual(141);
    expect(compact).toContain('Sleep Guidance');
    expect(compact).not.toContain('*');
  });
});
