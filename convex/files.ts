import { ConvexError } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Generate a short-lived upload URL for Convex Storage.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthenticated call to generateUploadUrl");
    }

    return await ctx.storage.generateUploadUrl();
  },
});
