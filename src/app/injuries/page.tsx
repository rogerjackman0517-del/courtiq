"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";
import { TeamLogo } from "@/components/teams/TeamLogo";
import { Search, AlertTriangle, X, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

type Injury = {
  name: string;
  position: string;
  status: string;
  comment: string;
  type: string;
  detail: string;
  returnDate: string;
  headshot: string;
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

const STATUS_META: Record<string, { color: string; severity: number; bg: string; border: string }> = {
  Out:          { color: "#F87171", severity: 4, bg: "#F8717118", border: "#F8717135" },
  Doubtful:     { color: "#F87171", severity: 3, bg: "#F8717112", border: "#F8717130" },
  "Day-To-Day": { color: "#F59E0B", severity: 2, bg: "#F59E0B15", border: "#F59E0B30" },
  Questionable: { color: "#F59E0B", severity: 2, bg: "#F59E0B15", border: "#F59E0B30" },
  Probable:     { color: "#34D399", severity: 1, bg: "#34D39912", border: "#34D39928" },
  Available:    { color: "#34D399", severity: 0, bg: "#34D39912", border: "#34D39928" },
};

const STATUS_FILTERS = ["All", "Out", "Doubtful", "Questionable", "Day-To-Day", "Probable"];

type FlatInjury = Injury & {
  teamAbbr: string;
  teamNameFull: string;
  teamMeta: TeamMeta | undefined;
};

function PlayerCard({ injury }: { injury: FlatInjury }) {
  const meta = injury.teamMeta;
  const teamColor = meta?.primaryColor ?? "#5B8DEF";
  const s = STATUS_META[injury.status] ?? { color: "#8A8A93", severity: 0, bg: "#8A8A9312", border: "#8A8A9328" };
  const [imgErr, setImgErr] = useState(false);
  const hasPhoto = !!injury.headshot && !imgErr;

  return (
    <Link
      href={meta?.slug ? `/teams/${meta.slug}` : "#"}
      className="group floating-card no-jiggle rounded-2xl overflow-hidden flex flex-col hover:scale-[1.02] transition-transform duration-200"
    >
      {/* Team color accent bar */}
      <div className="h-0.5 w-full shrink-0" style={{ background: teamColor }} />

      {/* Photo area */}
      <div className="relative h-[128px] overflow-hidden shrink-0">
        {/* Ambient team-color wash */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 90% at 50% 0%, ${teamColor}30, transparent 65%)`,
          }}
        />
        {/* Red tint for "Out" players */}
        {s.severity >= 3 && (
          <div className="absolute inset-0" style={{ background: "rgba(248,113,113,0.04)" }} />
        )}
        {/* Watermark status for "Out" players */}
        {injury.status === "Out" && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center font-[family-name:var(--font-barlow)] font-black select-none opacity-[0.05] text-[4.5rem] tracking-tight"
            style={{ color: "#F87171" }}
          >
            OUT
          </span>
        )}
        {/* Player headshot */}
        {hasPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={injury.headshot}
            alt={injury.name}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[124px] w-auto object-contain object-bottom"
            style={{
              maskImage: "linear-gradient(180deg, black 45%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(180deg, black 45%, transparent 100%)",
            }}
            onError={() => setImgErr(true)}
          />
        ) : (
          // Initials fallback
          <div className="absolute inset-0 flex items-end justify-center pb-5">
            <div
              className="h-14 w-14 rounded-full flex items-center justify-center font-[family-name:var(--font-barlow)] font-black text-xl"
              style={{
                background: `${teamColor}18`,
                border: `1.5px solid ${teamColor}28`,
                color: teamColor,
              }}
            >
              {injury.name.split(" ").slice(-1)[0]?.[0] ?? "?"}
            </div>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="p-3 pt-2 flex flex-col gap-1.5 flex-1">
        {/* Status badge */}
        <span
          className="self-start inline-flex items-center gap-1 text-[8px] font-bold tracking-[0.15em] uppercase rounded-full px-2 py-0.5"
          style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
        >
          <span className="h-1 w-1 rounded-full shrink-0" style={{ background: s.color }} />
          {injury.status || "—"}
        </span>

        {/* Name */}
        <p className="font-[family-name:var(--font-barlow)] font-bold text-sm leading-tight text-[#F5F5F7] truncate group-hover:text-[#D4B560] transition-colors">
          {injury.name}
        </p>

        {/* Team + position */}
        <div className="flex items-center gap-1.5">
          <TeamLogo teamId={meta?.id} abbreviation={injury.teamAbbr} size="xs" />
          <span className="text-[9px] text-[#6E6E76]">{injury.teamAbbr}</span>
          {injury.position && (
            <>
              <span className="text-[#3A3A42] text-[8px]">·</span>
              <span className="text-[9px] text-[#6E6E76]">{injury.position}</span>
            </>
          )}
        </div>

        {/* Injury detail */}
        {(injury.type || injury.detail) && (
          <p className="text-[9px] text-[#8A8A93] truncate leading-snug">
            {[injury.type, injury.detail].filter(Boolean).join(" · ")}
          </p>
        )}

        {/* Return date */}
        {injury.returnDate && (
          <p className="text-[9px] text-[#6E6E76] mt-auto pt-1">
            Return: <span className="text-[#8A8A93]">{injury.returnDate}</span>
          </p>
        )}
      </div>
    </Link>
  );
}

export default function InjuriesPage() {
  const [teams, setTeams] = useState<TeamBlock[]>([]);
  const [teamMeta, setTeamMeta] = useState<TeamMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");

  useEffect(() => {
    Promise.all([
      fetch("/api/injuries").then(r => r.ok ? r.json() : { teams: [] }),
      fetch("/api/teams/with-records").then(r => r.ok ? r.json() : []),
    ])
      .then(([inj, t]) => {
        if (Array.isArray(inj?.teams)) setTeams(inj.teams);
        if (Array.isArray(t)) setTeamMeta(t);
      })
      .finally(() => setLoading(false));
  }, []);

  const metaByAbbr = useMemo(() => {
    const m: Record<string, TeamMeta> = {};
    teamMeta.forEach(t => { m[t.abbreviation] = t; });
    return m;
  }, [teamMeta]);

  // Flatten + sort by severity descending
  const allInjuries = useMemo<FlatInjury[]>(() =>
    teams
      .flatMap(tb =>
        tb.injuries.map(i => ({
          ...i,
          teamAbbr: tb.team,
          teamNameFull: tb.teamName,
          teamMeta: metaByAbbr[tb.team],
        }))
      )
      .sort((a, b) => (STATUS_META[b.status]?.severity ?? 0) - (STATUS_META[a.status]?.severity ?? 0)),
    [teams, metaByAbbr]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: allInjuries.length };
    allInjuries.forEach(i => { c[i.status] = (c[i.status] ?? 0) + 1; });
    return c;
  }, [allInjuries]);

  const filtered = useMemo(() =>
    allInjuries.filter(i => {
      const statusOk = activeStatus === "All" || i.status === activeStatus;
      const q = query.toLowerCase();
      const queryOk = !q || [i.name, i.teamAbbr, i.teamNameFull, i.type, i.detail]
        .some(s => s.toLowerCase().includes(q));
      return statusOk && queryOk;
    }),
    [allInjuries, activeStatus, query]
  );

  const outCount = counts["Out"] ?? 0;
  const dtdCount = (counts["Day-To-Day"] ?? 0) + (counts["Questionable"] ?? 0) + (counts["Doubtful"] ?? 0);
  const probCount = (counts["Probable"] ?? 0) + (counts["Available"] ?? 0);

  return (
    <div className="pb-24 lg:pb-12 premium-fade-in">

      {/* HERO */}
      <section className="brand-glow relative px-4 lg:px-12 pt-10 lg:pt-16 pb-10 overflow-hidden" data-reveal>
        {/* Court grid */}
        <div className="court-grid-bg pointer-events-none absolute inset-0 opacity-20" aria-hidden />
        {/* Subtle red ambient for injury theme */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 50% 60% at 20% 40%, rgba(248,113,113,0.07) 0%, transparent 65%)" }}
          aria-hidden
        />

        <div className="max-w-6xl mx-auto relative">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={12} className="text-[#F87171]" />
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#F87171]">
              Injury Report
            </p>
          </div>

          <h1 className="font-[family-name:var(--font-barlow)] font-black text-[clamp(3rem,8vw,6.5rem)] leading-[0.9] tracking-[-0.04em] text-[#F5F5F7] mb-6">
            Who&apos;s hurt<br />
            <span className="text-[#D4B560]">right now.</span>
          </h1>

          {/* Summary pills */}
          {loading ? (
            <div className="flex gap-3">
              {[80, 64, 80, 64].map((w, i) => (
                <Skeleton key={i} className={`h-10 w-${w === 80 ? "20" : "16"} rounded-full`} />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 mb-5">
              <div className="flex items-center gap-2 rounded-full bg-white/[0.05] border border-white/[0.08] px-4 py-2">
                <AlertTriangle size={11} className="text-[#D4B560]" />
                <span className="font-[family-name:var(--font-barlow)] font-black text-xl text-[#F5F5F7]">{allInjuries.length}</span>
                <span className="text-[9px] text-[#8A8A93] tracking-[0.12em] uppercase font-semibold">Active</span>
              </div>
              {outCount > 0 && (
                <div className="flex items-center gap-2 rounded-full px-4 py-2" style={{ background: "#F8717115", border: "1px solid #F8717128" }}>
                  <span className="font-[family-name:var(--font-barlow)] font-black text-xl" style={{ color: "#F87171" }}>{outCount}</span>
                  <span className="text-[9px] tracking-[0.12em] uppercase font-semibold" style={{ color: "#F87171" }}>Out</span>
                </div>
              )}
              {dtdCount > 0 && (
                <div className="flex items-center gap-2 rounded-full px-4 py-2" style={{ background: "#F59E0B12", border: "1px solid #F59E0B25" }}>
                  <span className="font-[family-name:var(--font-barlow)] font-black text-xl" style={{ color: "#F59E0B" }}>{dtdCount}</span>
                  <span className="text-[9px] tracking-[0.12em] uppercase font-semibold" style={{ color: "#F59E0B" }}>Day-To-Day</span>
                </div>
              )}
              {probCount > 0 && (
                <div className="flex items-center gap-2 rounded-full px-4 py-2" style={{ background: "#34D39910", border: "1px solid #34D39920" }}>
                  <span className="font-[family-name:var(--font-barlow)] font-black text-xl" style={{ color: "#34D399" }}>{probCount}</span>
                  <span className="text-[9px] tracking-[0.12em] uppercase font-semibold" style={{ color: "#34D399" }}>Probable</span>
                </div>
              )}
            </div>
          )}

          <p className="text-sm text-[#6E6E76]">
            Updated every 10 min · ESPN · Sorted by severity
          </p>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="px-4 lg:px-12">
        <div className="max-w-6xl mx-auto h-px divider-shimmer" />
      </div>

      {/* FILTER + SEARCH */}
      <section className="px-4 lg:px-12 py-5" data-reveal data-reveal-delay="1">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Status filter chips */}
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map(s => {
              const active = activeStatus === s;
              const count = s === "All" ? allInjuries.length : (counts[s] ?? 0);
              if (!loading && count === 0 && s !== "All") return null;
              const meta = s !== "All" ? STATUS_META[s] : null;
              const color = meta?.color ?? "#D4B560";
              return (
                <button
                  key={s}
                  onClick={() => setActiveStatus(s)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold tracking-[0.15em] uppercase transition-all duration-200",
                    active
                      ? "shadow-sm"
                      : "text-[#8A8A93] bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.14] hover:text-[#F5F5F7]"
                  )}
                  style={active ? {
                    background: color,
                    border: `1px solid ${color}`,
                    color: "#0A0A0F",
                  } : {}}
                >
                  {s}
                  {!loading && (
                    <span
                      className="tabular-nums text-[9px]"
                      style={active ? { opacity: 0.65 } : { color: "#6E6E76" }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-full px-4 py-2.5 min-w-[220px] focus-within:border-[#D4B560]/40 transition-colors">
            <Search size={12} className="text-[#6E6E76] shrink-0" />
            <input
              type="text"
              placeholder="Player or team..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs text-[#F5F5F7] placeholder:text-[#6E6E76] outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-[#6E6E76] hover:text-[#F5F5F7] transition-colors"
                aria-label="Clear search"
              >
                <X size={11} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* PLAYER GRID */}
      <section className="px-4 lg:px-12 pb-12" data-reveal data-reveal-delay="2">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {Array.from({ length: 24 }).map((_, i) => (
                <Skeleton key={i} className="h-[252px] rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-28">
              <p className="text-5xl mb-4">🏥</p>
              <p className="font-[family-name:var(--font-barlow)] font-black text-2xl text-[#F5F5F7] mb-2">
                {query ? "No matches." : "All clear."}
              </p>
              <p className="text-sm text-[#8A8A93]">
                {query
                  ? `Nothing found for "${query}". Try a different name or team.`
                  : "No injuries reported right now."}
              </p>
              {(query || activeStatus !== "All") && (
                <button
                  onClick={() => { setQuery(""); setActiveStatus("All"); }}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#D4B560] hover:text-white transition-colors"
                >
                  <X size={14} /> Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-[10px] font-medium text-[#6E6E76] tracking-[0.12em] uppercase mb-5">
                {filtered.length} player{filtered.length !== 1 ? "s" : ""}
                {activeStatus !== "All" && ` · ${activeStatus}`}
                {query && ` · "${query}"`}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filtered.map((injury, idx) => (
                  <PlayerCard key={`${injury.teamAbbr}-${injury.name}-${idx}`} injury={injury} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* SOURCE */}
      <section className="px-4 lg:px-12 pb-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] text-[#6E6E76] leading-relaxed">
            Source: ESPN injuries API. Out = ruled out · Doubtful = unlikely · Day-To-Day / Questionable = game-time decision · Probable / Available = expected to play.
          </p>
        </div>
      </section>

    </div>
  );
}
