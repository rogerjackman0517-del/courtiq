"use client";

import Link from "next/link";
import { Lock, Sparkles, ArrowUpRight } from "lucide-react";

type Props = {
  title: string;
  description: string;
  features?: string[];
};

export function ProPaywall({ title, description, features }: Props) {
  return (
    <div className="px-4 lg:px-12 pt-10 lg:pt-16 pb-20 max-w-3xl mx-auto">
      <div className="floating-card relative overflow-hidden rounded-3xl p-8 lg:p-12 text-center">
        {/* Soft gold halo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(212,181,96,0.18) 0%, transparent 70%)",
          }}
        />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4B560]/30 bg-[#D4B560]/10 px-3 py-1 mb-6">
            <Lock size={12} className="text-[#D4B560]" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4B560]">
              Pro feature
            </span>
          </div>

          <h1 className="font-[family-name:var(--font-barlow)] font-black text-3xl lg:text-5xl leading-tight tracking-[-0.03em] text-[#F5F5F7] mb-3">
            {title}
          </h1>
          <p className="text-base lg:text-lg text-[#8A8A93] max-w-xl mx-auto leading-relaxed mb-8">
            {description}
          </p>

          {features && features.length > 0 && (
            <ul className="text-left mx-auto max-w-md mb-8 space-y-2">
              {features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2.5 text-sm text-[#F5F5F7]"
                >
                  <Sparkles
                    size={13}
                    className="text-[#D4B560] mt-0.5 shrink-0"
                  />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/billing"
              className="ripple inline-flex items-center gap-2 bg-[#F5F5F7] text-[#0A0A0E] text-sm font-semibold tracking-tight px-6 py-3 rounded-full hover:bg-white transition-all duration-300 no-jiggle"
            >
              Upgrade to Pro
              <ArrowUpRight size={14} />
            </Link>
            <Link
              href="/"
              className="text-sm font-semibold tracking-tight text-[#8A8A93] hover:text-[#F5F5F7] transition-colors px-4 py-3"
            >
              Back home
            </Link>
          </div>

          <p className="mt-6 text-xs text-[#6E6E76]">
            $9.99/mo · cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
