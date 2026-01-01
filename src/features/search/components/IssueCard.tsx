import type { Doc } from "../../../../convex/_generated/dataModel";

import { ExternalLink } from "lucide-react";

interface IssueCardProps {
  issue: Doc<"issues"> & { score?: number };
  onClick: () => void;
}

const categoryColors = {
  Bug: "bg-red-100 text-red-700 border-red-200",
  "Feature Request": "bg-blue-100 text-blue-700 border-blue-200",
  Question: "bg-purple-100 text-purple-700 border-purple-200",
  Other: "bg-gray-100 text-gray-700 border-gray-200",
};

const confidenceColors = {
  High: "text-green-600",
  Medium: "text-yellow-600",
  Low: "text-red-600",
};

export const IssueCard = ({ issue, onClick }: IssueCardProps) => {
  // Format similarity score as percentage
  const similarityPercentage = issue.score ? Math.round(issue.score * 100) : null;

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-lg border-2 border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-blue-400 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="flex-1 text-lg font-semibold text-gray-900 group-hover:text-blue-600">{issue.title}</h3>
        <a
          href={issue.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0 text-gray-400 transition-colors hover:text-blue-600"
        >
          <ExternalLink size={18} />
        </a>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${categoryColors[issue.category]}`}>
          {issue.category}
        </span>
        <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600">#{issue.number}</span>
        <span className={`text-xs font-medium ${confidenceColors[issue.confidenceScore as keyof typeof confidenceColors]}`}>
          {issue.confidenceScore} Confidence
        </span>
        {similarityPercentage !== null && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            {similarityPercentage}% match
          </span>
        )}
      </div>

      <p className="line-clamp-3 text-sm text-gray-600">{issue.summary}</p>

      <div className="mt-3 text-xs text-blue-600 group-hover:underline">Lihat detail solusi →</div>
    </div>
  );
};
