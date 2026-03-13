import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../auth/AdminAuthContext.jsx';

export default function RequireAdminAuth({ children, allowedRoles = [] }) {
  const location = useLocation();
  const { isAuthenticated, user } = useAdminAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}
