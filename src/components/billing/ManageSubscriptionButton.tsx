"use client";

import { useState } from "react";

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res  = await fetch("/api/stripe/portal", { method: "POST" });
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
      className="w-full py-3 rounded-xl border border-[#C8A84B]/30 text-sm font-bold text-[#C8A84B] hover:bg-[#C8A84B]/10 transition-colors disabled:opacity-60"
    >
      {loading ? "Loading…" : "Manage Subscription"}
    </button>
  );
}
