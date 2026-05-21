"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";
import { TeamLogo } from "@/components/teams/TeamLogo";
import { AnimatedHeading } from "@/components/ui/AnimatedHeading";
import { Search } from "lucide-react";

type Injury = {
  name: string;
  position: string;
  status: string;
  comment: string;
  type: string;
  detail: string;
  returnDate: string;
};

type TeamBlock = {
  team: string;
  teamName: string;
  injuries: Injury[];
};

type TeamMeta = {
  id: number;
  abbreviation: string;
  fullName: string;
  primaryColor: string;
  slug: string;
};

const STATUS_COLOR: Record<string, string> = {
  Out: "#F87171",
  "Day-To-Day": "#F59E0B",
  Questionable: "#F59E0B",
  Doubtful: "#F87171",
  Probable: "#34D399",
  Available: "#34D399",
};

export default function InjuriesPage() {
  const [teams, setTeams] = useState<TeamBlock[]>([]);
  const [teamMeta, setTeamMeta] = useState<TeamMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/injuries").then((r) => (r.ok ? r.json() : { teams: [] })),
      fetch("/api/teams/with-records").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([inj, t]) => {
        if (Array.isArray(inj?.teams)) setTeams(inj.teams);
        if (Array.isArray(t)) setTeamMeta(t);
      })
      .finally(() => setLoading(false));
  }, []);

  const metaByAbbr = useMemo(() => {
    const m: Record<string, TeamMeta> = {};
    teamMeta.forEach((t) => { m[t.abbreviation] = t; });
    return m;
  }, [teamMeta]);

  const filtered = useMemo(() => {
    if (!query) return teams;
    const q = query.toLowerCase();
    return teams
      .map((tb) => ({
        ...tb,
        injuries: tb.injuries.filter(
          (i) =>
            i.name.toLowerCase().includes(q) ||
            tb.team.toLowerCase().includes(q) ||
            tb.teamName.toLowerCase().includes(q)
        ),
      }))
      .filter((tb) => tb.injuries.length > 0);
  }, [teams, query]);

  const total = teams.reduce((acc, tb) => acc + tb.injuries.length, 0);

  return (
    <div className="pb-24 lg:pb-12 premium-fade-in">
      <section className="brand-glow px-4 lg:px-12 pt-10 lg:pt-20 pb-8" data-reveal>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D4B560] mb-3">
            Injury report
          </p>
          <h1 className="font-[family-name:var(--font-barlow)] font-black text-5xl lg:text-7xl tracking-[-0.04em] text-[#F5F5F7] mb-4 leading-[0.95]">
            <AnimatedHeading text="Who's hurt" />
            <br />
            <span className="text-[#D4B560]">
              <AnimatedHeading text="right now." startDelay={250} />
            </span>
          </h1>
          <p className="text-base lg:text-lg text-[#8A8A93]">
            {loading ? "Loading…" : `${total} active injury report${total === 1 ? "" : "s"} across the league. Updated every 10 minutes from ESPN.`}
          </p>
        </div>
      </section>

      <section className="px-4 lg:px-12 pb-16" data-reveal data-reveal-delay="1">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 bg-[#1C1C24] border border-white/[0.05] rounded-2xl px-5 py-3 mb-6 max-w-md">
            <Search size={16} className="text-[#6E6E76] shrink-0" />
            <input
              type="text"
              placeholder="Search by player or team..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-[#F5F5F7] placeholder:text-[#6E6E76] outline-none"
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-3xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-[#8A8A93]">No matching injuries.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((tb, ti) => {
                const meta = metaByAbbr[tb.team];
                return (
                  <div key={`${tb.team || "team"}-${ti}`} className="floating-card rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] p-5">
                    <Link href={meta ? `/teams/${meta.slug}` : "#"} className="flex items-center gap-3 mb-4 group">
                      <TeamLogo
                        teamId={meta?.id}
                        abbreviation={tb.team}
                        primaryColor={meta?.primaryColor}
                        size="sm"
                      />
                      <div>
                        <p className="font-[family-name:var(--font-barlow)] font-bold text-lg text-[#F5F5F7] group-hover:text-[#D4B560] transition-colors leading-tight">
                          {tb.teamName}
                        </p>
                        <p className="text-[10px] text-[#6E6E76] tracking-wider">{tb.team} · {tb.injuries.length} listed</p>
                      </div>
                    </Link>
                    <ul className="space-y-2.5">
                      {tb.injuries.map((i, idx) => {
                        const color = STATUS_COLOR[i.status] ?? "#8A8A93";
                        return (
                          <li key={idx} className="flex items-center justify-between gap-3 text-sm">
                            <div className="min-w-0">
                              <p className="text-[#F5F5F7] truncate">
                                {i.name}{" "}
                                {i.position && <span className="text-[10px] text-[#6E6E76]">· {i.position}</span>}
                              </p>
                              {(i.detail || i.type) && (
                                <p className="text-[11px] text-[#8A8A93] truncate">
                                  {[i.type, i.detail].filter(Boolean).join(" · ")}
                                </p>
                              )}
                            </div>
                            <span
                              className="text-[10px] font-bold tracking-wider uppercase rounded-full px-2 py-0.5 shrink-0"
                              style={{ color, background: `${color}1A`, border: `1px solid ${color}40` }}
                            >
                              {i.status || "—"}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-xs text-[#6E6E76] mt-10 max-w-2xl">
            Source: ESPN. Status definitions: Out = ruled out, Doubtful = unlikely, Day-To-Day / Questionable = manager's call closer to tip, Probable / Available = expected to play.
          </p>
        </div>
      </section>
    </div>
  );
}
