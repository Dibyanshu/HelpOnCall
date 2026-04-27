import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Lock, ChevronDown, UserPlus, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../auth/AdminAuthContext.jsx';
import {
  createInitialFieldErrors,
  hasAnyFieldErrors,
  normalizeZodFieldErrors,
} from '../utils/formFieldErrors.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'content_publisher',
  isActive: true,
};

const initialFieldErrors = createInitialFieldErrors(['name', 'email', 'password', 'role']);

export default function AdminUserNewPage() {
  const [formData, setFormData] = useState(initialForm);
  const [roleOptions, setRoleOptions] = useState([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token, user, signOut } = useAdminAuth();
  const navigate = useNavigate();

  const loadRoles = useCallback(async () => {
    setErrorMessage('');
    setIsLoadingRoles(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/roles`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        signOut();
        navigate('/admin/login', { replace: true, state: { from: { pathname: '/admin/users/new' } } });
        return;
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to load roles.');
      }

      const nextRoles = Array.isArray(data?.data) ? data.data : [];
      setRoleOptions(nextRoles);
      setFormData((prev) => {
        if (nextRoles.some((role) => role.value === prev.role)) {
          return prev;
        }

        return {
          ...prev,
          role: nextRoles[0]?.value || '',
        };
      });
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load roles.');
    } finally {
      setIsLoadingRoles(false);
    }
  }, [navigate, signOut, token]);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (name in initialFieldErrors) {
      setFieldErrors((prev) => ({ ...prev, [name]: [] }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setFieldErrors(initialFieldErrors);

    if (isLoadingRoles || !formData.role) {
      setErrorMessage('Roles are still loading. Please try again in a moment.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        signOut();
        navigate('/admin/login', { replace: true, state: { from: { pathname: '/admin/users/new' } } });
        return;
      }

      if (!response.ok) {
        let nextFieldErrors = { ...initialFieldErrors };

        if (response.status === 400) {
          nextFieldErrors = normalizeZodFieldErrors(data, initialFieldErrors);
        }

        if (response.status === 409) {
          nextFieldErrors = {
            ...nextFieldErrors,
            email: [data?.message || 'User with this email already exists.'],
          };
        }

        const hasInlineErrors = hasAnyFieldErrors(nextFieldErrors);
        setFieldErrors(nextFieldErrors);

        if (hasInlineErrors) {
          return;
        }

        throw new Error(data?.message || 'Failed to create user.');
      }

      navigate('/admin/users', {
        replace: true,
        state: { message: 'User created successfully.' },
      });
    } catch (error) {
      setErrorMessage(error.message || 'Failed to create user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldStyles = "block w-full rounded-xl border-0 py-3.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 transition-all duration-200 bg-white";

  return (
    <div className="max-w-3xl space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-md border border-slate-200 bg-white p-6 shadow-md sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-md bg-teal-50 flex items-center justify-center text-teal-700">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">User Details</h2>
                  <p className="text-sm text-slate-500">
                    Fill in the credentials and role for the new manager.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Link to="/admin/users" className="btn-secondary gap-2 border border-slate-300 px-6 transition-all">
                  <ArrowLeft size={16} />
                  Cancel & Return
                </Link>
              </div>
            </div>
          </motion.div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md sm:p-8 space-y-6"
            aria-label="Create admin user form"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-1.5">
                <label htmlFor="name" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <User className="h-3.5 w-3.5 text-teal-600/70" />
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  minLength={2}
                  className={fieldStyles}
                  placeholder="Ex: Jane Doe"
                />
                {fieldErrors.name.length > 0 ? (
                  <ul className="mt-1 list-disc pl-5 text-xs text-red-700" role="alert">
                    {fieldErrors.name.map((message, index) => (
                      <li key={`${message}-${index}`}>{message}</li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <Mail className="h-3.5 w-3.5 text-teal-600/70" />
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={fieldStyles}
                  placeholder="jane@helponcall.com"
                />
                {fieldErrors.email.length > 0 ? (
                  <ul className="mt-1 list-disc pl-5 text-xs text-red-700" role="alert">
                    {fieldErrors.email.map((message, index) => (
                      <li key={`${message}-${index}`}>{message}</li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="role" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <Shield className="h-3.5 w-3.5 text-teal-600/70" />
                  Assigned Role
                </label>
                <div className="relative">
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={isLoadingRoles || roleOptions.length === 0}
                    className={`${fieldStyles} appearance-none cursor-pointer pr-10`}
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                {isLoadingRoles ? (
                  <p className="mt-1 text-[10px] text-slate-500 italic">Syncing roles from server...</p>
                ) : null}
                {!isLoadingRoles && roleOptions.length === 0 ? (
                  <button
                    type="button"
                    onClick={loadRoles}
                    className="mt-2 text-xs font-bold text-rose-600 underline"
                  >
                    Retry loading roles
                  </button>
                ) : null}
                {fieldErrors.role.length > 0 ? (
                  <ul className="mt-1 list-disc pl-5 text-xs text-red-700" role="alert">
                    {fieldErrors.role.map((message, index) => (
                      <li key={`${message}-${index}`}>{message}</li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label htmlFor="password" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <Lock className="h-3.5 w-3.5 text-teal-600/70" />
                  Initial Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={fieldStyles}
                  placeholder="Minimum 8 characters"
                />
                {fieldErrors.password.length > 0 ? (
                  <ul className="mt-1 list-disc pl-5 text-xs text-red-700" role="alert">
                    {fieldErrors.password.map((message, index) => (
                      <li key={`${message}-${index}`}>{message}</li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div className="sm:col-span-2 pt-2">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 accent-teal-700 text-teal-700 focus:ring-teal-700 cursor-pointer"
                  />
                  <span>Activate user account immediately</span>
                </label>
              </div>
            </div>

            {errorMessage ? (
              <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 font-medium" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <div className="pt-4 flex items-center gap-4">
              <button
                 type="submit"
                 disabled={isSubmitting}
                 className="btn-primary flex-1 sm:flex-none px-8"
               >
                 {isSubmitting ? 'Processing...' : 'Register User'}
               </button>
              <Link
                to="/admin/users"
                className="btn-secondary flex-1 sm:flex-none justify-center px-8 border border-slate-300"
              >
                Cancel
              </Link>
            </div>
          </form>
    </div>
  );
}
