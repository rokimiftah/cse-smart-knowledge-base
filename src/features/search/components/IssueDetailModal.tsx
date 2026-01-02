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

const categoryColors = {
  Bug: {
    badge: "bg-red-600",
    iconBg: "bg-red-100",
    iconText: "text-red-700",
  },
  "Feature Request": {
    badge: "bg-blue-600",
    iconBg: "bg-blue-100",
    iconText: "text-blue-700",
  },
  Question: {
    badge: "bg-purple-600",
    iconBg: "bg-purple-100",
    iconText: "text-purple-700",
  },
  Other: {
    badge: "bg-gray-600",
    iconBg: "bg-gray-100",
    iconText: "text-gray-700",
  },
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
  const colors = categoryColors[issue.category];

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 backdrop-blur-sm sm:p-4"
    >
      <div className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white p-4 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900 sm:text-2xl">Issue Details</h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full p-1.5 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700 sm:p-2"
          >
            <X size={20} className="sm:hidden" />
            <X size={24} className="hidden sm:block" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Title section */}
          <div className="mb-6 sm:mb-8">
            <div className="mb-3 flex items-start gap-3 sm:gap-4">
              <div className={`rounded-xl ${colors.iconBg} p-2.5 sm:p-3`}>
                <CategoryIcon className={colors.iconText} size={20} />
              </div>
              <div className="flex-1">
                <h3 className="mb-3 text-lg leading-tight font-bold text-gray-900 sm:text-2xl">{issue.title}</h3>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full ${colors.badge} px-3 py-1.5 text-xs font-semibold text-white shadow-sm sm:text-sm`}
                  >
                    <CategoryIcon size={14} />
                    {issue.category}
                  </span>
                  <span className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm sm:text-sm">
                    #{issue.number}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm sm:text-sm">
                    <CheckCircle size={14} />
                    {issue.confidenceScore} Solution
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5 sm:space-y-6">
            {/* Summary section */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm sm:p-5">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900 sm:text-base">
                <div className="h-1 w-1 rounded-full bg-blue-600" />
                Summary
              </h4>
              <p className="leading-relaxed text-gray-700 sm:text-base">{issue.summary}</p>
            </div>

            {/* Root Cause section */}
            {issue.rootCause && (
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 shadow-sm sm:p-5">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-orange-900 sm:text-base">
                  <AlertCircle size={18} />
                  Root Cause
                </h4>
                <p className="leading-relaxed text-gray-700 sm:text-base">{issue.rootCause}</p>
              </div>
            )}

            {/* Solution section */}
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm sm:p-5">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-green-900 sm:text-base">
                <CheckCircle size={18} />
                Solution
              </h4>
              <p className="leading-relaxed text-gray-800 sm:text-base">{issue.solution}</p>
            </div>

            {/* CTA Button */}
            <div className="pt-2 text-center">
              <a
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl sm:text-base"
              >
                View Original Issue on GitHub
                <ExternalLink size={16} className="sm:hidden" />
                <ExternalLink size={18} className="hidden sm:block" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
