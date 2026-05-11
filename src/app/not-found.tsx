import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="font-[family-name:var(--font-barlow)] font-black text-8xl text-[#C8A84B] mb-2">404</p>
      <h2 className="font-[family-name:var(--font-barlow)] font-bold text-2xl text-[#F0F0F0] mb-2">
        Page not found
      </h2>
      <p className="text-sm text-[#888899] mb-6">
        That player, team, or page doesn&apos;t exist in our database.
      </p>
      <Link
        href="/"
        className="bg-[#C8A84B] text-black text-sm font-bold px-6 py-2.5 rounded-lg hover:bg-[#D4B55F] transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
