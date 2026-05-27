import { useEffect, useState } from 'react';
import { formatDeltaSeconds } from '~/lib/ui/format';

interface AnimatedDeltaNumberProps {
  target: number;
  durationMs?: number;
}

// Count up from 0 to the target delta over durationMs using rAF.
// Respects prefers-reduced-motion: if reduced, renders the final value directly.
export function AnimatedDeltaNumber({
  target,
  durationMs = 900,
}: AnimatedDeltaNumberProps) {
  const [value, setValue] = useState<number>(() => {
    if (typeof window === 'undefined') return target;
    const reduce = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    return reduce ? target : 0;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduce = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduce) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // easeOutExpo for racing-readout feel
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setValue(target * eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return <>{formatDeltaSeconds(value)}</>;
}
