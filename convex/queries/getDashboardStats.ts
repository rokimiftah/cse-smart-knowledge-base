import { query } from "../_generated/server";

export const getDashboardStats = query({
  handler: async (ctx) => {
    // Only fetch fields needed for stats, exclude embedding
    const allIssues = await ctx.db.query("issues").collect();

    const categoryCount: Record<string, number> = {};
    const confidenceCount: Record<string, number> = {};
    let latestTime = 0;

    for (const issue of allIssues) {
      categoryCount[issue.category] = (categoryCount[issue.category] || 0) + 1;
      confidenceCount[issue.confidenceScore] = (confidenceCount[issue.confidenceScore] || 0) + 1;
      if (issue._creationTime > latestTime) {
        latestTime = issue._creationTime;
      }
    }

    // Get recent issues without embedding field
    const recentIssues = await ctx.db.query("issues").order("desc").take(10);

    const recentWithoutEmbedding = recentIssues.map(({ embedding, ...rest }) => rest);

    return {
      total: allIssues.length,
      byCategory: categoryCount,
      byConfidence: confidenceCount,
      recentIssues: recentWithoutEmbedding,
      lastSync: latestTime > 0 ? latestTime : null,
    };
  },
});
