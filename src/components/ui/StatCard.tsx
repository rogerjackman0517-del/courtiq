import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: number;
  rank?: number;
  className?: string;
  highlight?: boolean;
}

export function StatCard({ label, value, subValue, trend, rank, className, highlight }: StatCardProps) {
  return (
    <div className={cn(
      "rounded-xl border border-white/[0.06] bg-[#111118] p-4 flex flex-col gap-1",
      highlight && "border-[#C8A84B]/30 bg-[#C8A84B]/[0.03]",
      className
    )}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#888899]">{label}</p>
      <div className="flex items-end gap-2">
        <span className={cn(
          "font-[family-name:var(--font-barlow)] font-bold text-3xl leading-none",
          highlight ? "text-[#C8A84B]" : "text-[#F0F0F0]"
        )}>
          {value}
        </span>
        {subValue && (
          <span className="text-xs text-[#888899] mb-0.5">{subValue}</span>
        )}
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        {trend !== undefined && (
          <span className={cn(
            "flex items-center gap-0.5 text-xs font-semibold",
            trend > 0 ? "text-[#22C55E]" : trend < 0 ? "text-[#EF4444]" : "text-[#888899]"
          )}>
            {trend > 0 ? <TrendingUp size={11} /> : trend < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
            {trend > 0 ? "+" : ""}{trend.toFixed(1)}
          </span>
        )}
        {rank !== undefined && (
          <span className="text-xs text-[#888899]">
            #{rank} in NBA
          </span>
        )}
      </div>
    </div>
  );
}
