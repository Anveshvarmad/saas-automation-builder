export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600">
          AI-powered workflow automation platform
        </p>

        <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900">
          Build SaaS Automations Without Repetitive Manual Work
        </h1>

        <p className="mb-8 max-w-2xl text-lg text-gray-600">
          Create webhook-driven automation workflows, process business data with
          AI, run background jobs, and track every execution from one dashboard.
        </p>

        <div className="flex gap-4">
          <a
            href="/signup"
            className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white"
          >
            Start Free
          </a>

          <a
            href="/login"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-900"
          >
            Log In
          </a>
        </div>
      </section>
    </main>
  );
}
