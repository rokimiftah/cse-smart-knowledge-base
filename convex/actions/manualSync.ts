"use node";

import { v } from "convex/values";

import { internal } from "../_generated/api";
import { action } from "../_generated/server";

export const triggerSync = action({
  args: {
    perPage: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ total: number; processed: number; errors: number }> => {
    const result: { total: number; processed: number; errors: number } = await ctx.runAction(
      (internal as any)["actions/syncIssues"].syncIssues,
      {
        owner: "serpapi",
        repo: "public-roadmap",
        perPage: args.perPage || 10,
      },
    );

    return result;
  },
});
