"use node";

import { v } from "convex/values";

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

export const fetchClosedIssues = action({
  args: {
    owner: v.string(),
    repo: v.string(),
    perPage: v.optional(v.number()),
  },
  handler: async (_ctx, args): Promise<IssueWithComments[]> => {
    const { owner, repo, perPage = 30 } = args;
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      throw new Error("GITHUB_TOKEN is not configured in Convex environment variables");
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    const issuesUrl = `https://api.github.com/repos/${owner}/${repo}/issues?state=closed&per_page=${perPage}&sort=updated&direction=desc`;

    const issuesResponse = await fetch(issuesUrl, { headers });

    if (!issuesResponse.ok) {
      throw new Error(`GitHub API error: ${issuesResponse.status} ${issuesResponse.statusText}`);
    }

    const issues: GitHubIssue[] = await issuesResponse.json();

    const issuesWithComments: IssueWithComments[] = [];

    for (const issue of issues) {
      if ("pull_request" in issue) continue;

      let comments: string[] = [];

      if (issue.comments > 0) {
        const commentsUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${issue.number}/comments`;
        const commentsResponse = await fetch(commentsUrl, { headers });

        if (commentsResponse.ok) {
          const commentsData: GitHubComment[] = await commentsResponse.json();
          comments = commentsData.map((c) => c.body);
        }
      }

      issuesWithComments.push({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body || "",
        url: issue.html_url,
        comments,
      });
    }

    return issuesWithComments;
  },
});
