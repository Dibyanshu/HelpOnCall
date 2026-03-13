import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import AboutUsPage from './pages/AboutUsPage';
import ContactPage from './pages/ContactPage';
import Services from './pages/Services';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminUserNewPage from './pages/admin/AdminUserNewPage';
import RequireAdminAuth from './admin/routes/RequireAdminAuth';

function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route
        path="/admin/dashboard"
        element={(
          <RequireAdminAuth>
            <AdminDashboardPage />
          </RequireAdminAuth>
        )}
      />
      <Route
        path="/admin/users"
        element={(
          <RequireAdminAuth allowedRoles={['super_admin']}>
            <AdminUsersPage />
          </RequireAdminAuth>
        )}
      />
      <Route
        path="/admin/users/new"
        element={(
          <RequireAdminAuth allowedRoles={['super_admin']}>
            <AdminUserNewPage />
          </RequireAdminAuth>
        )}
      />

      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/about" element={<Layout><AboutUsPage /></Layout>} />
      <Route path="/services" element={<Layout><Services /></Layout>} />
      <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
