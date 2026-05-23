export type PromptInput = {
  language: 'en' | 'he' | 'ru';
  promptType: 'sleep' | 'hunger' | 'food_tasting' | 'recipe';
  childAgeMonths: number;
  childProfile: Record<string, unknown>;
  recentLogs: Record<string, unknown>[];
  userQuestion?: string;
};

const languageName = {
  en: 'English',
  he: 'Hebrew',
  ru: 'Russian',
} as const;

export function buildBabyGuidancePrompt(input: PromptInput) {
  return `
You are helping a parent understand baby tracking logs.
Respond in ${languageName[input.language]}.
The child is ${input.childAgeMonths} months old.
Prompt type: ${input.promptType}.

Rules:
- Give practical guidance, not diagnosis.
- Use Low, Medium, or High confidence only.
- Explain which log patterns support the suggestion.
- For 4-month solids, allergy concerns, illness, medicine, growth concerns, or unusual symptoms, tell the parent to follow doctor guidance.
- If recipe or food guidance is requested, prefer age-appropriate and simple foods.
- Return valid JSON with keys: title, body, confidenceLabel, sources.

Child profile:
${JSON.stringify(input.childProfile, null, 2)}

Recent logs:
${JSON.stringify(input.recentLogs, null, 2)}

Parent question:
${input.userQuestion ?? 'Give the best next suggestion.'}
`;
}
