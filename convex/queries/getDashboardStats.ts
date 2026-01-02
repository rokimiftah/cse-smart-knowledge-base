import { query } from "../_generated/server";

export const getDashboardStats = query({
  handler: async (ctx) => {
    const result = await ctx.db.query("issues").paginate({ cursor: null, numItems: 690 });

    const categoryCount: Record<string, number> = {};
    const confidenceCount: Record<string, number> = {};
    let lastSync: number | null = null;

    for (const issue of result.page) {
      categoryCount[issue.category] = (categoryCount[issue.category] || 0) + 1;
      confidenceCount[issue.confidenceScore] = (confidenceCount[issue.confidenceScore] || 0) + 1;
      if (lastSync === null || issue._creationTime > lastSync) {
        lastSync = issue._creationTime;
      }
    }

    const recentIssues = result.page
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 10)
      .map(({ embedding: _, ...rest }) => rest);

    return {
      total: result.page.length,
      byCategory: categoryCount,
      byConfidence: confidenceCount,
      recentIssues,
      lastSync,
      hasMore: !result.isDone,
    };
  },
});
