import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily("sync-github-issues", { hourUTC: 2, minuteUTC: 0 }, (internal as any)["actions/syncIssues"].syncIssues, {
  owner: "serpapi",
  repo: "public-roadmap",
  perPage: 30,
});

export default crons;
