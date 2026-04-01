
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  ChevronRight,
  Lock,
  LogOut,
  Bell,
  Download,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAdminAuth } from '../auth/AdminAuthContext.jsx';

const SIDEBAR_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Manage Services', icon: Database, path: '/admin/services' },
  { label: 'Manage Employees', icon: UsersRound, path: '/admin/users' },
  { label: 'Job Applications', icon: ClipboardList, path: '#', isLocked: true },
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
  const dropdownRef = useRef(null);

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
      <header className="fixed top-0 right-0 left-0 xl:left-64 h-20 bg-white border-b border-slate-100 z-40 px-10 flex items-center justify-between shadow-sm/5">
        <h1 className="text-xl font-primary text-slate-800 tracking-tight">Overview</h1>
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
                <p className="text-sm font-bold text-slate-800 leading-none mb-0.5 group-hover:text-teal-700 transition-colors uppercase tracking-tight">{user?.name}</p>
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
                    <p className="text-xs font-bold text-slate-800 mt-1.5 lowercase ml-7">{user?.role || 'Administrator'}</p>
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
      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-50 hidden xl:flex flex-col">
        <div className="p-6 h-20 flex items-center gap-3 border-b border-slate-50">
          <div className="h-9 w-9 bg-gradient-to-br from-[#0f766e] to-[#14b8a6] rounded-md flex items-center justify-center shadow-md shadow-teal-500/10">
            <span className="text-white text-lg italic tracking-tighter">H</span>
          </div>
          <span className="text-lg font-primary text-slate-800 tracking-tight">HELP ON CALL</span>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto custom-scrollbar pt-6">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = window.location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (item.isLocked) return;
                  setActiveItem(item.label);
                  if (item.path !== '#') navigate(item.path);
                }}
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
      </aside>
      {/* MAIN CONTENT (Outlet) */}
      <main className="flex-1 xl:ml-64 min-h-screen overflow-y-auto custom-scrollbar pt-20">
        <div className="mx-auto space-y-6 p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

