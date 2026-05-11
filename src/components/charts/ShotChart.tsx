"use client";

import { useEffect, useRef } from "react";
import type { ShotData } from "@/types";

interface ShotChartProps {
  shots: ShotData[];
  width?: number;
  height?: number;
}

// NBA court dimensions in feet, scaled to SVG units (1ft = 10px)
const SCALE = 4.5;
const COURT_W = 500 * SCALE / 10;
const COURT_H = 470 * SCALE / 10;

export function ShotChart({ shots, width = 500, height = 470 }: ShotChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaleX = width / 500;
    const scaleY = height / 470;

    ctx.clearRect(0, 0, width, height);

    // Draw court outline
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1.5;

    // Half-court boundary
    ctx.strokeRect(0, 0, width, height);

    // Paint / key
    const paintW = 160 * scaleX;
    const paintH = 190 * scaleY;
    const paintX = (500 - 160) / 2 * scaleX;
    ctx.strokeRect(paintX, height - paintH, paintW, paintH);

    // Free throw circle
    const ftCircleX = 250 * scaleX;
    const ftCircleY = (470 - 190) * scaleY;
    ctx.beginPath();
    ctx.arc(ftCircleX, ftCircleY, 60 * scaleX, 0, Math.PI, true);
    ctx.stroke();

    // Restricted area
    ctx.beginPath();
    ctx.arc(ftCircleX, height, 40 * scaleX, Math.PI, 0, false);
    ctx.stroke();

    // Backboard
    ctx.beginPath();
    ctx.moveTo((250 - 30) * scaleX, height - 4 * scaleY);
    ctx.lineTo((250 + 30) * scaleX, height - 4 * scaleY);
    ctx.stroke();

    // Three-point arc
    ctx.beginPath();
    ctx.arc(ftCircleX, height, 238 * scaleX, Math.PI, 0, false);
    ctx.moveTo((250 - 220) * scaleX, height);
    ctx.lineTo((250 - 220) * scaleX, (470 - 140) * scaleY);
    ctx.moveTo((250 + 220) * scaleX, height);
    ctx.lineTo((250 + 220) * scaleX, (470 - 140) * scaleY);
    ctx.stroke();

    // Draw shots
    shots.forEach(shot => {
      const x = (shot.x + 250) * scaleX;
      const y = (470 - shot.y) * scaleY;

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);

      if (shot.made) {
        ctx.fillStyle = "rgba(200, 168, 75, 0.7)";
        ctx.fill();
        ctx.strokeStyle = "rgba(200, 168, 75, 1)";
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.fillStyle = "rgba(239, 68, 68, 0.0)";
        ctx.fill();
        ctx.strokeStyle = "rgba(239, 68, 68, 0.7)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // X mark
        ctx.beginPath();
        ctx.moveTo(x - 3, y - 3);
        ctx.lineTo(x + 3, y + 3);
        ctx.moveTo(x + 3, y - 3);
        ctx.lineTo(x - 3, y + 3);
        ctx.stroke();
      }
    });
  }, [shots, width, height]);

  return (
    <div className="relative rounded-xl overflow-hidden bg-[#0D1117] border border-white/[0.06]">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full"
        style={{ display: "block" }}
      />
      <div className="absolute bottom-3 left-3 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5 text-[#888899]">
          <span className="h-2 w-2 rounded-full bg-[#C8A84B]" />Made
        </span>
        <span className="flex items-center gap-1.5 text-[#888899]">
          <span className="h-2 w-2 rounded-full border border-[#EF4444]" />Missed
        </span>
      </div>
    </div>
  );
}
