"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteWorkflowButtonProps = {
  workflowId: string;
};

export default function DeleteWorkflowButton({
  workflowId,
}: DeleteWorkflowButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this workflow?"
    );

    if (!confirmed) {
      return;
    }

    setIsLoading(true);

    const response = await fetch(`/api/workflows/${workflowId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      alert("Failed to delete workflow.");
      setIsLoading(false);
      return;
    }

    router.push("/workflows");
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isLoading}
      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
    >
      {isLoading ? "Deleting..." : "Delete"}
    </button>
  );
}
