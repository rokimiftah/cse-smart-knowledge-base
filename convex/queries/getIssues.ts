import { query } from "../_generated/server";

export const getAllIssues = query({
  handler: async (ctx) => {
    return await ctx.db.query("issues").collect();
  },
});

export const getStats = query({
  handler: async (ctx) => {
    const allIssues = await ctx.db.query("issues").collect();

    const categoryCount = allIssues.reduce(
      (acc, issue) => {
        acc[issue.category] = (acc[issue.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total: allIssues.length,
      byCategory: categoryCount,
    };
  },
});
