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

    console.log(`Successfully cleared ${allIssues.length} issues.`);

    return {
      deleted: allIssues.length,
      message: `Cleared ${allIssues.length} issues. Ready for fresh sync.`,
    };
  },
});
