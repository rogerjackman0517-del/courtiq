"use client";

import { useEffect, useState } from "react";

const KEY = "courtiq-daily-streak";

type Streak = { count: number; lastDate: string };

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function useDailyStreak(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cur: Streak = { count: 0, lastDate: "" };
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.count === "number" && typeof parsed.lastDate === "string") {
          cur = parsed;
        }
      }
    } catch { /* ignore */ }

    const today = todayStr();
    if (cur.lastDate === today) {
      // Already counted today. Nothing to do.
      setCount(cur.count);
      return;
    }
    const next: Streak = {
      count: cur.lastDate === yesterdayStr() ? cur.count + 1 : 1,
      lastDate: today,
    };
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
    setCount(next.count);
  }, []);

  return count;
}
