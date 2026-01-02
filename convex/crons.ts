import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily("sync-github-issues", { hourUTC: 19, minuteUTC: 0 }, (internal as any)["actions/syncIssues"].syncIssues, {
  owner: "serpapi",
  repo: "public-roadmap",
  perPage: 100,
});

export default crons;
