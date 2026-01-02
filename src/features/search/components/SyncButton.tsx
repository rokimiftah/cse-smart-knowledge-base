import { useState } from "react";

import { useAction } from "convex/react";
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from "lucide-react";

import { api } from "../../../../convex/_generated/api";

export const SyncButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const triggerSyncAction = useAction((api as any)["actions/manualSync"].triggerSync);

  const handleSync = async () => {
    setIsLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const result = await triggerSyncAction({ perPage: 100 });
      setStatus("success");
      setMessage(`Synced ${result.processed} issues`);

      // Auto-hide success message after 3s
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 3000);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Sync failed");

      // Auto-hide error message after 5s
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleSync}
        disabled={isLoading}
        className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-gray-300 bg-white px-5 py-3 font-semibold text-gray-900 transition-colors hover:border-gray-400 disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={18} />
        ) : status === "success" ? (
          <CheckCircle size={18} />
        ) : status === "error" ? (
          <AlertCircle size={18} />
        ) : (
          <RefreshCw size={18} />
        )}
        {isLoading ? "Syncing..." : status === "success" ? "Synced" : status === "error" ? "Failed" : "Sync"}
      </button>

      {/* Toast Message */}
      {message && (
        <div className="absolute top-full right-0 mt-2 w-64 rounded-xl border-2 border-gray-300 bg-white p-3 text-sm shadow-lg">
          {message}
        </div>
      )}
    </div>
  );
};
