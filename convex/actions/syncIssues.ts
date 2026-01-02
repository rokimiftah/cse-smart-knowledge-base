"use node";

import type { IssueWithComments } from "./githubFetcher";

import { v } from "convex/values";

import { internal } from "../_generated/api";
import { action } from "../_generated/server";

// Delay to respect Nvidia embedding API rate limit (30 RPM)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const RATE_LIMIT_DELAY_MS = 2100; // ~28 requests/min to stay under 30 RPM
const BATCH_SIZE = 25; // Process 25 issues per action call (~1 min per batch)

export const syncIssues = action({
  args: {
    owner: v.string(),
    repo: v.string(),
    perPage: v.optional(v.number()),
    maxPages: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { owner, repo, perPage = 100, maxPages = 30 } = args;

    await ctx.runMutation((internal as any)["mutations/updateSyncStatus"].startSync, {});

    try {
      console.log(`[Sync] Starting sync for ${owner}/${repo}`);

      const issues: IssueWithComments[] = await ctx.runAction((internal as any)["actions/githubFetcher"].fetchClosedIssues, {
        owner,
        repo,
        perPage,
        maxPages,
      });

      console.log(`[Sync] Fetched ${issues.length} closed issues`);

      // Filter out existing issues first
      const newIssues: IssueWithComments[] = [];
      for (const issue of issues) {
        const existing = await ctx.runQuery((internal as any)["queries/getIssueByGithubId"].getIssueByGithubId, {
          githubIssueId: issue.id,
        });
        if (!existing) {
          newIssues.push(issue);
        }
      }

      console.log(`[Sync] Found ${newIssues.length} new issues to process`);

      if (newIssues.length === 0) {
        await ctx.runMutation((internal as any)["mutations/updateSyncStatus"].completeSync, {
          processed: 0,
          total: issues.length,
          errors: 0,
          message: `No new issues to sync (${issues.length} already indexed)`,
        });
        return { total: issues.length, processed: 0, errors: 0 };
      }

      await ctx.runMutation((internal as any)["mutations/updateSyncStatus"].updateSyncProgress, {
        processed: 0,
        total: newIssues.length,
        errors: 0,
        message: `Processing ${newIssues.length} new issues...`,
      });

      // Schedule batch processing
      await ctx.scheduler.runAfter(0, (internal as any)["actions/syncIssues"].processBatch, {
        issues: newIssues,
        startIndex: 0,
        processedCount: 0,
        errorCount: 0,
        totalNew: newIssues.length,
        totalAll: issues.length,
      });

      return { total: issues.length, processed: 0, errors: 0, status: "started" };
    } catch (error) {
      console.error(`[Sync] Fatal error:`, error);

      await ctx.runMutation((internal as any)["mutations/updateSyncStatus"].completeSync, {
        processed: 0,
        total: 0,
        errors: 1,
        message: `Sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      });

      throw error;
    }
  },
});

export const processBatch = action({
  args: {
    issues: v.array(v.any()),
    startIndex: v.number(),
    processedCount: v.number(),
    errorCount: v.number(),
    totalNew: v.number(),
    totalAll: v.number(),
  },
  handler: async (ctx, args) => {
    const { issues, startIndex, totalNew, totalAll } = args;
    let { processedCount, errorCount } = args;

    const endIndex = Math.min(startIndex + BATCH_SIZE, issues.length);
    const batch = issues.slice(startIndex, endIndex);

    console.log(`[Sync] Processing batch ${startIndex}-${endIndex} of ${issues.length}`);

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

        // Update progress every 5 issues
        if (processedCount % 5 === 0) {
          await ctx.runMutation((internal as any)["mutations/updateSyncStatus"].updateSyncProgress, {
            processed: processedCount,
            total: totalNew,
            errors: errorCount,
            message: `Processing: ${processedCount}/${totalNew} new issues...`,
          });
        }

        // Rate limit delay for Nvidia embedding API (30 RPM)
        await delay(RATE_LIMIT_DELAY_MS);
      } catch (error) {
        errorCount++;
        console.error(`[Sync] Error processing issue #${issue.number}:`, error);
      }
    }

    // Check if there are more batches to process
    if (endIndex < issues.length) {
      // Schedule next batch
      await ctx.scheduler.runAfter(0, (internal as any)["actions/syncIssues"].processBatch, {
        issues,
        startIndex: endIndex,
        processedCount,
        errorCount,
        totalNew,
        totalAll,
      });
    } else {
      // All done
      console.log(`[Sync] Completed: ${processedCount} processed, ${errorCount} errors`);

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
