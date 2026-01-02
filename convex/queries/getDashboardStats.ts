import { query } from "../_generated/server";

export const getDashboardStats = query({
  handler: async (ctx) => {
    const stats = await ctx.db.query("issueStats").first();

    const recentIssues = await ctx.db.query("issues").order("desc").take(10);

    const recentWithoutEmbedding = recentIssues.map(({ embedding: _, ...rest }) => rest);

    if (stats) {
      return {
        total: stats.total,
        byCategory: {
          Bug: stats.byCategory.Bug,
          "Feature Request": stats.byCategory.FeatureRequest,
          Question: stats.byCategory.Question,
          Other: stats.byCategory.Other,
        },
        byConfidence: stats.byConfidence,
        recentIssues: recentWithoutEmbedding,
        lastSync: stats.lastSync ?? null,
      };
    }

    return {
      total: 0,
      byCategory: { Bug: 0, "Feature Request": 0, Question: 0, Other: 0 },
      byConfidence: { High: 0, Medium: 0, Low: 0 },
      recentIssues: recentWithoutEmbedding,
      lastSync: null,
    };
  },
});
