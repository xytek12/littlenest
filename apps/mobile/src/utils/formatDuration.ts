import { getDictionary } from '../i18n';
import type { AppLanguage } from '../types/domain';

export function formatDurationSeconds(totalSeconds: number, includeHours = false): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  if (includeHours) {
    const h = Math.floor(safe / 3600);
    const m = Math.floor((safe % 3600) / 60);
    const s = safe % 60;
    return [h, m, s].map((p) => String(p).padStart(2, '0')).join(':');
  }
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Returns a human-readable duration string using i18n keys.
 * - < 60s  → "12 seconds" / "12 שניות"
 * - < 3600s → "5 minutes" / "5 דקות"
 * - >= 3600s → "1 hr 14 min" / "שעה ו-14 דקות"
 */
export function formatDurationHuman(totalSeconds: number, language: AppLanguage | string = 'en'): string {
  const lang: AppLanguage = (language === 'he' || language === 'ru') ? language : 'en';
  const safe = Math.max(0, Math.floor(totalSeconds));
  const d = getDictionary(lang);
  if (safe < 60) {
    return d.common.durationSeconds(safe);
  }
  if (safe < 3600) {
    const mins = Math.floor(safe / 60);
    return d.common.durationMinutes(mins);
  }
  const hours = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  return d.common.durationHours(hours, mins);
}
