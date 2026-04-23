import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, RefreshCw, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../../auth/AdminAuthContext.jsx';
import { useToast } from '../../../components/common/Toast.jsx';
import { useConfirm } from '../../../components/common/ConfirmDialog.jsx';
import EmploymentAdminTable from './EmploymentAdminTable.jsx';
import { useEmploymentAdmin } from '../../../appServices/useEmploymentAdmin.js';

export default function EmploymentAdminPage() {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const navigate = useNavigate();
  const { token, user, signOut } = useAdminAuth();
  const toast = useToast();
  const confirm = useConfirm();

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

  useEffect(() => {
    if (!successMessage) return;
    toast.success(successMessage);
    setSuccessMessage('');
  }, [successMessage, setSuccessMessage, toast]);

  useEffect(() => {
    if (!errorMessage) return;
    toast.error(errorMessage);
    setErrorMessage('');
  }, [errorMessage, setErrorMessage, toast]);

  const handleApproveWithConfirm = useCallback(async (empId) => {
    const confirmed = await confirm({
      title: 'Approve Application?',
      message: 'Are you sure you want to approve this application?',
      confirmText: 'Yes, Approve',
      cancelText: 'Cancel',
      type: 'approve',
    });

    if (!confirmed) {
      return;
    }

    await approveSubmission(empId);
  }, [approveSubmission, confirm]);

  const handleRejectWithConfirm = useCallback(async (empId) => {
    const confirmed = await confirm({
      title: 'Reject Application?',
      message: 'Are you sure you want to reject this application?',
      confirmText: 'Yes, Reject',
      cancelText: 'Cancel',
      type: 'reject',
    });

    if (!confirmed) {
      return;
    }

    await rejectSubmission(empId);
  }, [confirm, rejectSubmission]);

  const fieldStyles = "block w-full rounded-xl border-0 py-3.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 transition-all duration-200 bg-white";

  return (
    <div className="space-y-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-md border border-slate-200 bg-white p-3 shadow-md sm:p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-md bg-teal-50 flex items-center justify-center text-teal-700">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 tracking-tight">Applicant Tracking System</h2>
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

          <div className="rounded-md border border-slate-200 bg-white p-3 shadow-xl sm:p-3 overflow-hidden">
            <EmploymentAdminTable
              submissions={submissions}
              isLoading={isLoading}
              isUpdatingEmpId={isUpdatingEmpId}
              isDownloadingEmpId={isDownloadingEmpId}
              onApprove={(empId) => {
                void handleApproveWithConfirm(empId);
              }}
              onReject={(empId) => {
                void handleRejectWithConfirm(empId);
              }}
              onDownloadResume={(empId) => {
                void downloadResume(empId);
              }}
            />
          </div>
    </div>
  );
}
