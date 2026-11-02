import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { sectionValidator } from "./lib/validators";

/**
 * Helper function to require coordinator authority on function invocation.
 */
async function requireCoordinator(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated call. Please sign in.");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user || user.role !== "coordinator") {
    throw new Error("Forbidden: Requires coordinator permissions.");
  }

  return user;
}

/**
 * List all users with role 'faculty_pending' awaiting verification.
 * Restricted to coordinator role only.
 */
export const listPendingFacultyRequests = query({
  args: {},
  handler: async (ctx) => {
    await requireCoordinator(ctx);

    const pendingUsers = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "faculty_pending"))
      .collect();

    return pendingUsers.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Approve a faculty signup request, setting their role to 'faculty'.
 * Restricted to coordinator role only.
 */
export const approveFacultyRequest = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireCoordinator(ctx);
    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) throw new Error("User record not found");
    if (targetUser.role !== "faculty_pending") {
      throw new Error("This user has no pending faculty request.");
    }
    await ctx.db.patch(args.userId, { role: "faculty" });
    return { success: true, userId: args.userId, newRole: "faculty" };
  },
});

/**
 * Reject a faculty signup request, reverting their role back to 'student'.
 * Restricted to coordinator role only.
 */
export const rejectFacultyRequest = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireCoordinator(ctx);
    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) throw new Error("User record not found");
    if (targetUser.role !== "faculty_pending") {
      throw new Error("This user has no pending faculty request.");
    }
    await ctx.db.patch(args.userId, { role: "student" });
    return { success: true, userId: args.userId, newRole: "student" };
  },
});

// ─────────────────────────────────────────────────────────────────
// USER MANAGEMENT
// ─────────────────────────────────────────────────────────────────

/**
 * List all users on the platform with optional role/section/search filters.
 * Coordinator only.
 */
export const listAllUsers = query({
  args: {
    roleFilter: v.optional(
      v.union(
        v.literal("all"),
        v.literal("student"),
        v.literal("faculty_pending"),
        v.literal("faculty"),
        v.literal("coordinator")
      )
    ),
    sectionFilter: v.optional(v.union(v.literal("all"), sectionValidator)),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireCoordinator(ctx);

    const allUsers = await ctx.db.query("users").order("desc").take(500);

    return allUsers.filter((u) => {
      if (args.roleFilter && args.roleFilter !== "all" && u.role !== args.roleFilter) return false;
      if (args.sectionFilter && args.sectionFilter !== "all" && u.section !== args.sectionFilter) return false;
      if (args.searchQuery) {
        const q = args.searchQuery.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchReg = u.registrationNumber?.toLowerCase().includes(q) ?? false;
        if (!matchName && !matchEmail && !matchReg) return false;
      }
      return true;
    });
  },
});

/**
 * Directly set any user's role — coordinator manual override.
 * Bypasses the faculty-request flow entirely.
 * Coordinator only.
 */
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("student"),
      v.literal("faculty_pending"),
      v.literal("faculty"),
      v.literal("coordinator")
    ),
  },
  handler: async (ctx, args) => {
    await requireCoordinator(ctx);
    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) throw new Error("User not found");
    await ctx.db.patch(args.userId, { role: args.role });
    return { success: true, userId: args.userId, newRole: args.role };
  },
});

// ─────────────────────────────────────────────────────────────────
// EVENT MANAGEMENT
// ─────────────────────────────────────────────────────────────────

/**
 * List all events platform-wide with host info and team member counts.
 * Coordinator only.
 */
export const listAllEvents = query({
  args: {},
  handler: async (ctx) => {
    await requireCoordinator(ctx);

    const events = await ctx.db.query("events").order("desc").take(200);

    return await Promise.all(
      events.map(async (event) => {
        const host = await ctx.db.get(event.hostId);
        const teamMembers = await ctx.db
          .query("teamMembers")
          .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
          .collect();

        return {
          ...event,
          eligibleSemesters: event.eligibleSemesters ?? "all",
          host: host
            ? { _id: host._id, name: host.name, role: host.role, section: host.section }
            : null,
          teamMemberCount: teamMembers.length,
          acceptedCount: teamMembers.filter((m) => m.status === "accepted").length,
        };
      })
    );
  },
});

/**
 * Cascade-delete an event and ALL related records:
 * joinRequestMessages → teamMembers → kanbanCards → teamChat → commitActivity → event
 * Coordinator only.
 */
export const deleteEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    await requireCoordinator(ctx);

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    // 1. teamMembers + their joinRequestMessages
    const teamMembers = await ctx.db
      .query("teamMembers")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();

    for (const member of teamMembers) {
      const messages = await ctx.db
        .query("joinRequestMessages")
        .withIndex("by_teamMemberId", (q) => q.eq("teamMemberId", member._id))
        .collect();
      for (const msg of messages) await ctx.db.delete(msg._id);
      await ctx.db.delete(member._id);
    }

    // 2. kanbanCards
    const kanbanCards = await ctx.db
      .query("kanbanCards")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();
    for (const card of kanbanCards) await ctx.db.delete(card._id);

    // 3. teamChat
    const chatMessages = await ctx.db
      .query("teamChat")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();
    for (const msg of chatMessages) await ctx.db.delete(msg._id);

    // 4. commitActivity
    const commits = await ctx.db
      .query("commitActivity")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();
    for (const commit of commits) await ctx.db.delete(commit._id);

    // 5. Delete the event itself
    await ctx.db.delete(args.eventId);

    return { success: true, deletedEventId: args.eventId };
  },
});

/**
 * Force-update any event's status regardless of who hosts it.
 * Coordinator only.
 */
export const forceUpdateEventStatus = mutation({
  args: {
    eventId: v.id("events"),
    status: v.union(
      v.literal("recruiting"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    await requireCoordinator(ctx);
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    await ctx.db.patch(args.eventId, { status: args.status });
    return { success: true, eventId: args.eventId, newStatus: args.status };
  },
});

// ─────────────────────────────────────────────────────────────────
// ACHIEVEMENT MANAGEMENT
// ─────────────────────────────────────────────────────────────────

/**
 * List all achievements platform-wide with author info.
 * Coordinator only.
 */
export const listAllAchievements = query({
  args: {},
  handler: async (ctx) => {
    await requireCoordinator(ctx);

    const achievements = await ctx.db
      .query("achievements")
      .order("desc")
      .take(300);

    return await Promise.all(
      achievements.map(async (item) => {
        const author = await ctx.db.get(item.userId);
        let proofUrl = item.proofFileUrl;
        if (item.proofStorageId) {
          const url = await ctx.storage.getUrl(item.proofStorageId);
          if (url) proofUrl = url;
        }
        return {
          ...item,
          proofUrl,
          author: author
            ? { _id: author._id, name: author.name, section: author.section, email: author.email }
            : null,
        };
      })
    );
  },
});

/**
 * Permanently delete an achievement record.
 * Coordinator only.
 */
export const deleteAchievement = mutation({
  args: { achievementId: v.id("achievements") },
  handler: async (ctx, args) => {
    await requireCoordinator(ctx);
    const achievement = await ctx.db.get(args.achievementId);
    if (!achievement) throw new Error("Achievement not found");
    await ctx.db.delete(args.achievementId);
    return { success: true, deletedId: args.achievementId };
  },
});

// ─────────────────────────────────────────────────────────────────
// PLATFORM STATS
// ─────────────────────────────────────────────────────────────────

/**
 * Aggregate platform-wide counts for the overview dashboard.
 * Coordinator only.
 */
export const getPlatformStats = query({
  args: {},
  handler: async (ctx) => {
    await requireCoordinator(ctx);

    const [students, facultyPending, faculty, coordinators, events, achievements] =
      await Promise.all([
        ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "student")).collect(),
        ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "faculty_pending")).collect(),
        ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "faculty")).collect(),
        ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "coordinator")).collect(),
        ctx.db.query("events").collect(),
        ctx.db.query("achievements").collect(),
      ]);

    const activeEvents = events.filter(
      (e) => e.status === "recruiting" || e.status === "in_progress"
    ).length;
    const completedEvents = events.filter((e) => e.status === "completed").length;
    const pendingAchievements = achievements.filter((a) => a.status === "pending").length;
    const verifiedAchievements = achievements.filter((a) => a.status === "verified").length;

    return {
      totalStudents: students.length,
      totalFaculty: faculty.length,
      pendingFacultyApprovals: facultyPending.length,
      totalCoordinators: coordinators.length,
      totalUsers: students.length + facultyPending.length + faculty.length + coordinators.length,
      activeEvents,
      completedEvents,
      totalEvents: events.length,
      totalAchievements: achievements.length,
      pendingAchievements,
      verifiedAchievements,
    };
  },
});
