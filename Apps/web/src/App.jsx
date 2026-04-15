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
import AdminLayout from './admin/adminLayout/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminUsersPage from './admin/pages/AdminUsersPage';
import AdminNewUser from './admin/pages/AdminNewUser';
import AdminEditUser from './admin/pages/AdminEditUser';
import AdminQuotationManagementPage from './admin/pages/AdminQuotationManagementPage';
import AdminServicePage from './admin/pages/AdminServicePage';
import AdminEmailTemplatesPage from './admin/pages/email-templates/AdminEmailTemplatesPage';
import EmploymentAdminPage from './admin/pages/employment/EmploymentAdminPage';
import RequireAdminAuth from './admin/routes/RequireAdminAuth';
import RequestForQuote from './pages/RequestForQuote';

function App() {
  return (
    <>
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* All admin pages share AdminLayout (hero + sidebar + Outlet) */}
        <Route
          element={(
            <RequireAdminAuth>
              <AdminLayout />
            </RequireAdminAuth>
          )}
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={
            <RequireAdminAuth allowedRoles={['super_admin', 'admin']}>
              <AdminUsersPage />
            </RequireAdminAuth>
          } />
          <Route path="/admin/users/create-new-staff-record" element={
            <RequireAdminAuth allowedRoles={['super_admin', 'admin']}>
              <AdminNewUser />
            </RequireAdminAuth>
          } />
          <Route path="/admin/users/edit-staff-record" element={
            <RequireAdminAuth allowedRoles={['super_admin', 'admin']}>
              <AdminEditUser />
            </RequireAdminAuth>
          } />
          <Route path="/admin/quotations" element={
            <RequireAdminAuth allowedRoles={['super_admin', 'admin']}>
              <AdminQuotationManagementPage />
            </RequireAdminAuth>
          } />
          <Route path="/admin/services" element={
            <RequireAdminAuth allowedRoles={['super_admin', 'admin']}>
              <AdminServicePage />
            </RequireAdminAuth>
          } />
          <Route path="/admin/employment" element={
            <RequireAdminAuth allowedRoles={['super_admin', 'admin']}>
              <EmploymentAdminPage />
            </RequireAdminAuth>
          } />
          <Route path="/admin/email-templates" element={
            <RequireAdminAuth allowedRoles={['super_admin']}>
              <AdminEmailTemplatesPage />
            </RequireAdminAuth>
          } />
        </Route>

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

