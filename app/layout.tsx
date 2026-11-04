import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import ConvexClientProvider from "./ConvexClientProvider";
import OnboardingGuard from "@/components/OnboardingGuard";
import Navbar from "@/components/Navbar";
import PendingFacultyBanner from "@/components/PendingFacultyBanner";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Cormorant Garamond is self-hosted: Google sometimes serves it from URLs that
// Turbopack's next/font/google can't parse ("queries have exactly one entry").
// Variable font, latin subset, weights 500-700. SIL Open Font License.
const display = localFont({
  src: "./fonts/CormorantGaramond-Variable-latin.woff2",
  weight: "500 700",
  style: "normal",
  variable: "--font-display",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Synapse | Campus network for CSE, IT and IoT",
  description:
    "Share achievements, get them verified by faculty, and form hackathon teams across the CSE, IT and IoT sections.",
};

export const viewport: Viewport = {
  themeColor: "#f5f6f9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body className="flex min-h-[100dvh] flex-col">
        <ConvexClientProvider>
          <OnboardingGuard>
            <Navbar />
            <PendingFacultyBanner />
            <div className="flex-1">{children}</div>
          </OnboardingGuard>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
