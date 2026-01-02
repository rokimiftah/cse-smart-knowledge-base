import type { Doc } from "../../../../convex/_generated/dataModel";

import { useEffect } from "react";

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
  useEffect(() => {
    if (issue) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [issue]);

  if (!issue) return null;

  const CategoryIcon = categoryIcons[issue.category];

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div onClick={handleBackdropClick} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl sm:max-h-[90vh] sm:rounded-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900 sm:text-2xl">Issue Details</h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 sm:p-2"
          >
            <X size={20} className="sm:hidden" />
            <X size={24} className="hidden sm:block" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="mb-4 flex items-start gap-2 sm:mb-6 sm:gap-3">
            <CategoryIcon className="mt-1 hidden flex-shrink-0 text-blue-600 sm:block" size={24} />
            <CategoryIcon className="mt-0.5 flex-shrink-0 text-blue-600 sm:hidden" size={20} />
            <div className="flex-1">
              <h3 className="mb-2 text-base font-semibold text-gray-900 sm:text-xl">{issue.title}</h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 sm:px-3 sm:py-1 sm:text-sm">
                  {issue.category}
                </span>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700 sm:px-3 sm:py-1 sm:text-sm">
                  #{issue.number}
                </span>
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 sm:px-3 sm:py-1 sm:text-sm">
                  {issue.confidenceScore} Solution
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-gray-500 uppercase sm:text-sm">
                Summary
              </h4>
              <p className="text-sm text-gray-700 sm:text-base">{issue.summary}</p>
            </div>

            {issue.rootCause && (
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-gray-500 uppercase sm:text-sm">
                  Root Cause
                </h4>
                <p className="text-sm text-gray-700 sm:text-base">{issue.rootCause}</p>
              </div>
            )}

            <div>
              <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-gray-500 uppercase sm:text-sm">
                Solution
              </h4>
              <div className="rounded-lg bg-green-50 p-3 sm:p-4">
                <p className="text-sm text-gray-800 sm:text-base">{issue.solution}</p>
              </div>
            </div>

            <div className="border-t pt-3 text-center sm:pt-4">
              <a
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:px-4 sm:text-base"
              >
                View Original Issue on GitHub
                <ExternalLink size={14} className="sm:hidden" />
                <ExternalLink size={16} className="hidden sm:block" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
