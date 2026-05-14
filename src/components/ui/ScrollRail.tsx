"use client";

import { useEffect, useState } from "react";

type Section = { id: string; label: string };

export function ScrollRail({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const scrollEl = document.querySelector("main");
    if (!scrollEl) return;

    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { root: scrollEl, threshold: [0.25, 0.5, 0.75], rootMargin: "-30% 0px -45% 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav
      aria-label="Page sections"
      className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-30 flex-col items-end gap-3"
    >
      {sections.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => scrollTo(s.id)}
          className="group flex items-center gap-3 no-jiggle"
          aria-label={`Jump to ${s.label}`}
          aria-current={active === s.id ? "true" : undefined}
        >
          <span
            className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-opacity ${
              active === s.id ? "opacity-100 text-[#D4B560]" : "opacity-0 group-hover:opacity-60 text-[#8A8A93]"
            }`}
          >
            {s.label}
          </span>
          <span className={`scroll-dot ${active === s.id ? "active" : ""}`} />
        </button>
      ))}
    </nav>
  );
}
