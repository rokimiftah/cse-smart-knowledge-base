import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  issues: defineTable({
    githubIssueId: v.number(),
    number: v.number(),
    title: v.string(),
    url: v.string(),
    state: v.string(),

    category: v.union(v.literal("Bug"), v.literal("Feature Request"), v.literal("Question"), v.literal("Other")),
    summary: v.string(),
    rootCause: v.optional(v.string()),
    solution: v.string(),
    confidenceScore: v.string(),

    embedding: v.array(v.float64()),
  })
    .index("by_github_id", ["githubIssueId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
    }),
});
