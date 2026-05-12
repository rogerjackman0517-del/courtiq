import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 lg:mt-24 border-t border-white/[0.06] bg-[#0A0A0E]">
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">

          {/* Brand */}
          <div className="max-w-md">
            <Link href="/" className="inline-flex items-center gap-2.5 group no-jiggle">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0A0A0E] border border-[#D4B560]/40">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#D4B560" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M17 4 A9 9 0 1 0 17 20" />
                  <circle cx="12" cy="12" r="2" fill="#D4B560" stroke="none" />
                </svg>
              </div>
              <span className="font-[family-name:var(--font-barlow)] font-bold text-xl tracking-[-0.04em] text-[#F5F5F7]">
                Court<span className="text-[#D4B560]">IQ</span>
              </span>
            </Link>
            <p className="text-sm text-[#8A8A93] mt-4 leading-relaxed">
              Real-time NBA stats, scores, and league insights. Built for fans who love the numbers.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-3">
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E6E76]">Explore</p>
              <Link href="/players" className="block text-sm text-[#8A8A93] hover:text-[#F5F5F7]">Players</Link>
              <Link href="/teams" className="block text-sm text-[#8A8A93] hover:text-[#F5F5F7]">Teams</Link>
              <Link href="/scores" className="block text-sm text-[#8A8A93] hover:text-[#F5F5F7]">Scores</Link>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E6E76]">Stats</p>
              <Link href="/standings" className="block text-sm text-[#8A8A93] hover:text-[#F5F5F7]">Standings</Link>
              <Link href="/stats" className="block text-sm text-[#8A8A93] hover:text-[#F5F5F7]">Stat Leaders</Link>
              <Link href="/draft" className="block text-sm text-[#8A8A93] hover:text-[#F5F5F7]">Draft</Link>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E6E76]">Account</p>
              <Link href="/billing" className="block text-sm text-[#8A8A93] hover:text-[#F5F5F7]">Pro</Link>
              <Link href="/news" className="block text-sm text-[#8A8A93] hover:text-[#F5F5F7]">News</Link>
              <Link href="/login" className="block text-sm text-[#8A8A93] hover:text-[#F5F5F7]">Sign in</Link>
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-12 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-[#6E6E76] tracking-wide">
            © {new Date().getFullYear()} CourtIQ. Made by Roger.
          </p>
          <p className="text-xs text-[#6E6E76] tracking-wide">
            Data via NBA.com & ESPN. Not affiliated with the NBA.
          </p>
        </div>
      </div>
    </footer>
  );
}
