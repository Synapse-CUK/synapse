"use client";

import { useState, useMemo, ReactNode } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { SECTIONS, type Section } from "@/convex/lib/validators";
import { Icons } from "@/components/Icons";
import { Alert, Avatar, EmptyState, LoadingScreen, Modal, PageHeader, Spinner, StatusScreen } from "@/components/ui";

// Types

type TabId = "overview" | "faculty" | "users" | "events" | "achievements";
type UserRole = "student" | "faculty_pending" | "faculty" | "coordinator";
type EventStatus = "recruiting" | "in_progress" | "completed";
type Feedback = { id: string; text: string; type: "success" | "error" } | null;

// Helpers

const ROLE_META: Record<UserRole, { label: string; chip: string }> = {
  student: { label: "Student", chip: "chip-neutral" },
  faculty_pending: { label: "Faculty pending", chip: "chip-gold" },
  faculty: { label: "Faculty", chip: "chip-royal" },
  coordinator: { label: "Coordinator", chip: "chip-navy" },
};

const STATUS_META: Record<EventStatus, { label: string; chip: string }> = {
  recruiting: { label: "Recruiting", chip: "chip-success" },
  in_progress: { label: "In progress", chip: "chip-royal" },
  completed: { label: "Completed", chip: "chip-neutral" },
};

const ACHIEVEMENT_CHIP: Record<string, string> = {
  pending: "chip-gold",
  verified: "chip-success",
  rejected: "chip-danger",
};

function RoleBadge({ role }: { role: string }) {
  const meta = ROLE_META[role as UserRole] ?? { label: role, chip: "chip-neutral" };
  return <span className={meta.chip}>{meta.label}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status as EventStatus] ?? { label: status, chip: "chip-neutral" };
  return <span className={meta.chip}>{meta.label}</span>;
}

function FeedbackAlert({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  return <Alert tone={feedback.type === "success" ? "success" : "error"}>{feedback.text}</Alert>;
}

function InlineLoading({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-8 text-sm text-muted">
      <Spinner className="h-4 w-4 text-gold" />
      {label}
    </div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th className="label-caps whitespace-nowrap px-4 py-3 text-left font-semibold">{children}</th>;
}

function pct(part: number, whole: number) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

// Tabs

function OverviewTab() {
  const stats = useQuery(api.coordinator.getPlatformStats);

  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-3" aria-hidden>
        {[1, 2, 3].map((n) => (
          <div key={n} className="panel space-y-4 p-6">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-12 w-20" />
            <div className="skeleton h-16 w-full" />
          </div>
        ))}
      </div>
    );
  }

  const groups = [
    {
      title: "People",
      icon: Icons.Users,
      headline: { value: stats.totalUsers, label: "members" },
      rows: [
        { label: "Students", value: stats.totalStudents },
        { label: "Faculty", value: stats.totalFaculty },
        { label: "Faculty waiting for approval", value: stats.pendingFacultyApprovals, flag: stats.pendingFacultyApprovals > 0 },
      ],
      rate: {
        value: pct(stats.totalFaculty, stats.totalFaculty + stats.pendingFacultyApprovals),
        label: "of faculty requests approved",
      },
    },
    {
      title: "Events",
      icon: Icons.Rocket,
      headline: { value: stats.totalEvents, label: "events" },
      rows: [
        { label: "Active", value: stats.activeEvents },
        { label: "Completed", value: stats.completedEvents },
      ],
      rate: { value: pct(stats.completedEvents, stats.totalEvents), label: "of events completed" },
    },
    {
      title: "Achievements",
      icon: Icons.Trophy,
      headline: { value: stats.totalAchievements, label: "posts" },
      rows: [
        { label: "Verified", value: stats.verifiedAchievements },
        { label: "Waiting for review", value: stats.pendingAchievements, flag: stats.pendingAchievements > 0 },
      ],
      rate: { value: pct(stats.verifiedAchievements, stats.totalAchievements), label: "of posts verified" },
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {groups.map((g) => (
        <section key={g.title} className="panel flex flex-col p-6" aria-label={g.title}>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-muted">
            <g.icon className="h-4 w-4 text-royal" />
            {g.title}
          </h3>
          <p className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-5xl font-semibold tabular-nums text-ink">{g.headline.value}</span>
            <span className="text-sm text-muted">{g.headline.label}</span>
          </p>
          <dl className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm">
            {g.rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between gap-4">
                <dt className="text-body">{r.label}</dt>
                <dd className={`font-semibold tabular-nums ${r.flag ? "text-gold-ink" : "text-ink"}`}>{r.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-auto pt-6 text-sm text-muted">
            <span className="font-semibold tabular-nums text-ink">{g.rate.value}%</span> {g.rate.label}
          </p>
        </section>
      ))}
    </div>
  );
}

function FacultyApprovalsTab() {
  const pendingRequests = useQuery(api.coordinator.listPendingFacultyRequests);
  const approveFaculty = useMutation(api.coordinator.approveFacultyRequest);
  const rejectFaculty = useMutation(api.coordinator.rejectFacultyRequest);

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function handleApprove(userId: Id<"users">) {
    if (!confirm(`Approve this user as faculty?`)) return;
    try {
      setProcessingId(userId);
      setFeedback(null);
      await approveFaculty({ userId });
      setFeedback({ id: userId, text: "Approved. They now have faculty access.", type: "success" });
    } catch (e: any) {
      setFeedback({ id: userId, text: e.message ?? "Approval failed.", type: "error" });
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(userId: Id<"users">) {
    if (!confirm(`Reject this faculty request and revert to student?`)) return;
    try {
      setProcessingId(userId);
      setFeedback(null);
      await rejectFaculty({ userId });
      setFeedback({ id: userId, text: "Request rejected. Their role is now student.", type: "error" });
    } catch (e: any) {
      setFeedback({ id: userId, text: e.message ?? "Rejection failed.", type: "error" });
    } finally {
      setProcessingId(null);
    }
  }

  if (!pendingRequests) return <InlineLoading label="Loading requests" />;

  if (pendingRequests.length === 0) {
    return (
      <EmptyState icon={<Icons.Check className="h-6 w-6" />} title="No requests waiting">
        New faculty sign-ups will appear here for review.
      </EmptyState>
    );
  }

  return (
    <div className="space-y-4">
      {pendingRequests.map((u) => (
        <article key={u._id} className="panel p-6">
          <header className="flex flex-wrap items-center gap-3">
            <Avatar name={u.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink">{u.name}</p>
              <p className="text-xs text-muted">
                Signed up{" "}
                {new Date(u.createdAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <RoleBadge role={u.role} />
          </header>

          <dl className="mt-5 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
            {[
              { label: "Email", value: u.universityEmail || u.email || "Not given" },
              { label: "Reg. no.", value: u.registrationNumber || "Not given", mono: true },
              { label: "Section", value: `${u.section}, admitted ${u.admissionYear ?? "unknown"}` },
            ].map((f) => (
              <div key={f.label} className="bg-surface px-4 py-3">
                <dt className="label-caps">{f.label}</dt>
                <dd className={`mt-1 truncate text-sm font-medium text-ink ${f.mono ? "font-mono uppercase" : ""}`}>
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>

          {feedback?.id === u._id && (
            <div className="mt-4">
              <FeedbackAlert feedback={feedback} />
            </div>
          )}

          <div className="mt-5 flex gap-3">
            <button
              onClick={() => handleApprove(u._id)}
              disabled={!!processingId || feedback?.id === u._id}
              className="btn-success"
            >
              {processingId === u._id ? <Spinner /> : <Icons.Check className="h-4 w-4" />}
              Approve
            </button>
            <button
              onClick={() => handleReject(u._id)}
              disabled={!!processingId || feedback?.id === u._id}
              className="btn-danger"
            >
              Reject
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function UsersTab() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [sectionFilter, setSectionFilter] = useState<"all" | Section>("all");
  const [pendingChange, setPendingChange] = useState<{ userId: Id<"users">; name: string; newRole: UserRole } | null>(
    null,
  );
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const users = useQuery(api.coordinator.listAllUsers, {
    roleFilter: roleFilter !== "all" ? roleFilter : undefined,
    sectionFilter: sectionFilter !== "all" ? sectionFilter : undefined,
    searchQuery: search.trim() || undefined,
  });
  const updateRole = useMutation(api.coordinator.updateUserRole);

  function requestRoleChange(userId: Id<"users">, name: string, newRole: UserRole) {
    setPendingChange({ userId, name, newRole });
  }

  async function confirmRoleChange() {
    if (!pendingChange) return;
    const { userId, name, newRole } = pendingChange;
    setPendingChange(null);
    try {
      setProcessingId(userId);
      setFeedback(null);
      await updateRole({ userId, role: newRole });
      setFeedback({ id: userId, text: `${name} is now ${ROLE_META[newRole].label.toLowerCase()}.`, type: "success" });
    } catch (e: any) {
      setFeedback({ id: userId, text: e.message ?? "Update failed.", type: "error" });
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <Modal
        open={!!pendingChange}
        onClose={() => setPendingChange(null)}
        size="sm"
        title="Change role?"
        icon={<Icons.Warning className="h-5 w-5" />}
      >
        {pendingChange && (
          <div className="space-y-6 px-6 py-6">
            <p className="text-[15px] leading-relaxed text-body">
              Set <strong className="text-ink">{pendingChange.name}</strong> to{" "}
              <strong className="text-ink">{ROLE_META[pendingChange.newRole].label}</strong>. Their access changes
              straight away.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setPendingChange(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={confirmRoleChange} className="btn-primary">
                Change role
              </button>
            </div>
          </div>
        )}
      </Modal>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Icons.Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <label htmlFor="user-search" className="sr-only">
            Search users
          </label>
          <input
            id="user-search"
            type="search"
            placeholder="Search by name, email or reg. no."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field h-10 pl-10 text-sm"
          />
        </div>
        <label htmlFor="user-role" className="sr-only">
          Filter by role
        </label>
        <select
          id="user-role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as "all" | UserRole)}
          className="input-field h-10 text-sm md:w-48"
        >
          <option value="all">All roles</option>
          <option value="student">Student</option>
          <option value="faculty_pending">Faculty pending</option>
          <option value="faculty">Faculty</option>
          <option value="coordinator">Coordinator</option>
        </select>
        <label htmlFor="user-section" className="sr-only">
          Filter by section
        </label>
        <select
          id="user-section"
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value as "all" | Section)}
          className="input-field h-10 text-sm md:w-40"
        >
          <option value="all">All sections</option>
          {SECTIONS.map((sec) => (
            <option key={sec} value={sec}>
              {sec}
            </option>
          ))}
        </select>
      </div>

      <FeedbackAlert feedback={feedback} />

      {!users ? (
        <InlineLoading label="Loading users" />
      ) : (
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="text-sm font-semibold text-ink">Users</span>
            <span className="text-xs tabular-nums text-muted">{users.length} shown</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-sunken/60">
                <tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Reg. no.</Th>
                  <Th>Section</Th>
                  <Th>Role</Th>
                  <Th>Change role</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted">
                      No users match these filters.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u._id}
                      className={`transition hover:bg-sunken/40 ${processingId === u._id ? "opacity-60" : ""}`}
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        <Link
                          href={`/profile/${u._id}`}
                          className="flex items-center gap-2.5 font-semibold text-ink hover:text-royal"
                        >
                          <Avatar name={u.name} size="sm" />
                          {u.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted">{u.universityEmail || u.email}</td>
                      <td className="px-4 py-3 font-mono text-xs uppercase text-body">{u.registrationNumber || "None"}</td>
                      <td className="px-4 py-3 font-medium text-body">{u.section}</td>
                      <td className="px-4 py-3">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-4 py-3">
                        <label htmlFor={`role-${u._id}`} className="sr-only">
                          Change role for {u.name}
                        </label>
                        <select
                          id={`role-${u._id}`}
                          value={u.role}
                          onChange={(e) => requestRoleChange(u._id, u.name, e.target.value as UserRole)}
                          disabled={processingId === u._id}
                          className="input-field h-9 w-44 text-sm"
                        >
                          <option value="student">Student</option>
                          <option value="faculty_pending">Faculty pending</option>
                          <option value="faculty">Faculty</option>
                          <option value="coordinator">Coordinator</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function EventsTab() {
  const events = useQuery(api.coordinator.listAllEvents);
  const deleteEvent = useMutation(api.coordinator.deleteEvent);
  const forceUpdateStatus = useMutation(api.coordinator.forceUpdateEventStatus);

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function handleDelete(eventId: Id<"events">, title: string) {
    if (
      !confirm(
        `Delete "${title}" and ALL related data (team members, chat, kanban cards, commit activity)? This is PERMANENT.`,
      )
    )
      return;
    if (!confirm(`Second confirmation: permanently delete "${title}"?`)) return;
    try {
      setProcessingId(eventId);
      setFeedback(null);
      await deleteEvent({ eventId });
      setFeedback({ id: eventId, text: `Deleted "${title}" and everything linked to it.`, type: "success" });
    } catch (e: any) {
      setFeedback({ id: eventId, text: e.message ?? "Delete failed.", type: "error" });
    } finally {
      setProcessingId(null);
    }
  }

  async function handleStatusChange(eventId: Id<"events">, title: string, status: EventStatus) {
    if (!confirm(`Force-change "${title}" status to "${status}"?`)) return;
    try {
      setProcessingId(eventId);
      setFeedback(null);
      await forceUpdateStatus({ eventId, status });
      setFeedback({ id: eventId, text: `Status set to ${STATUS_META[status].label.toLowerCase()}.`, type: "success" });
    } catch (e: any) {
      setFeedback({ id: eventId, text: e.message ?? "Update failed.", type: "error" });
    } finally {
      setProcessingId(null);
    }
  }

  if (!events) return <InlineLoading label="Loading events" />;

  return (
    <div className="space-y-4">
      <FeedbackAlert feedback={feedback} />

      <div className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="text-sm font-semibold text-ink">Events</span>
          <span className="text-xs tabular-nums text-muted">{events.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sunken/60">
              <tr>
                <Th>Title</Th>
                <Th>Host</Th>
                <Th>Members</Th>
                <Th>Status</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted">
                    No events yet.
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev._id} className={`transition hover:bg-sunken/40 ${processingId === ev._id ? "opacity-60" : ""}`}>
                    <td className="max-w-[240px] px-4 py-3">
                      <Link href={`/events/${ev._id}`} className="block truncate font-semibold text-ink hover:text-royal">
                        {ev.title}
                      </Link>
                      <span className="mt-0.5 block truncate font-mono text-[11px] text-muted">
                        {ev.techStack.slice(0, 3).join(", ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block font-medium text-ink">{ev.host?.name ?? "Unknown"}</span>
                      <span className="mt-1 inline-block">
                        <RoleBadge role={ev.host?.role ?? "student"} />
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-body">
                      {ev.acceptedCount} of {ev.teamSizeCap}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ev.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted">
                      {new Date(ev.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <label htmlFor={`status-${ev._id}`} className="sr-only">
                          Status for {ev.title}
                        </label>
                        <select
                          id={`status-${ev._id}`}
                          value={ev.status}
                          onChange={(e) => handleStatusChange(ev._id, ev.title, e.target.value as EventStatus)}
                          disabled={processingId === ev._id}
                          className="input-field h-9 w-36 text-sm"
                        >
                          <option value="recruiting">Recruiting</option>
                          <option value="in_progress">In progress</option>
                          <option value="completed">Completed</option>
                        </select>
                        <button
                          onClick={() => handleDelete(ev._id, ev.title)}
                          disabled={processingId === ev._id}
                          aria-label={`Delete ${ev.title}`}
                          className="btn-danger btn-sm h-9 w-9 px-0"
                        >
                          {processingId === ev._id ? <Spinner /> : <Icons.Trash className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AchievementsTab() {
  const achievements = useQuery(api.coordinator.listAllAchievements);
  const deleteAchievement = useMutation(api.coordinator.deleteAchievement);

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");

  const filtered = useMemo(() => {
    if (!achievements) return [];
    if (statusFilter === "all") return achievements;
    return achievements.filter((a) => a.status === statusFilter);
  }, [achievements, statusFilter]);

  async function handleDelete(achievementId: Id<"achievements">, title: string) {
    if (!confirm(`Permanently delete achievement "${title}"? This cannot be undone.`)) return;
    try {
      setProcessingId(achievementId);
      setFeedback(null);
      await deleteAchievement({ achievementId });
      setFeedback({ id: achievementId, text: `Deleted "${title}".`, type: "success" });
    } catch (e: any) {
      setFeedback({ id: achievementId, text: e.message ?? "Delete failed.", type: "error" });
    } finally {
      setProcessingId(null);
    }
  }

  const filters = [
    { id: "all", label: "All" },
    { id: "pending", label: "In review" },
    { id: "verified", label: "Verified" },
    { id: "rejected", label: "Rejected" },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="segmented" role="group" aria-label="Filter by status">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              aria-pressed={statusFilter === f.id}
              className={`segment ${statusFilter === f.id ? "segment-active" : ""}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {achievements !== undefined && (
          <span className="text-xs tabular-nums text-muted">{filtered.length} shown</span>
        )}
      </div>

      <FeedbackAlert feedback={feedback} />

      {!achievements ? (
        <InlineLoading label="Loading achievements" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Icons.Trophy className="h-6 w-6" />} title="Nothing to show">
          No achievements match this filter.
        </EmptyState>
      ) : (
        <div className="panel divide-y divide-line">
          {filtered.map((a) => (
            <div key={a._id} className={`flex items-start gap-4 p-5 ${processingId === a._id ? "opacity-60" : ""}`}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-ink">{a.title}</span>
                  <span className={ACHIEVEMENT_CHIP[a.status] ?? "chip-neutral"}>
                    {a.status === "pending" ? "In review" : a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{a.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                  <span>
                    By <span className="font-semibold text-body">{a.author?.name ?? "Unknown"}</span>
                    {a.author?.section && <span> ({a.author.section})</span>}
                  </span>
                  <span className="tabular-nums">{new Date(a.createdAt).toLocaleDateString("en-IN")}</span>
                  {a.proofUrl && (
                    <a
                      href={a.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-royal hover:underline"
                    >
                      <Icons.Paperclip className="h-3.5 w-3.5" />
                      Proof
                    </a>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(a._id, a.title)}
                disabled={processingId === a._id}
                aria-label={`Delete ${a.title}`}
                className="btn-danger btn-sm h-9 w-9 shrink-0 px-0"
              >
                {processingId === a._id ? <Spinner /> : <Icons.Trash className="h-4 w-4" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Page

const TABS: { id: TabId; label: string; icon: (p: React.SVGProps<SVGSVGElement>) => React.ReactElement }[] = [
  { id: "overview", label: "Overview", icon: Icons.Chart },
  { id: "faculty", label: "Faculty approvals", icon: Icons.Faculty },
  { id: "users", label: "Users", icon: Icons.Users },
  { id: "events", label: "Events", icon: Icons.Rocket },
  { id: "achievements", label: "Achievements", icon: Icons.Trophy },
];

export default function CoordinatorDashboardPage() {
  const dbUser = useQuery(api.users.current);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  if (dbUser === undefined) {
    return <LoadingScreen label="Checking coordinator access" />;
  }

  if (!dbUser || dbUser.role !== "coordinator") {
    return (
      <StatusScreen
        icon={<Icons.Shield className="h-7 w-7" />}
        title="Coordinators only"
        action={
          <Link href="/feed" className="btn-primary">
            Back to feed
          </Link>
        }
      >
        This control panel is for department coordinators.
      </StatusScreen>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:py-12">
      <PageHeader
        title="Coordinator dashboard"
        description="Users, events, achievements and faculty approvals across the platform."
        actions={
          <span className="chip-navy h-9 px-4 text-sm">
            <Icons.Crown className="h-4 w-4 text-gold-ink" />
            {dbUser.name}
          </span>
        }
      />

      <div className="overflow-x-auto">
        <div className="segmented" role="tablist" aria-label="Dashboard sections">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`segment ${activeTab === tab.id ? "segment-active" : ""}`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "faculty" && <FacultyApprovalsTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "events" && <EventsTab />}
        {activeTab === "achievements" && <AchievementsTab />}
      </div>
    </div>
  );
}
