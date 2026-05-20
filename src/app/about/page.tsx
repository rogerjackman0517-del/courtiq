import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata = {
  title: "About",
  description: "The story behind CourtIQ — NBA stats, scores, and league insights built by Roger Jackman.",
};

export default function AboutPage() {
  return (
    <div className="pb-24 lg:pb-12 premium-fade-in">
      <section className="brand-glow px-4 lg:px-12 pt-10 lg:pt-20 pb-12" data-reveal>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D4B560] mb-3">
            About
          </p>
          <h1 className="font-[family-name:var(--font-barlow)] font-black text-5xl lg:text-7xl tracking-[-0.04em] text-[#F5F5F7] mb-6 leading-[0.95]">
            For fans who love <span className="text-[#D4B560]">the numbers.</span>
          </h1>
        </div>
      </section>

      <section className="px-4 lg:px-12 max-w-3xl mx-auto space-y-6 text-[#F5F5F7] leading-relaxed text-base lg:text-lg" data-reveal data-reveal-delay="1">
        <p>
          CourtIQ is an NBA stats and scores dashboard built by{" "}
          <span className="font-medium">Roger Jackman</span>, a Knicks fan based in
          Portland, Oregon. It started as a way to track the league with the kind of
          analytics typically locked behind paywalls — and turned into a full product
          with scoreboards, player profiles, a trade machine, a playoff bracket, and
          a Pro tier on the way.
        </p>
        <p>
          Every page pulls live data from NBA.com via{" "}
          <a
            href="https://github.com/swar/nba_api"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted underline-offset-2 hover:text-[#D4B560]"
          >
            nba_api
          </a>{" "}
          and ESPN&apos;s public endpoints. The frontend is Next.js + Tailwind, the
          backend is FastAPI on Railway with Upstash Redis caching, auth runs on
          Clerk, and payments are wired through Stripe.
        </p>
        <p>
          Built to feel premium without being precious. Numbers up front, motion
          where it matters, no clutter. If it slows you down, it&apos;s gone.
        </p>
        <p className="text-sm text-[#8A8A93]">
          Have feedback? File a GitHub issue or DM Roger directly.
        </p>
      </section>

      <section className="px-4 lg:px-12 max-w-3xl mx-auto mt-12" data-reveal data-reveal-delay="2">
        <div className="floating-card no-jiggle rounded-3xl p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4B560] mb-1">
              For press / media
            </p>
            <p className="font-[family-name:var(--font-barlow)] font-bold text-xl text-[#F5F5F7]">
              Get the press kit
            </p>
          </div>
          <Link
            href="/press"
            className="inline-flex items-center gap-2 bg-[#F5F5F7] text-[#0A0A0E] text-sm font-semibold tracking-tight px-5 py-2.5 rounded-full hover:bg-white"
          >
            Press kit
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
