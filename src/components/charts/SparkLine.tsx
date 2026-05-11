"use client";

import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

interface SparkLineProps {
  data: number[];
  color?: string;
  height?: number;
}

export function SparkLine({ data, color = "#C8A84B", height = 40 }: SparkLineProps) {
  const chartData = data.map((v, i) => ({ i, v }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
        <Tooltip
          content={({ active, payload }) =>
            active && payload?.length ? (
              <div className="bg-[#1A1A24] border border-white/[0.06] rounded px-2 py-1 text-xs text-[#F0F0F0]">
                {payload[0].value}
              </div>
            ) : null
          }
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
