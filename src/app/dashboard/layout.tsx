import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your dashboard",
  description: "Your favorite team, pinned players, and bracket picks on CourtIQ.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
