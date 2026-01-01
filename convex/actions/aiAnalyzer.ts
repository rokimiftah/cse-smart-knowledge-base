"use node";

import { v } from "convex/values";

import { action } from "../_generated/server";
import { callLLM, getEmbedding } from "../lib/openai";

const ANALYSIS_PROMPT = `You are an expert technical support analyst. Analyze the following GitHub issue and extract structured information.

Issue Title: {title}

Issue Body:
{body}

Comments:
{comments}

Based on this discussion, provide a JSON response with the following structure:
{
  "category": "Bug" | "Feature Request" | "Question" | "Other",
  "summary": "A concise 2-3 sentence summary of the main problem or question",
  "rootCause": "The underlying technical cause (if identified, otherwise null)",
  "solution": "The solution provided, workaround suggested, or reason for closing (wontfix, duplicate, etc.)",
  "confidenceScore": "High" | "Medium" | "Low"
}

Guidelines:
- Focus on technical details, ignore social pleasantries
- If the issue was solved, extract the actual solution from comments
- If it's a wontfix/duplicate, explain why
- Be concise but technically accurate
- confidenceScore should be "High" if there's clear resolution, "Medium" if partial/workaround, "Low" if unresolved/unclear

Respond with valid JSON only, no additional text.`;

interface AIAnalysisResult {
  category: "Bug" | "Feature Request" | "Question" | "Other";
  summary: string;
  rootCause: string | null;
  solution: string;
  confidenceScore: "High" | "Medium" | "Low";
  embedding: number[];
}

export const analyzeIssue = action({
  args: {
    issue: v.object({
      id: v.number(),
      number: v.number(),
      title: v.string(),
      body: v.string(),
      url: v.string(),
      comments: v.array(v.string()),
    }),
  },
  handler: async (_ctx, args): Promise<AIAnalysisResult> => {
    const { issue } = args;

    const commentsText = issue.comments.length > 0 ? issue.comments.slice(0, 10).join("\n\n---\n\n") : "No comments";

    const prompt = ANALYSIS_PROMPT.replace("{title}", issue.title)
      .replace("{body}", issue.body || "No description provided")
      .replace("{comments}", commentsText);

    // Call LLM using fetch (curl-like)
    const analysisText = await callLLM([
      {
        role: "system",
        content:
          "You are a technical analyst that extracts structured information from GitHub issues. Always respond with valid JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ]);

    // Clean markdown code blocks if present (```json ... ```)
    let cleanedJson = analysisText || "{}";
    if (cleanedJson.includes("```")) {
      // Remove markdown code fences
      cleanedJson = cleanedJson
        .replace(/```json?\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
    }

    const analysis = JSON.parse(cleanedJson);

    // Generate embedding with comprehensive context
    // Include: title, original body, AI summary, solution, and root cause
    const embeddingText = `Title: ${issue.title}

Description: ${issue.body || "No description"}

Summary: ${analysis.summary}

Root Cause: ${analysis.rootCause || "Not identified"}

Solution: ${analysis.solution}

Category: ${analysis.category}`;

    // Generate embedding with input_type="passage" (for indexing documents)
    const embedding = await getEmbedding(embeddingText, "passage");

    console.log("Embedding generated:", {
      issueNumber: issue.number,
      embeddingTextLength: embeddingText.length,
      embeddingDimensions: embedding.length,
    });

    return {
      category: analysis.category,
      summary: analysis.summary,
      rootCause: analysis.rootCause || null,
      solution: analysis.solution,
      confidenceScore: analysis.confidenceScore,
      embedding,
    };
  },
});
