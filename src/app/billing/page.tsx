import { Check, Zap } from "lucide-react";
import { CheckoutButton } from "@/components/billing/CheckoutButton";
import { ManageSubscriptionButton } from "@/components/billing/ManageSubscriptionButton";
import { auth } from "@clerk/nextjs/server";

const FREE_FEATURES = [
  "Live scores & schedules",
  "Basic player stats",
  "Conference standings",
  "NBA news & transactions",
  "Team rosters & records",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Advanced stats (PER, BPM, VORP, Win Shares)",
  "Full game logs & career stats",
  "Shot chart visualizations",
  "Lineup explorer & on/off splits",
  "Clutch performance stats",
  "Prop bet analyzer & hit rates",
  "Fantasy start/sit advisor",
  "Waiver wire recommendations",
  "Trade analyzer",
  "Ad-free experience",
  "CSV data exports",
  "Email alerts for your players",
];

export default async function BillingPage() {
  const { sessionClaims } = await auth();
  const isPro = (sessionClaims?.metadata as Record<string, unknown> | undefined)?.subscriptionStatus === "active";

  return (
    <div className="px-4 lg:px-8 py-10 pb-24 lg:pb-10 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#C8A84B] bg-[#C8A84B]/10 px-3 py-1.5 rounded-full mb-4">
          <Zap size={12} /> Upgrade to Pro
        </div>
        <h1 className="font-[family-name:var(--font-barlow)] font-black text-5xl text-[#F0F0F0] mb-3">
          The full CourtIQ experience
        </h1>
        <p className="text-[#888899] max-w-md mx-auto">
          Serious fans, bettors, and fantasy players use Pro tools. Join thousands of subscribers who get an edge every day.
        </p>
        {isPro && (
          <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-4 py-2 rounded-full">
            ✓ You&apos;re on Pro — all features unlocked
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Free tier */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#111118] p-7">
          <div className="mb-6">
            <p className="text-sm font-semibold text-[#888899] mb-1">Free</p>
            <div className="flex items-end gap-2">
              <span className="font-[family-name:var(--font-barlow)] font-black text-5xl text-[#F0F0F0]">$0</span>
              <span className="text-[#888899] mb-1">/month</span>
            </div>
            <p className="text-xs text-[#888899] mt-1">No credit card required</p>
          </div>
          <ul className="space-y-2.5 mb-7">
            {FREE_FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-[#888899]">
                <Check size={15} className="text-[#888899] shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <button disabled className="w-full py-3 rounded-xl border border-white/[0.12] text-sm font-bold text-[#888899] cursor-default">
            Current Plan
          </button>
        </div>

        {/* Pro tier */}
        <div className="relative rounded-2xl border border-[#C8A84B]/40 bg-gradient-to-br from-[#C8A84B]/10 to-[#111118] p-7 overflow-hidden">
          <div className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-wider text-black bg-[#C8A84B] px-2.5 py-1 rounded-full">
            Most Popular
          </div>
          <div className="mb-6">
            <p className="text-sm font-semibold text-[#C8A84B] mb-1">Pro</p>
            <div className="flex items-end gap-2">
              <span className="font-[family-name:var(--font-barlow)] font-black text-5xl text-[#F0F0F0]">$9.99</span>
              <span className="text-[#888899] mb-1">/month</span>
            </div>
            <p className="text-xs text-[#888899] mt-1">
              or <span className="text-[#C8A84B] font-bold">$79/year</span> — save 34%
            </p>
          </div>
          <ul className="space-y-2.5 mb-7">
            {PRO_FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-[#F0F0F0]">
                <Check size={15} className="text-[#C8A84B] shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <div className="space-y-3">
            {isPro ? (
              <ManageSubscriptionButton />
            ) : (
              <>
                <CheckoutButton plan="monthly" label="Start 7-Day Free Trial — $9.99/mo" />
                <CheckoutButton plan="annual"  label="Get Annual Plan — $79/yr (save 34%)" variant="outline" />
              </>
            )}
          </div>
          <p className="text-center text-[10px] text-[#888899] mt-3">
            Cancel anytime · No commitment
          </p>
        </div>
      </div>

      {/* Trust signals */}
      <div className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-white/[0.06] text-center">
        {[
          { num: "10,000+", label: "Active subscribers" },
          { num: "99.9%",   label: "Uptime SLA" },
          { num: "4.8★",    label: "Average rating" },
        ].map(({ num, label }) => (
          <div key={label}>
            <p className="font-[family-name:var(--font-barlow)] font-black text-3xl text-[#C8A84B]">{num}</p>
            <p className="text-xs text-[#888899] mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
