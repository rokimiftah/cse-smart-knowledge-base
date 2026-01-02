import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  issueStats: defineTable({
    total: v.number(),
    byCategory: v.object({
      Bug: v.number(),
      FeatureRequest: v.number(),
      Question: v.number(),
      Other: v.number(),
    }),
    byConfidence: v.object({
      High: v.number(),
      Medium: v.number(),
      Low: v.number(),
    }),
    lastSync: v.optional(v.number()),
  }),

  syncStatus: defineTable({
    isRunning: v.boolean(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    processed: v.optional(v.number()),
    total: v.optional(v.number()),
    errors: v.optional(v.number()),
    message: v.optional(v.string()),
  }),

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
      dimensions: 2048,
    }),
});
