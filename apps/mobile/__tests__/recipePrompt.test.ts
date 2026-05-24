import { describe, expect, it } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('recipe search prompt', () => {
  it('asks for real recipe ideas in the selected language without growth or schedule guidance', () => {
    const promptSource = fs.readFileSync(
      path.resolve(__dirname, '../../../supabase/functions/_shared/recipePrompt.ts'),
      'utf8',
    );

    expect(promptSource).toContain("he: 'Hebrew'");
    expect(promptSource).toContain('Respond in ${languageName[input.language]}');
    expect(promptSource).toContain('real food recipe ideas only');
    expect(promptSource).toContain('Do not include growth');
    expect(promptSource).toContain('Do not include sleep, feeding, or daily schedule');
    expect(promptSource).toContain('direct canonical recipe URLs');
    expect(promptSource).toContain('Do not return search result, redirect, tracking, or aggregator URLs');
    expect(promptSource).toContain('${input.query}');
  });
});
