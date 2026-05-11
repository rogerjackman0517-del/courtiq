"use client";

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer
} from "recharts";

interface PlayerRadarProps {
  data: { label: string; value: number; fullMark?: number }[];
  color?: string;
}

export function PlayerRadar({ data, color = "#C8A84B" }: PlayerRadarProps) {
  const chartData = data.map(d => ({
    subject: d.label,
    A: d.value,
    fullMark: d.fullMark ?? 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="rgba(255,255,255,0.06)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: "#888899", fontSize: 11, fontWeight: 600 }}
        />
        <Radar
          name="Player"
          dataKey="A"
          stroke={color}
          fill={color}
          fillOpacity={0.15}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
