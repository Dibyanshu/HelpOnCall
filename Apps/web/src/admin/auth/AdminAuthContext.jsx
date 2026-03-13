import { createContext, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'hoc_admin_auth';

const AdminAuthContext = createContext(null);

function readStoredAuth() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { token: '', user: null };
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.token || !parsed?.user) {
      return { token: '', user: null };
    }

    return parsed;
  } catch {
    return { token: '', user: null };
  }
}

export function AdminAuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);

  const signIn = (token, user) => {
    const nextAuth = { token, user };
    setAuth(nextAuth);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
  };

  const signOut = () => {
    setAuth({ token: '', user: null });
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      token: auth.token,
      user: auth.user,
      isAuthenticated: Boolean(auth.token),
      signIn,
      signOut,
    }),
    [auth.token, auth.user],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }

  return context;
}
