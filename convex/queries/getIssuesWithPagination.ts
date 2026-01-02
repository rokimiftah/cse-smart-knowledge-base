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

    const allIssues = await ctx.db.query("issues").collect();

    let filtered = allIssues;

    if (category && category !== "all") {
      filtered = filtered.filter((issue) => issue.category === category);
    }

    if (confidenceScore && confidenceScore !== "all") {
      filtered = filtered.filter((issue) => issue.confidenceScore === confidenceScore);
    }

    filtered.sort((a, b) => b._creationTime - a._creationTime);

    const total = filtered.length;
    const paginatedIssues = filtered.slice(offset, offset + limit);

    // Exclude embedding to reduce bandwidth
    const issuesWithoutEmbedding = paginatedIssues.map(({ embedding, ...rest }) => rest);

    return {
      issues: issuesWithoutEmbedding,
      total,
      hasMore: offset + limit < total,
    };
  },
});
