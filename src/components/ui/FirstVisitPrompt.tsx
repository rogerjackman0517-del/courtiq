"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { TeamLogo } from "@/components/teams/TeamLogo";
import { useFavoriteTeam } from "@/lib/useFavoriteTeam";

const PICKED_KEY = "courtiq-team-picked";

type TeamOption = {
  id: number;
  abbreviation: string;
  city: string;
  name: string;
  primaryColor?: string;
};

export function FirstVisitPrompt({ teams }: { teams: TeamOption[] }) {
  const [show, setShow] = useState(false);
  const [visible, setVisible] = useState(false);
  const { setTeam } = useFavoriteTeam();

  useEffect(() => {
    try {
      if (!localStorage.getItem(PICKED_KEY)) {
        const t = setTimeout(() => {
          setShow(true);
          requestAnimationFrame(() => setVisible(true));
        }, 900);
        return () => clearTimeout(t);
      }
    } catch { /* ignore */ }
  }, []);

  function pick(abbr: string) {
    setTeam(abbr);
    dismiss();
  }

  function dismiss() {
    setVisible(false);
    setTimeout(() => setShow(false), 350);
    try { localStorage.setItem(PICKED_KEY, "1"); } catch { /* ignore */ }
  }

  if (!show || teams.length === 0) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={dismiss}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-[#131318] border-t border-white/[0.08] shadow-2xl transition-transform duration-350 ease-out"
        style={{ transform: visible ? "translateY(0)" : "translateY(100%)" }}
      >
        <div className="px-5 pt-5 pb-safe pb-8 max-w-2xl mx-auto">
          {/* Handle */}
          <div className="mx-auto h-1 w-10 rounded-full bg-white/[0.12] mb-5" />

          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="font-[family-name:var(--font-barlow)] font-black text-2xl tracking-tight text-[#F5F5F7]">
                Pick your team.
              </p>
              <p className="text-sm text-[#8A8A93] mt-1">
                We&apos;ll always show their game first.
              </p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="p-2 text-[#6E6E76] hover:text-[#F5F5F7] transition-colors"
              aria-label="Skip"
            >
              <X size={16} />
            </button>
          </div>

          {/* Team grid */}
          <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 mb-5">
            {teams.map((t) => (
              <button
                key={t.abbreviation}
                type="button"
                onClick={() => pick(t.abbreviation)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/[0.05] active:bg-white/[0.08] transition-colors group"
                title={`${t.city} ${t.name}`}
              >
                <TeamLogo
                  teamId={t.id}
                  abbreviation={t.abbreviation}
                  primaryColor={t.primaryColor}
                  size="sm"
                  className="group-hover:scale-110 transition-transform"
                />
                <span className="text-[9px] font-bold tracking-wider text-[#6E6E76] group-hover:text-[#F5F5F7] transition-colors">
                  {t.abbreviation}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={dismiss}
            className="w-full text-xs text-[#6E6E76] hover:text-[#F5F5F7] transition-colors py-2"
          >
            Skip — I&apos;ll decide later
          </button>
        </div>
      </div>
    </>
  );
}
