import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { RotateCw, Plus, Users, Pencil, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../../admin/auth/AdminAuthContext.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { useConfirm } from '../../components/common/ConfirmDialog.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function formatDateTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString();
}

function toRoleLabel(role) {
  return String(role || '')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function renderRoleBadge(role) {
  const classes = role === 'super_admin'
    ? 'bg-indigo-100 text-indigo-800'
    : role === 'admin'
      ? 'bg-teal-100 text-teal-800'
      : role === 'resume_reviewer'
        ? 'bg-amber-100 text-amber-800'
        : role === 'job_poster'
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-slate-100 text-slate-700';

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${classes}`}>
      {toRoleLabel(role)}
    </span>
  );
}

function renderUserStatusBadge(isActive) {
  const classes = isActive ? 'bg-emerald-100 text-emerald-800 capitalize' : 'bg-slate-200 text-slate-700 capitalize';

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${classes}`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
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
  const canEditUsers = user?.role === 'super_admin' || user?.role === 'admin';

  useEffect(() => {
    if (successMessage && !hasShownNavigationToastRef.current) {
      hasShownNavigationToastRef.current = true;
      toast.success(successMessage);
      // Clear state to avoid toast on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [successMessage, toast, navigate, location.pathname]);

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
        message: `Are you sure you want to de-authorize "${targetUser.name}"? They will lose all access to the authorized portal immediately.`,
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
    <div className="space-y-1">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-md border border-slate-200 bg-white p-3 shadow-md sm:p-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-md bg-teal-50 flex items-center justify-center text-teal-700">
              <Users size={24} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 tracking-tight">Manage Help On Call Staffs</h2>
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

      <div className="rounded-md border border-slate-200 bg-white p-3 shadow-md sm:p-3 overflow-hidden">


        {isLoading ? (
          <p className="text-sm text-slate-600 animate-pulse">Fetching users from database...</p>
        ) : null}



        {!isLoading ? (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Staff Name</th>
                  <th scope="col">Email Address</th>
                  <th scope="col">Staff Role</th>
                  <th scope="col">Status</th>
                  {canEditUsers ? (
                    <th scope="col">Action</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((item) => (
                    <tr key={item.id}>
                      <td className="whitespace-nowrap text-slate-800 font-medium">{item.name}</td>
                      <td className="whitespace-nowrap text-slate-600 tracking-tight">{item.email}</td>
                      <td className="whitespace-nowrap">
                        {renderRoleBadge(item.role)}
                      </td>
                      <td className="whitespace-nowrap">
                        {renderUserStatusBadge(item.isActive)}
                      </td>
                      {canEditUsers ? (
                        <td className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => navigate('/admin/users/edit-staff-record', { state: { userId: item.id, targetUser: item } })}
                              disabled={user?.role === 'admin' && item.role === 'super_admin'}
                              className="icon-btn icon-btn-neutral"
                              title="Edit user"
                              aria-label="Edit user"
                            >
                              <Pencil size={16} />
                            </button>

                            {canManageStatus ? (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(item)}
                                disabled={updatingUserId !== null || (user?.role === 'admin' && item.role === 'super_admin')}
                                className={`status-switch ${item.isActive ? 'status-switch-on' : 'status-switch-off'} disabled:opacity-50`}
                                title={item.isActive ? 'Deactivate user' : 'Activate user'}
                                aria-label={item.isActive ? 'Deactivate user' : 'Activate user'}
                              >
                                {updatingUserId === item.id ? (
                                  <>
                                    <Loader2 size={14} className="animate-spin text-current" />
                                    Updating...
                                  </>
                                ) : (
                                  <>
                                    <span className="status-switch-label">{item.isActive ? 'Active' : 'Inactive'}</span>
                                    <span className="status-switch-track" aria-hidden="true">
                                      <span className="status-switch-thumb" />
                                    </span>
                                  </>
                                )}
                              </button>
                            ) : null}
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={canEditUsers ? 7 : 6}>
                      No administrative users were found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
