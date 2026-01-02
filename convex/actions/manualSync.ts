"use node";

import { v } from "convex/values";

import { internal } from "../_generated/api";
import { action } from "../_generated/server";

export const triggerSync = action({
  args: {
    perPage: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ started: boolean }> => {
    // Schedule the sync action to run immediately in the background
    await ctx.scheduler.runAfter(0, (internal as any)["actions/syncIssues"].syncIssues, {
      owner: "serpapi",
      repo: "public-roadmap",
      perPage: args.perPage || 100,
    });

    return { started: true };
  },
});
