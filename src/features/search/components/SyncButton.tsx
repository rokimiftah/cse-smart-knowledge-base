import { useEffect, useState } from "react";

import { useAction, useQuery } from "convex/react";
import { AlertCircle, CheckCircle, Loader2, RefreshCw, X } from "lucide-react";

import { api } from "../../../../convex/_generated/api";

export const SyncButton = () => {
  const syncStatus = useQuery((api as any)["queries/getSyncStatus"].getSyncStatus);
  const triggerSyncAction = useAction((api as any)["actions/manualSync"].triggerSync);
  const [tooltipDismissed, setTooltipDismissed] = useState(false);

  // Reset dismissed state when a new sync starts
  useEffect(() => {
    if (syncStatus?.isRunning) {
      setTooltipDismissed(false);
    }
  }, [syncStatus?.isRunning]);

  const isLoading = syncStatus === undefined;
  const isSyncing = syncStatus?.isRunning === true;
  const isDisabled = isLoading || isSyncing;

  const handleSync = async () => {
    if (isDisabled) return;

    try {
      await triggerSyncAction({ perPage: 100 });
    } catch (err) {
      console.error("Sync failed:", err);
    }
  };

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="animate-spin" size={16} />;
    if (isSyncing) return <Loader2 className="animate-spin" size={16} />;
    if (syncStatus?.errors && syncStatus.errors > 0) return <AlertCircle size={16} />;
    if (syncStatus?.completedAt) return <CheckCircle size={16} />;
    return <RefreshCw size={16} />;
  };

  const getButtonText = () => {
    if (isLoading) return "";
    if (isSyncing) {
      if (syncStatus?.total && syncStatus.total > 0) {
        return `Syncing ${syncStatus.processed ?? 0}/${syncStatus.total}...`;
      }
      return syncStatus?.message || "Syncing...";
    }
    return "Sync";
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleSync}
        disabled={isDisabled}
        style={{ cursor: isDisabled ? "not-allowed" : "pointer", opacity: isDisabled ? 0.5 : 1 }}
        className="inline-flex items-center gap-1.5 rounded-xl border-2 border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 transition-colors hover:border-gray-400 sm:gap-2 sm:rounded-2xl sm:px-5 sm:py-3 sm:text-base"
      >
        {getStatusIcon()}
        <span className="hidden sm:inline">{getButtonText()}</span>
      </button>

      {syncStatus?.message &&
        !isSyncing &&
        !tooltipDismissed &&
        syncStatus.completedAt &&
        syncStatus.processed !== undefined &&
        syncStatus.processed > 0 && (
          <div className="absolute right-0 bottom-full mb-2 w-56 rounded-lg border-2 border-gray-300 bg-white p-2.5 text-xs shadow-lg sm:w-64 sm:rounded-xl sm:p-3 sm:text-sm">
            <button
              type="button"
              onClick={() => setTooltipDismissed(true)}
              className="absolute top-1 right-1 cursor-pointer p-0.5 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
            <div className="pr-4">{syncStatus.message}</div>
          </div>
        )}
    </div>
  );
};
