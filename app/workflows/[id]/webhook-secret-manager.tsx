"use client";

import { useState } from "react";

type WebhookSecretManagerProps = {
  webhookId: string;
  tokenPrefix: string;
};

export default function WebhookSecretManager({
  webhookId,
  tokenPrefix,
}: WebhookSecretManagerProps) {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  async function generateSecret() {
    setError("");
    setSecret("");
    setIsGenerating(true);

    try {
      const response = await fetch(`/api/webhooks/${webhookId}/rotate-secret`, {
        method: "POST",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate webhook secret.");
      }

      setSecret(data.secret);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
      <h3 className="font-semibold text-yellow-900">Webhook Secret</h3>

      <p className="mt-2 text-sm text-yellow-800">
        Current secret prefix:{" "}
        <span className="font-mono font-semibold">{tokenPrefix}</span>
      </p>

      <p className="mt-2 text-sm text-yellow-800">
        Generate a new secret and copy it immediately. For security, the full
        secret is shown only once.
      </p>

      <button
        type="button"
        onClick={generateSecret}
        disabled={isGenerating}
        className="mt-4 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isGenerating ? "Generating..." : "Generate new secret"}
      </button>

      {error && (
        <p className="mt-3 text-sm font-medium text-red-700">{error}</p>
      )}

      {secret && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-yellow-900">
            Copy this secret now:
          </p>

          <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-100">
            {secret}
          </pre>
        </div>
      )}
    </div>
  );
}
