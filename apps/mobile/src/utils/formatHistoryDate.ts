import type { AppLanguage } from '../types/domain';

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function fallbackDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function fallbackTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatHistoryDate(iso: string, language: AppLanguage): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  try {
    return new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(date);
  } catch {
    return fallbackDate(date);
  }
}

export function formatHistoryTime(iso: string, language: AppLanguage): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  try {
    return new Intl.DateTimeFormat(language, { timeStyle: 'short' }).format(date);
  } catch {
    return fallbackTime(date);
  }
}
