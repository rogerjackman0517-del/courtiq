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
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#111118] border-t border-white/[0.06] pb-safe">
      <div className="flex items-center">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                active ? "text-[#C8A84B]" : "text-[#888899]"
              )}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
