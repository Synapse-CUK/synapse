import { ConvexError, v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { getCurrentUser } from "./lib/auth";
import { hasFacultyAccess } from "./lib/roles";

/**
 * Add the proof URL and a public author summary to an achievement.
 * Only return non-sensitive author fields here: this reaches every signed-in user.
 */
async function withAuthorAndProof(ctx: QueryCtx, item: Doc<"achievements">) {
  const author = await ctx.db.get(item.userId);
  let proofUrl = item.proofFileUrl;
  if (item.proofStorageId) {
    const storageUrl = await ctx.storage.getUrl(item.proofStorageId);
    if (storageUrl) {
      proofUrl = storageUrl;
    }
  }

  return {
    ...item,
    proofUrl,
    author: author
      ? {
          _id: author._id,
          name: author.name,
          section: author.section,
          year: author.year,
          role: author.role,
        }
      : null,
  };
}

/**
 * Create a new achievement (starts in "pending" status).
 */
export const createAchievement = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    proofStorageId: v.optional(v.id("_storage")),
    proofFileUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthenticated call to createAchievement");
    }

    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new ConvexError("User record not found in Convex database");
    }

    const achievementId = await ctx.db.insert("achievements", {
      userId: user._id,
      title: args.title,
      description: args.description,
      proofStorageId: args.proofStorageId,
      proofFileUrl: args.proofFileUrl,
      status: "pending",
      createdAt: Date.now(),
    });

    // Optionally grant +10 XP for submitting an achievement
    await ctx.db.patch(user._id, {
      xp: (user.xp || 0) + 10,
    });

    return achievementId;
  },
});

/**
 * List all achievements for the community feed (pending & verified), newest first.
 * Requires sign-in.
 */
export const listFeed = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getCurrentUser(ctx);
    if (!viewer) {
      return [];
    }

    const achievements = await ctx.db
      .query("achievements")
      .order("desc")
      .take(50);

    return await Promise.all(
      achievements
        .filter((item) => item.status !== "rejected")
        .map((item) => withAuthorAndProof(ctx, item))
    );
  },
});

/**
 * List all achievements posted by a specific user. Requires sign-in.
 */
export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const viewer = await getCurrentUser(ctx);
    if (!viewer) {
      return [];
    }

    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return await Promise.all(achievements.map((item) => withAuthorAndProof(ctx, item)));
  },
});

/**
 * List all pending achievements awaiting verification. Faculty and coordinators only.
 * Returns an empty list for everyone else, because the dashboard page runs this
 * query before its own role check.
 */
export const listPending = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getCurrentUser(ctx);
    if (!hasFacultyAccess(viewer?.role)) {
      return [];
    }

    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();

    return await Promise.all(achievements.map((item) => withAuthorAndProof(ctx, item)));
  },
});

/**
 * Faculty or coordinator mutation to approve (verify) or reject an achievement.
 * Each achievement can only be decided once, and never by its own author.
 */
export const updateAchievementStatus = mutation({
  args: {
    achievementId: v.id("achievements"),
    status: v.union(v.literal("verified"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthenticated call");
    }

    const reviewer = await getCurrentUser(ctx);
    if (!reviewer || !hasFacultyAccess(reviewer.role)) {
      throw new ConvexError("Only faculty and coordinators can verify achievements.");
    }

    const achievement = await ctx.db.get(args.achievementId);
    if (!achievement) {
      throw new ConvexError("Achievement not found");
    }

    if (achievement.status !== "pending") {
      throw new ConvexError("This achievement has already been reviewed.");
    }

    if (achievement.userId === reviewer._id) {
      throw new ConvexError("You can't review your own achievement.");
    }

    await ctx.db.patch(args.achievementId, {
      status: args.status,
      verifiedBy: reviewer._id,
    });

    // If verified, award +50 XP bonus to student!
    if (args.status === "verified") {
      const student = await ctx.db.get(achievement.userId);
      if (student) {
        await ctx.db.patch(student._id, {
          xp: (student.xp || 0) + 50,
        });
      }
    }
  },
});
