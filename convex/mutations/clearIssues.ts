import { mutation } from "../_generated/server";

// Mutation to clear all issues (for fresh re-sync)
export const clearAllIssues = mutation({
  args: {},
  handler: async (ctx) => {
    const allIssues = await ctx.db.query("issues").collect();

    console.log(`Clearing ${allIssues.length} issues from database...`);

    for (const issue of allIssues) {
      await ctx.db.delete(issue._id);
    }

    // Reset stats
    const stats = await ctx.db.query("issueStats").first();
    if (stats) {
      await ctx.db.patch(stats._id, {
        total: 0,
        byCategory: { Bug: 0, FeatureRequest: 0, Question: 0, Other: 0 },
        byConfidence: { High: 0, Medium: 0, Low: 0 },
        lastSync: undefined,
      });
    }

    console.log(`Successfully cleared ${allIssues.length} issues.`);

    return {
      deleted: allIssues.length,
      message: `Cleared ${allIssues.length} issues. Ready for fresh sync.`,
    };
  },
});
