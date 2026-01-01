import { query } from "../_generated/server";

export const getDashboardStats = query({
  handler: async (ctx) => {
    const allIssues = await ctx.db.query("issues").collect();

    const categoryCount = allIssues.reduce(
      (acc, issue) => {
        acc[issue.category] = (acc[issue.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const confidenceCount = allIssues.reduce(
      (acc, issue) => {
        acc[issue.confidenceScore] = (acc[issue.confidenceScore] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const recentIssues = allIssues.sort((a, b) => b._creationTime - a._creationTime).slice(0, 10);

    return {
      total: allIssues.length,
      byCategory: categoryCount,
      byConfidence: confidenceCount,
      recentIssues,
      lastSync: allIssues.length > 0 ? Math.max(...allIssues.map((i) => i._creationTime)) : null,
    };
  },
});
