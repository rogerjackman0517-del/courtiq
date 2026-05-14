import { cn } from "@/lib/utils";

/**
 * Apple-style shimmer skeleton.
 * Compose into any shape with className for size & shape.
 */
export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div className={cn("shimmer", className)} style={style} aria-hidden />;
}

/** Single player row skeleton (table). Matches the players list visual. */
export function PlayerRowSkeleton() {
  return (
    <tr className="border-b border-white/[0.03] last:border-b-0">
      <td className="px-5 py-3.5"><Skeleton className="h-3 w-4" /></td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-3 w-32" />
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="inline-flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-3 w-10" />
        </div>
      </td>
      <td className="px-3 py-3.5 text-right"><Skeleton className="h-3 w-6 ml-auto" /></td>
      <td className="px-3 py-3.5 text-right"><Skeleton className="h-3 w-8 ml-auto" /></td>
      <td className="px-3 py-3.5 text-right"><Skeleton className="h-4 w-10 ml-auto" /></td>
      <td className="px-3 py-3.5"><Skeleton className="h-5 w-16 mx-auto rounded-md" /></td>
      <td className="px-3 py-3.5 text-right"><Skeleton className="h-3 w-8 ml-auto" /></td>
      <td className="px-3 py-3.5 text-right"><Skeleton className="h-3 w-8 ml-auto" /></td>
      <td className="px-3 py-3.5 text-right"><Skeleton className="h-3 w-10 ml-auto" /></td>
      <td className="px-3 py-3.5 text-right"><Skeleton className="h-3 w-10 ml-auto" /></td>
      <td className="px-3 py-3.5 text-right"><Skeleton className="h-3 w-10 ml-auto" /></td>
    </tr>
  );
}

/** Team card skeleton — matches teams list layout. */
export function TeamCardSkeleton() {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
      <Skeleton className="h-14 w-40 mb-6" />
      <Skeleton className="h-2.5 w-24 mb-4" />
      <Skeleton className="h-1 w-full mb-6 rounded-full" />
      <div className="flex justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-10 rounded-full" />
      </div>
    </div>
  );
}

/** News article card skeleton. */
export function NewsCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div className={cn(
      "rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] overflow-hidden",
      featured && "lg:flex lg:items-stretch"
    )}>
      <Skeleton className={cn(
        "rounded-none",
        featured ? "lg:w-1/2 lg:max-w-md h-48 lg:h-auto" : "h-40"
      )} />
      <div className="p-6 flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3 w-14" />
        </div>
        <Skeleton className={cn("h-5 w-full")} />
        <Skeleton className={cn("h-5 w-3/4")} />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

/** Game card skeleton — matches scores game cards. */
export function GameCardSkeleton() {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] p-6">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-10 w-12" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-10 w-12" />
        </div>
      </div>
    </div>
  );
}

/** Standings table row skeleton. */
export function StandingsRowSkeleton() {
  return (
    <tr className="border-b border-white/[0.03] last:border-b-0">
      <td className="px-3 py-4 text-center"><Skeleton className="h-3 w-4 mx-auto" /></td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="h-4 w-32" />
        </div>
      </td>
      <td className="px-3 py-4 text-right"><Skeleton className="h-4 w-6 ml-auto" /></td>
      <td className="px-3 py-4 text-right"><Skeleton className="h-4 w-6 ml-auto" /></td>
      <td className="px-3 py-4 text-right"><Skeleton className="h-3 w-10 ml-auto" /></td>
      <td className="px-3 py-4 text-right"><Skeleton className="h-3 w-10 ml-auto" /></td>
      <td className="px-3 py-4 text-right"><Skeleton className="h-5 w-10 rounded-full ml-auto" /></td>
    </tr>
  );
}

/** Stat card skeleton — matches League Pulse cards on homepage. */
export function StatCardSkeleton() {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] p-6">
      <Skeleton className="h-3 w-16 mb-6" />
      <Skeleton className="h-16 w-32 mb-2" />
      <Skeleton className="h-3 w-20 mb-6" />
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
    </div>
  );
}
