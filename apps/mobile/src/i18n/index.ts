import type { AppLanguage } from '../types/domain';
import { en } from './en';
import { he } from './he';
import { ru } from './ru';

export type Dictionary = typeof en;

const dictionaries: Record<AppLanguage, Dictionary> = { en, he, ru };

export function getDictionary(language: AppLanguage) {
  return dictionaries[language];
}

export function isRtlLanguage(language: AppLanguage) {
  return language === 'he';
}
