import { motion } from 'framer-motion';
import { UserCheck } from 'lucide-react';
import { useAdminAuth } from '../auth/AdminAuthContext.jsx';

export default function AdminQuotationManagementPage() {
  const { user } = useAdminAuth();
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-md border border-slate-200 bg-white p-6 shadow-md sm:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-md bg-teal-50 flex items-center justify-center text-teal-700">
              <UserCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Quotation Management</h2>
              <p className="text-sm text-slate-500 font-sans">
                Signed in as <span className="font-semibold text-teal-700">{user?.name || user?.email}</span> ({user?.role})
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="bg-white rounded-md border border-slate-200 shadow-md p-12 text-center">
        <div className="text-slate-300 mb-4">
          <UserCheck size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-bold text-slate-700 mb-2">Quotation Management</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          This section will display quotation records, service requests, and interaction history. Coming soon.
        </p>
      </div>
    </div>
  );
}
