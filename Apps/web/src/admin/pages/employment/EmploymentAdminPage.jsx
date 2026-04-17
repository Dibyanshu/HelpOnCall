import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, RefreshCw, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../../auth/AdminAuthContext.jsx';
import EmploymentAdminTable from './EmploymentAdminTable.jsx';
import { useEmploymentAdmin } from '../../../appServices/useEmploymentAdmin.js';

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
    <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-md border border-slate-200 bg-white p-6 shadow-md sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-md bg-teal-50 flex items-center justify-center text-teal-700">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Applicant Tracking System</h2>
                  <p className="text-sm text-slate-500 font-sans">
                    Signed in as <span className="font-semibold text-teal-700">{user?.name || user?.email}</span> ({user?.role})
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => fetchSubmissions({ search: searchText, status: statusFilter })}
                  className="btn-secondary gap-2 px-6 transition-all"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>
            </div>
          </motion.div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">

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
  );
}
