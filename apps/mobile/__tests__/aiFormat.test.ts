import { describe, expect, it } from '@jest/globals';
import { compactAiText, formatRecipeSearchError, normalizeProviderAnswer } from '../src/ai/format';

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

  it('extracts JSON surrounded by prose without leaking raw JSON into cards', () => {
    const answer = normalizeProviderAnswer({
      provider: 'openai',
      title: 'Suggestion',
      body:
        'Sure, here is the card:\n{"title":"Simple lentil mash","body":"Cook red lentils until very soft. Mash with carrot for a gentle real-food meal.","confidenceLabel":"Medium","sources":[{"title":"Direct recipe","url":"https://www.yummytoddlerfood.com/lentils-for-babies/"},{"title":"Search result","url":"https://www.google.com/search?q=baby+lentil+recipe"}]}\nHope this helps.',
      confidenceLabel: 'Low',
      sources: [],
    });

    expect(answer.title).toBe('Simple lentil mash');
    expect(answer.body).toBe(
      'Cook red lentils until very soft. Mash with carrot for a gentle real-food meal.',
    );
    expect(answer.body).not.toContain('{');
    expect(answer.confidenceLabel).toBe('Medium');
    expect(answer.sources).toEqual([
      { title: 'Direct recipe', url: 'https://www.yummytoddlerfood.com/lentils-for-babies/' },
    ]);
  });

  it('uses the first recipe object when a provider returns a JSON array', () => {
    const answer = normalizeProviderAnswer({
      provider: 'gemini',
      title: 'Suggestion',
      body:
        '[{"title":"Apple oat pancakes","body":"Soft pancakes made with oats and grated apple.","confidenceLabel":"High","sources":[{"title":"Recipe page","url":"https://www.healthylittlefoodies.com/apple-oat-pancakes/"}]}]',
      confidenceLabel: 'Low',
      sources: [],
    });

    expect(answer.title).toBe('Apple oat pancakes');
    expect(answer.body).toBe('Soft pancakes made with oats and grated apple.');
    expect(answer.confidenceLabel).toBe('High');
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

  it('formats recipe search provider failures without raw provider details', () => {
    const message = formatRecipeSearchError(
      new Error(
        'Gemini failed: {"error":{"message":"billing details required","code":"insufficient_quota"}}',
      ),
    );

    expect(message).toBe('Recipe ideas could not refresh right now. Try again later.');
    expect(message).not.toMatch(/Gemini failed|billing|quota|insufficient/i);
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
