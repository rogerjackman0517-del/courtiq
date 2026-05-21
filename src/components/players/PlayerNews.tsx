"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

type News = { title: string; link: string; published: string };

function timeAgo(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const mins = Math.max(0, Math.round((Date.now() - d.getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export function PlayerNews({ name }: { name: string }) {
  const [items, setItems] = useState<News[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/player-news?name=${encodeURIComponent(name)}`)
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data) => { if (!cancelled) setItems(data.items ?? []); })
      .finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, [name]);

  if (!loaded || items.length === 0) return null;

  return (
    <div className="floating-card no-jiggle rounded-3xl p-6 lg:p-8 mb-8">
      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4B560] mb-4">
        Latest news
      </p>
      <ul className="space-y-3">
        {items.map((n, i) => (
          <li key={i}>
            <a
              href={n.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3"
            >
              <ExternalLink size={12} className="text-[#6E6E76] mt-1.5 shrink-0 group-hover:text-[#D4B560]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#F5F5F7] group-hover:text-[#D4B560] transition-colors leading-snug">
                  {n.title}
                </p>
                <p className="text-[11px] text-[#6E6E76] mt-0.5">{timeAgo(n.published)}</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
