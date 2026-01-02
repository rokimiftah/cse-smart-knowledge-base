"use node";

import type { Doc } from "../_generated/dataModel";

import { v } from "convex/values";

import { internal } from "../_generated/api";
import { action } from "../_generated/server";
import { getEmbedding } from "../lib/openai";

// Nvidia NemoRetriever produces lower scores than OpenAI models
// 0.35+ = relevant, 0.25-0.35 = possibly relevant, <0.25 = not relevant
const MIN_SIMILARITY_THRESHOLD = 0.3;

// Confidence score boost multiplier
const CONFIDENCE_BOOST: Record<string, number> = {
  High: 1.2,
  Medium: 1.0,
  Low: 0.8,
};

// Keyword match boost - boost score if query keywords appear in title/summary
const KEYWORD_MATCH_BOOST = 1.5;
// API name match boost - higher boost for matching API names like [Google], [Amazon]
const API_NAME_MATCH_BOOST = 2.0;

// Extract significant keywords from query (ignore common words)
const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "shall",
  "can",
  "need",
  "dare",
  "ought",
  "used",
  "to",
  "of",
  "in",
  "for",
  "on",
  "with",
  "at",
  "by",
  "from",
  "as",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "between",
  "and",
  "but",
  "or",
  "nor",
  "so",
  "yet",
  "both",
  "either",
  "neither",
  "not",
  "only",
  "own",
  "same",
  "than",
  "too",
  "very",
  "just",
  "also",
  "how",
  "what",
  "when",
  "where",
  "why",
  "which",
  "who",
  "whom",
  "whose",
  "this",
  "that",
  "these",
  "those",
  "i",
  "me",
  "my",
  "we",
  "our",
  "you",
  "your",
  "he",
  "him",
  "his",
  "she",
  "her",
  "it",
  "its",
  "they",
  "them",
  "their",
  "all",
  "any",
  "each",
  "every",
  "no",
  "some",
  "such",
  "more",
  "most",
  "other",
  "return",
  "returns",
  "error",
  "errors",
  "issue",
  "issues",
  "problem",
  "problems",
  "result",
  "results",
  "data",
  "api",
  "search",
  "query",
  "request",
  "response",
]);

const extractKeywords = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
};

// Extract API name from title pattern like "[Google Maps API]" or "[Amazon Product API]"
const extractApiName = (title: string): string | null => {
  const match = title.match(/^\[([^\]]+)\]/);
  if (match) {
    // Extract first word (e.g., "Google" from "Google Maps API")
    const apiName = match[1].split(/\s+/)[0].toLowerCase();
    return apiName;
  }
  return null;
};

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

    // Create score map from vector results
    const scoreMap = new Map(filteredResults.map((r) => [r._id.toString(), r._score]));

    // Extract keywords from query for hybrid matching
    const queryKeywords = extractKeywords(query);

    // Sort by combined score (similarity * confidence boost * keyword boost)
    const sortedIssues = issues
      .map((issue) => {
        const similarityScore = scoreMap.get(issue._id.toString()) || 0;
        const confidenceBoost = CONFIDENCE_BOOST[issue.confidenceScore] || 1.0;

        // Check if query keywords appear in title or summary
        const issueText = `${issue.title} ${issue.summary}`.toLowerCase();
        const matchedKeywords = queryKeywords.filter((kw) => issueText.includes(kw));
        const keywordBoost = matchedKeywords.length > 0 ? KEYWORD_MATCH_BOOST : 1.0;

        // Check if API name matches query keywords (e.g., "amazon" in query matches "[Amazon Product API]")
        const issueApiName = extractApiName(issue.title);
        const apiNameMatches = issueApiName && queryKeywords.some((kw) => issueApiName.includes(kw));
        const apiBoost = apiNameMatches ? API_NAME_MATCH_BOOST : 1.0;

        const combinedScore = similarityScore * confidenceBoost * keywordBoost * apiBoost;
        return { issue, combinedScore, similarityScore, matchedKeywords, apiNameMatches };
      })
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, limit)
      .map(({ issue }) => issue);

    return sortedIssues;
  },
});
