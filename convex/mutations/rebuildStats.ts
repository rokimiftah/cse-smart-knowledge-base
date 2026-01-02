import { internal } from "../_generated/api";
import { action } from "../_generated/server";

export const rebuildStats = action({
  args: {},
  handler: async (ctx) => {
    let cursor: string | null = null;
    let done = false;
    let total = 0;
    const byCategory = { Bug: 0, FeatureRequest: 0, Question: 0, Other: 0 };
    const byConfidence = { High: 0, Medium: 0, Low: 0 };
    let lastSync: number | null = null;

    while (!done) {
      const result: {
        page: Array<{
          category: "Bug" | "Feature Request" | "Question" | "Other";
          confidenceScore: string;
          _creationTime: number;
        }>;
        isDone: boolean;
        continueCursor: string;
      } = await ctx.runQuery(internal.queries.paginateIssuesLight.paginateIssuesLight, {
        cursor,
        numItems: 500,
      });

      for (const issue of result.page) {
        total++;
        const categoryKey = issue.category === "Feature Request" ? "FeatureRequest" : issue.category;
        byCategory[categoryKey]++;
        const confidence = issue.confidenceScore as "High" | "Medium" | "Low";
        if (confidence in byConfidence) {
          byConfidence[confidence]++;
        }
        if (lastSync === null || issue._creationTime > lastSync) {
          lastSync = issue._creationTime;
        }
      }

      done = result.isDone;
      cursor = result.continueCursor;
    }

    await ctx.runMutation(internal.mutations.updateStats.updateStats, {
      total,
      byCategory,
      byConfidence,
      lastSync,
    });

    return { total, byCategory, byConfidence, lastSync };
  },
});
