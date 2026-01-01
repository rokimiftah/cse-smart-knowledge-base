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
  },
});
