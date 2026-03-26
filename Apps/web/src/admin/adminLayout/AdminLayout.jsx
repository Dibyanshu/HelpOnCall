import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  Briefcase,
  LayoutDashboard,
  Database,
  Mail,
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
  { label: 'Quotations', icon: UserCheck, path: '/admin/quotations' },
  { label: 'Our Team', icon: Users, path: '/admin/users' },
  { label: 'Careers', icon: Briefcase, path: '/admin/employment' },
  { label: 'Email Templates', icon: Mail, path: '/admin/email-templates', roles: ['super_admin'] },
];

export default function AdminLayout() {
  const { user, signOut } = useAdminAuth();
  const [collapsed, setCollapsed] = useState(true);
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/admin/login');
  };

  return (
    <>
      <div className="bg-slate-50 min-h-screen flex flex-col">
        {/* Top Area: Sidebar + Main Content */}
        <div className="flex flex-1 items-stretch">
          {/* Sidebar Area - The aside stretches to touch footer, inner div stays sticky */}
          <aside
            className={`flex-shrink-0 bg-white border-r border-slate-200 shadow-sm transition-all duration-300 ease-in-out z-30 ${collapsed ? 'w-[68px]' : 'w-[240px]'
              }`}
          >
            <div className="sticky top-0 h-[calc(100vh-76px)] flex flex-col">
              {/* Collapse Toggle */}
              <div className="flex items-center justify-end px-3 py-3 border-b border-teal-900 bg-teal-900">
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="h-7 w-7 rounded-md flex items-center justify-center text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-all cursor-pointer"
                  title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
              </div>

              {/* Nav Items */}
              <nav className="flex-1 flex flex-col gap-1 px-2 py-4 overflow-y-auto custom-scrollbar">
                {sidebarItems.filter((item) => !item.roles || item.roles.includes(user?.role)).map((item) => (
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
            </div>
          </aside>

          {/* Main Wrapper */}
          <div className="flex flex-col flex-1 min-w-0">
            {/* Hero Section */}
            <header className="relative px-4 py-8 sm:px-6 sm:py-4 lg:px-8 lg:py-2 shrink-0 overflow-hidden">
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
                className="relative flex items-center justify-between gap-6"
              >
                <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-5">
                  <h3 className="text-xl font-bold leading-tight text-white sm:text-2xl lg:text-xl shrink-0">
                    Welcome {user?.name || user?.email?.split('@')[0] || 'Admin'}
                  </h3>
                  <p className="text-xs leading-relaxed text-teal-100/80 sm:text-sm italic border-l border-teal-500/30 pl-4 py-1">
                    Monitor metrics, manage users, and optimize service performance across the network.
                  </p>
                </div>

                <button
                  onClick={handleSignOut}
                  className="group flex items-center gap-2 px-4 py-2 rounded-full btn-secondary hover:bg-rose-500/20 text-rose-900 border border-white/20 hover:border-rose-500/30 transition-all duration-200 text-sm font-bold cursor-pointer backdrop-blur-sm"
                >
                  <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </motion.div>
            </header>

            {/* Main Content (Outlet) */}
            <main className="flex-1 min-w-0 bg-slate-50">
              <div className="px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
              </div>
            </main>
          </div>
        </div>

        {/* Full-width Footer */}
        <footer className="bg-gray-900 py-6 px-4 sm:px-6 lg:px-8 border-t border-gray-800 shrink-0 w-full relative z-40">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-medium text-gray-500">
            <p>&copy; {new Date().getFullYear()} Help On Call. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}

