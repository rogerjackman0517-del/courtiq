import Link from "next/link";
import { Download } from "lucide-react";

export const metadata = {
  title: "Press kit",
  description: "Logos, screenshots, and product details for CourtIQ.",
};

const ASSETS = [
  { label: "Logo · gold mark", href: "/icon.svg", mono: false },
  { label: "Favicon", href: "/favicon.ico", mono: false },
];

const FACTS = [
  ["Launched", "2026"],
  ["Built by", "Roger Jackman (Portland, OR)"],
  ["Stack", "Next.js · Tailwind · FastAPI · Upstash · Clerk · Stripe"],
  ["Data", "NBA.com (via nba_api) · ESPN"],
  ["Players tracked", "150 active"],
  ["Pro pricing", "$9.99 / month"],
];

export default function PressPage() {
  return (
    <div className="pb-24 lg:pb-12 premium-fade-in">
      <section className="brand-glow px-4 lg:px-12 pt-10 lg:pt-20 pb-10" data-reveal>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D4B560] mb-3">
            Press kit
          </p>
          <h1 className="font-[family-name:var(--font-barlow)] font-black text-5xl lg:text-7xl tracking-[-0.04em] text-[#F5F5F7] mb-4 leading-[0.95]">
            One line.
            <br />
            <span className="text-[#D4B560]">Many numbers.</span>
          </h1>
          <p className="text-base lg:text-lg text-[#8A8A93] max-w-xl">
            Everything you need to write about, embed, or link to CourtIQ.
          </p>
        </div>
      </section>

      <section className="px-4 lg:px-12 max-w-3xl mx-auto space-y-10" data-reveal data-reveal-delay="1">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76] mb-3">
            One-liner
          </p>
          <p className="text-lg text-[#F5F5F7] leading-relaxed">
            CourtIQ is an NBA stats and scoreboard product with player profiles, a
            playoff bracket, a trade machine, and a Pro analytics tier — built for
            fans who love the numbers.
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76] mb-3">
            Fast facts
          </p>
          <dl className="floating-card no-jiggle rounded-2xl bg-gradient-to-br from-[#1C1C24] to-[#131318] divide-y divide-white/[0.04]">
            {FACTS.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between px-5 py-3 gap-4">
                <dt className="text-xs uppercase tracking-[0.15em] text-[#8A8A93]">{k}</dt>
                <dd className="text-sm text-[#F5F5F7] text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76] mb-3">
            Brand assets
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ASSETS.map((a) => (
              <a
                key={a.href}
                href={a.href}
                download
                className="floating-card no-jiggle rounded-2xl bg-gradient-to-br from-[#1C1C24] to-[#131318] p-5 flex items-center justify-between gap-4 group"
              >
                <span className="text-sm text-[#F5F5F7] font-medium">{a.label}</span>
                <Download size={14} className="text-[#6E6E76] group-hover:text-[#D4B560] transition-colors" />
              </a>
            ))}
          </div>
        </div>

        <div className="floating-card no-jiggle rounded-2xl p-6">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4B560] mb-2">
            Contact
          </p>
          <p className="text-sm text-[#F5F5F7] mb-1">
            Roger Jackman ·{" "}
            <Link href="/about" className="underline decoration-dotted underline-offset-2 hover:text-[#D4B560]">
              about
            </Link>
          </p>
          <p className="text-xs text-[#8A8A93]">
            For media inquiries, hit Roger on his linked socials in the footer.
          </p>
        </div>
      </section>
    </div>
  );
}
