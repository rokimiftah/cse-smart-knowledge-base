import type { Doc } from "../../../convex/_generated/dataModel";

import { useState } from "react";

import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";

import { IssueCard } from "@features/search/components/IssueCard";
import { IssueDetailModal } from "@features/search/components/IssueDetailModal";
import { SearchBar } from "@features/search/components/SearchBar";
import { SyncButton } from "@features/search/components/SyncButton";
import { useIssueSearch } from "@features/search/hooks/useIssueSearch";

import { api } from "../../../convex/_generated/api";

export const SearchPage = () => {
  const [selectedIssue, setSelectedIssue] = useState<Doc<"issues"> | null>(null);
  const { results, isLoading, error, search } = useIssueSearch();
  const stats = useQuery((api as any)["queries/getDashboardStats"].getDashboardStats);

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content - Centered */}
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-black">SerpApi CSE Smart Knowledge Base</h1>
        </div>

        {/* Search Input */}
        <div className="w-full max-w-4xl">
          <SearchBar onSearch={search} isLoading={isLoading} />
        </div>

        {/* Stats - elegant format */}
        {stats && (
          <div className="mt-8 inline-flex items-center gap-4 rounded-full border border-gray-200 bg-gray-50 px-6 py-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-gray-900">{stats.total}</span>
              <span className="text-gray-500">issues indexed</span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center gap-2 text-gray-500">
              <span>Last sync:</span>
              <span className="font-semibold text-gray-900">
                {stats.lastSync
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
                  : "Never"}
              </span>
            </div>
          </div>
        )}

        {/* Results Area */}
        {results.length > 0 && (
          <div className="mt-16 w-full max-w-7xl">
            <p className="mb-8 text-center text-sm text-gray-500">
              Found {results.length} relevant {results.length === 1 ? "result" : "results"}
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {results.map((issue) => (
                <IssueCard key={issue._id} issue={issue} onClick={() => setSelectedIssue(issue)} />
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mt-16 text-center">
            <Loader2 className="mx-auto mb-4 animate-spin text-black" size={40} />
            <p className="text-sm text-gray-500">Searching for solutions...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-16 max-w-2xl border border-black bg-white p-6 text-center">
            <p className="text-sm font-medium text-black">Error: {error}</p>
          </div>
        )}
      </div>

      {/* Sync button - bottom right corner */}
      <div className="fixed right-6 bottom-6">
        <SyncButton />
      </div>

      {/* Issue Detail Modal */}
      <IssueDetailModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
    </div>
  );
};
