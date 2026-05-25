import { useEffect, useState } from 'react';

/**
 * Increments a counter once per second while `enabled` is true.
 * Use the returned value as a hint for re-renders that read Date.now() directly.
 */
export function useTickEverySecond(enabled: boolean): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [enabled]);
  return tick;
}
