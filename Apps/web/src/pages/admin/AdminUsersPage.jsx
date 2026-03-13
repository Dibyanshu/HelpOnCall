import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../admin/auth/AdminAuthContext.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function formatDateTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString();
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const { token, user, signOut } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const successMessage = location.state?.message || '';

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        signOut();
        navigate('/admin/login', { replace: true, state: { from: { pathname: '/admin/users' } } });
        return;
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to load users.');
      }

      setUsers(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, signOut, token]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Admin Portal</p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900">Users</h1>
              <p className="mt-2 text-sm text-slate-600">
                Signed in as {user?.name || user?.email} ({user?.role})
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/admin/users/new"
                className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
              >
                New User
              </Link>
              <button
                type="button"
                onClick={loadUsers}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
              >
                Refresh
              </button>
              <Link
                to="/admin/dashboard"
                className="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-900"
              >
                Back To Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          {successMessage ? (
            <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800" role="status">
              {successMessage}
            </div>
          ) : null}

          {isLoading ? (
            <p className="text-sm text-slate-600">Loading users...</p>
          ) : null}

          {!isLoading && errorMessage ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
              <p>{errorMessage}</p>
              <button
                type="button"
                onClick={loadUsers}
                className="mt-2 rounded-md bg-red-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-800"
              >
                Retry
              </button>
            </div>
          ) : null}

          {!isLoading && !errorMessage ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left font-semibold text-slate-700">Name</th>
                    <th scope="col" className="px-3 py-2 text-left font-semibold text-slate-700">Email</th>
                    <th scope="col" className="px-3 py-2 text-left font-semibold text-slate-700">Role</th>
                    <th scope="col" className="px-3 py-2 text-left font-semibold text-slate-700">Status</th>
                    <th scope="col" className="px-3 py-2 text-left font-semibold text-slate-700">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {users.length > 0 ? (
                    users.map((item) => (
                      <tr key={item.id}>
                        <td className="whitespace-nowrap px-3 py-2 text-slate-800">{item.name}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">{item.email}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">{item.role}</td>
                        <td className="whitespace-nowrap px-3 py-2">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}
                          >
                            {item.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">{formatDateTime(item.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
