import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scores",
  description: "NBA scores and schedule for today and any date — boxscores, leaders, live updates.",
};

export default function ScoresLayout({ children }: { children: React.ReactNode }) {
  return children;
}
