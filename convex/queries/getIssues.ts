import { query } from "../_generated/server";

export const getAllIssues = query({
  handler: async (ctx) => {
    const issues = await ctx.db.query("issues").collect();
    // Exclude embedding to reduce bandwidth
    return issues.map(({ embedding, ...rest }) => rest);
  },
});

export const getStats = query({
  handler: async (ctx) => {
    const allIssues = await ctx.db.query("issues").collect();

    const categoryCount: Record<string, number> = {};
    for (const issue of allIssues) {
      categoryCount[issue.category] = (categoryCount[issue.category] || 0) + 1;
    }

    return {
      total: allIssues.length,
      byCategory: categoryCount,
    };
  },
});
