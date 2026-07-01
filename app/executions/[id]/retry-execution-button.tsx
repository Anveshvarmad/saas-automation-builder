"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RetryExecutionButtonProps = {
  executionId: string;
};

export default function RetryExecutionButton({
  executionId,
}: RetryExecutionButtonProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isRetrying, setIsRetrying] = useState(false);

  async function retryExecution() {
    setError("");
    setIsRetrying(true);

    try {
      const response = await fetch(`/api/executions/${executionId}/retry`, {
        method: "POST",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to retry execution.");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsRetrying(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={retryExecution}
        disabled={isRetrying}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRetrying ? "Retrying..." : "Retry Execution"}
      </button>

      {error && <p className="mt-2 text-sm font-medium text-red-700">{error}</p>}
    </div>
  );
}
