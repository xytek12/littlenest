export type ConfidenceLabel = 'Low' | 'Medium' | 'High';
export type ProviderName = 'gemini' | 'openai';

export type AiSource = {
  title: string;
  url: string;
};

export type ProviderAnswer = {
  provider: ProviderName;
  title: string;
  body: string;
  confidenceLabel: ConfidenceLabel;
  sources: AiSource[];
  raw: unknown;
};

export type AiRouterResponse = {
  recommended: ProviderAnswer;
  comparison: ProviderAnswer[];
  safetyNote: string;
};
