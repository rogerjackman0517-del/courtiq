import Link from "next/link";
import { Lock, TrendingUp, Users, Target, Zap } from "lucide-react";

const FEATURES = [
  { icon: Target, title: "Shot Quality Analysis", description: "League-wide shot quality charts, expected vs. actual efficiency breakdowns." },
  { icon: TrendingUp, title: "Pace & Space", description: "Team offensive system analysis — 3PT rate, paint touches, transition frequency." },
  { icon: Users, title: "Lineup Explorer", description: "Best and worst 5-man lineup combinations by net rating and minutes." },
  { icon: Zap, title: "On/Off Splits", description: "How each team performs with or without any player on the court." },
  { icon: Target, title: "Clutch Stats", description: "Performance in final 5 minutes within 5 points — who shows up when it matters." },
  { icon: TrendingUp, title: "Prop Bet Analyzer", description: "Player prop hit rates vs. current lines. Find the edges before games tip off." },
];

export default function AnalyticsPage() {
  return (
    <div className="px-4 lg:px-8 py-6 pb-24 lg:pb-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C8A84B] bg-[#C8A84B]/10 px-2 py-1 rounded-full">Pro Feature</span>
        </div>
        <h1 className="font-[family-name:var(--font-barlow)] font-black text-4xl text-[#F0F0F0] uppercase tracking-wide mb-2">
          Analytics Hub
        </h1>
        <p className="text-sm text-[#888899] max-w-lg">
          Advanced team and player analytics for serious fans, bettors, and fantasy players. Upgrade to Pro to unlock all tools.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="relative rounded-xl border border-white/[0.06] bg-[#111118] p-5 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#C8A84B]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#C8A84B]/10 shrink-0">
                <Icon size={18} className="text-[#C8A84B]" />
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-barlow)] font-bold text-base text-[#F0F0F0] mb-1">{title}</h3>
                <p className="text-xs text-[#888899] leading-relaxed">{description}</p>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0F]/80 backdrop-blur-[2px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2 text-sm font-bold text-[#C8A84B]">
                <Lock size={14} /> Upgrade to unlock
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upsell */}
      <div className="rounded-2xl border border-[#C8A84B]/30 bg-gradient-to-br from-[#C8A84B]/10 to-[#4B7BE8]/5 p-8 text-center max-w-lg mx-auto">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#C8A84B]/20 mx-auto mb-4">
          <Zap size={22} className="text-[#C8A84B]" />
        </div>
        <h2 className="font-[family-name:var(--font-barlow)] font-black text-2xl text-[#F0F0F0] mb-2">
          Unlock CourtIQ Pro
        </h2>
        <p className="text-sm text-[#888899] mb-6">
          Advanced analytics, prop bet tools, fantasy lineup optimizer, ad-free experience, and CSV exports.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <Link
            href="/billing"
            className="bg-[#C8A84B] text-black text-sm font-black px-8 py-3 rounded-xl hover:bg-[#D4B55F] transition-colors"
          >
            $9.99/mo — Start Free Trial
          </Link>
          <Link href="/billing" className="text-xs text-[#888899] hover:text-[#F0F0F0] transition-colors">
            or $79/yr (save 34%)
          </Link>
        </div>
      </div>
    </div>
  );
}
