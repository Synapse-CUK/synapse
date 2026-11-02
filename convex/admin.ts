import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { roleValidator, sectionValidator } from "./lib/validators";

/**
 * Operator-only tools. Internal functions can't be called from the browser;
 * they run from the Convex dashboard or the CLI with deployment access, e.g.
 *   npx convex run --prod admin:setRole '{"email":"a@b.c","role":"coordinator"}'
 */

/** Set a user's role by email. Used to create the first coordinator. */
export const setRole = internalMutation({
  args: { email: v.string(), role: roleValidator },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
      throw new Error(`No user found with email ${args.email}`);
    }

    await ctx.db.patch(user._id, { role: args.role });
    return { userId: user._id, role: args.role };
  },
});

/**
 * Create or update a QA account's Convex record. Safe to re-run. Accounts with
 * no registrationNumber are sent through onboarding on first sign-in.
 */
export const seedQaUser = internalMutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    role: roleValidator,
    section: sectionValidator,
    registrationNumber: v.optional(v.string()),
    admissionYear: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    return await ctx.db.insert("users", {
      ...args,
      skills: [],
      xp: 0,
      createdAt: Date.now(),
    });
  },
});
