"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { PlanKey } from "@/lib/stripe";

interface CheckoutButtonProps {
  plan: PlanKey;
  label: string;
  variant?: "primary" | "outline";
}

export function CheckoutButton({ plan, label, variant = "primary" }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (res.status === 401) {
        router.push("/login?redirect_url=/billing");
        return;
      }

      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "w-full py-3 rounded-xl text-sm font-black transition-colors disabled:opacity-60",
        variant === "primary"
          ? "bg-[#C8A84B] text-black hover:bg-[#D4B55F]"
          : "bg-[#C8A84B]/10 border border-[#C8A84B]/20 text-[#C8A84B] hover:bg-[#C8A84B]/20"
      )}
    >
      {loading ? "Redirecting…" : label}
    </button>
  );
}
