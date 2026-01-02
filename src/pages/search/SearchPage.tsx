import type { Doc } from "../../../convex/_generated/dataModel";

import { useState } from "react";

import { useQuery } from "convex/react";

import { IssueCard } from "@features/search/components/IssueCard";
import { IssueDetailModal } from "@features/search/components/IssueDetailModal";
import { SearchBar } from "@features/search/components/SearchBar";
import { SyncButton } from "@features/search/components/SyncButton";
import { useIssueSearch } from "@features/search/hooks/useIssueSearch";

import { api } from "../../../convex/_generated/api";

export const SearchPage = () => {
  const [selectedIssue, setSelectedIssue] = useState<Doc<"issues"> | null>(null);
  const { results, isLoading, error, search, clearResults } = useIssueSearch();
  const stats = useQuery((api as any)["queries/getDashboardStats"].getDashboardStats);

  const hasResults = results.length > 0 || isLoading || error;

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      {/* Header Section */}
      <div className={`z-40 w-full ${hasResults ? "" : "flex flex-1 items-center justify-center"}`}>
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
          {/* Title */}
          <div className="mb-3 text-center sm:mb-4">
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-black sm:text-2xl md:text-3xl lg:text-4xl">
              SerpApi CSE Smart Knowledge Base
            </h1>
            <a
              href="https://github.com/serpapi/public-roadmap/issues?q=is%3Aissue%20state%3Aclosed"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
            >
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span>serpapi/public-roadmap</span>
            </a>
          </div>

          {/* Search Input */}
          <div className="mx-auto w-full max-w-4xl">
            <SearchBar onSearch={search} onClear={clearResults} isLoading={isLoading} />
          </div>

          {/* Stats */}
          <div className="mt-3 flex justify-center sm:mt-4">
            <div className="inline-flex w-full max-w-xl flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs shadow-sm sm:w-auto sm:flex-row sm:gap-3 sm:rounded-full sm:px-5 sm:py-2.5 sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 sm:h-2 sm:w-2" />
                <span className="font-semibold text-gray-900">{stats?.total ?? "—"}</span>
                <span className="text-gray-500">issues indexed</span>
              </div>
              <div className="hidden h-3.5 w-px bg-gray-300 sm:block" />
              <div className="flex items-center gap-1.5 text-gray-500 sm:gap-2">
                <span>Last sync:</span>
                <span className="font-semibold text-gray-900">
                  {stats?.lastSync
                    ? (() => {
                        const date = new Date(stats.lastSync);
                        const now = new Date();
                        const diffMs = now.getTime() - date.getTime();
                        const diffMins = Math.floor(diffMs / 60000);
                        const diffHours = Math.floor(diffMs / 3600000);
                        const diffDays = Math.floor(diffMs / 86400000);

                        if (diffMins < 60) return `${diffMins}m ago`;
                        if (diffHours < 24) return `${diffHours}h ago`;
                        if (diffDays < 7) return `${diffDays}d ago`;
                        return date.toLocaleDateString();
                      })()
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Results Section */}
      {hasResults && (
        <div className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            {/* Results Area */}
            {results.length > 0 && (
              <div>
                <p className="mb-6 text-center text-sm text-gray-500 lg:mb-8">
                  Found {results.length} relevant {results.length === 1 ? "result" : "results"}
                </p>
                <div className="mb-1 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:mb-4 lg:grid-cols-3">
                  {results.map((issue) => (
                    <IssueCard key={issue._id} issue={issue} onClick={() => setSelectedIssue(issue)} />
                  ))}
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="fixed inset-0 z-30 flex items-center justify-center">
                <div className="flex gap-2">
                  <div className="h-3 w-3 animate-bounce rounded-full bg-black" style={{ animationDelay: "0ms" }} />
                  <div className="h-3 w-3 animate-bounce rounded-full bg-black" style={{ animationDelay: "150ms" }} />
                  <div className="h-3 w-3 animate-bounce rounded-full bg-black" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="mx-auto max-w-2xl border border-black bg-white p-4 text-center sm:p-6">
                <p className="text-sm font-medium text-black">Error: {error}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sync button - bottom right corner */}
      <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
        <SyncButton />
      </div>

      {/* Issue Detail Modal */}
      <IssueDetailModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
    </div>
  );
};
