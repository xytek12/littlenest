import type { ChildProfile } from '../types/domain';

export const mockFamily = {
  id: 'family-demo',
  mode: 'single' as const,
  language: 'en' as const,
};

export const mockChild: ChildProfile = {
  id: 'child-demo',
  familyId: mockFamily.id,
  displayName: 'Maya',
  sex: 'girl',
  dateOfBirth: '2025-09-22',
};

export const mockAiSuggestion = {
  title: 'Nap window starts around 13:10',
  explanation: "Based on Maya's last wake time and yesterday's pattern.",
  confidence: 'Medium' as const,
};

export const mockFood = {
  name: 'Avocado',
  testCount: 2,
  ageRange: '6+ months',
};
