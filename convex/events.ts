import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";
import { getEffectiveSemester, getClassCode } from "./lib/semester";
import { sectionValidator } from "./lib/validators";

/**
 * Create a new event or hackathon project.
 */
export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    techStack: v.array(v.string()),
    formationMode: v.union(
      v.literal("student_choice"),
      v.literal("faculty_assign")
    ),
    eligibilityFilter: v.union(v.literal("all"), sectionValidator),
    eligibleSemesters: v.optional(v.union(v.literal("all"), v.array(v.number()))),
    teamSizeCap: v.number(),
    deadline: v.number(),
    githubRepoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to createEvent");
    }

    const host = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!host) {
      throw new Error("Host user profile not found");
    }

    const eligibleSemesters = args.eligibleSemesters ?? "all";

    const eventId = await ctx.db.insert("events", {
      hostId: host._id,
      hostType: host.role === "faculty" ? "faculty" : "student",
      title: args.title,
      description: args.description,
      techStack: args.techStack,
      formationMode: args.formationMode,
      eligibilityFilter: args.eligibilityFilter,
      eligibleSemesters,
      teamSizeCap: args.teamSizeCap,
      deadline: args.deadline,
      status: "recruiting",
      githubRepoUrl: args.githubRepoUrl,
      createdAt: Date.now(),
    });

    // Automatically add host as an accepted lead team member
    await ctx.db.insert("teamMembers", {
      eventId,
      userId: host._id,
      role: host.role === "faculty" ? "Faculty Mentor" : "Project Lead",
      status: "accepted",
    });

    return eventId;
  },
});

/**
 * List all events, newest first, with host information and current member counts.
 * Requires sign-in.
 */
export const listEvents = query({
  args: {
    status: v.optional(
      v.union(v.literal("all"), v.literal("recruiting"), v.literal("in_progress"), v.literal("completed"))
    ),
  },
  handler: async (ctx, args) => {
    const viewer = await getCurrentUser(ctx);
    if (!viewer) {
      return [];
    }

    const events = await ctx.db.query("events").order("desc").collect();

    const filteredEvents = events.filter((e) => {
      if (!args.status || args.status === "all") return true;
      return e.status === args.status;
    });

    return await Promise.all(
      filteredEvents.map(async (event) => {
        const host = await ctx.db.get(event.hostId);
        const teamMembers = await ctx.db
          .query("teamMembers")
          .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
          .collect();

        const acceptedCount = teamMembers.filter((m) => m.status === "accepted").length;

        return {
          ...event,
          eligibleSemesters: event.eligibleSemesters ?? "all",
          host: host
            ? {
                _id: host._id,
                name: host.name,
                role: host.role,
                section: host.section,
                classCode: getClassCode(getEffectiveSemester(host), host.section),
              }
            : null,
          acceptedCount,
        };
      })
    );
  },
});

/**
 * Get detailed information for a single event workspace.
 * Requires sign-in. Contact details are never included.
 */
export const getEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const viewer = await getCurrentUser(ctx);
    if (!viewer) {
      return null;
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      return null;
    }

    const host = await ctx.db.get(event.hostId);

    const teamMemberDocs = await ctx.db
      .query("teamMembers")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();

    const membersWithUsers = await Promise.all(
      teamMemberDocs.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        const effectiveSem = user ? getEffectiveSemester(user) : 1;
        const classCode = user ? getClassCode(effectiveSem, user.section) : "";

        return {
          ...member,
          user: user
            ? {
                _id: user._id,
                name: user.name,
                section: user.section,
                effectiveSemester: effectiveSem,
                classCode,
                role: user.role,
              }
            : null,
        };
      })
    );

    return {
      ...event,
      eligibleSemesters: event.eligibleSemesters ?? "all",
      host: host
        ? {
            _id: host._id,
            name: host.name,
            role: host.role,
            section: host.section,
            classCode: getClassCode(getEffectiveSemester(host), host.section),
          }
        : null,
      members: membersWithUsers,
    };
  },
});

/**
 * Host-only mutation to update event status (recruiting -> in_progress -> completed).
 */
export const updateEventStatus = mutation({
  args: {
    eventId: v.id("events"),
    status: v.union(v.literal("recruiting"), v.literal("in_progress"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    if (!user || user._id !== event.hostId) {
      throw new Error("Only the event host can change the event status.");
    }

    await ctx.db.patch(args.eventId, {
      status: args.status,
    });
  },
});
