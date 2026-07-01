import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome back, {currentUser.user.name}. You are working inside{" "}
              <span className="font-medium text-gray-900">
                {currentUser.organization?.name}
              </span>
              .
            </p>
          </div>

          <form action="/api/auth/logout" method="post">
            <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900">
              Log out
            </button>
          </form>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">Total Workflows</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">0</h2>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">Successful Executions</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">0</h2>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">Failed Executions</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">0</h2>
          </div>
        </div>
      </div>
    </main>
  );
}
