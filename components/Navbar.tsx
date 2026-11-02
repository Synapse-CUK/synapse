"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Icons } from "./Icons";
import { SectionIcon, sectionBadgeClass } from "./sectionUi";

export default function Navbar() {
  const pathname = usePathname();
  const dbUser = useQuery(api.users.current);

  const navLinks = [
    { href: "/feed", label: "Feed" },
    { href: "/events", label: "Projects" },
    ...(dbUser?.role === "faculty"
      ? [{ href: "/faculty/dashboard", label: "Faculty Portal" }]
      : []),
    ...(dbUser?.role === "coordinator"
      ? [{ href: "/coordinator/dashboard", label: "Coordinator" }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/70 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Mark */}
        <Link href="/feed" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-xl gradient-teal flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Icons.Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-black text-xl tracking-tight text-slate-900">
            Synapse
          </span>
        </Link>

        {/* Nav Links */}
        <SignedIn>
          <nav className="hidden sm:flex items-center gap-1 bg-slate-100/80 rounded-2xl p-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/60"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </SignedIn>

        {/* Right Section */}
        <div className="flex items-center gap-3 shrink-0">
          <SignedIn>
            {dbUser && (
              <div className="hidden sm:flex items-center gap-2">
                {dbUser.role === "coordinator" && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    👑 Coordinator
                  </span>
                )}

                {dbUser.role === "faculty_pending" && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    ⏳ Pending Faculty
                  </span>
                )}

                {dbUser.role === "faculty" && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    🎓 Faculty
                  </span>
                )}

                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${sectionBadgeClass(dbUser.section)}`}>
                  <SectionIcon section={dbUser.section} className="w-3.5 h-3.5" />
                  <span>{dbUser.classCode || `${dbUser.section} · Sem ${dbUser.effectiveSemester || 1}`}</span>
                </div>

                <Link
                  href={`/profile/${dbUser._id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition"
                >
                  <Icons.Lightning className="w-3.5 h-3.5 text-amber-500" />
                  <span>{dbUser.xp || 0} XP</span>
                </Link>
              </div>
            )}
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <SignedOut>
            <div className="flex gap-2">
              <Link
                href="/sign-in"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 rounded-xl text-sm font-bold gradient-teal text-white shadow-sm hover:opacity-90 transition"
              >
                Join Synapse
              </Link>
            </div>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
