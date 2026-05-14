"use client";

import { useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  className?: string;
  strength?: number;
  children: React.ReactNode;
};

export function MagneticButton({ href, className, strength = 14, children }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);

  function handleMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    el.style.transform = `translate(${(x * strength).toFixed(2)}px, ${(y * strength).toFixed(2)}px)`;
  }

  function handleLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0, 0)";
  }

  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={cn("magnetic-btn no-jiggle inline-flex items-center gap-2", className)}
    >
      {children}
    </Link>
  );
}
