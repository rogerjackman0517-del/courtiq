import type { Metadata } from "next";
import { Barlow_Condensed, DM_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import { LiveTicker } from "@/components/layout/LiveTicker";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { Splash } from "@/components/ui/Splash";
import { ToastProvider } from "@/components/ui/Toast";

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
  metadataBase: new URL("https://courtiq-mocha.vercel.app"),
  title: { default: "CourtIQ — NBA Analytics", template: "%s | CourtIQ" },
  description: "Real-time NBA stats, scores, and league insights. Built for fans who love the numbers.",
  keywords: ["NBA", "basketball", "stats", "analytics", "fantasy", "props"],
  openGraph: {
    title: "CourtIQ — NBA Analytics",
    description: "Real-time NBA stats, scores, and league insights.",
    siteName: "CourtIQ",
    type: "website",
    url: "https://courtiq-mocha.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "CourtIQ — NBA Analytics",
    description: "Real-time NBA stats, scores, and league insights.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${barlowCondensed.variable} ${dmSans.variable} h-full`}>
        <body className="h-full bg-[#0A0A0F] text-[#F0F0F0] antialiased">
          <ToastProvider>
          <div className="flex h-full">
            {/* Desktop sidebar */}
            <Sidebar />

            {/* Main content */}
            <div className="flex flex-1 flex-col min-w-0 lg:ml-60">
              <LiveTicker />
              <TopNav />
              <main className="flex-1 overflow-auto pb-20 lg:pb-0">
                {children}
                <Footer />
              </main>
            </div>
          </div>

          {/* Mobile bottom nav */}
          <MobileNav />

          {/* Global overlays */}
          <Splash />
          <CommandPalette />
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
