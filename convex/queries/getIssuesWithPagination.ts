import { v } from "convex/values";

import { query } from "../_generated/server";

export const getIssuesWithPagination = query({
  args: {
    category: v.optional(v.string()),
    confidenceScore: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { category, confidenceScore, limit = 20, offset = 0 } = args;

    let issues = await ctx.db.query("issues").collect();

    if (category && category !== "all") {
      issues = issues.filter((issue) => issue.category === category);
    }

    if (confidenceScore && confidenceScore !== "all") {
      issues = issues.filter((issue) => issue.confidenceScore === confidenceScore);
    }

    issues.sort((a, b) => b._creationTime - a._creationTime);

    const total = issues.length;
    const paginatedIssues = issues.slice(offset, offset + limit);

    return {
      issues: paginatedIssues,
      total,
      hasMore: offset + limit < total,
    };
  },
});
