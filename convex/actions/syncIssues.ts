"use node";

import type { IssueWithComments } from "./githubFetcher";

import { v } from "convex/values";

import { internal } from "../_generated/api";
import { action } from "../_generated/server";

export const syncIssues = action({
  args: {
    owner: v.string(),
    repo: v.string(),
    perPage: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { owner, repo, perPage = 30 } = args;

    console.log(`[Sync] Starting sync for ${owner}/${repo}`);

    const issues: IssueWithComments[] = await ctx.runAction((internal as any)["actions/githubFetcher"].fetchClosedIssues, {
      owner,
      repo,
      perPage,
    });

    console.log(`[Sync] Fetched ${issues.length} closed issues`);

    let processedCount = 0;
    let errorCount = 0;

    for (const issue of issues) {
      try {
        const existing = await ctx.runQuery((internal as any)["queries/getIssueByGithubId"].getIssueByGithubId, {
          githubIssueId: issue.id,
        });

        if (existing) {
          console.log(`[Sync] Skipping existing issue #${issue.number}`);
          continue;
        }

        console.log(`[Sync] Analyzing issue #${issue.number}: ${issue.title}`);

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
        console.log(`[Sync] Saved issue #${issue.number}`);
      } catch (error) {
        errorCount++;
        console.error(`[Sync] Error processing issue #${issue.number}:`, error);
      }
    }

    console.log(`[Sync] Completed: ${processedCount} processed, ${errorCount} errors`);

    return {
      total: issues.length,
      processed: processedCount,
      errors: errorCount,
    };
  },
});
