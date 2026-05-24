import { describe, expect, it } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('recipe search prompt', () => {
  it('asks for age-matched real recipes in the selected language without growth or schedule guidance', () => {
    const promptSource = fs.readFileSync(
      path.resolve(__dirname, '../../../supabase/functions/_shared/recipePrompt.ts'),
      'utf8',
    );

    expect(promptSource).toContain("he: 'Hebrew'");
    expect(promptSource).toContain('Respond in ${languageName[input.language]}');
    expect(promptSource).toContain('Return real recipes or food preparation ideas only.');
    expect(promptSource).toContain('Do not include growth');
    expect(promptSource).toContain('Do not include sleep, feeding schedule, or daily schedule');
    expect(promptSource).toContain('${input.childAgeMonths} months');
    expect(promptSource).toContain('Hebrew-language recipe sites');
    expect(promptSource).toContain('Every "url" MUST be a real, direct, HTTPS link');
    expect(promptSource).toContain('Return exactly 6 recipes as a JSON array');
  });
});
