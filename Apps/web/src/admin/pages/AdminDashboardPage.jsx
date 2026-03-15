import { Link } from 'react-router-dom';
import { useAdminAuth } from '../../admin/auth/AdminAuthContext.jsx';

export default function AdminDashboardPage() {
  const { user, signOut } = useAdminAuth();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Admin Portal</p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900">Dashboard</h1>
              <p className="mt-2 text-sm text-slate-600">
                You are signed in as {user?.name || user?.email} ({user?.role}).
              </p>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Users</h2>
            <p className="mt-2 text-sm text-slate-600">
              View and manage admin users from a dedicated protected screen.
            </p>
            <Link
              to="/admin/users"
              className="mt-4 inline-flex rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-900"
            >
              Open Users
            </Link>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Services</h2>
            <p className="mt-2 text-sm text-slate-600">
              Manage service categories and nested services from the admin service dashboard.
            </p>
            <Link
              to="/admin/services"
              className="mt-4 inline-flex rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-900"
            >
              Manage Services
            </Link>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Back To Website</h2>
            <p className="mt-2 text-sm text-slate-600">Return to the public Help On Call pages.</p>
            <Link
              to="/"
              className="mt-4 inline-flex rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
