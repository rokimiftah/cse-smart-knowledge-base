"use node";

import type { Doc } from "../_generated/dataModel";

import { v } from "convex/values";

import { internal } from "../_generated/api";
import { action } from "../_generated/server";
import { getEmbedding } from "../lib/openai";

// Nvidia NemoRetriever produces lower scores than OpenAI models
// 0.35+ = relevant, 0.25-0.35 = possibly relevant, <0.25 = not relevant
const MIN_SIMILARITY_THRESHOLD = 0.25;

export const searchIssues = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Doc<"issues">[]> => {
    const { query, limit = 10 } = args;

    const queryEmbedding = await getEmbedding(query, "query");

    // Use native Convex vector search (fetch more for better filtering, max 256)
    const vectorResults = await ctx.vectorSearch("issues", "by_embedding", {
      vector: queryEmbedding,
      limit: Math.min(limit * 5, 256),
    });

    // Filter by similarity threshold
    const filteredResults = vectorResults.filter((r) => r._score >= MIN_SIMILARITY_THRESHOLD);

    console.log("Vector search results:", {
      query,
      totalResults: vectorResults.length,
      filteredResults: filteredResults.length,
      threshold: MIN_SIMILARITY_THRESHOLD,
      scores: vectorResults.slice(0, 5).map((r) => r._score.toFixed(3)),
    });

    if (filteredResults.length === 0) {
      return [];
    }

    // Fetch full documents
    const issues: Doc<"issues">[] = await ctx.runQuery(internal.queries.vectorSearch.fetchIssuesByIds, {
      ids: filteredResults.map((r) => r._id),
    });

    return issues;
  },
});
