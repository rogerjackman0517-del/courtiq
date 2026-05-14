"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-[#6E6E76]">
      {items.map((c, i) => {
        const last = i === items.length - 1;
        const content = last ? (
          <span aria-current="page" className="text-[#F5F5F7] font-medium">{c.label}</span>
        ) : c.href ? (
          <Link href={c.href} className="hover:text-[#F5F5F7] transition-colors">{c.label}</Link>
        ) : (
          <span>{c.label}</span>
        );
        return (
          <span key={i} className="inline-flex items-center gap-1.5">
            {content}
            {!last && <ChevronRight size={11} className="text-[#3A3A42]" />}
          </span>
        );
      })}
    </nav>
  );
}
