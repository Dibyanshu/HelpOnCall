import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../admin/auth/AdminAuthContext.jsx';
import {
  createInitialFieldErrors,
  hasAnyFieldErrors,
  normalizeZodFieldErrors,
} from '../../admin/utils/formFieldErrors.js';
import Layout from '../../components/layout/Layout';
import serviceHero from '../../assets/Service_Hero.png';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const initialFieldErrors = createInitialFieldErrors(['email', 'password']);

export default function AdminLoginPage() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [dashboardDesign, setDashboardDesign] = useState('new');
  const { isAuthenticated, signIn } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from?.pathname || (dashboardDesign === 'new' ? '/admin/dashboard' : '/admin/dashboard-old');

  useEffect(() => {
    if (isAuthenticated) {
      const destination = dashboardDesign === 'new' ? '/admin/dashboard' : '/admin/dashboard-old';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, dashboardDesign]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name in initialFieldErrors) {
      setFieldErrors((prev) => ({ ...prev, [name]: [] }));
    }

    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setFieldErrors(initialFieldErrors);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 400) {
          const nextFieldErrors = normalizeZodFieldErrors(data, initialFieldErrors);
          setFieldErrors(nextFieldErrors);

          if (hasAnyFieldErrors(nextFieldErrors)) {
            return;
          }
        }

        throw new Error(data?.message || 'Unable to sign in.');
      }

      signIn(data.token, data.user);
      const destination = dashboardDesign === 'new' ? '/admin/dashboard' : '/admin/dashboard-old';
      navigate(destination, { replace: true });
    } catch (error) {
      setErrorMessage(error.message || 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen">
        {/* Login Hero Section */}
        <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <img
            src={serviceHero}
            alt="Secure Admin Access"
            className="absolute inset-0 h-full w-full object-cover grayscale opacity-80 mix-blend-multiply"
            loading="eager"
          />
          <div className="absolute inset-0 bg-teal-900/75" aria-hidden="true" />
          <div className="relative mx-auto max-w-5xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-100 italic">Restricted Access</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Staff Portal Login
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-teal-100 sm:text-lg">
              Welcome back to the Help On Call administrative interface. Please sign in with your secure credentials to manage services and personnel.
            </p>
          </div>
        </section>

        <div className="mx-auto w-full max-w-md px-4 py-20 relative z-10">
          <form 
            onSubmit={handleSubmit} 
            className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl space-y-5"
            aria-label="Admin login form"
          >
            <div className="text-center mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-700 bg-teal-50 px-3 py-1 rounded-full">Secure Session</span>
            </div>

            <div className="space-y-1">
              <label htmlFor="admin-email" className="block text-xs font-bold text-teal-900 uppercase tracking-tighter">
                Admin Email
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                value={credentials.email}
                onChange={handleChange}
                required
                autoComplete="username"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                placeholder="admin@helponcall.com"
              />
              {fieldErrors.email.length > 0 ? (
                <ul className="mt-1 list-disc pl-5 text-xs text-red-700" role="alert">
                  {fieldErrors.email.map((message, index) => (
                    <li key={`${message}-${index}`}>{message}</li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="space-y-1">
              <label htmlFor="admin-password" className="block text-xs font-bold text-teal-900 uppercase tracking-tighter">
                Access Password
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                placeholder="••••••••"
              />
              {fieldErrors.password.length > 0 ? (
                <ul className="mt-1 list-disc pl-5 text-xs text-red-700" role="alert">
                  {fieldErrors.password.map((message, index) => (
                    <li key={`${message}-${index}`}>{message}</li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-teal-900 uppercase tracking-tighter">
                Portal Experience
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDashboardDesign('old')}
                  className={`rounded-xl border px-3 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${dashboardDesign === 'old' 
                    ? 'bg-teal-700 text-white border-teal-700 shadow-md ring-2 ring-teal-100' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-teal-400'}`}
                >
                  Classic
                </button>
                <button
                  type="button"
                  onClick={() => setDashboardDesign('new')}
                  className={`rounded-xl border px-3 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${dashboardDesign === 'new' 
                    ? 'bg-teal-700 text-white border-teal-700 shadow-md ring-2 ring-teal-100' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-teal-400'}`}
                >
                  Modern
                </button>
              </div>
            </div>

            {errorMessage ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 font-medium" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3.5 rounded-xl shadow-lg shadow-teal-700/20 active:scale-[0.98] transition-transform"
            >
              {isSubmitting ? 'Authenticating...' : 'Secure Sign In'}
            </button>
            
            <div className="pt-4 text-center border-t border-slate-100 mt-6">
              <Link
                to="/"
                className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-teal-700 transition-colors"
              >
                ← Return to Public Website
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
