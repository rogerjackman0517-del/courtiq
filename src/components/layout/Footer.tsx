import Link from "next/link";

function GithubMark() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.26 5.68.41.35.78 1.05.78 2.12v3.14c0 .31.21.67.8.56C20.22 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function TwitterMark() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2H21l-6.52 7.45L22 22h-5.97l-4.68-6.13L5.95 22H3.19l6.97-7.97L2 2h6.09l4.24 5.62L18.244 2Zm-2.09 18h1.66L7.94 4H6.18l9.97 16Z" />
    </svg>
  );
}

function LinkedinMark() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.22 22.5h4.56V8.06H.22V22.5ZM7.86 8.06h4.37v1.97h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.47 3.04 5.47 7v7.84h-4.56v-6.95c0-1.66-.03-3.79-2.31-3.79-2.31 0-2.67 1.81-2.67 3.67v7.07H7.86V8.06Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="relative mt-16 lg:mt-24 border-t border-white/[0.06] bg-[#0A0A0E]">
      {/* Gold gradient shimmer line at the top, matching section dividers */}
      <div className="absolute top-0 left-0 right-0 h-px divider-shimmer" />

      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">

          {/* Brand */}
          <div className="max-w-md">
            <Link href="/" className="inline-flex items-center gap-2.5 group no-jiggle">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0A0A0E] border border-[#D4B560]/40 shadow-lg shadow-[#D4B560]/10 group-hover:border-[#D4B560]/80 group-hover:shadow-[#D4B560]/25 transition-all">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#D4B560" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M17 4 A9 9 0 1 0 17 20" />
                  <circle cx="12" cy="12" r="2" fill="#D4B560" stroke="none" />
                </svg>
              </div>
              <span className="font-[family-name:var(--font-barlow)] font-bold text-xl tracking-[-0.04em] text-[#F5F5F7] text-shine">
                Court<span className="text-[#D4B560]" style={{ WebkitTextFillColor: "#D4B560" }}>IQ</span>
              </span>
            </Link>
            <p className="text-sm text-[#8A8A93] mt-4 leading-relaxed max-w-sm">
              Real-time NBA stats, scores, and league insights. Built for fans who love the numbers.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-2">
            <div>
              <p className="section-label ml-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E6E76] mb-3">Explore</p>
              <Link href="/players" className="flex items-center min-h-[36px] text-sm text-[#8A8A93] hover:text-[#F5F5F7] transition-colors">Players</Link>
              <Link href="/teams" className="flex items-center min-h-[36px] text-sm text-[#8A8A93] hover:text-[#F5F5F7] transition-colors">Teams</Link>
              <Link href="/scores" className="flex items-center min-h-[36px] text-sm text-[#8A8A93] hover:text-[#F5F5F7] transition-colors">Scores</Link>
            </div>
            <div>
              <p className="section-label ml-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E6E76] mb-3">Stats</p>
              <Link href="/standings" className="flex items-center min-h-[36px] text-sm text-[#8A8A93] hover:text-[#F5F5F7] transition-colors">Standings</Link>
              <Link href="/stats" className="flex items-center min-h-[36px] text-sm text-[#8A8A93] hover:text-[#F5F5F7] transition-colors">Stat Leaders</Link>
              <Link href="/draft" className="flex items-center min-h-[36px] text-sm text-[#8A8A93] hover:text-[#F5F5F7] transition-colors">Draft</Link>
            </div>
            <div>
              <p className="section-label ml-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E6E76] mb-3">Account</p>
              <Link href="/billing" className="flex items-center min-h-[36px] text-sm text-[#8A8A93] hover:text-[#F5F5F7] transition-colors">Pro</Link>
              <Link href="/news" className="flex items-center min-h-[36px] text-sm text-[#8A8A93] hover:text-[#F5F5F7] transition-colors">News</Link>
              <Link href="/login" className="flex items-center min-h-[36px] text-sm text-[#8A8A93] hover:text-[#F5F5F7] transition-colors">Sign in</Link>
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-12 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-xs text-[#6E6E76] tracking-wide">
              © {new Date().getFullYear()} CourtIQ. Built by{" "}
              <span className="text-[#F5F5F7] font-medium">Roger Jackman</span>.
            </p>
            <div className="flex items-center gap-1">
              <a
                href="https://github.com/rogerjackman0517-del/courtiq"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#6E6E76] hover:text-[#D4B560] hover:bg-[#D4B560]/[0.08] hover:shadow-[0_0_12px_rgba(212,181,96,0.18)] transition-all"
                aria-label="GitHub"
              >
                <GithubMark />
              </a>
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#6E6E76] hover:text-[#D4B560] hover:bg-[#D4B560]/[0.08] hover:shadow-[0_0_12px_rgba(212,181,96,0.18)] transition-all"
                aria-label="Twitter"
              >
                <TwitterMark />
              </a>
              <a
                href="https://linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#6E6E76] hover:text-[#D4B560] hover:bg-[#D4B560]/[0.08] hover:shadow-[0_0_12px_rgba(212,181,96,0.18)] transition-all"
                aria-label="LinkedIn"
              >
                <LinkedinMark />
              </a>
            </div>
          </div>
          <p className="text-xs text-[#6E6E76] tracking-wide">
            Data via NBA.com &amp; ESPN. Not affiliated with the NBA.
          </p>
        </div>
      </div>
    </footer>
  );
}
