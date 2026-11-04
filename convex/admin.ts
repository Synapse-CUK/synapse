import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { TableNames } from "./_generated/dataModel";
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

const ALL_TABLES: TableNames[] = [
  "joinRequestMessages",
  "teamMembers",
  "kanbanCards",
  "teamChat",
  "commitActivity",
  "events",
  "achievements",
  "users",
];
const RESET_BATCH = 200;

/**
 * Delete every document and stored file, for starting a dev deployment fresh.
 * Refuses to run unless the deployment has ALLOW_DATA_RESET=true, which must
 * only ever be set on dev:
 *   npx convex env set ALLOW_DATA_RESET true
 *   npx convex run admin:resetAllData
 * Deletes in batches and reschedules itself until everything is gone.
 */
export const resetAllData = internalMutation({
  args: {},
  handler: async (ctx) => {
    if (process.env.ALLOW_DATA_RESET !== "true") {
      throw new Error("Refusing to reset: set ALLOW_DATA_RESET=true on this deployment first (dev only).");
    }

    let deleted = 0;
    for (const table of ALL_TABLES) {
      const docs = await ctx.db.query(table).take(RESET_BATCH - deleted);
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
      deleted += docs.length;
      if (deleted >= RESET_BATCH) break;
    }

    if (deleted < RESET_BATCH) {
      const files = await ctx.db.system.query("_storage").take(RESET_BATCH - deleted);
      for (const file of files) {
        await ctx.storage.delete(file._id);
      }
      deleted += files.length;
    }

    if (deleted >= RESET_BATCH) {
      await ctx.scheduler.runAfter(0, internal.admin.resetAllData, {});
      return { deleted, done: false };
    }
    return { deleted, done: true };
  },
});
