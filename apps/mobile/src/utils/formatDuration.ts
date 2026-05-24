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
