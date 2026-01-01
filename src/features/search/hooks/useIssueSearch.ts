import type { Doc } from "../../../../convex/_generated/dataModel";

import { useState } from "react";

import { useAction } from "convex/react";

import { api } from "../../../../convex/_generated/api";

export const useIssueSearch = () => {
  const [results, setResults] = useState<Doc<"issues">[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchAction = useAction((api as any)["queries/searchIssues"].searchIssues);

  const search = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchResults = await searchAction({ query, limit: 10 });
      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search issues");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    results,
    isLoading,
    error,
    search,
  };
};
