import type { Metadata } from "next";
import { Barlow_Condensed, DM_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { MobileNav } from "@/components/layout/MobileNav";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "CourtIQ — NBA Analytics", template: "%s | CourtIQ" },
  description: "Premium NBA analytics, stats, and insights for fans, bettors, and fantasy players.",
  keywords: ["NBA", "basketball", "stats", "analytics", "fantasy", "props"],
  openGraph: {
    siteName: "CourtIQ",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${barlowCondensed.variable} ${dmSans.variable} h-full`}>
        <body className="h-full bg-[#0A0A0F] text-[#F0F0F0] antialiased">
          <div className="flex h-full">
            {/* Desktop sidebar */}
            <Sidebar />

            {/* Main content */}
            <div className="flex flex-1 flex-col min-w-0 lg:ml-60">
              <TopNav />
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </div>

          {/* Mobile bottom nav */}
          <MobileNav />
        </body>
      </html>
    </ClerkProvider>
  );
}
