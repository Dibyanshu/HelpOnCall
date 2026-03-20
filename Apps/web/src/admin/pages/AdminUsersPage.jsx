import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { RotateCw, LayoutDashboard, Plus } from 'lucide-react';
import { useAdminAuth } from '../../admin/auth/AdminAuthContext.jsx';
import AdminUserEditPage from './AdminUserEditPage.jsx';
import { useAdminUserEditForm } from '../hooks/useAdminUserEditForm.js';
import Layout from '../../components/layout/Layout';
import serviceHero from '../../assets/Service_Hero.png';

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
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { token, user, signOut } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const successMessage = location.state?.message || '';
  const canManageStatus = user?.role === 'super_admin' || user?.role === 'admin';

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
    setStatusMessage,
    setErrorMessage,
  });

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

  const handleUpdateStatus = useCallback(async (targetUser) => {
    if (!canManageStatus || updatingUserId !== null) {
      return;
    }

    setStatusMessage('');
    setErrorMessage('');
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
      setStatusMessage(data?.message || 'User status updated successfully.');
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update user status.');
    } finally {
      setUpdatingUserId(null);
    }
  }, [canManageStatus, navigate, signOut, token, updatingUserId]);

  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <img
            src={serviceHero}
            alt="Admin Portal Background"
            className="absolute inset-0 h-full w-full object-cover grayscale opacity-80 mix-blend-multiply"
            loading="eager"
          />
          <div className="absolute inset-0 bg-teal-900/75" aria-hidden="true" />
          <div className="relative mx-auto max-w-5xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-100 italic">User Management</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Admin Portal: Users
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-teal-100 sm:text-lg">
              Manage system administrators, control access levels, and monitor user activity across the Greater Toronto Area.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 my-10 relative z-10 pt-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Active Administrators</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Signed in as <span className="font-semibold text-teal-700">{user?.name || user?.email}</span> ({user?.role})
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {canManageStatus ? (
                  <Link
                    to="/admin/users/new"
                    className="btn-primary px-6"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New User
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={loadUsers}
                  disabled={isLoading}
                  className="btn-secondary px-6"
                >
                  <RotateCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <Link
                  to="/admin/dashboard"
                  className="btn-secondary border border-slate-300 px-6"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Back To Dashboard
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md sm:p-6 overflow-hidden">
            {successMessage || statusMessage ? (
              <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800" role="status">
                {successMessage || statusMessage}
              </div>
            ) : null}

            {isLoading ? (
              <p className="text-sm text-slate-600 animate-pulse">Fetching users from database...</p>
            ) : null}

            {!isLoading && errorMessage ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                <p>{errorMessage}</p>
                <button
                  type="button"
                  onClick={loadUsers}
                  className="mt-3 btn-primary text-xs bg-red-700 hover:bg-red-800 border-none"
                >
                  Retry Connection
                </button>
              </div>
            ) : null}

            {!isLoading && !errorMessage ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th scope="col" className="px-3 py-3 text-left font-bold text-teal-900 uppercase tracking-tighter">Full Name</th>
                      <th scope="col" className="px-3 py-3 text-left font-bold text-teal-900 uppercase tracking-tighter">Email Address</th>
                      <th scope="col" className="px-3 py-3 text-left font-bold text-teal-900 uppercase tracking-tighter">System Role</th>
                      <th scope="col" className="px-3 py-3 text-left font-bold text-teal-900 uppercase tracking-tighter">Added By</th>
                      <th scope="col" className="px-3 py-3 text-left font-bold text-teal-900 uppercase tracking-tighter">Status</th>
                      <th scope="col" className="px-3 py-3 text-left font-bold text-teal-900 uppercase tracking-tighter">Created At</th>
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
                            <span className={`px-2 py-1 rounded text-[10px] uppercase font-black tracking-widest ${item.role === 'super_admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                              {item.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-slate-500 italic text-xs">{item.createdBy || 'System'}</td>
                          <td className="whitespace-nowrap px-3 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${item.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}
                            >
                              {item.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-slate-500 text-xs">{formatDateTime(item.createdAt)}</td>
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
        </div>

        <AdminUserEditPage
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
    </Layout>
  );
}
