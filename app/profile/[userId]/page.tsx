"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import AchievementCard, { AchievementItem } from "@/components/AchievementCard";
import EditProfileModal from "@/components/EditProfileModal";
import { Icons } from "@/components/Icons";
import { SectionIcon, sectionBadgeClass } from "@/components/sectionUi";

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const resolvedParams = use(params);
  const targetUserId = resolvedParams.userId as Id<"users">;

  const currentDbUser = useQuery(api.users.current);
  const profile = useQuery(api.users.getUserProfile, { userId: targetUserId });
  const userAchievements = useQuery(api.achievements.listByUser, {
    userId: targetUserId,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isOwner = currentDbUser && currentDbUser._id === targetUserId;

  if (profile === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (profile === null) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
          <Icons.X className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Profile Not Found</h1>
        <p className="text-slate-500">This student profile doesn't exist or was removed.</p>
        <Link
          href="/feed"
          className="inline-block px-6 py-3 gradient-teal text-white font-bold rounded-2xl shadow-sm hover:opacity-90 transition"
        >
          Return to Feed
        </Link>
      </div>
    );
  }

  const initials = profile.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Profile Card */}
      <div className="social-card card-shadow-md overflow-hidden">
        {/* Banner */}
        <div className="h-48 gradient-banner relative">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Profile Header */}
        <div className="px-6 sm:px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-16 mb-6">
            {/* Avatar */}
            <div className="w-28 h-28 rounded-2xl gradient-teal border-4 border-white shadow-xl flex items-center justify-center text-white font-black text-4xl shrink-0">
              {initials}
            </div>

            {/* Edit Button */}
            {isOwner && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:border-teal-500 hover:text-teal-700 transition self-start sm:self-auto"
              >
                <Icons.Edit className="w-4 h-4" />
                Edit Academic Profile
              </button>
            )}
          </div>

          {/* Name & Badges */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                {profile.name}
              </h1>

              {/* Class Code Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-mono font-black bg-indigo-600 text-white shadow-sm">
                <Icons.Sparkles className="w-4 h-4 text-indigo-200" />
                {profile.classCode || `${profile.section} · Sem ${profile.effectiveSemester}`}
              </span>

              {/* Section Badge */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold ${sectionBadgeClass(profile.section)}`}>
                <SectionIcon section={profile.section} className="w-4 h-4" />
                {profile.section} Section
              </span>

              {/* Role Badge */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold ${
                profile.role === "faculty" ? "badge-faculty" : "badge-student"
              }`}>
                {profile.role === "faculty"
                  ? <Icons.Faculty className="w-4 h-4" />
                  : <Icons.Student className="w-4 h-4" />
                }
                {profile.role === "faculty" ? "Faculty" : "Student"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-mono">
              {profile.registrationNumber && (
                <span>REG NO: <strong className="text-slate-800">{profile.registrationNumber}</strong></span>
              )}
              {(profile.universityEmail || profile.email) && (
                <span>EMAIL: <strong className="text-slate-800">{profile.universityEmail || profile.email}</strong></span>
              )}
              {profile.admissionYear && (
                <span>ADMISSION: <strong className="text-slate-800">{profile.admissionYear}</strong></span>
              )}
            </div>

            {profile.bio ? (
              <p className="text-slate-700 text-base leading-relaxed max-w-2xl">{profile.bio}</p>
            ) : (
              <p className="text-slate-400 text-sm italic">
                {isOwner ? "Add a bio to tell the community about yourself." : "No bio added yet."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* XP */}
        <div className="social-card card-shadow p-6 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto">
            <Icons.Lightning className="w-7 h-7 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-amber-600">{profile.xp}</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">XP Balance</p>
        </div>

        {/* Achievements */}
        <div className="social-card card-shadow p-6 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto">
            <Icons.Trophy className="w-7 h-7 text-indigo-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{profile.achievementCount}</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Achievements</p>
        </div>

        {/* Verified */}
        <div className="social-card card-shadow p-6 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto">
            <Icons.Verified className="w-7 h-7 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-600">{profile.verifiedCount}</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Verified</p>
        </div>
      </div>

      {/* Skills Section */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="social-card card-shadow p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Skills & Technology Stack</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill: string, idx: number) => (
              <span
                key={idx}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 transition cursor-default"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Icons.Trophy className="w-6 h-6 text-indigo-600" />
            Achievements
            <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-sm font-semibold">
              {profile.achievementCount}
            </span>
          </h2>
        </div>

        {userAchievements === undefined ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="social-card p-6 animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-slate-100 rounded" />
                    <div className="w-20 h-3 bg-slate-50 rounded" />
                  </div>
                </div>
                <div className="w-3/4 h-5 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : userAchievements.length === 0 ? (
          <div className="social-card p-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
              <Icons.Trophy className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-700">No achievements yet</h3>
              <p className="text-slate-400 text-sm mt-1">
                {isOwner
                  ? "Post your first achievement to get started!"
                  : "This student hasn't posted any achievements yet."}
              </p>
            </div>
            {isOwner && (
              <Link
                href="/feed"
                className="inline-block px-5 py-2.5 gradient-teal text-white font-bold rounded-xl text-sm shadow-sm hover:opacity-90 transition"
              >
                Post Achievement
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {userAchievements.map((item) => (
              <AchievementCard key={item._id} item={item as AchievementItem} />
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isOwner && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialData={{
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
