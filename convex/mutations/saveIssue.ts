import { v } from "convex/values";

import { internalMutation } from "../_generated/server";

export const saveIssue = internalMutation({
  args: {
    githubIssueId: v.number(),
    number: v.number(),
    title: v.string(),
    url: v.string(),
    state: v.string(),
    category: v.union(v.literal("Bug"), v.literal("Feature Request"), v.literal("Question"), v.literal("Other")),
    summary: v.string(),
    rootCause: v.optional(v.string()),
    solution: v.string(),
    confidenceScore: v.string(),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("issues", args);

    const stats = await ctx.db.query("issueStats").first();
    const now = Date.now();

    const categoryKey = args.category === "Feature Request" ? "FeatureRequest" : args.category;
    const confidence = args.confidenceScore as "High" | "Medium" | "Low";

    if (stats) {
      await ctx.db.patch(stats._id, {
        total: stats.total + 1,
        byCategory: {
          ...stats.byCategory,
          [categoryKey]: stats.byCategory[categoryKey as keyof typeof stats.byCategory] + 1,
        },
        byConfidence: {
          ...stats.byConfidence,
          [confidence]: (stats.byConfidence[confidence] || 0) + 1,
        },
        lastSync: now,
      });
    } else {
      const byCategory = { Bug: 0, FeatureRequest: 0, Question: 0, Other: 0 };
      byCategory[categoryKey as keyof typeof byCategory] = 1;

      const byConfidence = { High: 0, Medium: 0, Low: 0 };
      byConfidence[confidence] = 1;

      await ctx.db.insert("issueStats", {
        total: 1,
        byCategory,
        byConfidence,
        lastSync: now,
      });
    }
  },
});
