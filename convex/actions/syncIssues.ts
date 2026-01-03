"use node";

import type { IssueWithComments } from "./githubFetcher";

import { v } from "convex/values";

import { internal } from "../_generated/api";
import { action } from "../_generated/server";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const RATE_LIMIT_DELAY_MS = 2100;
const BATCH_SIZE = 25;

export const syncIssues = action({
  args: {
    owner: v.string(),
    repo: v.string(),
    perPage: v.optional(v.number()),
    maxPages: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { owner, repo, maxPages = 30 } = args;

    await ctx.runMutation((internal as any)["mutations/updateSyncStatus"].startSync, {});

    console.log(`[Sync] Starting sync for ${owner}/${repo}`);

    await ctx.scheduler.runAfter(0, (internal as any)["actions/githubFetcher"].startFetchIssues, {
      owner,
      repo,
      maxPages,
    });

    return { status: "started", message: "Sync started, fetching issues in background" };
  },
});

interface RawIssue {
  githubId: number;
  number: number;
  title: string;
  body: string;
  url: string;
  comments: string[];
}

export const processIssuesFromFetch = action({
  args: {
    syncId: v.string(),
  },
  handler: async (ctx, args): Promise<{ total: number; processed: number; errors: number; status?: string }> => {
    const { syncId } = args;

    const rawIssues: RawIssue[] = await ctx.runQuery((internal as any)["queries/syncRawIssues"].getRawIssuesForSync, { syncId });

    console.log(`[Sync] Received ${rawIssues.length} new issues from fetch (already filtered)`);

    if (rawIssues.length === 0) {
      await ctx.runMutation((internal as any)["mutations/syncRawIssues"].clearRawIssues, { syncId });
      await ctx.runMutation((internal as any)["mutations/updateSyncStatus"].completeSync, {
        processed: 0,
        total: 0,
        errors: 0,
        message: "No new issues to sync",
      });
      return { total: 0, processed: 0, errors: 0 };
    }

    await ctx.runMutation((internal as any)["mutations/updateSyncStatus"].updateSyncProgress, {
      processed: 0,
      total: rawIssues.length,
      errors: 0,
      message: `Processing ${rawIssues.length} new issues...`,
    });

    await ctx.scheduler.runAfter(0, (internal as any)["actions/syncIssues"].processBatch, {
      syncId,
      startIndex: 0,
      processedCount: 0,
      errorCount: 0,
      totalNew: rawIssues.length,
    });

    return { total: rawIssues.length, processed: 0, errors: 0, status: "processing" };
  },
});

export const processBatch = action({
  args: {
    syncId: v.string(),
    startIndex: v.number(),
    processedCount: v.number(),
    errorCount: v.number(),
    totalNew: v.number(),
  },
  handler: async (ctx, args): Promise<{ processedCount: number; errorCount: number }> => {
    const { syncId, startIndex, totalNew } = args;
    let { processedCount, errorCount } = args;

    const rawIssues: RawIssue[] = await ctx.runQuery((internal as any)["queries/syncRawIssues"].getRawIssuesForSync, { syncId });

    const allIssues: IssueWithComments[] = rawIssues.map((r) => ({
      id: r.githubId,
      number: r.number,
      title: r.title,
      body: r.body,
      url: r.url,
      comments: r.comments,
    }));

    const endIndex = Math.min(startIndex + BATCH_SIZE, allIssues.length);
    const batch = allIssues.slice(startIndex, endIndex);

    console.log(`[Sync] Processing batch ${startIndex}-${endIndex} of ${allIssues.length}`);

    for (const issue of batch) {
      try {
        const analysis = await ctx.runAction((internal as any)["actions/aiAnalyzer"].analyzeIssue, {
          issue,
        });

        await ctx.runMutation((internal as any)["mutations/saveIssue"].saveIssue, {
          githubIssueId: issue.id,
          number: issue.number,
          title: issue.title,
          url: issue.url,
          state: "closed",
          category: analysis.category,
          summary: analysis.summary,
          rootCause: analysis.rootCause || undefined,
          solution: analysis.solution,
          confidenceScore: analysis.confidenceScore,
          embedding: analysis.embedding,
        });

        processedCount++;

        if (processedCount % 5 === 0) {
          await ctx.runMutation((internal as any)["mutations/updateSyncStatus"].updateSyncProgress, {
            processed: processedCount,
            total: totalNew,
            errors: errorCount,
            message: `Processing: ${processedCount}/${totalNew} new issues...`,
          });
        }

        await delay(RATE_LIMIT_DELAY_MS);
      } catch (error) {
        errorCount++;
        console.error(`[Sync] Error processing issue #${issue.number}:`, error);
      }
    }

    if (endIndex < allIssues.length) {
      await ctx.scheduler.runAfter(0, (internal as any)["actions/syncIssues"].processBatch, {
        syncId,
        startIndex: endIndex,
        processedCount,
        errorCount,
        totalNew,
      });
    } else {
      console.log(`[Sync] Completed: ${processedCount} processed, ${errorCount} errors`);

      await ctx.runMutation((internal as any)["mutations/syncRawIssues"].clearRawIssues, { syncId });
      await ctx.runMutation((internal as any)["mutations/updateSyncStatus"].completeSync, {
        processed: processedCount,
        total: totalNew,
        errors: errorCount,
        message: `Completed: ${processedCount} new issues indexed, ${errorCount} errors`,
      });
    }

    return { processedCount, errorCount };
  },
});
