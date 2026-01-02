"use node";

import { v } from "convex/values";

import { internal } from "../_generated/api";
import { action } from "../_generated/server";

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  state: string;
  comments: number;
}

interface GitHubComment {
  body: string;
  created_at: string;
}

export interface IssueWithComments {
  id: number;
  number: number;
  title: string;
  body: string;
  url: string;
  comments: string[];
}

const ISSUES_PER_PAGE = 100;
const MAX_ISSUES_PER_BATCH = 20;

function getGitHubHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is not configured in Convex environment variables");
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function generateSyncId(): string {
  return `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const startFetchIssues = action({
  args: {
    owner: v.string(),
    repo: v.string(),
    maxPages: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ status: string; syncId: string }> => {
    const { owner, repo, maxPages = 30 } = args;
    const syncId = generateSyncId();

    console.log(`[GitHub] Starting paginated fetch for ${owner}/${repo}, syncId: ${syncId}`);

    await ctx.scheduler.runAfter(0, (internal as any)["actions/githubFetcher"].fetchPage, {
      owner,
      repo,
      syncId,
      page: 1,
      maxPages,
    });

    return { status: "started", syncId };
  },
});

export const fetchPage = action({
  args: {
    owner: v.string(),
    repo: v.string(),
    syncId: v.string(),
    page: v.number(),
    maxPages: v.number(),
  },
  handler: async (ctx, args): Promise<void> => {
    const { owner, repo, syncId, page, maxPages } = args;
    const headers = getGitHubHeaders();

    const issuesUrl = `https://api.github.com/repos/${owner}/${repo}/issues?state=closed&per_page=${ISSUES_PER_PAGE}&page=${page}&sort=updated&direction=desc`;

    console.log(`[GitHub] Fetching page ${page}...`);
    const issuesResponse = await fetch(issuesUrl, { headers });

    if (!issuesResponse.ok) {
      throw new Error(`GitHub API error: ${issuesResponse.status} ${issuesResponse.statusText}`);
    }

    const issues: GitHubIssue[] = await issuesResponse.json();

    if (issues.length === 0) {
      console.log(`[GitHub] No more issues at page ${page}, starting comment fetch`);
      await ctx.scheduler.runAfter(0, (internal as any)["actions/githubFetcher"].fetchCommentsForBatch, {
        owner,
        repo,
        syncId,
      });
      return;
    }

    const filteredIssues = issues.filter((issue) => !("pull_request" in issue));
    console.log(`[GitHub] Page ${page}: fetched ${issues.length} issues, ${filteredIssues.length} after PR filter`);

    for (const issue of filteredIssues) {
      await ctx.runMutation((internal as any)["mutations/syncRawIssues"].saveRawIssue, {
        syncId,
        githubId: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body || "",
        url: issue.html_url,
        commentsCount: issue.comments,
      });
    }

    const hasMore = issues.length === ISSUES_PER_PAGE && page < maxPages;

    if (hasMore) {
      await ctx.scheduler.runAfter(0, (internal as any)["actions/githubFetcher"].fetchPage, {
        owner,
        repo,
        syncId,
        page: page + 1,
        maxPages,
      });
    } else {
      console.log(`[GitHub] All pages fetched, starting comment fetch`);
      await ctx.scheduler.runAfter(0, (internal as any)["actions/githubFetcher"].fetchCommentsForBatch, {
        owner,
        repo,
        syncId,
      });
    }
  },
});

export const fetchCommentsForBatch = action({
  args: {
    owner: v.string(),
    repo: v.string(),
    syncId: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    const { owner, repo, syncId } = args;
    const headers = getGitHubHeaders();

    const unfetchedIssues = await ctx.runQuery((internal as any)["queries/syncRawIssues"].getNextUnfetchedIssues, {
      syncId,
      limit: MAX_ISSUES_PER_BATCH,
    });

    if (unfetchedIssues.length === 0) {
      console.log(`[GitHub] All comments fetched, triggering issue processing`);
      await ctx.scheduler.runAfter(0, (internal as any)["actions/syncIssues"].processIssuesFromFetch, {
        syncId,
      });
      return;
    }

    console.log(`[GitHub] Fetching comments for ${unfetchedIssues.length} issues`);

    for (const issue of unfetchedIssues) {
      let comments: string[] = [];

      if (issue.commentsCount > 0) {
        const commentsUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${issue.number}/comments`;
        const commentsResponse = await fetch(commentsUrl, { headers });

        if (commentsResponse.ok) {
          const commentsData: GitHubComment[] = await commentsResponse.json();
          comments = commentsData.map((c) => c.body);
        }
      }

      await ctx.runMutation((internal as any)["mutations/syncRawIssues"].updateRawIssueComments, {
        syncId,
        githubId: issue.githubId,
        comments,
      });
    }

    await ctx.scheduler.runAfter(0, (internal as any)["actions/githubFetcher"].fetchCommentsForBatch, {
      owner,
      repo,
      syncId,
    });
  },
});

export const fetchClosedIssues = action({
  args: {
    owner: v.string(),
    repo: v.string(),
    perPage: v.optional(v.number()),
    maxPages: v.optional(v.number()),
  },
  handler: async (_ctx, _args): Promise<IssueWithComments[]> => {
    throw new Error("fetchClosedIssues is deprecated. Use startFetchIssues instead.");
  },
});
