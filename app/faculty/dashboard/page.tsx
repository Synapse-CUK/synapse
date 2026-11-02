"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function FacultyDashboardPage() {
  const dbUser = useQuery(api.users.current);
  const pendingAchievements = useQuery(api.achievements.listPending);
  const updateAchievementStatus = useMutation(api.achievements.updateAchievementStatus);

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ id: string; text: string; type: "success" | "error" } | null>(null);

  if (dbUser === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-stone-500 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span>Verifying faculty security token...</span>
        </div>
      </div>
    );
  }

  // Specific state for pending faculty users
  if (dbUser && dbUser.role === "faculty_pending") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl font-bold">
          ⏳
        </div>
        <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
          Faculty Access Pending Approval
        </h1>
        <p className="text-stone-600 text-sm max-w-md mx-auto leading-relaxed">
          Your faculty registration request is currently under review by a department coordinator. You will gain full faculty access — including this dashboard, achievement verification, and official event hosting — once approved.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          STATUS: PENDING_COORDINATOR_APPROVAL
        </div>
        <div className="pt-2">
          <Link
            href="/feed"
            className="inline-block px-6 py-3 bg-teal-600 hover:bg-teal-500 rounded-xl text-white font-bold text-sm shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            Return to Community Feed
          </Link>
        </div>
      </div>
    );
  }

  // Access check fallback if user is not faculty
  if (!dbUser || dbUser.role !== "faculty") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 text-2xl font-bold">
          🛡️
        </div>
        <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
          Access Restricted to Faculty
        </h1>
        <p className="text-stone-600 text-sm max-w-md mx-auto">
          The Faculty Management Dashboard is reserved exclusively for verified academic supervisors and faculty members.
        </p>
        <Link
          href="/feed"
          className="inline-block px-6 py-3 bg-teal-600 hover:bg-teal-500 rounded-xl text-white font-bold text-sm shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
        >
          Return to Community Feed
        </Link>
      </div>
    );
  }

  async function handleVerify(achievementId: Id<"achievements">, status: "verified" | "rejected") {
    try {
      setProcessingId(achievementId);
      setFeedbackMsg(null);
      await updateAchievementStatus({ achievementId, status });
      setFeedbackMsg({
        id: achievementId,
        text: status === "verified" ? "Achievement verified (+50 XP granted)!" : "Achievement rejected.",
        type: status === "verified" ? "success" : "error",
      });
    } catch (err: any) {
      console.error("Verification error:", err);
      setFeedbackMsg({
        id: achievementId,
        text: err.message || "Failed to update status.",
        type: "error",
      });
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-2xs relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5 font-mono text-xs font-bold text-indigo-700">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
              <span>ACADEMIC_SUPERVISOR // MANAGEMENT_PORTAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              Faculty Management Dashboard
            </h1>
            <p className="text-stone-500 text-sm max-w-2xl mt-1 leading-relaxed font-sans">
              Verify student achievement submissions, award bonus XP, broadcast announcements, and supervise hackathon teams.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/events"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-sm transition flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              + Launch Hackathon Event
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Verification Stream (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
              <span>🔬 Verification Queue</span>
              {pendingAchievements && pendingAchievements.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {pendingAchievements.length} PENDING
                </span>
              )}
            </h2>
          </div>

          {pendingAchievements === undefined ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="bg-white border border-stone-200/80 rounded-2xl p-6 animate-pulse space-y-3"
                >
                  <div className="w-1/3 h-5 bg-stone-100 rounded" />
                  <div className="w-full h-12 bg-stone-100/60 rounded" />
                </div>
              ))}
            </div>
          ) : pendingAchievements.length === 0 ? (
            <div className="bg-white border border-stone-200/80 rounded-2xl p-12 text-center space-y-3 shadow-2xs">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 text-2xl font-bold">
                ✓
              </div>
              <h3 className="text-lg font-extrabold text-zinc-900">
                Verification Queue Clear
              </h3>
              <p className="text-stone-500 text-sm max-w-md mx-auto font-sans">
                All student achievement submissions have been reviewed and verified.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingAchievements.map((item) => (
                <article
                  key={item._id}
                  className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-zinc-900 text-base">
                          {item.author?.name || "Student"}
                        </span>
                        {item.author && (
                          <span
                            className={`px-2.5 py-0.5 rounded-lg font-mono text-xs font-bold border ${
                              item.author.section === "IT"
                                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                                : "bg-amber-50 border-amber-200 text-amber-700"
                            }`}
                          >
                            {item.author.section === "IT" ? "💻 IT" : "📡 IoT"} · Yr {item.author.year}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-stone-500">
                        Submitted: {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg font-mono text-xs font-bold bg-amber-50 border border-amber-200 text-amber-800">
                      ⏳ PENDING_VERIFICATION
                    </span>
                  </div>

                  {/* Body */}
                  <h4 className="text-lg font-extrabold text-zinc-900 mb-1.5 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-zinc-700 text-sm whitespace-pre-wrap leading-relaxed mb-4 font-sans">
                    {item.description}
                  </p>

                  {/* Proof Attachment */}
                  {item.proofUrl && (
                    <div className="mb-4">
                      <a
                        href={item.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 p-3 bg-stone-50 border border-stone-200 hover:border-indigo-500/60 rounded-xl text-xs font-mono font-semibold text-indigo-700 hover:underline transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                      >
                        📎 View Student Proof File / Certificate
                      </a>
                    </div>
                  )}

                  {/* Feedback Msg */}
                  {feedbackMsg?.id === item._id && (
                    <div
                      className={`p-3 mb-4 rounded-xl font-mono text-xs font-bold border ${
                        feedbackMsg.type === "success"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-rose-50 border-rose-200 text-rose-800"
                      }`}
                    >
                      {feedbackMsg.text}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-3 border-t border-stone-100">
                    <button
                      onClick={() => handleVerify(item._id, "verified")}
                      disabled={processingId === item._id}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition disabled:opacity-50 flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                    >
                      {processingId === item._id ? "Processing..." : "✓ Approve & Award +50 XP"}
                    </button>

                    <button
                      onClick={() => handleVerify(item._id, "rejected")}
                      disabled={processingId === item._id}
                      className="px-5 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs transition disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
                    >
                      Reject Submission
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Controls (1 Column) */}
        <div className="space-y-6">
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="text-base font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
              🛠️ Faculty Tools & Quick Actions
            </h3>
            <p className="text-stone-500 text-xs leading-relaxed font-sans">
              As a faculty member, your verifications grant students bonus XP on their public profile leaderboard.
            </p>

            <div className="space-y-2 pt-2 border-t border-stone-100 font-mono text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between">
                <span className="text-stone-600 font-semibold">VERIFICATION BONUS:</span>
                <span className="font-extrabold text-amber-600">+50 XP</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between">
                <span className="text-stone-600 font-semibold">SUBMISSION XP:</span>
                <span className="font-extrabold text-indigo-600">+10 XP</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <Link
                href="/events"
                className="block w-full py-3 px-4 text-center rounded-xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200 text-zinc-900 text-xs font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                Browse All Hackathon Teams
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
