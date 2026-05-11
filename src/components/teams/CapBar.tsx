"use client";

import { formatSalary } from "@/lib/utils";

interface CapBarProps {
  used: number;
  cap: number;
  luxuryTax: number;
}

export function CapBar({ used, cap, luxuryTax }: CapBarProps) {
  const usedPct       = Math.min((used / luxuryTax) * 100, 100);
  const capLinePct    = (cap / luxuryTax) * 100;
  const overCap       = used > cap;
  const overLuxury    = used > luxuryTax;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-[family-name:var(--font-barlow)] font-bold text-base uppercase tracking-wide text-[#F0F0F0]">
          Salary Cap
        </h3>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          overLuxury ? "text-[#EF4444] bg-[#EF4444]/10" :
          overCap    ? "text-[#F59E0B] bg-[#F59E0B]/10" :
                       "text-[#22C55E] bg-[#22C55E]/10"
        }`}>
          {overLuxury ? "Over Luxury Tax" : overCap ? "Over Cap" : "Under Cap"}
        </span>
      </div>

      {/* Bar */}
      <div className="relative h-6 bg-[#1A1A24] rounded-lg overflow-hidden mb-4">
        {/* Used salary */}
        <div
          className="absolute left-0 top-0 bottom-0 rounded-lg transition-all"
          style={{
            width: `${usedPct}%`,
            background: overLuxury
              ? "linear-gradient(90deg, #EF4444, #C8A84B)"
              : overCap
              ? "linear-gradient(90deg, #F59E0B, #C8A84B)"
              : "linear-gradient(90deg, #22C55E, #C8A84B)",
          }}
        />
        {/* Cap line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/40"
          style={{ left: `${capLinePct}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="font-[family-name:var(--font-barlow)] font-bold text-lg text-[#F0F0F0]">{formatSalary(used)}</p>
          <p className="text-[10px] text-[#888899] uppercase tracking-wider">Total Payroll</p>
        </div>
        <div>
          <p className="font-[family-name:var(--font-barlow)] font-bold text-lg text-[#C8A84B]">{formatSalary(cap)}</p>
          <p className="text-[10px] text-[#888899] uppercase tracking-wider">Salary Cap</p>
        </div>
        <div>
          <p className="font-[family-name:var(--font-barlow)] font-bold text-lg text-[#EF4444]">{formatSalary(luxuryTax)}</p>
          <p className="text-[10px] text-[#888899] uppercase tracking-wider">Luxury Tax</p>
        </div>
      </div>
    </div>
  );
}
