import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/HomePage';
import AboutUsPage from './pages/AboutUsPage';
import EmploymentPage from './pages/EmploymentPage';
import Services from './pages/ServicesPage';
import SitemapPage from './pages/SitemapPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import UserRegistrationPage from './pages/UserRegistrationPage';
import AdminLoginPage from './admin/pages/AdminLoginPage';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminDashboardPage from './admin/pages/AdminDashboardPage';
import AdminUsersPage from './admin/pages/AdminUsersPage';
import AdminUserNewPage from './admin/pages/AdminUserNewPage';
import ServiceDashboardLayout from './admin/pages/services/ServiceDashboardLayout';
import EmploymentAdminPage from './admin/pages/employment/EmploymentAdminPage';
import RequireAdminAuth from './admin/routes/RequireAdminAuth';
import RequestForQuote from './pages/RequestForQuote';

function App() {
  return (
    <>
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route
          path="/admin/dashboard"
          element={(
            <RequireAdminAuth>
              <AdminDashboard />
            </RequireAdminAuth>
          )}
        />
        <Route
          path="/admin/dashboard-old"
          element={(
            <RequireAdminAuth>
              <AdminDashboardPage />
            </RequireAdminAuth>
          )}
        />
        <Route
          path="/admin/users"
          element={(
            <RequireAdminAuth allowedRoles={['super_admin', 'admin']}>
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
        <Route
          path="/admin/services"
          element={(
            <RequireAdminAuth allowedRoles={['super_admin', 'admin']}>
              <ServiceDashboardLayout />
            </RequireAdminAuth>
          )}
        />
        <Route
          path="/admin/employment"
          element={(
            <RequireAdminAuth allowedRoles={['super_admin', 'admin']}>
              <EmploymentAdminPage />
            </RequireAdminAuth>
          )}
        />

        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/about" element={<Layout><AboutUsPage /></Layout>} />
        <Route path="/services" element={<Layout><Services /></Layout>} />
        <Route path="/register" element={<Layout><UserRegistrationPage /></Layout>} />
        <Route path="/employment" element={<Layout><EmploymentPage /></Layout>} />
        <Route path="/sitemap" element={<Layout><SitemapPage /></Layout>} />
        <Route path="/privacy-policy" element={<Layout><PrivacyPolicyPage /></Layout>} />
        <Route path="/quote" element={<Layout><RequestForQuote /></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
