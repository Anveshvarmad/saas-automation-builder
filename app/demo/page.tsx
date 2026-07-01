import Link from "next/link";

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <Link
            href="/"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to home
          </Link>

          <h1 className="mt-4 text-4xl font-bold text-slate-900">
            Demo Flow
          </h1>

          <p className="mt-3 max-w-3xl text-slate-600">
            Use this page as your interview demo script. It explains how the
            SaaS Automation Builder works end-to-end.
          </p>
        </div>

        <section className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              1. Create a workflow
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              A user signs up, creates an organization, and creates a workflow
              with a webhook trigger.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              2. Secure the webhook
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The platform generates a webhook URL and secret. Requests must
              include the secret header to prevent unauthorized triggers.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              3. Queue execution
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              When the webhook is called, the app creates execution records in
              PostgreSQL and pushes a job into Redis/BullMQ.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              4. Run AI step
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              A background worker picks up the job, sends the payload to OpenAI,
              and stores structured AI output.
            </p>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Demo curl command
          </h2>

          <p className="mt-3 text-sm text-slate-600">
            Copy the real webhook URL and secret from your workflow page.
          </p>

          <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-100">
{`curl -X POST http://localhost:3000/api/webhooks/YOUR_WEBHOOK_ID \\
  -H "Content-Type: application/json" \\
  -H "x-webhook-secret: YOUR_WEBHOOK_SECRET" \\
  -d '{
    "leadName": "Sarah Johnson",
    "email": "sarah@example.com",
    "company": "GrowthOps AI",
    "message": "We need pricing for 500 employees and want a demo this week."
  }'`}
          </pre>
        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Technologies used
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Next.js App Router",
              "TypeScript",
              "PostgreSQL",
              "Prisma",
              "Redis",
              "BullMQ",
              "OpenAI API",
              "Docker Compose",
              "Tailwind CSS",
              "Custom Auth",
              "Audit Logs",
              "Secure Webhooks",
            ].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Try the App
          </Link>

          <Link
            href="/login"
            className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
