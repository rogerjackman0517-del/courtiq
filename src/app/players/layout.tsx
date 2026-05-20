import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Players",
  description: "Every active NBA player with per-game stats, search, sort, and full season trends.",
};

export default function PlayersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
