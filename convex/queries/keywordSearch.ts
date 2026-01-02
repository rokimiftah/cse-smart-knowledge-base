import { v } from "convex/values";

import { query } from "../_generated/server";

export const keywordSearch = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { query: searchQuery, limit = 10 } = args;

    // Use pagination to get all issues without hitting memory limit
    const allIssues: any[] = [];
    let isDone = false;
    let cursor: string | null = null;

    while (!isDone) {
      const result: { page: any[]; isDone: boolean; continueCursor: string } = await ctx.db
        .query("issues")
        .paginate({ numItems: 100, cursor: cursor as any });

      for (const issue of result.page) {
        allIssues.push(issue);
      }

      isDone = result.isDone;
      cursor = result.continueCursor;
    }

    // Simple keyword matching (case-insensitive)
    const keywords = searchQuery.toLowerCase().split(/\s+/);

    const scoredIssues = allIssues.map((issue) => {
      const searchText = `
        ${issue.title}
        ${issue.summary}
        ${issue.solution}
        ${issue.category}
      `.toLowerCase();

      // Count how many keywords match
      let matchCount = 0;
      for (const keyword of keywords) {
        if (searchText.includes(keyword)) {
          matchCount++;
        }
      }

      // Calculate simple relevance score
      const score = matchCount / keywords.length;

      return {
        ...issue,
        score,
        matchCount,
      };
    });

    // Filter: at least one keyword must match
    const relevant = scoredIssues.filter((issue) => issue.matchCount > 0);

    // Sort by match count and score
    relevant.sort((a, b) => {
      if (b.matchCount !== a.matchCount) {
        return b.matchCount - a.matchCount;
      }
      return b.score - a.score;
    });

    console.log("Keyword search:", {
      query: searchQuery,
      keywords,
      totalIssues: allIssues.length,
      matchedIssues: relevant.length,
      topScores: relevant.slice(0, 3).map((i) => ({
        number: i.number,
        title: i.title.substring(0, 50),
        matchCount: i.matchCount,
        score: i.score.toFixed(2),
      })),
    });

    // Exclude embedding from results to reduce bandwidth
    return relevant.slice(0, limit).map(({ embedding, ...rest }) => rest);
  },
});
