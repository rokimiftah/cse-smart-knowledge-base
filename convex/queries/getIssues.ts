import { query } from "../_generated/server";

export const getAllIssues = query({
  handler: async (ctx) => {
    // Use pagination to get all issues without hitting memory limit
    const allIssues: any[] = [];
    let isDone = false;
    let cursor: string | null = null;

    while (!isDone) {
      const result: { page: any[]; isDone: boolean; continueCursor: string } = await ctx.db
        .query("issues")
        .paginate({ numItems: 100, cursor: cursor as any });

      for (const issue of result.page) {
        // Exclude embedding to reduce bandwidth
        const { embedding, ...rest } = issue;
        allIssues.push(rest);
      }

      isDone = result.isDone;
      cursor = result.continueCursor;
    }

    return allIssues;
  },
});

export const getStats = query({
  handler: async (ctx) => {
    // Use pagination to count stats without hitting memory limit
    let total = 0;
    const categoryCount: Record<string, number> = {};

    let isDone = false;
    let cursor: string | null = null;

    while (!isDone) {
      const result: { page: any[]; isDone: boolean; continueCursor: string } = await ctx.db
        .query("issues")
        .paginate({ numItems: 100, cursor: cursor as any });

      for (const issue of result.page) {
        total++;
        categoryCount[issue.category] = (categoryCount[issue.category] || 0) + 1;
      }

      isDone = result.isDone;
      cursor = result.continueCursor;
    }

    return {
      total,
      byCategory: categoryCount,
    };
  },
});
