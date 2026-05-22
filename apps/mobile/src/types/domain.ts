export type ChildSex = 'boy' | 'girl';
export type TwinType = 'boy_boy' | 'girl_girl' | 'boy_girl';
export type FamilyMode = 'single' | 'twins';
export type AppLanguage = 'en' | 'he' | 'ru';
export type ConfidenceLabel = 'Low' | 'Medium' | 'High';
export type AiProvider = 'gemini' | 'openai' | 'claude';
export type AiPromptType = 'sleep' | 'hunger' | 'food_tasting' | 'recipe';
export type AiFeedbackRating = 'good' | 'okay' | 'bad';

export type ChildProfile = {
  id: string;
  familyId: string;
  displayName: string;
  sex: ChildSex;
  dateOfBirth: string;
};

export type TrackingLogType =
  | 'sleep'
  | 'feed'
  | 'solid_food'
  | 'diaper'
  | 'mood'
  | 'note'
  | 'illness'
  | 'teething'
  | 'medication'
  | 'unusual_day';

export type FoodTestStatus = 'Not started' | '1/3 tested' | '2/3 tested' | 'Completed';
