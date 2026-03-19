import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../auth/AdminAuthContext.jsx';
import EmploymentAdminTable from './EmploymentAdminTable.jsx';
import { useEmploymentAdmin } from './useEmploymentAdmin.js';

export default function EmploymentAdminPage() {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const navigate = useNavigate();
  const { token, user, signOut } = useAdminAuth();

  const handleUnauthorized = useCallback(() => {
    signOut();
    navigate('/admin/login', { replace: true, state: { from: { pathname: '/admin/employment' } } });
  }, [navigate, signOut]);

  const {
    submissions,
    isLoading,
    isUpdatingEmpId,
    isDownloadingEmpId,
    errorMessage,
    successMessage,
    setErrorMessage,
    setSuccessMessage,
    fetchSubmissions,
    approveSubmission,
    rejectSubmission,
    downloadResume,
  } = useEmploymentAdmin({
    token,
    onUnauthorized: handleUnauthorized,
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchSubmissions({ search: searchText, status: statusFilter });
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchSubmissions, searchText, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Admin Portal</p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900">Employment Submissions</h1>
              <p className="mt-2 text-sm text-slate-600">
                Signed in as {user?.name || user?.email} ({user?.role})
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fetchSubmissions({ search: searchText, status: statusFilter })}
                className="btn-secondary"
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

          <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
            <input
              type="search"
              value={searchText}
              onChange={(event) => {
                setSearchText(event.target.value);
                setErrorMessage('');
                setSuccessMessage('');
              }}
              placeholder="Search by emp_id, name, email, phone"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="approve">Approved</option>
              <option value="reject">Rejected</option>
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          {successMessage ? (
            <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800" role="status">
              {successMessage}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
              {errorMessage}
            </div>
          ) : null}

          <EmploymentAdminTable
            submissions={submissions}
            isLoading={isLoading}
            isUpdatingEmpId={isUpdatingEmpId}
            isDownloadingEmpId={isDownloadingEmpId}
            onApprove={(empId) => {
              void approveSubmission(empId);
            }}
            onReject={(empId) => {
              void rejectSubmission(empId);
            }}
            onDownloadResume={(empId) => {
              void downloadResume(empId);
            }}
          />
        </div>
      </div>
    </div>
  );
}
