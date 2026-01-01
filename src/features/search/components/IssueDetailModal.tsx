import type { Doc } from "../../../../convex/_generated/dataModel";

import { AlertCircle, CheckCircle, ExternalLink, HelpCircle, X } from "lucide-react";

interface IssueDetailModalProps {
  issue: Doc<"issues"> | null;
  onClose: () => void;
}

const categoryIcons = {
  Bug: AlertCircle,
  "Feature Request": CheckCircle,
  Question: HelpCircle,
  Other: HelpCircle,
};

export const IssueDetailModal = ({ issue, onClose }: IssueDetailModalProps) => {
  if (!issue) return null;

  const CategoryIcon = categoryIcons[issue.category];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b bg-white p-6">
          <h2 className="text-2xl font-bold text-gray-900">Issue Details</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 flex items-start gap-3">
            <CategoryIcon className="mt-1 flex-shrink-0 text-blue-600" size={24} />
            <div className="flex-1">
              <h3 className="mb-2 text-xl font-semibold text-gray-900">{issue.title}</h3>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">{issue.category}</span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">#{issue.number}</span>
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                  {issue.confidenceScore} Confidence
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                Summary
              </h4>
              <p className="text-gray-700">{issue.summary}</p>
            </div>

            {issue.rootCause && (
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                  Root Cause
                </h4>
                <p className="text-gray-700">{issue.rootCause}</p>
              </div>
            )}

            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                Solution
              </h4>
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-gray-800">{issue.solution}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <a
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
              >
                View Original Issue on GitHub
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
