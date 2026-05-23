import type { AiPromptType, ConfidenceLabel } from '../types/domain';

export type ProviderAnswer = {
  provider: 'gemini' | 'openai';
  title: string;
  body: string;
  confidenceLabel: ConfidenceLabel;
  sources: { title: string; url: string }[];
};

export type AiRequestInput = {
  language: 'en' | 'he' | 'ru';
  promptType: AiPromptType;
  childAgeMonths: number;
  childProfile: Record<string, unknown>;
  recentLogs: Record<string, unknown>[];
  userQuestion?: string;
};

export type AiRouterResponse = {
  recommended: ProviderAnswer;
  comparison: ProviderAnswer[];
  safetyNote: string;
};
