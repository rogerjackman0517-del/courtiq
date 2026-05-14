"use client";

type Props = {
  seed: number;
  average: number;
  points?: number;
  width?: number;
  height?: number;
  color?: string;
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Synthetic last-N game trend, seeded per-player so the same player always
// shows the same sparkline. Variance scales with the average so role players
// look flat-ish and stars get more dramatic peaks.
function generateSeries(seed: number, avg: number, n: number): number[] {
  const rng = mulberry32(seed + 1);
  const variance = Math.max(2, avg * 0.28);
  return Array.from({ length: n }, () => {
    const noise = (rng() - 0.5) * 2 * variance;
    return Math.max(0, avg + noise);
  });
}

export function Sparkline({
  seed,
  average,
  points = 7,
  width = 64,
  height = 20,
  color = "#D4B560",
}: Props) {
  const series = generateSeries(seed, average, points);
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;
  const pad = 2;

  const coords = series.map((v, i) => {
    const x = (i / (points - 1)) * (width - pad * 2) + pad;
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return [x, y] as const;
  });

  const path = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");

  const lastX = coords[coords.length - 1][0];
  const lastY = coords[coords.length - 1][1];
  const lastAboveAvg = series[series.length - 1] >= average;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden="true"
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={`spark-fade-${seed}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <path
        d={path}
        fill="none"
        stroke={`url(#spark-fade-${seed})`}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={lastX}
        cy={lastY}
        r="2"
        fill={lastAboveAvg ? color : "#8A8A93"}
      />
    </svg>
  );
}
