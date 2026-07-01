export default function WorkflowsPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
            <p className="mt-2 text-gray-600">
              Create and manage automation workflows.
            </p>
          </div>

          <a
            href="/workflows/new"
            className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
          >
            New Workflow
          </a>
        </div>

        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            No workflows yet
          </h2>
          <p className="mt-2 text-gray-600">
            Your workflows will appear here after you create them.
          </p>
        </div>
      </div>
    </main>
  );
}