import type { AppLanguage } from '../types/domain';
import { en } from './en';
import { he } from './he';
import { ru } from './ru';

const dictionaries = { en, he, ru };

export function getDictionary(language: AppLanguage) {
  return dictionaries[language];
}
