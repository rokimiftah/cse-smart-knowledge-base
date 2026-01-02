import { useAction, useQuery } from "convex/react";
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from "lucide-react";

import { api } from "../../../../convex/_generated/api";

export const SyncButton = () => {
  const syncStatus = useQuery((api as any)["queries/getSyncStatus"].getSyncStatus);
  const triggerSyncAction = useAction((api as any)["actions/manualSync"].triggerSync);

  const isSyncing = syncStatus?.isRunning === true;

  console.log("SyncButton debug:", { syncStatus, isSyncing });

  const handleSync = async () => {
    if (isSyncing) return;

    try {
      await triggerSyncAction({ perPage: 100 });
    } catch (err) {
      console.error("Sync failed:", err);
    }
  };

  const getStatusIcon = () => {
    if (isSyncing) return <Loader2 className="animate-spin" size={16} />;
    if (syncStatus?.errors && syncStatus.errors > 0) return <AlertCircle size={16} />;
    if (syncStatus?.completedAt) return <CheckCircle size={16} />;
    return <RefreshCw size={16} />;
  };

  const getButtonText = () => {
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
        disabled={isSyncing}
        style={{ cursor: isSyncing ? "not-allowed" : "pointer", opacity: isSyncing ? 0.5 : 1 }}
        className="inline-flex items-center gap-1.5 rounded-xl border-2 border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 transition-colors hover:border-gray-400 sm:gap-2 sm:rounded-2xl sm:px-5 sm:py-3 sm:text-base"
      >
        {getStatusIcon()}
        <span className="hidden sm:inline">{getButtonText()}</span>
      </button>

      {syncStatus?.message && !isSyncing && syncStatus.completedAt && (
        <div className="absolute top-full right-0 mt-2 w-56 rounded-lg border-2 border-gray-300 bg-white p-2.5 text-xs shadow-lg sm:w-64 sm:rounded-xl sm:p-3 sm:text-sm">
          {syncStatus.message}
        </div>
      )}
    </div>
  );
};
