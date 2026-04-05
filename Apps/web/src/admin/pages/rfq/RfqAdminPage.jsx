import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, RefreshCw, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../../auth/AdminAuthContext.jsx';
import { useToast } from '../../../components/common/Toast.jsx';
import { useConfirm } from '../../../components/common/ConfirmDialog.jsx';
import RfqAdminTable from './RfqAdminTable.jsx';
import { useRFQAdmin } from '../../../appServices/useRFQAdmin.js';

export default function RfqAdminPage() {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const navigate = useNavigate();
  const { token, signOut } = useAdminAuth();
  const toast = useToast();
  const confirm = useConfirm();

  const handleUnauthorized = useCallback(() => {
    signOut();
    navigate('/admin/login', { replace: true, state: { from: { pathname: '/admin/quotations' } } });
  }, [navigate, signOut]);

  const {
    submissions,
    isLoading,
    isUpdatingRfqId,
    errorMessage,
    successMessage,
    setErrorMessage,
    setSuccessMessage,
    fetchSubmissions,
    approveSubmission,
    rejectSubmission,
  } = useRFQAdmin({
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

  const handleApproveWithConfirm = useCallback(async (rfqId) => {
    const confirmed = await confirm({
      title: 'Approve Quotation Request?',
      message: 'Are you sure you want to approve this quotation request?',
      confirmText: 'Yes, Approve',
      cancelText: 'Cancel',
      type: 'approve',
    });

    if (!confirmed) {
      return;
    }

    await approveSubmission(rfqId);
  }, [approveSubmission, confirm]);

  const handleRejectWithConfirm = useCallback(async (rfqId) => {
    const confirmed = await confirm({
      title: 'Reject Quotation Request?',
      message: 'Are you sure you want to reject this quotation request?',
      confirmText: 'Yes, Reject',
      cancelText: 'Cancel',
      type: 'reject',
    });

    if (!confirmed) {
      return;
    }

    await rejectSubmission(rfqId);
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
              <ClipboardList size={24} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 tracking-tight">Review Quotations</h2>
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

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-md border border-slate-200 bg-white p-3 shadow-md sm:p-3"
      >
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or RFQ ID…"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className={`${fieldStyles} pl-9`}
            />
          </div>
          <div className="relative min-w-[160px]">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${fieldStyles} pl-9 appearance-none`}
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="approve">Approved</option>
              <option value="reject">Rejected</option>
            </select>
          </div>
        </div>
      </motion.div>

      <div className="rounded-md border border-slate-200 bg-white p-3 shadow-xl sm:p-3 overflow-hidden">
        <RfqAdminTable
          submissions={submissions}
          isLoading={isLoading}
          isUpdatingRfqId={isUpdatingRfqId}
          onApprove={(rfqId) => {
            void handleApproveWithConfirm(rfqId);
          }}
          onReject={(rfqId) => {
            void handleRejectWithConfirm(rfqId);
          }}
        />
      </div>
    </div>
  );
}
