import { mutation } from "./_generated/server";

/**
 * Generate a short-lived upload URL for Convex Storage.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to generateUploadUrl");
    }

    return await ctx.storage.generateUploadUrl();
  },
});
