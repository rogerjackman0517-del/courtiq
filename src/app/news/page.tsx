"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, AlertCircle } from "lucide-react";
import { NewsCardSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

type NewsItem = {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  image: string;
};

function formatTime(pubDate: string): string {
  if (!pubDate) return "";
  const d = new Date(pubDate);
  if (isNaN(d.getTime())) return pubDate;
  const diffMs = Math.max(0, Date.now() - d.getTime());
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function categorize(title: string): string {
  const t = title.toLowerCase();
  if (/injur|out for|miss|return|surgery|sidelin/.test(t)) return "Injury";
  if (/trade|sign|waive|deal|extension|contract|agree/.test(t)) return "Transaction";
  if (/playoff|finals|game [0-9]|series|sweep|elimin/.test(t)) return "Playoffs";
  if (/mvp|award|all-nba|all-star|hall of fame/.test(t)) return "Awards";
  return "News";
}

const catColor: Record<string, string> = {
  Injury:      "text-[#F87171] bg-[#F87171]/10 border-[#F87171]/20",
  Transaction: "text-[#5B8DEF] bg-[#5B8DEF]/10 border-[#5B8DEF]/20",
  Playoffs:    "text-[#D4B560] bg-[#D4B560]/10 border-[#D4B560]/20",
  Awards:      "text-[#A855F7] bg-[#A855F7]/10 border-[#A855F7]/20",
  News:        "text-[#8A8A93] bg-white/[0.04] border-white/[0.06]",
};

function NewsCard({ item, isFeatured }: { item: NewsItem; isFeatured?: boolean }) {
  const cat = categorize(item.title);
  return (
    <Anchor
      href={item.link}
      className={cn(
        "floating-card group block rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] overflow-hidden transition-all duration-500 hover:scale-[1.01]",
        isFeatured ? "lg:flex lg:items-stretch" : ""
      )}
    >
      {item.image && (
        <div className={cn(
          "shrink-0 bg-[#0A0A0E] overflow-hidden",
          isFeatured ? "lg:w-1/2 lg:max-w-md h-48 lg:h-auto" : "h-40"
        )}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image}
            alt=""
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-6 flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-3">
          <span className={cn("text-[10px] font-bold tracking-[0.15em] uppercase px-2 py-1 rounded-full border", catColor[cat])}>
            {cat}
          </span>
          <span className="text-[10px] text-[#6E6E76] tracking-wide">{formatTime(item.pubDate)}</span>
        </div>
        <h3 className={cn(
          "font-[family-name:var(--font-barlow)] font-bold text-[#F5F5F7] group-hover:text-[#D4B560] tracking-tight leading-tight mb-2 transition-colors",
          isFeatured ? "text-2xl lg:text-3xl" : "text-lg"
        )}>
          {item.title}
        </h3>
        {item.description && (
          <p className="text-sm text-[#8A8A93] leading-relaxed line-clamp-2">{item.description}</p>
        )}
        <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-[#6E6E76] group-hover:text-[#D4B560] transition-colors">
          Read on ESPN <ArrowUpRight size={12} />
        </div>
      </div>
    </Anchor>
  );
}

// Wrapper to prevent the heredoc paste bug from eating bare <a> tags
function Anchor(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props} target="_blank" rel="noopener noreferrer" />;
}

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/news")
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
      .then(d => {
        if (cancelled) return;
        if (Array.isArray(d)) { setItems(d); setError(null); }
        else { setError("Unexpected response"); }
      })
      .catch(e => { if (!cancelled) setError(String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const injuryItems = items.filter(i => categorize(i.title) === "Injury").slice(0, 5);
  const featured = items[0];
  const rest = items.slice(1);

  return (
    <div className="pb-24 lg:pb-12 premium-fade-in">

      {/* HERO */}
      <section className="px-6 lg:px-12 pt-16 lg:pt-20 pb-12" data-reveal>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8A8A93] mb-3">
            News
          </p>
          <h1 className="font-[family-name:var(--font-barlow)] font-black text-5xl lg:text-7xl tracking-[-0.04em] text-[#F5F5F7] mb-4 leading-[0.95]">
            What&apos;s happening<br />
            <span className="text-[#D4B560]">in the league.</span>
          </h1>
          <p className="text-base lg:text-lg text-[#8A8A93] max-w-xl leading-relaxed">
            {loading ? "Loading headlines…" : `${items.length} headlines from across the NBA. Powered by ESPN.`}
          </p>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="px-4 lg:px-12">
        <div className="max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {error && (
        <div className="px-6 lg:px-12 max-w-6xl mx-auto mt-8">
          <div className="rounded-2xl border border-[#F87171]/30 bg-[#F87171]/10 px-5 py-4 text-sm text-[#F87171]">
            Failed to load: {error}
          </div>
        </div>
      )}

      {loading && (
        <section className="px-4 lg:px-12 py-8 lg:py-16">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <NewsCardSkeleton featured />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <NewsCardSkeleton key={"news-skel-" + i} />)}
              </div>
            </div>
          </div>
        </section>
      )}

      {!loading && items.length === 0 && !error && (
        <div className="px-6 lg:px-12 py-16 text-center text-[#8A8A93]">No news available.</div>
      )}

      {!loading && items.length > 0 && (
        <section className="px-4 lg:px-12 py-8 lg:py-16" data-reveal data-reveal-delay="1">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main feed */}
            <div className="lg:col-span-2 space-y-4">
              {featured && <NewsCard item={featured} isFeatured />}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rest.slice(0, 12).map((item, i) => (
                  <NewsCard key={i} item={item} />
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-4">
              <div className="floating-card rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] overflow-hidden sticky top-20">
                <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
                  <AlertCircle size={14} className="text-[#F87171]" />
                  <h2 className="font-[family-name:var(--font-barlow)] font-bold text-sm tracking-tight text-[#F5F5F7]">
                    Injury Watch
                  </h2>
                </div>
                {injuryItems.length === 0 ? (
                  <div className="px-5 py-8 text-xs text-[#6E6E76] text-center tracking-wide">No injury news right now.</div>
                ) : (
                  <div>
                    {injuryItems.map((item, i) => (
                      <Anchor
                        key={i}
                        href={item.link}
                        className={cn(
                          "block px-5 py-3.5 transition-colors hover:bg-white/[0.02]",
                          i !== injuryItems.length - 1 && "border-b border-white/[0.04]"
                        )}
                      >
                        <p className="text-xs font-semibold text-[#F5F5F7] leading-snug mb-1 tracking-tight line-clamp-2">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-[#6E6E76] tracking-wide">{formatTime(item.pubDate)}</p>
                      </Anchor>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-[#1C1C24]/50 px-5 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E6E76] mb-1.5">Source</p>
                <p className="text-xs text-[#8A8A93] tracking-wide leading-relaxed">
                  Headlines pulled from ESPN&apos;s NBA feed. Click any story to read the full article.
                </p>
              </div>
            </aside>

          </div>
        </section>
      )}
    </div>
  );
}
