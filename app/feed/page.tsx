"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AchievementCard, { AchievementItem } from "@/components/AchievementCard";
import PostAchievementModal from "@/components/PostAchievementModal";
import { Icons } from "@/components/Icons";
import { SectionIcon, sectionBadgeClass } from "@/components/sectionUi";

export default function FeedPage() {
  const dbUser = useQuery(api.users.current);
  const achievements = useQuery(api.achievements.listFeed);

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Sidebar: User Profile Card */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="social-card card-shadow overflow-hidden">
            {/* Mini Banner */}
            <div className="h-20 gradient-banner" />

            <div className="px-5 pb-5 -mt-8">
              {dbUser ? (
                <div className="space-y-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-2xl gradient-teal border-4 border-white flex items-center justify-center text-white font-black text-xl shadow-lg">
                    {dbUser.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()}
                  </div>

                  <div className="space-y-2">
                    <h2 className="font-bold text-lg text-slate-900 leading-tight">{dbUser.name}</h2>

                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold ${sectionBadgeClass(dbUser.section)}`}>
                      <SectionIcon section={dbUser.section} className="w-3.5 h-3.5" />
                      {dbUser.section} Section · Year {dbUser.year}
                    </span>

                    {dbUser.bio && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {dbUser.bio}
                      </p>
                    )}
                  </div>

                  {/* XP & Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <div className="text-center py-3 rounded-xl bg-amber-50 border border-amber-100">
                      <Icons.Lightning className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                      <p className="text-base font-black text-amber-600">{dbUser.xp || 0}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">XP</p>
                    </div>

                    <div className="text-center py-3 rounded-xl bg-slate-50 border border-slate-100">
                      {dbUser.role === "faculty"
                        ? <Icons.Faculty className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                        : <Icons.Student className="w-5 h-5 text-teal-500 mx-auto mb-1" />
                      }
                      <p className="text-xs font-bold text-slate-700 capitalize">
                        {dbUser.role === "faculty" ? "Faculty" : "Student"}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role</p>
                    </div>
                  </div>

                  {/* Skills */}
                  {dbUser.skills && dbUser.skills.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {dbUser.skills.slice(0, 6).map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 border border-indigo-100 text-indigo-700"
                          >
                            {skill}
                          </span>
                        ))}
                        {dbUser.skills.length > 6 && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-500">
                            +{dbUser.skills.length - 6}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <Link
                    href={`/profile/${dbUser._id}`}
                    className="block w-full py-2.5 text-center rounded-xl border-2 border-slate-200 text-slate-700 text-sm font-bold hover:border-teal-500 hover:text-teal-700 transition"
                  >
                    View Full Profile
                  </Link>
                </div>
              ) : (
                <div className="py-6 text-center space-y-2">
                  <div className="w-6 h-6 mx-auto border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-400">Loading profile...</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="social-card card-shadow p-5 space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Explore</p>
            <Link href="/events" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition group">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                <Icons.Rocket className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Hackathons</p>
                <p className="text-xs text-slate-400">Browse & join events</p>
              </div>
              <Icons.ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 ml-auto transition" />
            </Link>
          </div>
        </aside>

        {/* Main Feed */}
        <main className="lg:col-span-2 space-y-5">
          {/* Post Achievement Prompt */}
          <div className="social-card card-shadow p-5">
            <div className="flex items-center gap-3">
              {dbUser && (
                <div className="w-11 h-11 rounded-xl gradient-teal flex items-center justify-center text-white font-black text-sm shrink-0">
                  {dbUser.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()}
                </div>
              )}
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="flex-1 text-left px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-400 text-sm hover:border-teal-400 hover:bg-teal-50/30 transition cursor-pointer"
              >
                Share an achievement, certificate, or project milestone...
              </button>
            </div>

            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                <Icons.Trophy className="w-5 h-5 text-amber-500" />
                Achievement
              </button>
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                <Icons.Paperclip className="w-5 h-5 text-blue-500" />
                Certificate
              </button>
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                <Icons.Sparkles className="w-5 h-5 text-purple-500" />
                Milestone
              </button>
            </div>
          </div>

          {/* Feed Stream Header */}
          <div className="flex items-center gap-2 px-1">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-lg font-bold text-slate-800">Live Feed</h1>
            <span className="text-sm text-slate-400">·</span>
            <span className="text-sm text-slate-400">CSE, IT & IoT Achievements</span>
          </div>

          {/* Feed List */}
          {achievements === undefined ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="social-card p-6 animate-pulse space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-slate-100 rounded-xl" />
                    <div className="space-y-2">
                      <div className="w-32 h-4 bg-slate-100 rounded-lg" />
                      <div className="w-20 h-3 bg-slate-50 rounded" />
                    </div>
                  </div>
                  <div className="w-3/4 h-5 bg-slate-100 rounded-lg" />
                  <div className="w-full h-16 bg-slate-50 rounded-xl" />
                </div>
              ))}
            </div>
          ) : achievements.length === 0 ? (
            <div className="social-card p-16 text-center space-y-5">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-teal-50 to-indigo-50 border border-slate-100 flex items-center justify-center">
                <Icons.Sparkles className="w-10 h-10 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Nothing here yet</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto mt-1">
                  Be the first to share an achievement, hackathon win, or project milestone!
                </p>
              </div>
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 gradient-teal text-white font-bold rounded-xl text-sm shadow-sm hover:opacity-90 transition"
              >
                <Icons.Plus className="w-5 h-5" />
                Post First Achievement
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {achievements.map((item) => (
                <AchievementCard key={item._id} item={item as AchievementItem} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Post Modal */}
      <PostAchievementModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
      />
    </div>
  );
}
