import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { RotateCw, Plus, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../../admin/auth/AdminAuthContext.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { useConfirm } from '../../components/common/ConfirmDialog.jsx';
import AdminEditUser from './AdminEditUser.jsx';
import { useAdminUserEditForm } from '../../appServices/useAdminUserEditForm.js';

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
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const hasShownNavigationToastRef = useRef(false);
  const toast = useToast();
  const confirm = useConfirm();

  const { token, user, signOut } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const successMessage = location.state?.message || '';
  const canManageStatus = user?.role === 'super_admin' || user?.role === 'admin';
  const canCreateUsers = user?.role === 'super_admin' || user?.role === 'admin';

  useEffect(() => {
    if (successMessage && !hasShownNavigationToastRef.current) {
      hasShownNavigationToastRef.current = true;
      toast.success(successMessage);
      // Clear state to avoid toast on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [successMessage, toast, navigate, location.pathname]);

  const {
    isEditOpen,
    editFormData,
    editFieldErrors,
    editErrorMessage,
    isSubmittingEdit,
    canEditUsers,
    canEditRoles,
    openEditPanel,
    closeEditPanel,
    handleEditFieldChange,
    handleEditSubmit,
  } = useAdminUserEditForm({
    token,
    user,
    navigate,
    signOut,
    users,
    setUsers,
  });

  const loadUsers = useCallback(async () => {
    setIsLoading(true);

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
      toast.error(error.message || 'Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, signOut, token]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleUpdateStatus = useCallback(async (targetUser) => {
    if (!canManageStatus || updatingUserId !== null) {
      return;
    }

    if (targetUser.isActive) {
      const confirmed = await confirm({
        title: 'Deactivate User?',
        message: `Are you sure you want to de-authorize "${targetUser.name}"? They will lose all access to the admin portal immediately.`,
        confirmText: 'Yes, Deactivate',
        cancelText: 'Cancel',
        type: 'deactivate',
      });

      if (!confirmed) {
        return;
      }
    }

    setUpdatingUserId(targetUser.id);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: targetUser.id,
          isActive: !targetUser.isActive,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        signOut();
        navigate('/admin/login', { replace: true, state: { from: { pathname: '/admin/users' } } });
        return;
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to update user status.');
      }

      const updatedUser = data?.user;
      setUsers((prev) => prev.map((item) => (item.id === updatedUser.id ? { ...item, ...updatedUser } : item)));
      toast.success(data?.message || 'User status updated successfully.');
    } catch (error) {
      toast.error(error.message || 'Failed to update user status.');
    } finally {
      setUpdatingUserId(null);
    }
  }, [canManageStatus, navigate, signOut, token, updatingUserId]);

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
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Manage Help On Call Staffs</h2>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={loadUsers}
              disabled={isLoading}
              className="btn-secondary gap-2 px-6 transition-all"
            >
              <RotateCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Refresh Staff List
            </button>
            {canCreateUsers ? (
              <Link
                to="/admin/users/create-new-staff-record"
                className="btn-primary gap-2 px-6 transition-all"
              >
                <Plus size={16} />
                Add New Staff
              </Link>
            ) : null}
          </div>
        </div>
      </motion.div>

      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-md sm:p-6 overflow-hidden">


        {isLoading ? (
          <p className="text-sm text-slate-600 animate-pulse">Fetching users from database...</p>
        ) : null}



        {!isLoading ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50/50">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left font-bold text-teal-900 uppercase tracking-tighter">Full Name</th>
                  <th scope="col" className="px-3 py-3 text-left font-bold text-teal-900 uppercase tracking-tighter">Email Address</th>
                  <th scope="col" className="px-3 py-3 text-left font-bold text-teal-900 uppercase tracking-tighter">System Role</th>
                  <th scope="col" className="px-3 py-3 text-left font-bold text-teal-900 uppercase tracking-tighter">Status</th>
                  {/* <th scope="col" className="px-3 py-3 text-left font-bold text-teal-900 uppercase tracking-tighter">Created By</th>
                  <th scope="col" className="px-3 py-3 text-left font-bold text-teal-900 uppercase tracking-tighter">Created At</th> */}
                  {canEditUsers ? (
                    <th scope="col" className="px-3 py-3 text-left font-bold text-teal-900 uppercase tracking-tighter">Action</th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {users.length > 0 ? (
                  users.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="whitespace-nowrap px-3 py-4 text-slate-800 font-medium">{item.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-600 tracking-tight">{item.email}</td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-black tracking-widest ${item.role === 'super_admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                          {item.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <span
                          className={`inline-flex rounded-md px-2.5 py-0.5 text-xs font-semibold shadow-sm ${item.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}
                        >
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {/* <td className="whitespace-nowrap px-3 py-4 text-slate-500 italic text-xs">{item.createdBy || 'System'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-500 text-xs">{formatDateTime(item.createdAt)}</td> */}
                      {canEditUsers ? (
                        <td className="whitespace-nowrap px-3 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditPanel(item)}
                              disabled={user?.role === 'admin' && item.role === 'super_admin'}
                              className="btn-secondary px-3 py-1.5 text-xs rounded-md hover:bg-slate-100"
                            >
                              Edit
                            </button>

                            {canManageStatus ? (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(item)}
                                disabled={updatingUserId !== null || (user?.role === 'admin' && item.role === 'super_admin')}
                                className={`px-3 py-1.5 text-xs rounded-md font-bold transition-all ${item.isActive
                                  ? 'btn-deactivate'
                                  : 'btn-activate'
                                  } disabled:opacity-50`}
                              >
                                {updatingUserId === item.id
                                  ? '...'
                                  : item.isActive
                                    ? 'Deactivate'
                                    : 'Activate'}
                              </button>
                            ) : null}
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={canEditUsers ? 7 : 6} className="px-3 py-10 text-center text-slate-500 italic">
                      No administrative users were found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
      <AdminEditUser
        isOpen={isEditOpen}
        formData={editFormData}
        fieldErrors={editFieldErrors}
        errorMessage={editErrorMessage}
        isSubmitting={isSubmittingEdit}
        canEditRoles={canEditRoles}
        onChange={handleEditFieldChange}
        onSubmit={handleEditSubmit}
        onClose={closeEditPanel}
      />
    </div>
  );
}
