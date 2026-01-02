import { v } from "convex/values";

import { internalMutation } from "../_generated/server";

export const updateStats = internalMutation({
  args: {
    total: v.number(),
    byCategory: v.object({
      Bug: v.number(),
      FeatureRequest: v.number(),
      Question: v.number(),
      Other: v.number(),
    }),
    byConfidence: v.object({
      High: v.number(),
      Medium: v.number(),
      Low: v.number(),
    }),
    lastSync: v.union(v.number(), v.null()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("issueStats").first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        total: args.total,
        byCategory: args.byCategory,
        byConfidence: args.byConfidence,
        lastSync: args.lastSync ?? undefined,
      });
    } else {
      await ctx.db.insert("issueStats", {
        total: args.total,
        byCategory: args.byCategory,
        byConfidence: args.byConfidence,
        lastSync: args.lastSync ?? undefined,
      });
    }
  },
});
