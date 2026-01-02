import { v } from "convex/values";

import { mutation } from "../_generated/server";

export const saveRawIssue = mutation({
  args: {
    syncId: v.string(),
    githubId: v.number(),
    number: v.number(),
    title: v.string(),
    body: v.string(),
    url: v.string(),
    commentsCount: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("syncRawIssues", {
      syncId: args.syncId,
      githubId: args.githubId,
      number: args.number,
      title: args.title,
      body: args.body,
      url: args.url,
      commentsCount: args.commentsCount,
      commentsFetched: false,
      comments: [],
    });
  },
});

export const updateRawIssueComments = mutation({
  args: {
    syncId: v.string(),
    githubId: v.number(),
    comments: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const issue = await ctx.db
      .query("syncRawIssues")
      .withIndex("by_sync_id", (q) => q.eq("syncId", args.syncId))
      .filter((q) => q.eq(q.field("githubId"), args.githubId))
      .first();

    if (issue) {
      await ctx.db.patch(issue._id, {
        comments: args.comments,
        commentsFetched: true,
      });
    }
  },
});

export const clearRawIssues = mutation({
  args: {
    syncId: v.string(),
  },
  handler: async (ctx, args) => {
    const issues = await ctx.db
      .query("syncRawIssues")
      .withIndex("by_sync_id", (q) => q.eq("syncId", args.syncId))
      .collect();

    for (const issue of issues) {
      await ctx.db.delete(issue._id);
    }
  },
});
