import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare",
  description: "Compare any two active NBA players side-by-side with a radar of strengths and a stat-by-stat verdict.",
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
