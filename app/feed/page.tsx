"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AchievementCard, { AchievementItem } from "@/components/AchievementCard";
import PostAchievementModal from "@/components/PostAchievementModal";
import { Icons } from "@/components/Icons";
import { RoleIcon, SectionIcon, sectionBadgeClass } from "@/components/sectionUi";
import { ROLE_META } from "@/convex/lib/roles";
import { Avatar, EmptyState } from "@/components/ui";

function FeedSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      {[1, 2, 3].map((n) => (
        <div key={n} className="panel space-y-4 p-6">
          <div className="flex items-center gap-3">
            <div className="skeleton h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <div className="skeleton h-4 w-36" />
              <div className="skeleton h-3 w-24" />
            </div>
          </div>
          <div className="skeleton h-5 w-3/4" />
          <div className="skeleton h-14 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export default function FeedPage() {
  const dbUser = useQuery(api.users.current);
  const achievements = useQuery(api.achievements.listFeed);

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const openComposer = () => setIsPostModalOpen(true);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Profile summary */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:col-span-4">
          <div className="panel overflow-hidden">
            <div className="relative h-20 bg-band">
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(80%_120%_at_100%_0%,rgb(var(--gold)/0.35),transparent_60%)]"
              />
            </div>

            <div className="-mt-8 px-5 pb-5">
              {dbUser ? (
                <div className="space-y-4">
                  <Avatar name={dbUser.name} size="lg" className="ring-4 ring-surface" />

                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold leading-tight text-ink">{dbUser.name}</h2>
                    <span className={`${sectionBadgeClass(dbUser.section)} font-mono`}>
                      <SectionIcon section={dbUser.section} className="h-3.5 w-3.5" />
                      {dbUser.classCode ?? `${dbUser.section} dept.`}
                    </span>
                    {dbUser.bio && <p className="line-clamp-2 text-sm leading-relaxed text-muted">{dbUser.bio}</p>}
                  </div>

                  <dl className="grid grid-cols-2 divide-x divide-line rounded-xl border border-line">
                    <div className="px-4 py-3">
                      <dt className="label-caps">XP</dt>
                      <dd className="mt-1 flex items-center gap-1.5 text-xl font-semibold tabular-nums text-ink">
                        <Icons.Lightning className="h-4 w-4 text-gold" />
                        {dbUser.xp || 0}
                      </dd>
                    </div>
                    <div className="px-4 py-3">
                      <dt className="label-caps">Role</dt>
                      <dd className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-ink">
                        <RoleIcon role={dbUser.role} className="h-4 w-4 text-royal" />
                        {ROLE_META[dbUser.role].label}
                      </dd>
                    </div>
                  </dl>

                  {dbUser.skills && dbUser.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {dbUser.skills.slice(0, 6).map((skill: string, idx: number) => (
                        <span key={idx} className="chip-neutral">
                          {skill}
                        </span>
                      ))}
                      {dbUser.skills.length > 6 && (
                        <span className="chip-neutral text-muted">+{dbUser.skills.length - 6}</span>
                      )}
                    </div>
                  )}

                  <Link href={`/profile/${dbUser._id}`} className="btn-secondary w-full">
                    View profile
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 pt-2" aria-hidden>
                  <div className="skeleton h-14 w-14 rounded-xl" />
                  <div className="skeleton h-5 w-40" />
                  <div className="skeleton h-4 w-24 rounded-full" />
                  <div className="skeleton h-16 w-full rounded-xl" />
                </div>
              )}
            </div>
          </div>

          <Link href="/events" className="panel group flex items-center gap-4 p-4 transition hover:border-line-strong">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold/30 bg-gold-tint text-gold-ink">
              <Icons.Rocket className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">Projects and hackathons</span>
              <span className="block text-xs text-muted">Find a team or host one</span>
            </span>
            <Icons.ChevronRight className="ml-auto h-4 w-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink" />
          </Link>
        </aside>

        {/* Feed */}
        <main className="space-y-6 lg:col-span-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="display text-4xl md:text-5xl">Campus feed</h1>
              <p className="mt-2 text-[15px] text-muted">Achievements from the CSE, IT and IoT sections.</p>
            </div>
          </div>

          {/* Composer */}
          <div className="panel p-4">
            <div className="flex items-center gap-3">
              {dbUser && <Avatar name={dbUser.name} />}
              <button
                onClick={openComposer}
                className="flex h-11 flex-1 items-center rounded-xl border border-line bg-sunken/50 px-4 text-left text-[15px] text-muted transition hover:border-line-strong hover:bg-sunken"
              >
                Share an achievement or certificate
              </button>
              <button onClick={openComposer} className="btn-primary hidden sm:inline-flex">
                <Icons.Plus className="h-4 w-4" />
                Post
              </button>
            </div>
          </div>

          {achievements === undefined ? (
            <FeedSkeleton />
          ) : achievements.length === 0 ? (
            <EmptyState
              icon={<Icons.Trophy className="h-6 w-6" />}
              title="Nothing here yet"
              action={
                <button onClick={openComposer} className="btn-primary">
                  <Icons.Plus className="h-4 w-4" />
                  Post the first achievement
                </button>
              }
            >
              Share a hackathon result, a certificate or a project milestone to start the feed.
            </EmptyState>
          ) : (
            <div className="space-y-4">
              {achievements.map((item) => (
                <AchievementCard key={item._id} item={item as AchievementItem} />
              ))}
            </div>
          )}
        </main>
      </div>

      <PostAchievementModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} />
    </div>
  );
}
