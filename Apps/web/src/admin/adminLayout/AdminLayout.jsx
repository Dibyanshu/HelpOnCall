
import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Database,
  UsersRound,
  ClipboardList,
  Users,
  Building2,
  BriefcaseBusiness,
  Megaphone,
  Headset,
  Lock,
  LogOut,
  Bell,
  Download,
  ChevronDown,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  TextQuote,
  X
} from 'lucide-react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAdminAuth } from '../auth/AdminAuthContext.jsx';
import helpOnCallLogo from '../../assets/helpOnCallLogo.png';

const SIDEBAR_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', isLocked: false },
  { label: 'Manage Services', icon: Database, path: '/admin/services', isLocked: false },
  { label: 'Manage Staffs', icon: UsersRound, path: '/admin/users', isLocked: false,  isChildAvailable: true },
  { label: 'Job Applications', icon: ClipboardList, path: '/admin/employment', isLocked: false },
  { label: 'Manage Quotations', icon: TextQuote, path: '/admin/quotations', isLocked: false },
  { label: 'Manage Customers', icon: Users, path: '#', isLocked: true },
  { label: 'Manage Blogs', icon: Building2, path: '#', isLocked: true },
  { label: 'Manage Partners', icon: BriefcaseBusiness, path: '#', isLocked: true },
  { label: 'Manage Locations', icon: Megaphone, path: '#', isLocked: true },
  { label: 'Customer Support', icon: Headset, path: '#', isLocked: true },
];


export default function AdminLayout() {
  const { user, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleMenuNavigation = (item) => {
    if (item.isLocked) return;
    setActiveItem(item.label);
    if (item.path !== '#') {
      navigate(item.path);
      setIsMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F4F7F6] font-secondary overflow-hidden">
      {/* FIXED HEADER */}
      <header className="fixed top-0 right-0 left-0 h-20 bg-white border-b border-slate-100 z-40 px-4 flex items-center justify-between shadow-sm/5">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="xl:hidden h-10 w-10 flex items-center justify-center bg-slate-100 border border-slate-300 rounded-md text-slate-500 hover:text-teal-600 hover:bg-white transition-all"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            title={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="h-11 w-11 rounded-md border border-slate-200 bg-white shadow-sm flex items-center justify-center overflow-hidden shrink-0">
            <img
              src={helpOnCallLogo}
              alt="Help On Call"
              className="h-8 w-auto object-contain"
              loading="eager"
            />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="text-[15px] font-semibold tracking-tight text-slate-900 truncate">Help On Call (Admin)</p>
            <p className="text-[10px] uppercase tracking-[0.1em] text-teal-700/90 truncate mt-1">Manage The Helping hands</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-10 w-10 flex items-center justify-center bg-slate-100 border border-slate-300 rounded-md text-slate-400 hover:text-teal-600 hover:bg-white hover:shadow-sm transition-all relative" title='Export Reports'>
            <Download size={18} />
          </button>
          <button className="h-10 w-10 flex items-center justify-center bg-slate-100 border border-slate-300 rounded-md text-slate-400 hover:text-teal-600 hover:bg-white hover:shadow-sm transition-all relative" title='Notifications'>
            <Bell size={18} />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-rose-500 rounded-md border-2 border-white"></span>
          </button>
          {/* Profile Dropdown Section */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 bg-white hover:bg-slate-50 border border-slate-100/50 p-1.5 pr-4 rounded-md transition-all group active:scale-95"
            >
              <div className="h-10 w-10 rounded-md bg-teal-600 border border-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md overflow-hidden uppercase">
                {user?.name?.charAt(0) || '!'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-none mb-0.5 group-hover:text-teal-700 transition-colors uppercase">{user?.name}</p>
              </div>
              <ChevronDown size={14} className={`text-slate-300 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden z-50 p-2"
                >
                  {/* Role Label */}
                  <div className="px-4 py-3 border-b border-slate-50 mx-1 mb-1">
                    <div className="flex items-center gap-3 text-slate-400">
                      <ShieldCheck size={16} className="text-teal-600" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">My Role</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1.5 lowercase ml-7 capitalize">{user?.role || 'Administrator'}</p>
                  </div>
                  {/* Sign Out Button */}
                  <button
                    onClick={() => { signOut(); navigate('/admin/login'); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all group"
                  >
                    <div className="h-8 w-8 rounded-md bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors">
                      <LogOut size={16} />
                    </div>
                    <span className="text-[13px] font-bold tracking-tight">Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed top-20 inset-x-0 bottom-0 bg-slate-900/20 z-40 xl:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -320, opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0.8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed top-20 bottom-0 left-0 w-72 max-w-[85vw] bg-white border-r border-slate-200 z-50 xl:hidden flex flex-col"
            >
              <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto custom-scrollbar pt-4">
                {SIDEBAR_ITEMS.map((item) => {
                  const isActive = window.location.pathname === item.path;
                  return (
                    <button
                      key={item.label}
                      onClick={() => handleMenuNavigation(item)}
                      disabled={item.isLocked}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-md text-[13px] font-bold transition-all duration-200 ${isActive
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        } ${item.isLocked ? 'cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={18} className={isActive ? 'stroke-[2.5px]' : 'stroke-[2px] opacity-70'} />
                        {item.label}
                      </div>
                      {item.isLocked && <Lock size={12} className="text-yellow-600" />}
                    </button>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside className={`fixed top-20 bottom-0 left-0 ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-slate-200 z-30 hidden xl:flex flex-col transition-all duration-300`}>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto custom-scrollbar pt-4">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = window.location.pathname === item.path || (item.isChildAvailable && window.location.pathname.startsWith(item.path));
            return (
              <button
                key={item.label}
                onClick={() => handleMenuNavigation(item)}
                disabled={item.isLocked}
                title={item.label}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-md text-[13px] font-bold transition-all duration-200 ${isActive
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  } ${item.isLocked ? 'cursor-not-allowed' : ''}`}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? '' : 'gap-3'}`}>
                  <item.icon size={18} className={isActive ? 'stroke-[2.5px]' : 'stroke-[2px] opacity-70'} />
                  {!isSidebarCollapsed ? item.label : null}
                </div>
                {!isSidebarCollapsed && item.isLocked && <Lock size={12} className="text-yellow-600" />}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start gap-2'} rounded-md px-3 py-2 text-[11px] font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all`}
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
            {!isSidebarCollapsed ? 'Collapse Sidebar' : null}
          </button>
        </div>
      </aside>
      {/* MAIN CONTENT (Outlet) */}
      <main className={`flex-1 ${isSidebarCollapsed ? 'xl:ml-20' : 'xl:ml-64'} min-h-screen overflow-y-auto custom-scrollbar pt-20 transition-all duration-300`}>
        <div className="mx-auto space-y-6 p-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

