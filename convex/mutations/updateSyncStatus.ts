import { v } from "convex/values";

import { internalMutation } from "../_generated/server";

export const startSync = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("syncStatus").first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isRunning: true,
        startedAt: Date.now(),
        completedAt: undefined,
        processed: 0,
        total: 0,
        errors: 0,
        message: "Starting sync...",
      });
    } else {
      await ctx.db.insert("syncStatus", {
        isRunning: true,
        startedAt: Date.now(),
        processed: 0,
        total: 0,
        errors: 0,
        message: "Starting sync...",
      });
    }
  },
});

export const updateSyncProgress = internalMutation({
  args: {
    processed: v.number(),
    total: v.number(),
    errors: v.number(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("syncStatus").first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        processed: args.processed,
        total: args.total,
        errors: args.errors,
        message: args.message,
      });
    }
  },
});

export const completeSync = internalMutation({
  args: {
    processed: v.number(),
    total: v.number(),
    errors: v.number(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("syncStatus").first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        isRunning: false,
        completedAt: Date.now(),
        processed: args.processed,
        total: args.total,
        errors: args.errors,
        message: args.message,
      });
    }
  },
});
