/**
 * formatDateLong — explicit date/time helpers for the Nara-card UI.
 *
 * Returns strings like:
 *   EN → "Wed, May 27 · 19:14"
 *   HE → "יום ד׳, 27.5 · 19:14"
 *
 * Uses Intl where available (React Native JSC supports Intl on both platforms).
 * Falls back to manual formatting when the device locale is unavailable.
 */

import type { AppLanguage } from '../types/domain';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

const HEBREW_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

/**
 * Returns a long date + time string for a sleep session "since" line.
 * e.g. "Wed · May 27 · 20:28"  or  "יום ד׳ · 27.5 · 20:28"
 */
export function formatDateLong(iso: string, language: AppLanguage): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const time = `${hh}:${mm}`;

  if (language === 'he') {
    const dayName = HEBREW_DAYS[date.getDay()] ?? '';
    const dayNum = date.getDate();
    const month = date.getMonth() + 1;
    return `יום ${dayName} · ${dayNum}.${month} · ${time}`;
  }

  // English (and Russian which falls back to English)
  try {
    const weekday = new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date);
    const monthName = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
    const day = date.getDate();
    return `${weekday} · ${monthName} ${day} · ${time}`;
  } catch {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${year}-${pad(month)}-${pad(day)} · ${time}`;
  }
}

/**
 * Returns a date-only string (no time) in the same style as formatDateLong.
 *   EN → "Wed · May 27"
 *   HE → "יום ד׳ · 27.5"
 */
export function formatDateOnly(iso: string, language: AppLanguage): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  const dayNum = date.getDate();
  const month = date.getMonth() + 1;

  if (language === 'he') {
    const dayName = HEBREW_DAYS[date.getDay()] ?? '';
    return `יום ${dayName} · ${dayNum}.${month}`;
  }

  try {
    const weekday = new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date);
    const monthName = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
    return `${weekday} · ${monthName} ${dayNum}`;
  } catch {
    return `${date.getFullYear()}-${pad(month)}-${pad(dayNum)}`;
  }
}

/**
 * Returns only the time portion: "19:14"
 */
export function formatTimeShort(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Returns a day-group heading (no time) for history screens.
 *   EN → "Wednesday, May 27"
 *   HE → "יום רביעי, 27.5"
 */
export function formatDayHeading(iso: string, language: AppLanguage): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  const dayNum = date.getDate();
  const month = date.getMonth() + 1;

  if (language === 'he') {
    const dayName = HEBREW_DAYS[date.getDay()] ?? '';
    return `יום ${dayName}, ${dayNum}.${month}`;
  }

  try {
    const weekday = new Intl.DateTimeFormat('en', { weekday: 'long' }).format(date);
    const monthName = new Intl.DateTimeFormat('en', { month: 'long' }).format(date);
    return `${weekday}, ${monthName} ${dayNum}`;
  } catch {
    return `${date.getFullYear()}-${pad(month)}-${pad(dayNum)}`;
  }
}
