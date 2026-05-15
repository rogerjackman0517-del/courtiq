"use client";

import { useEffect } from "react";

/**
 * Wires global mousemove/mouseleave handlers that compute a per-card
 * tilt and write CSS vars (--tilt-x, --tilt-y, --tilt-z) on whichever
 * .floating-card the cursor is currently over.
 *
 * Mount once at the root so every floating-card on every page picks up
 * the effect without per-element wiring.
 */
export function TiltProvider() {
  useEffect(() => {
    let active: HTMLElement | null = null;
    let rafId: number | null = null;
    let lastX = 0;
    let lastY = 0;

    function reset(card: HTMLElement | null) {
      if (!card) return;
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--tilt-z", "0");
    }

    function apply() {
      rafId = null;
      const card = active;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      // ignore if the cursor has actually moved outside (e.g. between frames)
      if (
        lastX < rect.left ||
        lastX > rect.right ||
        lastY < rect.top ||
        lastY > rect.bottom
      ) {
        return;
      }
      const x = (lastX - rect.left) / rect.width;
      const y = (lastY - rect.top) / rect.height;
      const rotY = (x - 0.5) * 10;
      const rotX = (0.5 - y) * 8;
      card.style.setProperty("--tilt-x", `${rotX.toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${rotY.toFixed(2)}deg`);
      card.style.setProperty("--tilt-z", "-3px");
    }

    function onMove(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const card = target?.closest<HTMLElement>(".floating-card") ?? null;
      if (card !== active) {
        reset(active);
        active = card;
      }
      if (!card) return;
      lastX = e.clientX;
      lastY = e.clientY;
      if (rafId === null) {
        rafId = requestAnimationFrame(apply);
      }
    }

    function onLeaveWindow() {
      reset(active);
      active = null;
    }

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeaveWindow);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeaveWindow);
      if (rafId !== null) cancelAnimationFrame(rafId);
      reset(active);
    };
  }, []);

  return null;
}
