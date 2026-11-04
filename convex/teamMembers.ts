import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";
import { getAcademicInfo, getEffectiveSemester } from "./lib/semester";
import { hasFacultyAccess, isStudent } from "./lib/roles";

/**
 * Student request to join an event with a desired role.
 * Allowed ONLY if event.formationMode === "student_choice" and student meets section & semester eligibility.
 */
export const requestToJoin = mutation({
  args: {
    eventId: v.id("events"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthenticated call to requestToJoin");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new ConvexError("User record not found");
    }

    if (!isStudent(user.role)) {
      throw new ConvexError("Only students can join teams.");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new ConvexError("Event not found");
    }

    if (event.status !== "recruiting") {
      throw new ConvexError("This project is not currently recruiting members.");
    }

    if (event.formationMode !== "student_choice") {
      throw new ConvexError("This event uses Faculty Assignment mode. Students cannot self-request to join.");
    }

    // Section eligibility check
    if (
      event.eligibilityFilter !== "all" &&
      event.eligibilityFilter !== user.section
    ) {
      throw new ConvexError(
        `Section restricted: This event is reserved for ${event.eligibilityFilter} section students.`
      );
    }

    // Semester eligibility check
    const effectiveSem = getEffectiveSemester(user);
    if (
      event.eligibleSemesters &&
      event.eligibleSemesters !== "all" &&
      Array.isArray(event.eligibleSemesters) &&
      !event.eligibleSemesters.includes(effectiveSem)
    ) {
      throw new ConvexError(
        `Semester restricted: This event requires Semester ${event.eligibleSemesters.join(", ")}, but your current semester is ${effectiveSem}.`
      );
    }

    // Check capacity
    const existingMembers = await ctx.db
      .query("teamMembers")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();

    const acceptedCount = existingMembers.filter((m) => m.status === "accepted").length;
    if (acceptedCount >= event.teamSizeCap) {
      throw new ConvexError("Team size capacity reached.");
    }

    // Check if already requested or accepted
    const userMemberRecord = existingMembers.find((m) => m.userId === user._id);
    if (userMemberRecord) {
      throw new ConvexError("You have already requested or joined this team.");
    }

    return await ctx.db.insert("teamMembers", {
      eventId: args.eventId,
      userId: user._id,
      role: args.role.trim() || "Contributor",
      status: "requested",
    });
  },
});

/**
 * Host-only mutation to accept or reject a pending join request.
 */
export const respondToJoinRequest = mutation({
  args: {
    teamMemberId: v.id("teamMembers"),
    response: v.union(v.literal("accept"), v.literal("reject")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthenticated call");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const memberDoc = await ctx.db.get(args.teamMemberId);
    if (!memberDoc) {
      throw new ConvexError("Join request record not found");
    }

    const event = await ctx.db.get(memberDoc.eventId);
    if (!event) {
      throw new ConvexError("Associated event not found");
    }

    if (!user || user._id !== event.hostId) {
      throw new ConvexError("Only the event host can manage join requests.");
    }

    if (args.response === "accept") {
      // Check capacity before accepting
      const existingMembers = await ctx.db
        .query("teamMembers")
        .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
        .collect();

      const acceptedCount = existingMembers.filter((m) => m.status === "accepted").length;
      if (acceptedCount >= event.teamSizeCap) {
        throw new ConvexError("Cannot accept: Team size capacity reached.");
      }

      await ctx.db.patch(args.teamMemberId, {
        status: "accepted",
      });
    } else {
      await ctx.db.delete(args.teamMemberId);
    }
  },
});

/**
 * Send a pre-accept message on a join request.
 * Accessible ONLY to the host and the requesting student.
 */
export const sendJoinRequestMessage = mutation({
  args: {
    teamMemberId: v.id("teamMembers"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthenticated call");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new ConvexError("User record not found");
    }

    const memberDoc = await ctx.db.get(args.teamMemberId);
    if (!memberDoc) {
      throw new ConvexError("Join request record not found");
    }

    const event = await ctx.db.get(memberDoc.eventId);
    if (!event) {
      throw new ConvexError("Associated event not found");
    }

    // Access check: caller must be host or applicant
    const isHost = user._id === event.hostId;
    const isApplicant = user._id === memberDoc.userId;

    if (!isHost && !isApplicant) {
      throw new ConvexError("Only the host and the applicant can chat on this request.");
    }

    if (!args.message.trim()) {
      throw new ConvexError("Message cannot be empty.");
    }

    return await ctx.db.insert("joinRequestMessages", {
      teamMemberId: args.teamMemberId,
      senderId: user._id,
      message: args.message.trim(),
      createdAt: Date.now(),
    });
  },
});

/**
 * List pre-accept chat messages for a join request.
 * Accessible ONLY to the host and the requesting student.
 */
export const listJoinRequestMessages = query({
  args: { teamMemberId: v.id("teamMembers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const memberDoc = await ctx.db.get(args.teamMemberId);
    if (!memberDoc) {
      return [];
    }

    const event = await ctx.db.get(memberDoc.eventId);
    if (!event) {
      return [];
    }

    const isHost = user._id === event.hostId;
    const isApplicant = user._id === memberDoc.userId;

    if (!isHost && !isApplicant) {
      return [];
    }

    const messages = await ctx.db
      .query("joinRequestMessages")
      .withIndex("by_teamMemberId", (q) => q.eq("teamMemberId", args.teamMemberId))
      .order("asc")
      .collect();

    return await Promise.all(
      messages.map(async (msg) => {
        const sender = await ctx.db.get(msg.senderId);
        const classCode = sender ? getAcademicInfo(sender).classCode : null;

        return {
          ...msg,
          sender: sender
            ? {
                _id: sender._id,
                name: sender.name,
                role: sender.role,
                section: sender.section,
                classCode,
              }
            : null,
        };
      })
    );
  },
});

/**
 * Faculty host mutation to directly assign an eligible student to a team.
 * Allowed ONLY when event.formationMode === "faculty_assign".
 */
export const assignStudent = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthenticated call");
    }

    const facultyUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new ConvexError("Event not found");
    }

    if (!facultyUser || facultyUser._id !== event.hostId) {
      throw new ConvexError("Only the event host can assign students.");
    }

    if (event.formationMode !== "faculty_assign") {
      throw new ConvexError("Direct assignment is only permitted in Faculty Assignment mode.");
    }

    const studentToAssign = await ctx.db.get(args.userId);
    if (!studentToAssign) {
      throw new ConvexError("Target student not found");
    }
    if (!isStudent(studentToAssign.role)) {
      throw new ConvexError("Only students can be assigned to a team.");
    }

    // Section eligibility check
    if (
      event.eligibilityFilter !== "all" &&
      event.eligibilityFilter !== studentToAssign.section
    ) {
      throw new ConvexError(
        `Section mismatch: Student belongs to ${studentToAssign.section}, but event requires ${event.eligibilityFilter}.`
      );
    }

    // Semester eligibility check
    const effectiveSem = getEffectiveSemester(studentToAssign);
    if (
      event.eligibleSemesters &&
      event.eligibleSemesters !== "all" &&
      Array.isArray(event.eligibleSemesters) &&
      !event.eligibleSemesters.includes(effectiveSem)
    ) {
      throw new ConvexError(
        `Semester mismatch: Student is in Semester ${effectiveSem}, but event requires Semester ${event.eligibleSemesters.join(", ")}.`
      );
    }

    const existingMembers = await ctx.db
      .query("teamMembers")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();

    const acceptedCount = existingMembers.filter((m) => m.status === "accepted").length;
    if (acceptedCount >= event.teamSizeCap) {
      throw new ConvexError("Team size capacity reached.");
    }

    const isAlreadyMember = existingMembers.some((m) => m.userId === args.userId);
    if (isAlreadyMember) {
      throw new ConvexError("Student is already assigned to this team.");
    }

    return await ctx.db.insert("teamMembers", {
      eventId: args.eventId,
      userId: args.userId,
      role: args.role.trim() || "Assigned Team Member",
      status: "accepted",
    });
  },
});

/**
 * Helper query to list eligible students for faculty assignment.
 * Filtered by section AND semester eligibility, excluding existing team members.
 * Only the event host and coordinators get results, and registration numbers
 * are only included for faculty and coordinators.
 */
export const listEligibleStudents = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const viewer = await getCurrentUser(ctx);
    if (!viewer) {
      return [];
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      return [];
    }

    const isCoordinator = viewer.role === "coordinator";
    if (viewer._id !== event.hostId && !isCoordinator) {
      return [];
    }
    const canSeeRegistration = hasFacultyAccess(viewer.role);

    const existingMembers = await ctx.db
      .query("teamMembers")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();

    const memberUserIds = new Set(existingMembers.map((m) => m.userId));

    const allStudents = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "student"))
      .collect();

    const eligibleStudents = allStudents.filter((student) => {
      if (memberUserIds.has(student._id)) return false;

      // Section check
      if (event.eligibilityFilter !== "all" && student.section !== event.eligibilityFilter) {
        return false;
      }

      // Semester check
      const effectiveSem = getEffectiveSemester(student);
      if (
        event.eligibleSemesters &&
        event.eligibleSemesters !== "all" &&
        Array.isArray(event.eligibleSemesters) &&
        !event.eligibleSemesters.includes(effectiveSem)
      ) {
        return false;
      }

      return true;
    });

    return eligibleStudents.map((student) => ({
      _id: student._id,
      name: student.name,
      section: student.section,
      registrationNumber: canSeeRegistration ? student.registrationNumber : undefined,
    }));
  },
});

/**
 * List all events where the current user is host or an accepted team member.
 */
export const listMyTeams = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const myMemberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const acceptedMemberships = myMemberships.filter((m) => m.status === "accepted");

    const hostedEvents = await ctx.db
      .query("events")
      .withIndex("by_hostId", (q) => q.eq("hostId", user._id))
      .collect();

    const eventIdSet = new Set([
      ...acceptedMemberships.map((m) => m.eventId),
      ...hostedEvents.map((e) => e._id),
    ]);

    const resultEvents = await Promise.all(
      Array.from(eventIdSet).map(async (eventId) => {
        const event = await ctx.db.get(eventId);
        if (!event) return null;

        const host = await ctx.db.get(event.hostId);
        const teamMembers = await ctx.db
          .query("teamMembers")
          .withIndex("by_eventId", (q) => q.eq("eventId", eventId))
          .collect();

        const myMembership = teamMembers.find((m) => m.userId === user._id);
        const acceptedCount = teamMembers.filter((m) => m.status === "accepted").length;

        return {
          ...event,
          host: host
            ? {
                _id: host._id,
                name: host.name,
                role: host.role,
                classCode: getAcademicInfo(host).classCode,
              }
            : null,
          userRole: myMembership?.role || (event.hostId === user._id ? "Host Lead" : "Member"),
          acceptedCount,
        };
      })
    );

    return resultEvents.filter(Boolean);
  },
});

/**
 * Update team member's GitHub username.
 */
export const updateGithubUsername = mutation({
  args: {
    teamMemberId: v.id("teamMembers"),
    githubUsername: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthenticated call");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const memberDoc = await ctx.db.get(args.teamMemberId);
    if (!memberDoc) {
      throw new ConvexError("Team member record not found");
    }

    if (!user || user._id !== memberDoc.userId) {
      throw new ConvexError("You can only edit your own GitHub username.");
    }

    await ctx.db.patch(args.teamMemberId, {
      githubUsername: args.githubUsername.trim(),
    });
  },
});
