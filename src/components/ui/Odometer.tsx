"use client";

import { useEffect, useState } from "react";

type Props = {
  value: number;
  className?: string;
};

const DIGITS = "0123456789".split("");

export function Odometer({ value, className }: Props) {
  const [shown, setShown] = useState(value);

  useEffect(() => {
    // tiny delay so the stack actually animates from the previous value
    if (shown === value) return;
    const t = setTimeout(() => setShown(value), 50);
    return () => clearTimeout(t);
  }, [value, shown]);

  const str = String(Math.max(0, Math.round(shown)));
  const padded = str.padStart(String(Math.max(value, shown)).length, " ");

  return (
    <span className={`odometer ${className ?? ""}`} aria-label={String(value)}>
      {padded.split("").map((ch, i) =>
        ch === " " ? (
          <span key={i} className="opacity-0">0</span>
        ) : (
          <span key={i} className="odometer-digit">
            <span
              className="odometer-stack"
              style={{ transform: `translateY(-${parseInt(ch, 10)}em)` }}
            >
              {DIGITS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </span>
          </span>
        )
      )}
    </span>
  );
}
