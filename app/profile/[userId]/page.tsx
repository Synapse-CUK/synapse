"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import AchievementCard, { AchievementItem } from "@/components/AchievementCard";
import EditProfileModal from "@/components/EditProfileModal";
import { Icons } from "@/components/Icons";
import { RoleIcon, SectionIcon, sectionBadgeClass } from "@/components/sectionUi";
import { ROLE_META, isStudent } from "@/convex/lib/roles";
import { Avatar, EmptyState, LoadingScreen, StatusScreen } from "@/components/ui";

export default function UserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const resolvedParams = use(params);
  const targetUserId = resolvedParams.userId as Id<"users">;

  const currentDbUser = useQuery(api.users.current);
  const profile = useQuery(api.users.getUserProfile, { userId: targetUserId });
  const userAchievements = useQuery(api.achievements.listByUser, { userId: targetUserId });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isOwner = currentDbUser && currentDbUser._id === targetUserId;

  if (profile === undefined) {
    return <LoadingScreen label="Loading profile" />;
  }

  if (profile === null) {
    return (
      <StatusScreen
        icon={<Icons.Student className="h-7 w-7" />}
        title="Profile not found"
        action={
          <Link href="/feed" className="btn-primary">
            Back to feed
          </Link>
        }
      >
        This profile doesn&apos;t exist or was removed.
      </StatusScreen>
    );
  }

  const stats = [
    { label: "XP", value: profile.xp, icon: Icons.Lightning, tone: "text-gold" },
    { label: "Achievements", value: profile.achievementCount, icon: Icons.Trophy, tone: "text-royal" },
    { label: "Verified", value: profile.verifiedCount, icon: Icons.Verified, tone: "text-success" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:py-12">
      {/* Header */}
      <section className="panel overflow-hidden">
        <div className="relative h-36 bg-band sm:h-44">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(70%_140%_at_100%_0%,rgb(var(--gold)/0.32),transparent_60%),radial-gradient(60%_120%_at_0%_100%,rgb(var(--royal)/0.45),transparent_60%)]"
          />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gold/50" />
        </div>

        <div className="px-6 pb-8 sm:px-10">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <Avatar name={profile.name} size="xl" className="ring-4 ring-surface" />
            {isOwner && (
              <button onClick={() => setIsEditModalOpen(true)} className="btn-secondary self-start sm:self-auto">
                <Icons.Edit className="h-4 w-4" />
                Edit profile
              </button>
            )}
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <h1 className="display text-4xl md:text-5xl">{profile.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {profile.classCode && <span className="chip-navy font-mono">{profile.classCode}</span>}
                <span className={sectionBadgeClass(profile.section)}>
                  <SectionIcon section={profile.section} className="h-3.5 w-3.5" />
                  {profile.classCode ? profile.section : `${profile.section} department`}
                </span>
                <span className={ROLE_META[profile.role].chip}>
                  <RoleIcon role={profile.role} />
                  {ROLE_META[profile.role].label}
                </span>
              </div>
            </div>

            {profile.bio ? (
              <p className="max-w-2xl text-[15px] leading-relaxed text-body">{profile.bio}</p>
            ) : (
              <p className="text-sm text-muted">
                {isOwner ? "Add a short bio so others know what you work on." : "No bio yet."}
              </p>
            )}

            <dl className="flex flex-wrap gap-x-8 gap-y-2 pt-1 text-sm">
              {isStudent(profile.role) && profile.registrationNumber && (
                <div className="flex gap-2">
                  <dt className="text-muted">Reg. no.</dt>
                  <dd className="font-mono font-medium uppercase text-ink">{profile.registrationNumber}</dd>
                </div>
              )}
              {(profile.universityEmail || profile.email) && (
                <div className="flex gap-2">
                  <dt className="text-muted">Email</dt>
                  <dd className="font-medium text-ink">{profile.universityEmail || profile.email}</dd>
                </div>
              )}
              {isStudent(profile.role) && profile.admissionYear && (
                <div className="flex gap-2">
                  <dt className="text-muted">Admitted</dt>
                  <dd className="font-medium tabular-nums text-ink">{profile.admissionYear}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <dl className="grid grid-cols-3 divide-x divide-line border-t border-line">
          {stats.map((s) => (
            <div key={s.label} className="px-4 py-5 sm:px-8">
              <dt className="label-caps flex items-center gap-1.5">
                <s.icon className={`h-3.5 w-3.5 ${s.tone}`} />
                {s.label}
              </dt>
              <dd className="mt-1.5 font-display text-4xl font-semibold tabular-nums text-ink">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {profile.skills && profile.skills.length > 0 && (
        <section aria-labelledby="skills-heading">
          <h2 id="skills-heading" className="text-lg font-semibold text-ink">
            Skills
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.skills.map((skill: string, idx: number) => (
              <span key={idx} className="chip-neutral h-8 px-3.5 text-sm">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="achievements-heading" className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 id="achievements-heading" className="display text-3xl">
            Achievements
          </h2>
          <span className="text-sm tabular-nums text-muted">{profile.achievementCount} total</span>
        </div>

        {userAchievements === undefined ? (
          <div className="space-y-4" aria-hidden>
            {[1, 2].map((n) => (
              <div key={n} className="panel space-y-3 p-6">
                <div className="flex items-center gap-3">
                  <div className="skeleton h-10 w-10 rounded-xl" />
                  <div className="skeleton h-4 w-36" />
                </div>
                <div className="skeleton h-5 w-3/4" />
              </div>
            ))}
          </div>
        ) : userAchievements.length === 0 ? (
          <EmptyState
            icon={<Icons.Trophy className="h-6 w-6" />}
            title="No achievements yet"
            action={
              isOwner ? (
                <Link href="/feed" className="btn-primary">
                  Post an achievement
                </Link>
              ) : undefined
            }
          >
            {isOwner
              ? "Post your first achievement from the feed."
              : "This person hasn't posted any achievements yet."}
          </EmptyState>
        ) : (
          <div className="space-y-4">
            {userAchievements.map((item) => (
              <AchievementCard key={item._id} item={item as AchievementItem} />
            ))}
          </div>
        )}
      </section>

      {isOwner && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialData={{
            role: profile.role,
            section: profile.section,
            registrationNumber: profile.registrationNumber,
            universityEmail: profile.universityEmail,
            admissionYear: profile.admissionYear,
            semesterOverride: profile.semesterOverride,
            bio: profile.bio,
            skills: profile.skills,
          }}
        />
      )}
    </div>
  );
}
