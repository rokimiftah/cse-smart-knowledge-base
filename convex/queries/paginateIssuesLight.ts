import { v } from "convex/values";

import { internalQuery } from "../_generated/server";

export const paginateIssuesLight = internalQuery({
  args: {
    cursor: v.union(v.string(), v.null()),
    numItems: v.number(),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.query("issues").paginate({ cursor: args.cursor, numItems: args.numItems });

    const lightIssues = result.page.map((issue) => ({
      category: issue.category,
      confidenceScore: issue.confidenceScore,
      _creationTime: issue._creationTime,
    }));

    return {
      page: lightIssues,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  },
});
