import { cn } from "@/lib/utils";
import type { GameLog } from "@/types";

interface GameLogTableProps {
  logs: GameLog[];
}

export function GameLogTable({ logs }: GameLogTableProps) {
  return (
    <div className="rounded-xl border border-white/[0.06] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-[#111118]">
              {["Date", "OPP", "", "Result", "MIN", "PTS", "REB", "AST", "STL", "BLK", "TOV", "FG", "3P", "FT", "+/-"].map(h => (
                <th key={h} className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#888899] text-right first:text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-3 py-2.5 text-xs text-[#888899] whitespace-nowrap">{log.date}</td>
                <td className="px-3 py-2.5 text-xs font-bold text-[#888899]">{log.opponent}</td>
                <td className="px-3 py-2.5 text-[10px] text-[#888899]">{log.homeAway}</td>
                <td className={cn("px-3 py-2.5 text-xs font-bold text-right", log.result === "W" ? "text-[#22C55E]" : "text-[#EF4444]")}>
                  {log.result} {log.score}
                </td>
                <td className="px-3 py-2.5 text-right text-xs text-[#888899]">{log.min}</td>
                <td className="px-3 py-2.5 text-right font-[family-name:var(--font-barlow)] font-bold text-[#F0F0F0]">{log.pts}</td>
                <td className="px-3 py-2.5 text-right text-xs text-[#F0F0F0]">{log.reb}</td>
                <td className="px-3 py-2.5 text-right text-xs text-[#F0F0F0]">{log.ast}</td>
                <td className="px-3 py-2.5 text-right text-xs text-[#888899]">{log.stl}</td>
                <td className="px-3 py-2.5 text-right text-xs text-[#888899]">{log.blk}</td>
                <td className="px-3 py-2.5 text-right text-xs text-[#888899]">{log.tov}</td>
                <td className="px-3 py-2.5 text-right text-xs text-[#888899]">{log.fgm}-{log.fga}</td>
                <td className="px-3 py-2.5 text-right text-xs text-[#888899]">{log.fg3m}-{log.fg3a}</td>
                <td className="px-3 py-2.5 text-right text-xs text-[#888899]">{log.ftm}-{log.fta}</td>
                <td className={cn("px-3 py-2.5 text-right text-xs font-bold", log.plusMinus > 0 ? "text-[#22C55E]" : log.plusMinus < 0 ? "text-[#EF4444]" : "text-[#888899]")}>
                  {log.plusMinus > 0 ? "+" : ""}{log.plusMinus}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
