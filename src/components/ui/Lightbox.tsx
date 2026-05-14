"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type Props = {
  src: string;
  alt: string;
  open: boolean;
  onClose: () => void;
};

export function Lightbox({ src, alt, open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/85 backdrop-blur-sm premium-fade-in"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 text-[#F5F5F7]/80 hover:text-white"
        aria-label="Close"
      >
        <X size={22} />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="max-h-[85vh] max-w-[90vw] rounded-2xl shadow-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
