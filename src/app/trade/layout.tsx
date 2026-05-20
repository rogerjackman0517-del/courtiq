import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trade Machine",
  description: "Swap any two NBA players and see the projected impact on standings and wins.",
};

export default function TradeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
