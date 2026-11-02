import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import ConvexClientProvider from "./ConvexClientProvider";
import OnboardingGuard from "@/components/OnboardingGuard";
import Navbar from "@/components/Navbar";
import PendingFacultyBanner from "@/components/PendingFacultyBanner";
import "./globals.css";

const outfitFont = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const interFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Synapse - College Achievements & Collaboration Platform",
  description:
    "LinkedIn-style platform for college students (CSE, IT and IoT sections) to share achievements, collaborate on hackathons, and connect with faculty.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfitFont.variable} ${interFont.variable}`}
    >
      <body className="antialiased bg-[#f8fafc] text-slate-900 min-h-screen flex flex-col font-sans bg-dot-grid-light">
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
