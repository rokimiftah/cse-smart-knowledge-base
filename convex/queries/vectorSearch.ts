import { v } from "convex/values";

import { internalQuery } from "../_generated/server";

export const fetchIssuesByIds = internalQuery({
  args: {
    ids: v.array(v.id("issues")),
  },
  handler: async (ctx, args) => {
    const results = [];
    for (const id of args.ids) {
      const doc = await ctx.db.get(id);
      if (doc !== null) {
        results.push(doc);
      }
    }
    return results;
  },
});
