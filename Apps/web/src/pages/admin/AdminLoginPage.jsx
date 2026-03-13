import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../admin/auth/AdminAuthContext.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export default function AdminLoginPage() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { isAuthenticated, signIn } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from?.pathname || '/admin/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to sign in.');
      }

      signIn(data.token, data.user);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrorMessage(error.message || 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Staff Portal</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Admin Login</h1>
        <p className="mt-2 text-sm text-gray-600">
          Sign in with your admin credentials to access the portal.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" aria-label="Admin login form">
          <div>
            <label htmlFor="admin-email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="admin-email"
              name="email"
              type="email"
              value={credentials.email}
              onChange={handleChange}
              required
              autoComplete="username"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              placeholder="admin@helponcall.com"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              placeholder="Enter your password"
            />
          </div>

          {errorMessage ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-4 text-sm">
          <Link
            to="/"
            className="font-medium text-gray-700 underline decoration-gray-300 underline-offset-4 transition-colors hover:text-teal-700"
          >
            Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
