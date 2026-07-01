export default function NewWorkflowPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create Workflow
          </h1>
          <p className="mt-2 text-gray-600">
            Define a trigger and automation steps for your SaaS workflow.
          </p>
        </div>

        <form className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Workflow Name
            </label>
            <input
              type="text"
              placeholder="Classify new leads"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              placeholder="Use AI to classify incoming leads and send the result to a CRM."
              className="min-h-28 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Trigger Type
            </label>
            <select className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black">
              <option>Webhook Trigger</option>
              <option>Manual Trigger</option>
              <option>Scheduled Trigger</option>
            </select>
          </div>

          <button
            type="button"
            className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Save Workflow
          </button>
        </form>
      </div>
    </main>
  );
}