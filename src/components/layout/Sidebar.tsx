"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Calendar, Users, Shield, BarChart2,
  TrendingUp, Trophy, Newspaper, Star, Settings, Sparkles, ArrowLeftRight, Flame, RadioTower
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/",          label: "Home",        icon: Home },
  { href: "/scores",    label: "Scores",      icon: Calendar },
  { href: "/live",      label: "Live",        icon: RadioTower },
  { href: "/players",   label: "Players",     icon: Users },
  { href: "/teams",     label: "Teams",       icon: Shield },
  { href: "/standings", label: "Standings",   icon: Trophy },
  { href: "/power-rankings", label: "Power Rankings", icon: Flame },
  { href: "/stats",     label: "Stat Leaders",icon: BarChart2 },
  { href: "/compare",   label: "Compare",     icon: ArrowLeftRight },
  { href: "/analytics", label: "Analytics",   icon: TrendingUp, premium: true },
  { href: "/fantasy",   label: "Fantasy",     icon: Star, premium: true },
  { href: "/draft",     label: "Draft",       icon: Users },
  { href: "/news",      label: "News",        icon: Newspaper },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 z-40 hidden lg:flex flex-col bg-[#0A0A0E]">
      {/* Logo — clickable home button with custom mark */}
      <Link
        href="/"
        className="group flex items-center gap-2.5 px-6 py-6 transition-opacity hover:opacity-80"
        aria-label="CourtIQ — Home"
      >
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#0A0A0E] border border-[#D4B560]/40 group-hover:border-[#D4B560]/80 shadow-lg shadow-[#D4B560]/10 group-hover:shadow-[#D4B560]/30 transition-all">
          {/* B monogram — open C ring + focal dot */}
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#D4B560" strokeWidth="2.5" strokeLinecap="round">
            <path d="M17 4 A9 9 0 1 0 17 20" />
            <circle cx="12" cy="12" r="2" fill="#D4B560" stroke="none" />
          </svg>
        </div>
        <span className="font-[family-name:var(--font-barlow)] font-bold text-xl tracking-[-0.04em] text-[#F5F5F7] group-hover:text-[#D4B560] transition-colors">
          Court<span className="text-[#D4B560]">IQ</span>
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, premium }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "bg-white/[0.06] text-[#F5F5F7]"
                  : "text-[#8A8A93] hover:text-[#F5F5F7] hover:bg-white/[0.03]"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-[#D4B560] shadow-[0_0_10px_rgba(212,181,96,0.5)]" />
              )}
              <Icon
                size={17}
                strokeWidth={active ? 2.2 : 1.8}
                className={cn(
                  "transition-colors",
                  active ? "text-[#D4B560]" : "text-[#8A8A93] group-hover:text-[#F5F5F7]"
                )}
              />
              <span className="flex-1 tracking-tight">{label}</span>
              {premium && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#D4B560]/80">
                  Pro
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — cleaner, more premium feel */}
      <div className="p-4 space-y-3">
        <Link
          href="/account"
          className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#8A8A93] hover:text-[#F5F5F7] hover:bg-white/[0.03] transition-all duration-200"
        >
          <Settings size={17} strokeWidth={1.8} className="text-[#8A8A93] group-hover:text-[#F5F5F7] transition-colors" />
          Account
        </Link>

        <Link
          href="/billing"
          className="group block relative overflow-hidden rounded-2xl p-4 border border-[#D4B560]/15 bg-gradient-to-br from-[#D4B560]/10 via-[#D4B560]/5 to-transparent transition-all duration-300 hover:border-[#D4B560]/30 hover:from-[#D4B560]/15"
        >
          <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full bg-[#D4B560]/10 blur-2xl group-hover:bg-[#D4B560]/20 transition-all duration-500" />
          <div className="relative flex items-center gap-1.5 mb-1">
            <Sparkles size={11} className="text-[#D4B560]" />
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#D4B560]">CourtIQ Pro</p>
          </div>
          <p className="relative text-xs text-[#8A8A93] mb-3 leading-relaxed">
            Advanced analytics, prop tools, fantasy edge
          </p>
          <div className="relative flex items-center justify-between text-xs">
            <span className="font-[family-name:var(--font-barlow)] font-bold text-[#F5F5F7]">$9.99<span className="text-[#8A8A93] font-normal">/mo</span></span>
            <span className="text-[#D4B560] font-semibold group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
