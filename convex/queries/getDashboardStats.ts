import { query } from "../_generated/server";

export const getDashboardStats = query({
  handler: async (ctx) => {
    // Use pagination to avoid memory limits (16MB)
    // Each page reads less data, staying under the limit
    const categoryCount: Record<string, number> = {};
    const confidenceCount: Record<string, number> = {};
    let total = 0;
    let latestTime = 0;

    let isDone = false;
    let cursor: string | null = null;

    while (!isDone) {
      const result: { page: any[]; isDone: boolean; continueCursor: string } = await ctx.db
        .query("issues")
        .paginate({ numItems: 100, cursor: cursor as any });

      for (const issue of result.page) {
        total++;
        categoryCount[issue.category] = (categoryCount[issue.category] || 0) + 1;
        confidenceCount[issue.confidenceScore] = (confidenceCount[issue.confidenceScore] || 0) + 1;
        if (issue._creationTime > latestTime) {
          latestTime = issue._creationTime;
        }
      }

      isDone = result.isDone;
      cursor = result.continueCursor;
    }

    // Get recent issues without embedding field
    const recentIssues = await ctx.db.query("issues").order("desc").take(10);
    const recentWithoutEmbedding = recentIssues.map(({ embedding, ...rest }) => rest);

    return {
      total,
      byCategory: categoryCount,
      byConfidence: confidenceCount,
      recentIssues: recentWithoutEmbedding,
      lastSync: latestTime > 0 ? latestTime : null,
    };
  },
});
