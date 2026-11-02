import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { getCurrentUser } from "./lib/auth";
import { getEffectiveSemester, getClassCode } from "./lib/semester";
import { sectionValidator } from "./lib/validators";

/**
 * Get current authenticated user details from Convex DB using Clerk auth context.
 * Includes calculated `effectiveSemester` and `classCode`.
 */
export const current = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }

    const effectiveSemester = getEffectiveSemester(user);
    const classCode = getClassCode(effectiveSemester, user.section);

    return {
      ...user,
      effectiveSemester,
      classCode,
    };
  },
});

/**
 * Sync identity fields from the Clerk webhook. Only name and email come from
 * Clerk: role and profile data belong to Convex, so a Clerk profile edit can
 * never change them. Internal because only the verified webhook may call it.
 */
export const syncUser = internalMutation({
  args: {
    clerkId: v.string(),
    name: v.optional(v.string()),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        name: args.name || existingUser.name,
        email: args.email || existingUser.email,
      });
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name || "Anonymous User",
      email: args.email,
      section: "IT",
      role: "student",
      skills: [],
      xp: 0,
      createdAt: Date.now(),
    });
  },
});

/**
 * Decide a user's role during onboarding. Users may only ask for student or
 * faculty access, faculty needs coordinator approval, and an approved faculty
 * or coordinator role is never changed here.
 */
function resolveOnboardingRole(
  currentRole: Doc<"users">["role"] | undefined,
  requested: "student" | "faculty" | undefined
): Doc<"users">["role"] {
  if (currentRole === "coordinator" || currentRole === "faculty") {
    return currentRole;
  }
  if (requested === "faculty") return "faculty_pending";
  if (requested === "student") return "student";
  return currentRole ?? "student";
}

/**
 * Complete academic onboarding step for a user.
 * If user selects "faculty", role is set to "faculty_pending" awaiting coordinator approval.
 */
export const completeOnboarding = mutation({
  args: {
    name: v.string(),
    registrationNumber: v.string(),
    universityEmail: v.optional(v.string()),
    section: sectionValidator,
    admissionYear: v.number(),
    role: v.optional(v.union(v.literal("student"), v.literal("faculty"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to completeOnboarding");
    }

    const user = await getCurrentUser(ctx);
    const targetRole = resolveOnboardingRole(user?.role, args.role);

    if (!user) {
      // Create user if the Clerk webhook has not created them yet
      const userId = await ctx.db.insert("users", {
        clerkId: identity.subject,
        name: args.name,
        email: identity.email || "",
        registrationNumber: args.registrationNumber.trim(),
        universityEmail: args.universityEmail?.trim(),
        section: args.section,
        admissionYear: args.admissionYear,
        role: targetRole,
        requestedRole: args.role,
        skills: [],
        xp: 0,
        createdAt: Date.now(),
      });
      return userId;
    }

    await ctx.db.patch(user._id, {
      name: args.name,
      registrationNumber: args.registrationNumber.trim(),
      universityEmail: args.universityEmail?.trim(),
      section: args.section,
      admissionYear: args.admissionYear,
      role: targetRole,
      requestedRole: args.role ?? user.requestedRole,
    });

    return user._id;
  },
});

/**
 * Update authenticated user's profile details.
 */
export const updateProfile = mutation({
  args: {
    section: v.optional(sectionValidator),
    registrationNumber: v.optional(v.string()),
    universityEmail: v.optional(v.string()),
    admissionYear: v.optional(v.number()),
    semesterOverride: v.optional(v.number()),
    bio: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User profile not found");
    }

    if (
      args.semesterOverride !== undefined &&
      (!Number.isInteger(args.semesterOverride) ||
        args.semesterOverride < 1 ||
        args.semesterOverride > 8)
    ) {
      throw new Error("Semester must be a whole number from 1 to 8.");
    }

    const updates: Record<string, any> = {};
    if (args.section !== undefined) updates.section = args.section;
    if (args.registrationNumber !== undefined) updates.registrationNumber = args.registrationNumber;
    if (args.universityEmail !== undefined) updates.universityEmail = args.universityEmail;
    if (args.admissionYear !== undefined) updates.admissionYear = args.admissionYear;
    if (args.semesterOverride !== undefined) updates.semesterOverride = args.semesterOverride;
    if (args.bio !== undefined) updates.bio = args.bio;
    if (args.skills !== undefined) updates.skills = args.skills;

    await ctx.db.patch(user._id, updates);
    return user._id;
  },
});

/**
 * Get a user's profile with achievement statistics, calculated semester and
 * class code. Requires sign-in. Contact and identity details are only returned
 * to the profile owner and coordinators.
 */
export const getUserProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const viewer = await getCurrentUser(ctx);
    if (!viewer) {
      return null;
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }

    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const achievementCount = achievements.length;
    const verifiedCount = achievements.filter((a) => a.status === "verified").length;

    const effectiveSemester = getEffectiveSemester(user);
    const classCode = getClassCode(effectiveSemester, user.section);

    const canSeePrivate = viewer._id === user._id || viewer.role === "coordinator";

    return {
      _id: user._id,
      name: user.name,
      section: user.section,
      role: user.role,
      skills: user.skills,
      xp: user.xp,
      bio: user.bio,
      admissionYear: user.admissionYear,
      email: canSeePrivate ? user.email : undefined,
      universityEmail: canSeePrivate ? user.universityEmail : undefined,
      registrationNumber: canSeePrivate ? user.registrationNumber : undefined,
      semesterOverride: canSeePrivate ? user.semesterOverride : undefined,
      effectiveSemester,
      classCode,
      achievementCount,
      verifiedCount,
    };
  },
});
