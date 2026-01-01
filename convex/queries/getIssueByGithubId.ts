import { v } from "convex/values";

import { internalQuery } from "../_generated/server";

export const getIssueByGithubId = internalQuery({
  args: {
    githubIssueId: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("issues")
      .withIndex("by_github_id", (q) => q.eq("githubIssueId", args.githubIssueId))
      .first();
  },
});
