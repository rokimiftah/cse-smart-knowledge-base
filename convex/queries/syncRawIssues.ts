import { v } from "convex/values";

import { query } from "../_generated/server";

export const getRawIssuesForSync = query({
  args: {
    syncId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("syncRawIssues")
      .withIndex("by_sync_id", (q) => q.eq("syncId", args.syncId))
      .collect();
  },
});

export const getUnfetchedCommentsCount = query({
  args: {
    syncId: v.string(),
  },
  handler: async (ctx, args) => {
    const issues = await ctx.db
      .query("syncRawIssues")
      .withIndex("by_sync_id", (q) => q.eq("syncId", args.syncId))
      .filter((q) => q.eq(q.field("commentsFetched"), false))
      .collect();
    return issues.length;
  },
});

export const getNextUnfetchedIssues = query({
  args: {
    syncId: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("syncRawIssues")
      .withIndex("by_sync_id", (q) => q.eq("syncId", args.syncId))
      .filter((q) => q.eq(q.field("commentsFetched"), false))
      .take(args.limit);
  },
});
