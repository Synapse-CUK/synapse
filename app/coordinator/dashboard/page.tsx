"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { SECTIONS, type Section } from "@/convex/lib/validators";

// ─── Types ──────────────────────────────────────────────────────────────────
type TabId = "overview" | "faculty" | "users" | "events" | "achievements";
type UserRole = "student" | "faculty_pending" | "faculty" | "coordinator";
type EventStatus = "recruiting" | "in_progress" | "completed";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const ROLE_META: Record<UserRole, { label: string; color: string }> = {
  student:         { label: "Student",         color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  faculty_pending: { label: "Pending Faculty",  color: "bg-amber-100  text-amber-800  border-amber-200"   },
  faculty:         { label: "Faculty",          color: "bg-indigo-100 text-indigo-800 border-indigo-200"  },
  coordinator:     { label: "Coordinator",      color: "bg-purple-100 text-purple-800 border-purple-200"  },
};

const STATUS_META: Record<EventStatus, { label: string; color: string }> = {
  recruiting:  { label: "Recruiting",  color: "bg-blue-100   text-blue-800   border-blue-200"   },
  in_progress: { label: "In Progress", color: "bg-amber-100  text-amber-800  border-amber-200"  },
  completed:   { label: "Completed",   color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
};

function RoleBadge({ role }: { role: string }) {
  const meta = ROLE_META[role as UserRole] ?? { label: role, color: "bg-stone-100 text-stone-700 border-stone-200" };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold border ${meta.color}`}>
      {meta.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status as EventStatus] ?? { label: status, color: "bg-stone-100 text-stone-700 border-stone-200" };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold border ${meta.color}`}>
      {meta.label}
    </span>
  );
}

function Spinner({ color = "border-purple-600" }: { color?: string }) {
  return <div className={`w-4 h-4 border-2 ${color} border-t-transparent rounded-full animate-spin`} />;
}

// ─── Sub-tabs ────────────────────────────────────────────────────────────────

function OverviewTab() {
  const stats = useQuery(api.coordinator.getPlatformStats);

  if (!stats) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white border border-stone-200 rounded-2xl p-5 animate-pulse space-y-2">
          <div className="w-8 h-8 bg-stone-100 rounded-xl" />
          <div className="w-16 h-6 bg-stone-100 rounded" />
          <div className="w-24 h-3 bg-stone-100 rounded" />
        </div>
      ))}
    </div>
  );

  const cards = [
    { icon: "👥", label: "Total Users",        value: stats.totalUsers,            color: "from-purple-500 to-indigo-600" },
    { icon: "🎓", label: "Students",           value: stats.totalStudents,         color: "from-emerald-500 to-teal-600"  },
    { icon: "📚", label: "Faculty",            value: stats.totalFaculty,          color: "from-indigo-500 to-blue-600"   },
    { icon: "⏳", label: "Pending Faculty",    value: stats.pendingFacultyApprovals, color: "from-amber-500 to-orange-500" },
    { icon: "⚡", label: "Active Events",      value: stats.activeEvents,          color: "from-blue-500 to-cyan-600"     },
    { icon: "✅", label: "Completed Events",   value: stats.completedEvents,       color: "from-teal-500 to-emerald-600"  },
    { icon: "🏆", label: "Total Achievements", value: stats.totalAchievements,     color: "from-rose-500 to-pink-600"     },
    { icon: "🔬", label: "Pending Verification",value: stats.pendingAchievements,  color: "from-orange-500 to-amber-600"  },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-xl mb-3`}>
              {card.icon}
            </div>
            <div className="text-3xl font-black text-zinc-900 font-mono">{card.value}</div>
            <div className="text-xs font-semibold text-stone-500 mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-2xs">
        <h3 className="text-sm font-extrabold text-zinc-900 mb-3">Platform Health</h3>
        <div className="space-y-2 font-mono text-xs">
          <div className="flex justify-between items-center py-2 border-b border-stone-100">
            <span className="text-stone-500">Faculty approval rate</span>
            <span className="font-bold text-indigo-700">
              {stats.totalFaculty + stats.pendingFacultyApprovals > 0
                ? Math.round((stats.totalFaculty / (stats.totalFaculty + stats.pendingFacultyApprovals)) * 100)
                : 0}% approved
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-stone-100">
            <span className="text-stone-500">Achievement verification rate</span>
            <span className="font-bold text-emerald-700">
              {stats.totalAchievements > 0
                ? Math.round((stats.verifiedAchievements / stats.totalAchievements) * 100)
                : 0}% verified
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-stone-500">Events completion rate</span>
            <span className="font-bold text-teal-700">
              {stats.totalEvents > 0
                ? Math.round((stats.completedEvents / stats.totalEvents) * 100)
                : 0}% completed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FacultyApprovalsTab() {
  const pendingRequests = useQuery(api.coordinator.listPendingFacultyRequests);
  const approveFaculty  = useMutation(api.coordinator.approveFacultyRequest);
  const rejectFaculty   = useMutation(api.coordinator.rejectFacultyRequest);

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; text: string; type: "success" | "error" } | null>(null);

  async function handleApprove(userId: Id<"users">) {
    if (!confirm(`Approve this user as faculty?`)) return;
    try {
      setProcessingId(userId); setFeedback(null);
      await approveFaculty({ userId });
      setFeedback({ id: userId, text: "✓ Approved — user now has full faculty access.", type: "success" });
    } catch (e: any) {
      setFeedback({ id: userId, text: e.message ?? "Approval failed.", type: "error" });
    } finally { setProcessingId(null); }
  }

  async function handleReject(userId: Id<"users">) {
    if (!confirm(`Reject this faculty request and revert to student?`)) return;
    try {
      setProcessingId(userId); setFeedback(null);
      await rejectFaculty({ userId });
      setFeedback({ id: userId, text: "Request rejected. Role set to student.", type: "error" });
    } catch (e: any) {
      setFeedback({ id: userId, text: e.message ?? "Rejection failed.", type: "error" });
    } finally { setProcessingId(null); }
  }

  if (!pendingRequests) return <div className="flex items-center gap-2 text-stone-500 text-sm"><Spinner /><span>Loading...</span></div>;

  if (pendingRequests.length === 0) return (
    <div className="bg-white border border-stone-200/80 rounded-2xl p-12 text-center shadow-2xs">
      <div className="text-4xl mb-3">✓</div>
      <h3 className="text-lg font-extrabold text-zinc-900">Queue Clear</h3>
      <p className="text-stone-500 text-sm mt-1">No faculty signups awaiting review.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {pendingRequests.map((u) => (
        <article key={u._id} className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="font-black text-zinc-900 text-base">{u.name}</div>
              <div className="text-xs font-mono text-stone-400 mt-0.5">
                {new Date(u.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            <RoleBadge role={u.role} />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4 font-mono text-xs">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
              <div className="text-stone-400 uppercase tracking-wider text-[10px] mb-0.5">Email</div>
              <div className="font-bold truncate">{u.universityEmail || u.email || "—"}</div>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
              <div className="text-stone-400 uppercase tracking-wider text-[10px] mb-0.5">Reg. No.</div>
              <div className="font-bold uppercase">{u.registrationNumber || "—"}</div>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
              <div className="text-stone-400 uppercase tracking-wider text-[10px] mb-0.5">Section</div>
              <div className="font-bold">{u.section} · {u.admissionYear ?? "—"}</div>
            </div>
          </div>
          {feedback?.id === u._id && (
            <div className={`p-3 mb-3 rounded-xl text-xs font-mono font-bold border ${feedback.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
              {feedback.text}
            </div>
          )}
          <div className="flex gap-3 pt-3 border-t border-stone-100">
            <button
              onClick={() => handleApprove(u._id)}
              disabled={!!processingId || feedback?.id === u._id}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition disabled:opacity-50 flex items-center gap-2"
            >
              {processingId === u._id ? <Spinner color="border-white" /> : "✓ Approve Faculty"}
            </button>
            <button
              onClick={() => handleReject(u._id)}
              disabled={!!processingId || feedback?.id === u._id}
              className="px-5 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs transition disabled:opacity-50"
            >
              ✕ Reject
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
  const [pendingChange, setPendingChange] = useState<{ userId: Id<"users">; name: string; newRole: UserRole } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; text: string; type: "success" | "error" } | null>(null);

  const users = useQuery(api.coordinator.listAllUsers, {
    roleFilter:    roleFilter    !== "all" ? roleFilter    : undefined,
    sectionFilter: sectionFilter !== "all" ? sectionFilter : undefined,
    searchQuery:   search.trim() || undefined,
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
      setFeedback({ id: userId, text: `✓ ${name}'s role updated to ${newRole}.`, type: "success" });
    } catch (e: any) {
      setFeedback({ id: userId, text: e.message ?? "Update failed.", type: "error" });
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Confirm Modal */}
      {pendingChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 space-y-4">
            <div className="text-2xl text-center">⚠️</div>
            <h2 className="text-lg font-extrabold text-zinc-900 text-center">Confirm Role Change</h2>
            <p className="text-sm text-stone-600 text-center">
              Set <strong>{pendingChange.name}</strong>'s role to{" "}
              <strong className="text-purple-700">{pendingChange.newRole}</strong>?
              This immediately changes their access on the platform.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={confirmRoleChange}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition"
              >
                Confirm
              </button>
              <button
                onClick={() => setPendingChange(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-bold text-sm transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-2xs flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search by name, email, reg. no…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border border-stone-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="px-3 py-2 rounded-xl border border-stone-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
        >
          <option value="all">All Roles</option>
          <option value="student">Student</option>
          <option value="faculty_pending">Pending Faculty</option>
          <option value="faculty">Faculty</option>
          <option value="coordinator">Coordinator</option>
        </select>
        <select
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value as any)}
          className="px-3 py-2 rounded-xl border border-stone-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
        >
          <option value="all">All Sections</option>
          {SECTIONS.map((sec) => (
            <option key={sec} value={sec}>{sec}</option>
          ))}
        </select>
        {users !== undefined && (
          <span className="text-xs font-mono text-stone-400">{users.length} users</span>
        )}
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`px-4 py-3 rounded-xl text-xs font-mono font-bold border ${feedback.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
          {feedback.text}
        </div>
      )}

      {/* Table */}
      {!users ? (
        <div className="flex items-center gap-2 text-stone-500 text-sm"><Spinner /><span>Loading users...</span></div>
      ) : (
        <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="text-left px-4 py-3 text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">Reg. No.</th>
                  <th className="text-left px-4 py-3 text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">Section</th>
                  <th className="text-left px-4 py-3 text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">Current Role</th>
                  <th className="text-left px-4 py-3 text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-stone-400 text-sm">No users match your filters.</td>
                  </tr>
                ) : users.map((u) => (
                  <tr key={u._id} className={`hover:bg-stone-50/50 transition ${processingId === u._id ? "opacity-60" : ""}`}>
                    <td className="px-4 py-3 font-bold text-zinc-900 whitespace-nowrap">
                      <Link href={`/profile/${u._id}`} className="hover:text-purple-700 transition">{u.name}</Link>
                    </td>
                    <td className="px-4 py-3 text-stone-500 font-mono text-xs">{u.universityEmail || u.email}</td>
                    <td className="px-4 py-3 font-mono text-xs text-stone-600 uppercase">{u.registrationNumber || "—"}</td>
                    <td className="px-4 py-3 text-xs font-bold">{u.section}</td>
                    <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => requestRoleChange(u._id, u.name, e.target.value as UserRole)}
                        disabled={processingId === u._id}
                        className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-mono font-bold bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 cursor-pointer"
                      >
                        <option value="student">student</option>
                        <option value="faculty_pending">faculty_pending</option>
                        <option value="faculty">faculty</option>
                        <option value="coordinator">coordinator</option>
                      </select>
                    </td>
                  </tr>
                ))}
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
  const deleteEvent         = useMutation(api.coordinator.deleteEvent);
  const forceUpdateStatus   = useMutation(api.coordinator.forceUpdateEventStatus);

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; text: string; type: "success" | "error" } | null>(null);

  async function handleDelete(eventId: Id<"events">, title: string) {
    if (!confirm(`Delete "${title}" and ALL related data (team members, chat, kanban cards, commit activity)? This is PERMANENT.`)) return;
    if (!confirm(`Second confirmation: permanently delete "${title}"?`)) return;
    try {
      setProcessingId(eventId); setFeedback(null);
      await deleteEvent({ eventId });
      setFeedback({ id: eventId, text: `✓ Event "${title}" and all related records deleted.`, type: "success" });
    } catch (e: any) {
      setFeedback({ id: eventId, text: e.message ?? "Delete failed.", type: "error" });
    } finally { setProcessingId(null); }
  }

  async function handleStatusChange(eventId: Id<"events">, title: string, status: EventStatus) {
    if (!confirm(`Force-change "${title}" status to "${status}"?`)) return;
    try {
      setProcessingId(eventId); setFeedback(null);
      await forceUpdateStatus({ eventId, status });
      setFeedback({ id: eventId, text: `✓ Status updated to "${status}".`, type: "success" });
    } catch (e: any) {
      setFeedback({ id: eventId, text: e.message ?? "Update failed.", type: "error" });
    } finally { setProcessingId(null); }
  }

  if (!events) return <div className="flex items-center gap-2 text-stone-500 text-sm"><Spinner /><span>Loading events...</span></div>;

  return (
    <div className="space-y-4">
      <div className="text-xs font-mono text-stone-400">{events.length} total events</div>

      {feedback && (
        <div className={`px-4 py-3 rounded-xl text-xs font-mono font-bold border ${feedback.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
          {feedback.text}
        </div>
      )}

      <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="text-left px-4 py-3 text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">Host</th>
                <th className="text-left px-4 py-3 text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">Members</th>
                <th className="text-left px-4 py-3 text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">Created</th>
                <th className="text-left px-4 py-3 text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {events.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-stone-400 text-sm">No events on the platform.</td></tr>
              ) : events.map((ev) => (
                <tr key={ev._id} className={`hover:bg-stone-50/50 transition ${processingId === ev._id ? "opacity-60" : ""}`}>
                  <td className="px-4 py-3 font-bold text-zinc-900 max-w-[180px]">
                    <div className="truncate">{ev.title}</div>
                    <div className="text-[10px] font-mono text-stone-400 mt-0.5">{ev.techStack.slice(0, 3).join(", ")}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="font-bold text-zinc-700">{ev.host?.name ?? "—"}</div>
                    <RoleBadge role={ev.host?.role ?? "student"} />
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-stone-600">
                    {ev.acceptedCount}/{ev.teamSizeCap}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={ev.status} />
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-stone-400 whitespace-nowrap">
                    {new Date(ev.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={ev.status}
                        onChange={(e) => handleStatusChange(ev._id, ev.title, e.target.value as EventStatus)}
                        disabled={processingId === ev._id}
                        className="px-2 py-1 rounded-lg border border-stone-200 text-[11px] font-mono bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 cursor-pointer"
                      >
                        <option value="recruiting">recruiting</option>
                        <option value="in_progress">in_progress</option>
                        <option value="completed">completed</option>
                      </select>
                      <button
                        onClick={() => handleDelete(ev._id, ev.title)}
                        disabled={processingId === ev._id}
                        className="px-3 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold text-[11px] transition disabled:opacity-50"
                      >
                        {processingId === ev._id ? "…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AchievementsTab() {
  const achievements   = useQuery(api.coordinator.listAllAchievements);
  const deleteAchievement = useMutation(api.coordinator.deleteAchievement);

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; text: string; type: "success" | "error" } | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");

  const filtered = useMemo(() => {
    if (!achievements) return [];
    if (statusFilter === "all") return achievements;
    return achievements.filter((a) => a.status === statusFilter);
  }, [achievements, statusFilter]);

  async function handleDelete(achievementId: Id<"achievements">, title: string) {
    if (!confirm(`Permanently delete achievement "${title}"? This cannot be undone.`)) return;
    try {
      setProcessingId(achievementId); setFeedback(null);
      await deleteAchievement({ achievementId });
      setFeedback({ id: achievementId, text: `✓ Achievement "${title}" deleted.`, type: "success" });
    } catch (e: any) {
      setFeedback({ id: achievementId, text: e.message ?? "Delete failed.", type: "error" });
    } finally { setProcessingId(null); }
  }

  const STATUS_COLORS: Record<string, string> = {
    pending:  "bg-amber-100 text-amber-800 border-amber-200",
    verified: "bg-emerald-100 text-emerald-800 border-emerald-200",
    rejected: "bg-rose-100 text-rose-800 border-rose-200",
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-2xs flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          {(["all", "pending", "verified", "rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition ${
                statusFilter === s ? "bg-purple-600 text-white border-purple-600" : "bg-white text-stone-600 border-stone-200 hover:border-purple-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {achievements !== undefined && (
          <span className="text-xs font-mono text-stone-400 ml-auto">{filtered.length} records</span>
        )}
      </div>

      {feedback && (
        <div className={`px-4 py-3 rounded-xl text-xs font-mono font-bold border ${feedback.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
          {feedback.text}
        </div>
      )}

      {!achievements ? (
        <div className="flex items-center gap-2 text-stone-500 text-sm"><Spinner /><span>Loading achievements...</span></div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white border border-stone-200/80 rounded-2xl p-10 text-center text-stone-400 text-sm">
              No achievements matching this filter.
            </div>
          ) : filtered.map((a) => (
            <div key={a._id} className={`bg-white border border-stone-200/80 rounded-2xl p-5 shadow-2xs flex items-start gap-4 ${processingId === a._id ? "opacity-60" : ""}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-bold text-zinc-900">{a.title}</span>
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${STATUS_COLORS[a.status] ?? ""}`}>
                    {a.status}
                  </span>
                </div>
                <div className="text-xs text-stone-500 mb-1.5 line-clamp-2">{a.description}</div>
                <div className="flex items-center gap-3 text-[10px] font-mono text-stone-400 flex-wrap">
                  <span>By: <strong className="text-stone-600">{a.author?.name ?? "Unknown"}</strong></span>
                  <span>{a.author?.section}</span>
                  <span>{new Date(a.createdAt).toLocaleDateString("en-IN")}</span>
                  {a.proofUrl && (
                    <a href={a.proofUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                      📎 Proof
                    </a>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(a._id, a.title)}
                disabled={processingId === a._id}
                className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold text-xs transition disabled:opacity-50 shrink-0"
              >
                {processingId === a._id ? <Spinner color="border-rose-400" /> : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "overview",      label: "Overview",          icon: "📊" },
  { id: "faculty",       label: "Faculty Approvals",  icon: "🎓" },
  { id: "users",         label: "Users",              icon: "👥" },
  { id: "events",        label: "Events",             icon: "⚡" },
  { id: "achievements",  label: "Achievements",       icon: "🏆" },
];

export default function CoordinatorDashboardPage() {
  const dbUser = useQuery(api.users.current);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  // Loading
  if (dbUser === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-stone-500 font-mono text-xs">
        <div className="flex items-center gap-3">
          <Spinner color="border-purple-600" />
          <span>Verifying coordinator credentials...</span>
        </div>
      </div>
    );
  }

  // Access gate
  if (!dbUser || dbUser.role !== "coordinator") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-2xl">🛡️</div>
        <h1 className="text-2xl font-extrabold text-zinc-900">Coordinator Access Required</h1>
        <p className="text-stone-600 text-sm max-w-md mx-auto">This control panel is reserved for department coordinators only.</p>
        <Link href="/feed" className="inline-block px-6 py-3 bg-teal-600 hover:bg-teal-500 rounded-xl text-white font-bold text-sm shadow-sm transition">
          Return to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-2xs relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 font-mono text-xs font-bold text-purple-700">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
              <span>COORDINATOR // ADMIN_CONTROL_PANEL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">Coordinator Dashboard</h1>
            <p className="text-stone-500 text-sm mt-1">Platform-wide admin controls — users, events, achievements, faculty approvals.</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-purple-50 border border-purple-200 font-mono text-xs font-bold text-purple-700 shrink-0">
            👑 {dbUser?.name}
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-1.5 shadow-2xs flex flex-wrap gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-purple-600 text-white shadow-sm"
                : "text-stone-500 hover:text-stone-800 hover:bg-stone-100"
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "overview"     && <OverviewTab />}
        {activeTab === "faculty"      && <FacultyApprovalsTab />}
        {activeTab === "users"        && <UsersTab />}
        {activeTab === "events"       && <EventsTab />}
        {activeTab === "achievements" && <AchievementsTab />}
      </div>
    </div>
  );
}
