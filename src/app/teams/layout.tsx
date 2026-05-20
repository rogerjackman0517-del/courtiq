import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teams",
  description: "All 30 NBA teams with records, streaks, and playoff position.",
};

export default function TeamsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
