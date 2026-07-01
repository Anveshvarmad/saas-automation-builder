"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewWorkflowPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState("WEBHOOK");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const response = await fetch("/api/workflows", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        triggerType,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Failed to create workflow.");
      setIsLoading(false);
      return;
    }

    router.push(`/workflows/${data.workflow.id}`);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <a href="/workflows" className="text-sm text-gray-600">
            ← Back to workflows
          </a>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Create Workflow
          </h1>
          <p className="mt-2 text-gray-600">
            Define a trigger for your automation. We will add workflow steps
            next.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-gray-200 bg-white p-6"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Workflow Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Classify new leads"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Use AI to classify incoming leads and send the result to a CRM."
              className="min-h-28 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Trigger Type
            </label>
            <select
              value={triggerType}
              onChange={(event) => setTriggerType(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
            >
              <option value="WEBHOOK">Webhook Trigger</option>
              <option value="MANUAL">Manual Trigger</option>
              <option value="SCHEDULE">Scheduled Trigger</option>
            </select>
          </div>

          {error ? (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <button
            disabled={isLoading}
            className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {isLoading ? "Creating..." : "Save Workflow"}
          </button>
        </form>
      </div>
    </main>
  );
}
