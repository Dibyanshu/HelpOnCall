import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  Briefcase,
  LayoutDashboard,
  Database,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useAdminAuth } from '../auth/AdminAuthContext.jsx';
import adminHero from '../../assets/admin/admin_hero.jpg';

const sidebarItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Services', icon: Database, path: '/admin/services' },
  { label: 'Customers', icon: UserCheck, path: '/admin/customers' },
  { label: 'Users', icon: Users, path: '/admin/users' },
  { label: 'Employment', icon: Briefcase, path: '/admin/employment' },
];

export default function AdminLayout() {
  const { user, signOut } = useAdminAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/admin/login');
  };

  return (
    <>
      <div className="bg-slate-50 min-h-screen flex flex-col">
        {/* Hero Section — sits above the sidebar + content area */}
        <section className="relative px-4 py-16 sm:px-6 sm:py-10 lg:px-8 lg:py-10">
          <img
            src={adminHero}
            alt="Admin Portal Background"
            className="absolute inset-0 h-full w-full object-cover grayscale opacity-80 mix-blend-multiply"
            loading="eager"
          />
          <div className="absolute inset-0 bg-teal-900/75" aria-hidden="true" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-100 italic">Help On Call {user?.role.toUpperCase()} Portal</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Welcome {user?.name || user?.email?.split('@')[0] || 'Admin'}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-teal-100 sm:text-lg">
              Monitor system metrics, manage user lists, and optimize customer service performance across the network.
            </p>
          </motion.div>
        </section>

        {/* Sidebar + Content Area — below the hero */}
        <div className="flex flex-1 items-stretch relative">
          {/* Sidebar */}
          <aside
            className={`flex-shrink-0 flex flex-col bg-white border-r border-slate-200 shadow-sm transition-all duration-300 ease-in-out z-10 ${collapsed ? 'w-[68px]' : 'w-[240px]'
              }`}
          >
            {/* Collapse Toggle */}
            <div className="flex items-center justify-end px-3 py-3 border-b border-slate-100">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="h-7 w-7 rounded-md flex items-center justify-center text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-all cursor-pointer"
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 flex flex-col gap-1 px-2 py-4 overflow-y-auto">
              {sidebarItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin/dashboard'}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${isActive
                      ? 'bg-teal-50 text-teal-800 shadow-sm border border-teal-100'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
                    } ${collapsed ? 'justify-center' : ''}`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon
                    size={18}
                    className="shrink-0 transition-colors"
                  />
                  {!collapsed && (
                    <span className="truncate tracking-wide">{item.label}</span>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Sign Out */}
            <div className="border-t border-slate-100 px-2 py-3">
              <button
                onClick={handleSignOut}
                className={`group flex items-center gap-3 w-full rounded-md px-3 py-2.5 text-sm font-semibold text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer ${collapsed ? 'justify-center' : ''
                  }`}
                title={collapsed ? 'Sign Out' : undefined}
              >
                <LogOut size={18} className="shrink-0" />
                {!collapsed && <span className="tracking-wide">Sign Out</span>}
              </button>
            </div>
          </aside>

          {/* Main Content (Outlet) */}
          <main className="flex-1 min-w-0">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Subtle Footer */}
        <footer className="bg-gray-900 py-6 px-4 sm:px-6 lg:px-8 border-t border-gray-800 shrink-0 w-full relative z-20">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-medium text-gray-500">
            <p>&copy; {new Date().getFullYear()} Help On Call. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
