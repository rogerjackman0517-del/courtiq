import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Standings",
  description: "Live NBA standings, games back, playoff positioning, hot streaks and remaining schedule strength.",
};

export default function StandingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
