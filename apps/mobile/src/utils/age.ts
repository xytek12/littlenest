import type { AppLanguage } from '../types/domain';

export function getAgeInMonths(dateOfBirth: string, now = new Date()): number {
  const birth = new Date(`${dateOfBirth}T00:00:00Z`);
  let months = (now.getUTCFullYear() - birth.getUTCFullYear()) * 12;
  months += now.getUTCMonth() - birth.getUTCMonth();
  if (now.getUTCDate() < birth.getUTCDate()) {
    months -= 1;
  }
  return Math.max(0, months);
}

export function getAgeLabel(dateOfBirth: string, now = new Date(), language: AppLanguage | string = 'en'): string {
  const months = getAgeInMonths(dateOfBirth, now);

  if (language === 'he') {
    const years = Math.floor(months / 12);
    const rem = months % 12;
    if (years === 0) {
      return months === 1 ? 'חודש אחד' : `${months} חודשים`;
    }
    if (rem === 0) {
      return years === 1 ? 'שנה אחת' : `${years} שנים`;
    }
    const yearLabel = years === 1 ? 'שנה' : `${years} שנים`;
    const monthLabel = rem === 1 ? 'חודש' : `${rem} חודשים`;
    return `${yearLabel} ו-${monthLabel}`;
  }

  // English / Russian (default)
  return months === 1 ? '1 month' : `${months} months`;
}
