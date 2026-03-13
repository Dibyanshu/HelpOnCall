import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../admin/auth/AdminAuthContext.jsx';
import {
  createInitialFieldErrors,
  hasAnyFieldErrors,
  normalizeZodFieldErrors,
} from '../../admin/utils/formFieldErrors.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const ROLE_OPTIONS = [
  { value: 'content_publisher', label: 'Content Publisher' },
  { value: 'resume_reviewer', label: 'Resume Reviewer' },
  { value: 'job_poster', label: 'Job Poster' },
  { value: 'super_admin', label: 'Super Admin' },
];

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
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token, user, signOut } = useAdminAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Admin Portal</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Create User</h1>
          <p className="mt-2 text-sm text-slate-600">
            Signed in as {user?.name || user?.email} ({user?.role})
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          aria-label="Create admin user form"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
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
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                placeholder="Jane Doe"
              />
              {fieldErrors.name.length > 0 ? (
                <ul className="mt-1 list-disc pl-5 text-xs text-red-700" role="alert">
                  {fieldErrors.name.map((message, index) => (
                    <li key={`${message}-${index}`}>{message}</li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
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

            <div>
              <label htmlFor="role" className="mb-1 block text-sm font-medium text-slate-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {fieldErrors.role.length > 0 ? (
                <ul className="mt-1 list-disc pl-5 text-xs text-red-700" role="alert">
                  {fieldErrors.role.map((message, index) => (
                    <li key={`${message}-${index}`}>{message}</li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                Temporary Password
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
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
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

            <div className="sm:col-span-2">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                />
                User is active
              </label>
            </div>
          </div>

          {errorMessage ? (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Creating...' : 'Create User'}
            </button>
            <Link
              to="/admin/users"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
