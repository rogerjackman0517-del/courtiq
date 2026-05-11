import { cn, formatSalary } from "@/lib/utils";
import Link from "next/link";

interface RosterPlayer {
  PLAYER_ID: number;
  PLAYER: string;
  NUM: string;
  POSITION: string;
  HOW_ACQUIRED: string;
  SEASON_EXP: number;
  salary?: number;
}

interface RosterTableProps {
  players: RosterPlayer[];
}

const POS_ORDER = ["G", "PG", "SG", "F", "SF", "PF", "C", "F-C", "G-F"];

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function RosterTable({ players }: RosterTableProps) {
  const sorted = [...players].sort((a, b) => {
    const ai = POS_ORDER.indexOf(a.POSITION);
    const bi = POS_ORDER.indexOf(b.POSITION);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const totalSalary = players.reduce((s, p) => s + (p.salary ?? 0), 0);

  return (
    <div className="rounded-xl border border-white/[0.06] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-[#111118]">
              <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#888899]">#</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#888899]">Player</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#888899]">Pos</th>
              <th className="text-right px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#888899]">Exp</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#888899]">How Acquired</th>
              <th className="text-right px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#888899]">Salary</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr key={p.PLAYER_ID} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                <td className="px-4 py-3 text-[#888899] text-xs font-semibold">{p.NUM || "—"}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/players/${slugify(p.PLAYER)}`}
                    className="font-semibold text-[#F0F0F0] group-hover:text-[#C8A84B] transition-colors"
                  >
                    {p.PLAYER}
                  </Link>
                </td>
                <td className="px-4 py-3 text-xs font-bold text-[#888899]">{p.POSITION || "—"}</td>
                <td className="px-4 py-3 text-right text-xs text-[#888899]">
                  {p.SEASON_EXP === 0 ? "R" : `${p.SEASON_EXP}yr`}
                </td>
                <td className="px-4 py-3 text-xs text-[#888899]">{p.HOW_ACQUIRED || "—"}</td>
                <td className={cn(
                  "px-4 py-3 text-right text-xs font-semibold",
                  p.salary && p.salary > 30_000_000 ? "text-[#C8A84B]" : "text-[#888899]"
                )}>
                  {p.salary ? formatSalary(p.salary) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/[0.06] bg-[#111118]">
              <td colSpan={5} className="px-4 py-3 text-xs font-bold text-[#888899]">
                Total Payroll ({players.length} players)
              </td>
              <td className="px-4 py-3 text-right text-sm font-bold text-[#C8A84B]">
                {totalSalary > 0 ? formatSalary(totalSalary) : "—"}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
