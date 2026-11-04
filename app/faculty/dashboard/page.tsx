"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Icons } from "@/components/Icons";
import { hasFacultyAccess } from "@/convex/lib/roles";
import { SectionIcon, sectionBadgeClass } from "@/components/sectionUi";
import { Alert, Avatar, EmptyState, LoadingScreen, PageHeader, Spinner, StatusScreen } from "@/components/ui";
import { errorMessage } from "@/lib/errors";

export default function FacultyDashboardPage() {
  const dbUser = useQuery(api.users.current);
  const pendingAchievements = useQuery(api.achievements.listPending);
  const updateAchievementStatus = useMutation(api.achievements.updateAchievementStatus);

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ id: string; text: string; type: "success" | "error" } | null>(null);

  if (dbUser === undefined) {
    return <LoadingScreen label="Checking faculty access" />;
  }

  if (dbUser && dbUser.role === "faculty_pending") {
    return (
      <StatusScreen
        icon={<Icons.Hourglass className="h-7 w-7" />}
        title="Waiting for approval"
        action={
          <Link href="/feed" className="btn-primary">
            Back to feed
          </Link>
        }
      >
        A department coordinator is reviewing your faculty request. Once approved you&apos;ll get this dashboard,
        achievement verification and official event hosting.
      </StatusScreen>
    );
  }

  if (!dbUser || !hasFacultyAccess(dbUser.role)) {
    return (
      <StatusScreen
        icon={<Icons.Shield className="h-7 w-7" />}
        title="Faculty only"
        action={
          <Link href="/feed" className="btn-primary">
            Back to feed
          </Link>
        }
      >
        This dashboard is for approved faculty and coordinators.
      </StatusScreen>
    );
  }

  async function handleVerify(achievementId: Id<"achievements">, status: "verified" | "rejected") {
    try {
      setProcessingId(achievementId);
      setFeedbackMsg(null);
      await updateAchievementStatus({ achievementId, status });
      setFeedbackMsg({
        id: achievementId,
        text: status === "verified" ? "Verified. The student received 50 XP." : "Submission rejected.",
        type: status === "verified" ? "success" : "error",
      });
    } catch (err) {
      console.error("Verification error:", err);
      setFeedbackMsg({ id: achievementId, text: errorMessage(err, "Failed to update status."), type: "error" });
    } finally {
      setProcessingId(null);
    }
  }

  const queueCount = pendingAchievements?.length ?? 0;

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:py-12">
      <PageHeader
        title="Faculty dashboard"
        description="Review student achievements and supervise hackathon teams."
        actions={
          <Link href="/events" className="btn-primary btn-lg">
            <Icons.Plus className="h-4 w-4" />
            Host an event
          </Link>
        }
      />

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2" aria-labelledby="queue-heading">
          <div className="flex items-center gap-3">
            <h2 id="queue-heading" className="display text-3xl">
              Verification queue
            </h2>
            {queueCount > 0 && <span className="chip-gold tabular-nums">{queueCount} waiting</span>}
          </div>

          {pendingAchievements === undefined ? (
            <div className="space-y-4" aria-hidden>
              {[1, 2].map((n) => (
                <div key={n} className="panel space-y-3 p-6">
                  <div className="skeleton h-4 w-1/3" />
                  <div className="skeleton h-5 w-2/3" />
                  <div className="skeleton h-12 w-full" />
                </div>
              ))}
            </div>
          ) : pendingAchievements.length === 0 ? (
            <EmptyState icon={<Icons.Check className="h-6 w-6" />} title="All caught up">
              Every submission has been reviewed. New posts will appear here.
            </EmptyState>
          ) : (
            <div className="space-y-4">
              {pendingAchievements.map((item) => {
                const busy = processingId === item._id;
                return (
                  <article key={item._id} className="panel p-6">
                    <header className="flex flex-wrap items-center gap-3">
                      <Avatar name={item.author?.name} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-ink">{item.author?.name || "Student"}</p>
                        <p className="text-xs text-muted">
                          Submitted{" "}
                          {new Date(item.createdAt).toLocaleString(undefined, {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {item.author?.section && (
                        <span className={sectionBadgeClass(item.author.section)}>
                          <SectionIcon section={item.author.section} className="h-3 w-3" />
                          {item.author.section} Year {item.author.year}
                        </span>
                      )}
                    </header>

                    <h3 className="mt-5 text-lg font-semibold leading-snug text-ink">{item.title}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-body">{item.description}</p>

                    {item.proofUrl ? (
                      <a
                        href={item.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-flex items-center gap-2 rounded-xl border border-line bg-sunken/50 px-4 py-2.5 text-sm font-semibold text-royal transition hover:border-royal/40"
                      >
                        <Icons.Certificate className="h-4 w-4" />
                        Open proof
                        <Icons.ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <p className="mt-5 text-sm text-muted">No proof attached.</p>
                    )}

                    {feedbackMsg?.id === item._id && (
                      <Alert tone={feedbackMsg.type === "success" ? "success" : "error"} className="mt-5">
                        {feedbackMsg.text}
                      </Alert>
                    )}

                    <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
                      <button
                        onClick={() => handleVerify(item._id, "verified")}
                        disabled={busy}
                        className="btn-success"
                      >
                        {busy ? <Spinner /> : <Icons.Verified className="h-4 w-4" />}
                        Verify and award 50 XP
                      </button>
                      <button onClick={() => handleVerify(item._id, "rejected")} disabled={busy} className="btn-danger">
                        Reject
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <section className="panel p-6">
            <h2 className="font-semibold text-ink">How XP works</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Your decisions add XP to a student&apos;s public profile.
            </p>
            <dl className="mt-5 divide-y divide-line rounded-xl border border-line">
              <div className="flex items-center justify-between px-4 py-3">
                <dt className="text-sm text-body">Posting an achievement</dt>
                <dd className="chip-neutral tabular-nums">+10 XP</dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <dt className="text-sm text-body">Verified by faculty</dt>
                <dd className="chip-gold tabular-nums">+50 XP</dd>
              </div>
            </dl>
          </section>

          <Link href="/events" className="panel group flex items-center gap-4 p-4 transition hover:border-line-strong">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold/30 bg-gold-tint text-gold-ink">
              <Icons.Users className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">Hackathon teams</span>
              <span className="block text-xs text-muted">See every event and its members</span>
            </span>
            <Icons.ChevronRight className="ml-auto h-4 w-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
