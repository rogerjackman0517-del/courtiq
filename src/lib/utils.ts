import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatStat(value: number, decimals = 1): string {
  return value.toFixed(decimals);
}

export function statTier(value: number, thresholds: [number, number, number, number]): string {
  const [elite, great, avg, below] = thresholds;
  if (value >= elite) return "stat-elite";
  if (value >= great) return "stat-great";
  if (value >= avg)   return "stat-avg";
  if (value >= below) return "stat-below";
  return "stat-poor";
}

export function formatSalary(dollars: number): string {
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000)     return `$${(dollars / 1_000).toFixed(0)}K`;
  return `$${dollars}`;
}

export function formatRecord(wins: number, losses: number): string {
  return `${wins}-${losses}`;
}

export function pct(made: number, attempted: number): string {
  if (attempted === 0) return ".000";
  return (made / attempted).toFixed(3).replace("0.", ".");
}
