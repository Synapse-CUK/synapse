"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { hasFacultyAccess } from "@/convex/lib/roles";
import { Icons } from "./Icons";
import { SectionIcon, sectionBadgeClass } from "./sectionUi";
import { BrandMark } from "./ui";

export default function Navbar() {
  const pathname = usePathname();
  const dbUser = useQuery(api.users.current);

  const navLinks = [
    { href: "/feed", label: "Feed" },
    { href: "/events", label: "Projects" },
    ...(hasFacultyAccess(dbUser?.role) ? [{ href: "/faculty/dashboard", label: "Faculty" }] : []),
    ...(dbUser?.role === "coordinator" ? [{ href: "/coordinator/dashboard", label: "Coordinator" }] : []),
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/85 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/feed" className="group flex shrink-0 items-center gap-2.5" aria-label="Synapse feed">
            <BrandMark className="h-8 w-8 transition-transform duration-300 group-hover:-rotate-6" />
            <span className="font-display text-[1.6rem] font-semibold leading-none tracking-tight text-ink">
              Synapse
            </span>
          </Link>

          <SignedIn>
            <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`relative rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive(link.href) ? "text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {link.label}
                  <span
                    aria-hidden
                    className={`absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-gold transition-opacity ${
                      isActive(link.href) ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </Link>
              ))}
            </nav>
          </SignedIn>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <SignedIn>
            {dbUser && (
              <div className="hidden items-center gap-2 lg:flex">
                {dbUser.role === "coordinator" && (
                  <span className="chip-navy">
                    <Icons.Crown className="h-3.5 w-3.5" />
                    Coordinator
                  </span>
                )}
                {dbUser.role === "faculty_pending" && (
                  <span className="chip-gold">
                    <Icons.Hourglass className="h-3.5 w-3.5" />
                    Faculty pending
                  </span>
                )}
                {dbUser.role === "faculty" && (
                  <span className="chip-navy">
                    <Icons.Faculty className="h-3.5 w-3.5" />
                    Faculty
                  </span>
                )}
                <span className={`${sectionBadgeClass(dbUser.section)} font-mono`}>
                  <SectionIcon section={dbUser.section} className="h-3.5 w-3.5" />
                  {dbUser.classCode ?? `${dbUser.section} dept.`}
                </span>
              </div>
            )}
            {dbUser && (
              <Link
                href={`/profile/${dbUser._id}`}
                className="chip-gold hidden h-8 px-3 transition hover:border-gold sm:inline-flex"
                title="Your XP"
              >
                <Icons.Lightning className="h-3.5 w-3.5" />
                <span className="tabular-nums">{dbUser.xp || 0} XP</span>
              </Link>
            )}
            <div className="ml-1 flex h-8 w-8 items-center justify-center">
              <UserButton afterSignOutUrl="/sign-in" />
            </div>
          </SignedIn>

          <SignedOut>
            <Link href="/sign-in" className="btn-ghost">
              Sign in
            </Link>
            <Link href="/sign-up" className="btn-primary">
              Join Synapse
            </Link>
          </SignedOut>
        </div>
      </div>

      {/* Small screens: the same links as a scrollable row */}
      <SignedIn>
        <nav aria-label="Main" className="border-t border-line/70 md:hidden">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  isActive(link.href) ? "bg-surface text-ink shadow-soft" : "text-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </SignedIn>
    </header>
  );
}
