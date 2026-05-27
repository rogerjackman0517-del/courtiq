"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Users, BarChart2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/",          label: "Home",    icon: Home },
  { href: "/scores",    label: "Scores",  icon: Calendar },
  { href: "/players",   label: "Players", icon: Users },
  { href: "/stats",     label: "Stats",   icon: BarChart2 },
  { href: "/news",      label: "More",    icon: MoreHorizontal },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#0E0E14]/90 backdrop-blur-xl border-t border-white/[0.06] pb-safe">
      <div className="flex items-center">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 pt-2 pb-1.5 text-[10px] font-medium transition-all duration-200",
                active ? "text-[#D4B560]" : "text-[#666672] hover:text-[#F5F5F7]"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-11 h-7 rounded-xl transition-all duration-200",
                active ? "bg-[#D4B560]/12 shadow-[0_0_12px_rgba(212,181,96,0.15)]" : ""
              )}>
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              </div>
              <span className={cn("tracking-wide", active ? "font-semibold" : "")}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
