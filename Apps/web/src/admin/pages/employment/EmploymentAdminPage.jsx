import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, RefreshCw, LayoutDashboard } from 'lucide-react';
import { useAdminAuth } from '../../auth/AdminAuthContext.jsx';
import EmploymentAdminTable from './EmploymentAdminTable.jsx';
import { useEmploymentAdmin } from './useEmploymentAdmin.js';
import Layout from '../../../components/layout/Layout';
import serviceHero from '../../../assets/Service_Hero.png';

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

  const fieldStyles = "block w-full rounded-xl border-0 py-3.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 transition-all duration-200 bg-white";

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 pb-20">
        {/* Employment Hero Section */}
        <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <img
            src={serviceHero}
            alt="Employment Administration"
            className="absolute inset-0 h-full w-full object-cover grayscale opacity-80 mix-blend-multiply"
            loading="eager"
          />
          <div className="absolute inset-0 bg-teal-900/75" aria-hidden="true" />
          <div className="relative mx-auto max-w-5xl text-left">
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-100 italic font-sans">Human Resources</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl font-sans">
              Employment Submissions
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-teal-100 sm:text-lg font-sans">
              Review candidate applications, manage talent acquisition, and download resumes for the Help On Call workforce across Toronto.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8 mt-12 relative z-10">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">Applicant Tracking System</h2>
                <p className="mt-1 text-sm text-slate-500 font-sans">
                  Signed in as <span className="font-semibold text-teal-700">{user?.name || user?.email}</span> ({user?.role})
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => fetchSubmissions({ search: searchText, status: statusFilter })}
                  className="btn-secondary px-6"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </button>
                <Link
                  to="/admin/dashboard"
                  className="btn-secondary border border-slate-300 px-6 font-sans"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Back To Dashboard
                </Link>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_280px]">
              {/* Search Bar Styled like RFQForm */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <Search className="h-3.5 w-3.5 text-teal-600/70" />
                  Search Applicant
                </label>
                <input
                  type="search"
                  value={searchText}
                  onChange={(event) => {
                    setSearchText(event.target.value);
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  placeholder="Search by name, email, or employee ID..."
                  className={fieldStyles}
                />
              </div>

              {/* Status Filter Styled like RFQForm */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <Filter className="h-3.5 w-3.5 text-teal-600/70" />
                  Application Status
                </label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(event.target.value);
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className={`${fieldStyles} appearance-none cursor-pointer pr-10`}
                  >
                    <option value="all">All Statuses</option>
                    <option value="new">New</option>
                    <option value="approve">Approved</option>
                    <option value="reject">Rejected</option>
                  </select>
                  <Filter className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xl sm:p-8 overflow-hidden">
            {successMessage ? (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 font-bold animate-in fade-in slide-in-from-top-2" role="status">
                ✓ {successMessage}
              </div>
            ) : null}

            {errorMessage ? (
              <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 font-bold animate-in fade-in slide-in-from-top-2" role="alert">
                ! {errorMessage}
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
    </Layout>
  );
}
