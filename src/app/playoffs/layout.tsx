import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "2026 NBA Playoffs Bracket",
  description: "Live 2026 NBA playoffs bracket — Eastern + Western Conference series scores and Finals projection.",
};

export default function PlayoffsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
