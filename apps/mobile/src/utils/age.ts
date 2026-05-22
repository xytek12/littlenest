export function getAgeInMonths(dateOfBirth: string, now = new Date()): number {
  const birth = new Date(`${dateOfBirth}T00:00:00Z`);
  let months = (now.getUTCFullYear() - birth.getUTCFullYear()) * 12;
  months += now.getUTCMonth() - birth.getUTCMonth();
  if (now.getUTCDate() < birth.getUTCDate()) {
    months -= 1;
  }
  return Math.max(0, months);
}

export function getAgeLabel(dateOfBirth: string, now = new Date()): string {
  const months = getAgeInMonths(dateOfBirth, now);
  return months === 1 ? '1 month' : `${months} months`;
}
