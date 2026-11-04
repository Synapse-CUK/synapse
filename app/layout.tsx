import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
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

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6f9" },
    { media: "(prefers-color-scheme: dark)", color: "#060e1a" },
  ],
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
