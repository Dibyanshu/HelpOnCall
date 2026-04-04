import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAdminAuth } from '../../admin/auth/AdminAuthContext.jsx';
import {
  createInitialFieldErrors,
  hasAnyFieldErrors,
  normalizeZodFieldErrors,
} from '../../admin/utils/formFieldErrors.js';
import Layout from '../../components/layout/Layout';
import serviceHero from '../../assets/Service_Hero.png';

// You may want to import your logo here if available
// import logo from '../../assets/logo.png';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const initialFieldErrors = createInitialFieldErrors(['email', 'password']);

export default function AdminLoginPage() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
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
      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      setErrorMessage(error.message || 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white">
      {/* Right Column: Hero Image with Overlay */}
      <div className="hidden md:flex w-1/2 relative items-center justify-center bg-slate-100 overflow-hidden min-h-screen">
        <img
          src={serviceHero}
          alt="Secure Admin Access"
          className="absolute inset-0 h-full w-full object-cover object-right select-none"
          loading="eager"
        />
        <div className="absolute inset-0 bg-white/40" />
        <div className="relative z-10 flex flex-col items-start justify-center h-full w-full px-16">
          <div className="bg-white/60 rounded-md p-8 shadow-lg backdrop-blur-xs">
            <div className="flex flex-col items-start w-full">
              <span className="text-2xl font-extrabold tracking-tight text-teal-700 select-none mb-6">Help<span className="text-slate-900">OnCall</span></span>
              <div className="flex items-center mb-4">
                <span className="text-lg font-semibold text-slate-700">Helping hands, always on call.</span>
              </div>
              <div className="text-slate-600 text-sm mt-2">
                Clinicians treat the patients, but you sustain the system. Your work is the quiet heartbeat behind every life saved.
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Left Column: Login Form and Welcome */}
      <div className="flex flex-col justify-between w-full md:w-1/2 bg-white px-8 py-10 md:py-0 md:pl-16 md:pr-8 min-h-screen">
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <h1 className="text-3xl font-bold mb-2 text-slate-900">Welcome To Staff Portal!</h1>
          <p className="mb-8 text-base text-slate-500">Please sign in with your secure credentials to manage staffs, services, resources and reports.</p>
          <form onSubmit={handleSubmit} className="space-y-5" aria-label="Admin login form">
            <div>
              <input
                id="admin-email"
                name="email"
                type="email"
                value={credentials.email}
                onChange={handleChange}
                required
                autoComplete="username"
                className="w-full rounded-md border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 bg-slate-50"
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
            <div>
              <input
                id="admin-password"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="w-full rounded-md border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 bg-slate-50"
                placeholder="********"
              />
              {fieldErrors.password.length > 0 ? (
                <ul className="mt-1 list-disc pl-5 text-xs text-red-700" role="alert">
                  {fieldErrors.password.map((message, index) => (
                    <li key={`${message}-${index}`}>{message}</li>
                  ))}
                </ul>
              ) : null}
            </div>
            {/* <div className="flex items-center justify-between">
              <Link to="#" className="text-xs text-green-600 hover:underline">Mot de passe oublié?</Link>
            </div> */}
            {errorMessage ? (
              <p className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 font-medium" role="alert">
                {errorMessage}
              </p>
            ) : null}
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="btn-secondary inline-flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm whitespace-nowrap"
              >
                <ArrowLeft size={16} />
                Back to Public Site
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex-1 py-3.5 rounded-md shadow-lg shadow-teal-700/20 active:scale-[0.98] transition-transform"
              >
                {isSubmitting ? 'Authenticating...' : 'Secure Sign In'}
              </button>
            </div>
          </form>
          <div className="mt-8 text-center text-xs text-slate-500">
            Got any feedback to share with HelpOnCall team ?<br />
            <a href="mailto:support@helponcall.com" className="text-green-600 hover:underline">support@helponcall.com</a>
          </div>
        </div>
        {/* <div className="mt-8 text-xs text-slate-300 text-center select-none">All rights reserved HelpOnCall 2026</div> */}
      </div>
      </div>
      );
}
