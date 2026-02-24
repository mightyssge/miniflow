import { useState, useEffect } from "react";

export function useTimerAnimation(isRunning: boolean, isSuccess: boolean, totalMs: number) {
  const [progress, setProgress] = useState(0);
  const [timeLeftStr, setTimeLeftStr] = useState("");

  useEffect(() => {
    if (!isRunning) {
      if (!isSuccess) { setProgress(0); setTimeLeftStr(""); }
      return;
    }

    const startTime = Date.now();
    const endTime = startTime + totalMs;
    let rafId: number;

    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const newProg = Math.min(1, 1 - (remaining / totalMs));
      
      setProgress(newProg);
      setTimeLeftStr(`${(remaining / 1000).toFixed(1)}s`);

      if (remaining > 0) rafId = requestAnimationFrame(tick);
      else { setTimeLeftStr("0.0s"); setProgress(1); }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isRunning, totalMs, isSuccess]);

  return { progress, timeLeftStr };
}