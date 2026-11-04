import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { getCurrentUser } from "./lib/auth";
import { getAcademicInfo } from "./lib/semester";
import { isStudent } from "./lib/roles";
import { sectionValidator } from "./lib/validators";

/**
 * Get current authenticated user details from Convex DB using Clerk auth context.
 * Includes calculated `effectiveSemester` and `classCode` (null for non-students).
 */
export const current = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }

    const { effectiveSemester, classCode } = getAcademicInfo(user);

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
 * Make sure the signed-in user has a Convex record. The Clerk webhook normally
 * creates it, but it can lag behind the first page load or be missing on a
 * deployment the webhook doesn't point at. New records are always students;
 * the identity comes from the auth token, never from arguments. Safe to call
 * repeatedly.
 */
export const ensureUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthenticated call to ensureUser");
    }

    const existing = await getCurrentUser(ctx);
    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      name: identity.name || identity.givenName || "New user",
      email: identity.email || "",
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
 * Complete onboarding.
 *
 * Students give a registration number and admission year (they set the
 * semester and class code). Faculty give only a name and department (section);
 * choosing faculty sets the role to "faculty_pending" until a coordinator
 * approves. Approved faculty and coordinators keep their role.
 */
export const completeOnboarding = mutation({
  args: {
    name: v.string(),
    registrationNumber: v.optional(v.string()),
    universityEmail: v.optional(v.string()),
    section: sectionValidator,
    admissionYear: v.optional(v.number()),
    role: v.optional(v.union(v.literal("student"), v.literal("faculty"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthenticated call to completeOnboarding");
    }

    const name = args.name.trim();
    if (!name) {
      throw new ConvexError("Please enter your full name.");
    }

    const user = await getCurrentUser(ctx);
    const targetRole = resolveOnboardingRole(user?.role, args.role);

    // Student-only details. Cleared for everyone else so a faculty member
    // never carries a semester or class code.
    let studentDetails: {
      registrationNumber?: string;
      admissionYear?: number;
      semesterOverride?: number;
    } = { registrationNumber: undefined, admissionYear: undefined, semesterOverride: undefined };

    if (isStudent(targetRole)) {
      const registrationNumber = args.registrationNumber?.trim();
      if (!registrationNumber) {
        throw new ConvexError("Please enter your registration number.");
      }
      const currentYear = new Date().getFullYear();
      if (
        args.admissionYear === undefined ||
        !Number.isInteger(args.admissionYear) ||
        args.admissionYear < 2000 ||
        args.admissionYear > currentYear + 1
      ) {
        throw new ConvexError("Please choose your admission year.");
      }
      studentDetails = {
        registrationNumber,
        admissionYear: args.admissionYear,
        semesterOverride: user?.semesterOverride,
      };
    }

    const fields = {
      name,
      universityEmail: args.universityEmail?.trim() || undefined,
      section: args.section,
      role: targetRole,
      requestedRole: args.role ?? user?.requestedRole,
      ...studentDetails,
    };

    if (!user) {
      // The Clerk webhook hasn't created the record yet.
      return await ctx.db.insert("users", {
        ...fields,
        clerkId: identity.subject,
        email: identity.email || "",
        skills: [],
        xp: 0,
        createdAt: Date.now(),
      });
    }

    await ctx.db.patch(user._id, fields);
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
      throw new ConvexError("User profile not found");
    }

    if (
      args.semesterOverride !== undefined &&
      (!Number.isInteger(args.semesterOverride) ||
        args.semesterOverride < 1 ||
        args.semesterOverride > 8)
    ) {
      throw new ConvexError("Semester must be a whole number from 1 to 8.");
    }

    const updates: Partial<Doc<"users">> = {};
    if (args.section !== undefined) updates.section = args.section;
    if (args.universityEmail !== undefined) updates.universityEmail = args.universityEmail.trim() || undefined;

    // Registration number, admission year and semester only apply to students.
    if (isStudent(user.role)) {
      if (args.registrationNumber !== undefined) {
        const registrationNumber = args.registrationNumber.trim();
        if (!registrationNumber) {
          throw new ConvexError("Registration number can't be empty.");
        }
        updates.registrationNumber = registrationNumber;
      }
      if (args.admissionYear !== undefined) updates.admissionYear = args.admissionYear;
      if (args.semesterOverride !== undefined) updates.semesterOverride = args.semesterOverride;
    }
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

    const { effectiveSemester, classCode } = getAcademicInfo(user);

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
