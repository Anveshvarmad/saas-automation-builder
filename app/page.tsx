import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
        <nav className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold">SaaS Automation Builder</p>
            <p className="text-sm text-slate-400">AI workflow automation</p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/login"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-900"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Sign Up
            </Link>
          </div>
        </nav>

        <div className="grid flex-1 items-center gap-12 py-20 lg:grid-cols-2">
          <div>
            <div className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300">
              Webhooks + Redis + OpenAI + PostgreSQL
            </div>

            <h1 className="mt-6 max-w-4xl text-5xl font-bold tracking-tight md:text-6xl">
              Build AI-powered workflows from webhook events.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              A full-stack SaaS automation platform where users create
              workflows, trigger them through secure webhooks, process jobs in a
              background worker, and store OpenAI-generated results with full
              execution history.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Create Account
              </Link>

              <Link
                href="/demo"
                className="rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-900"
              >
                View Demo Flow
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-sm font-semibold text-slate-400">
                Example workflow
              </p>

              <div className="mt-5 space-y-4">
                <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                  <p className="text-sm font-semibold text-blue-300">
                    1. Webhook Trigger
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    External lead form sends JSON payload.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                  <p className="text-sm font-semibold text-purple-300">
                    2. Redis Queue
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Execution is queued and processed by a worker.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                  <p className="text-sm font-semibold text-green-300">
                    3. OpenAI Step
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Lead is classified as hot, warm, or cold.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                  <p className="text-sm font-semibold text-yellow-300">
                    4. Execution Logs
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Input, output, status, and errors are stored in PostgreSQL.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
