import { useMemo, useState } from 'react';
import {
  createInitialFieldErrors,
  hasAnyFieldErrors,
  normalizeZodFieldErrors,
} from '../admin/utils/formFieldErrors.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const roleOptions = [
  { value: 'content_publisher', label: 'Content Publisher' },
  { value: 'resume_reviewer', label: 'Resume Reviewer' },
  { value: 'job_poster', label: 'Job Poster' },
];

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'content_publisher',
};

const initialFieldErrors = createInitialFieldErrors(['name', 'email', 'password', 'role']);

export default function UserRegistrationPage() {
  const [formData, setFormData] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordHint = useMemo(() => 'Minimum 8 characters', []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name in initialFieldErrors) {
      setFieldErrors((prev) => ({ ...prev, [name]: [] }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setFieldErrors(initialFieldErrors);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          isActive: false,
        }),
      });

      const data = await response.json().catch(() => ({}));

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

        throw new Error(data?.message || 'Failed to submit registration.');
      }

      setSuccessMessage(data?.message || 'Registration submitted. Your account is currently inactive pending approval.');
      setFormData(initialForm);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to submit registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Help On Call</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">User Registration</h1>
          <p className="mt-2 text-sm text-slate-600">
            Register your account to get started. New registrations are created as inactive and require admin approval.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-md border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          aria-label="Public user registration form"
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
                placeholder="you@example.com"
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
                {roleOptions.map((option) => (
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
                Password
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
                placeholder={passwordHint}
              />
              {fieldErrors.password.length > 0 ? (
                <ul className="mt-1 list-disc pl-5 text-xs text-red-700" role="alert">
                  {fieldErrors.password.map((message, index) => (
                    <li key={`${message}-${index}`}>{message}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>

          {errorMessage ? (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
              {successMessage}
            </p>
          ) : null}

          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Submitting...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}