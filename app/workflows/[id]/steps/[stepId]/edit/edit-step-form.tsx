"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type EditStepFormProps = {
  workflowId: string;
  stepId: string;
  initialName: string;
  initialPrompt: string;
};

export function EditStepForm({
  workflowId,
  stepId,
  initialName,
  initialPrompt,
}: EditStepFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialName);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/workflow-steps/${stepId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          prompt,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to update step.");
      }

      router.push(`/workflows/${workflowId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-white p-6 shadow-sm"
    >
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-slate-700">
          Step Name
        </label>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
          placeholder="Classify lead with AI"
        />
      </div>

      <div className="mt-5">
        <label className="text-sm font-medium text-slate-700">
          OpenAI Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={12}
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 font-mono text-sm text-slate-900 outline-none focus:border-blue-500"
          placeholder="Analyze this lead and classify it as hot, warm, or cold."
        />
        <p className="mt-2 text-sm text-slate-500">
          This prompt will be sent to OpenAI together with the webhook payload.
        </p>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save Step"}
        </button>

        <button
          type="button"
          onClick={() => router.push(`/workflows/${workflowId}`)}
          className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
