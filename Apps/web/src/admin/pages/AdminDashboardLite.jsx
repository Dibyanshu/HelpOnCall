import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Users,
  LayoutDashboard,
  Database,
  Search,
  Filter,
  Bell,
  ChevronDown,
  Star,
  LogOut,
  BriefcaseBusiness,
  ClipboardList,
  Building2,
  UsersRound,
  Megaphone,
  ArrowRightLeft,
  HeartHandshake,
  Headset,
  ChevronRight,
  ShieldCheck,
  Download,
  ArrowLeft,
  Calendar,
  Mail,
  CheckCircle2
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '../auth/AdminAuthContext.jsx';
import { useNavigate } from 'react-router-dom';

// Global Design System Colors
const COLORS = {
  green: '#009689',  // Teal-600
  red: '#e11d48', // Rose-600
  yellow: '#f59e0b',  // Yellow-500
};

// Mock Data
const LINE_DATA = [
  { name: 'Jan', expenses: 6000, revenue: 8000 },
  { name: 'Feb', expenses: 7000, revenue: 9500 },
  { name: 'Mar', expenses: 6500, revenue: 12000 },
  { name: 'Apr', expenses: 8000, revenue: 11000 },
  { name: 'May', expenses: 9000, revenue: 14000 },
  { name: 'Jun', expenses: 10500, revenue: 15500 },
  { name: 'Jul', expenses: 11000, revenue: 13000 },
  { name: 'Aug', expenses: 12500, revenue: 14500 },
  { name: 'Sep', expenses: 9500, revenue: 15000 },
  { name: 'Oct', expenses: 10000, revenue: 17000 },
  { name: 'Nov', expenses: 9000, revenue: 16000 },
  { name: 'Dec', expenses: 12000, revenue: 18000 },
];

const DONUT_DATA = [
  { name: 'Household Chores', value: 25, color: COLORS.yellow },
  { name: 'Personal Hygiene', value: 35, color: COLORS.green },
  { name: 'Mobility & Companionship', value: 15, color: COLORS.red },
];

const TRANSACTION_DATA = [
  { name: 'Jan', active: 38000, rfq: 8000 },
  { name: 'Feb', active: 25000, rfq: 15000 },
  { name: 'Mar', active: 5000, rfq: 3000 },
  { name: 'Apr', active: 48000, rfq: 4000 },
  { name: 'May', active: 22000, rfq: 10000 },
  { name: 'Jun', active: 15000, rfq: 4000 },
  { name: 'Jul', active: 10000, rfq: 3000 },
  { name: 'Aug', active: 35000, rfq: 12000 },
  { name: 'Sep', active: 35000, rfq: 10000 },
  { name: 'Oct', active: 35000, rfq: 10000 },
  { name: 'Nov', active: 40000, rfq: 8000 },
  { name: 'Dec', active: 5000, rfq: 2000 },
];

const EMPLOYMENT_STATS = {
  'Last Week': [
    { name: 'Applied', value: 650, total: 1000, color: '#0d9488' },
    { name: 'Interviewed', value: 320, total: 1000, color: '#0f766e' },
    { name: 'Hired', value: 120, total: 1000, color: '#312e81' },
  ],
  'Last Month': [
    { name: 'Applied', value: 2800, total: 5000, color: '#0d9488' },
    { name: 'Interviewed', value: 1450, total: 5000, color: '#0f766e' },
    { name: 'Hired', value: 580, total: 5000, color: '#312e81' },
  ],
  'Last Year': [
    { name: 'Applied', value: 31200, total: 35000, color: '#0d9488' },
    { name: 'Interviewed', value: 24500, total: 35000, color: '#0f766e' },
    { name: 'Hired', value: 8900, total: 35000, color: '#312e81' },
  ]
};

const RECENT_CUSTOMERS = [
  {
    id: 1,
    name: 'Wilson Dias',
    email: 'wilson.dias@example.com',
    location: 'Torronto',
    services: ['Household Chores', 'Tailor'],
    startDate: 'March 12, 2024'
  },
  {
    id: 2,
    name: 'Sarah Chen',
    email: 'sarah.chen@tech.com',
    location: 'Torronto',
    services: ['Personal Hygiene', 'Plumber'],
    startDate: 'Feb 28, 2024'
  },
  {
    id: 3,
    name: 'Marcus Miller',
    email: 'm.miller@globex.com',
    location: 'Torronto',
    services: ['Mobility & Companionship'],
    startDate: 'Jan 15, 2024'
  },
  {
    id: 4,
    name: 'Aisha Gupta',
    email: 'aisha@gupta.in',
    location: 'Torronto',
    services: ['Household Chores'],
    startDate: 'April 02, 2024'
  },
];


const SIDEBAR_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard-lite' },
  { label: 'Manage Customers', icon: Users, path: '#' },
  { label: 'Manage Employees', icon: UsersRound, path: '/admin/users' },
  { label: 'Manage Job Applications', icon: ClipboardList, path: '#' },
  { label: 'Manage Services', icon: Database, path: '/admin/services' },
  { label: 'Manage Blogs', icon: Building2, path: '#' },
  { label: 'Manage Partners', icon: BriefcaseBusiness, path: '#' },
  { label: 'Manage Locations', icon: Megaphone, path: '#' },
  { label: 'Customer Support', icon: Headset, path: '#' },
];

import { useServiceManagement } from '../../appServices/useServiceManagement.js';

export default function AdminDashboardLite() {
  const { user, token, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // State for Employment Stats period dropdown
  const [selectedPeriod, setSelectedPeriod] = useState('Last Month');
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const periodDropdownRef = useRef(null);

  // Stabilize the callback so useServiceManagement doesn't infinite-loop
  const handleUnauthorized = useCallback(() => {
    signOut();
    navigate('/admin/login');
  }, [signOut, navigate]);

  // Fetch services from API
  const { services, serviceTree, isLoading: servicesLoading } = useServiceManagement({
    token,
    onUnauthorized: handleUnauthorized,
  });

  // Map API services to the format expected by the TOP_SERVICES UI
  // We keep the percentages mock as per the design requirement
  const dynamicTopServices = React.useMemo(() => {
    if (!services || services.length === 0) return [];

    // Take the first 6 services and apply static percentages for visual variety
    const mockPercentages = [55, 46, 38, 32, 28, 24];
    return services.slice(0, 6).map((s, idx) => ({
      name: s.label,
      percentage: mockPercentages[idx] || 20
    }));
  }, [services]);

  // Ratings Distribution and Calculation
  const RATINGS_DISTRIBUTION = [
    { stars: 5, label: '5-star Experience', percentage: 70, color: '#0d9488' }, // Teal 600
    { stars: 4, label: '4-star', percentage: 15, color: '#22c55e' }, // Green 500
    { stars: 3, label: '3-star', percentage: 8, color: '#eab308' }, // Yellow 500
    { stars: 2, label: '2-star', percentage: 4, color: '#f97316' }, // Orange 500
    { stars: 1, label: '1-star', percentage: 3, color: '#e11d48' }, // Rose 600
  ];

  const averageRating = (RATINGS_DISTRIBUTION.reduce((acc, curr) => acc + (curr.stars * curr.percentage), 0) / 100).toFixed(1);
  const totalReviews = "24,323";

  // State for Recent Users detail panel
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(event.target)) {
        setIsPeriodOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/70 backdrop-blur-md border border-white/40 px-4 py-3 rounded-md shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] ring-1 ring-slate-900/5 min-w-[140px]">
          {label && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100/50 pb-2">{label}</p>}
          <div className="space-y-2">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color || (entry.payload && entry.payload.color) }} />
                  <span className="text-[11px] font-bold text-slate-500 capitalize">{entry.name}</span>
                </div>
                <span className="text-[11px] font-bold text-slate-900 tracking-tight">
                  {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

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
            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Profile Dropdown Section */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 bg-white hover:bg-slate-50 border border-slate-100/50 p-1.5 pr-4 rounded-xl transition-all group active:scale-95"
            >
              <div className="h-10 w-10 rounded-lg bg-teal-600 border border-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md overflow-hidden uppercase">
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
                  className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden z-50 p-2"
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
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors">
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
          <div className="h-9 w-9 bg-linear-to-br from-[#0f766e] to-[#14b8a6] rounded-md flex items-center justify-center shadow-md shadow-teal-500/10">
            <span className="text-white text-lg italic tracking-tighter">H</span>
          </div>
          <span className="text-lg font-primary text-slate-800 tracking-tight">HELP ON CALL</span>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto custom-scrollbar pt-6">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = activeItem === item.label;
            return (
              <button
                key={item.label}
                onClick={() => {
                  setActiveItem(item.label);
                  if (item.path !== '#') navigate(item.path);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-md text-[13px] font-bold transition-all duration-200 ${isActive
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={isActive ? 'stroke-[2.5px]' : 'stroke-[2px] opacity-70'} />
                  {item.label}
                </div>
                {item.label === 'Client Support' && (
                  <div className="h-5 w-5 bg-teal-600 rounded flex items-center justify-center text-[10px] text-white">24</div>
                )}
                {(item.label === 'Ads Management' || item.label === 'Partner & Sponsors') && <ChevronRight size={14} className="opacity-40" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 xl:ml-64 min-h-screen overflow-y-auto custom-scrollbar pt-20">
        <div className="p-8 max-w-[1500px] mx-auto space-y-6">

          {/* Overview Stats Grid */}
          <div className="bg-white rounded-md border border-slate-100/50 shadow-sm p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-y-8 divide-x divide-slate-50">
              {[
                { label: 'Service Providers', value: '3,232' },
                { label: 'Clients', value: '3,232' },
                { label: 'Active Users', value: '3,232' },
                { label: 'Services', value: '3,232' },
                { label: 'Ads', value: '3,232' },
                { label: 'Total Transactions', value: '3,232' },
                { label: 'Partners/Sponsors', value: '3,232' },
              ].map((stat, idx) => (
                <div key={idx} className={`${idx !== 0 ? 'pl-6' : ''} space-y-2`}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-xl font-bold font-primary text-slate-800 tracking-tight">{stat.value}</h3>
                </div>
              ))}
            </div>
          </div>

          {/* Line Chart + Donut Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-md border border-slate-100/50 shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-base font-bold font-primary text-slate-900 tracking-tight">Break-even Chart</h3>
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-teal-600"></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-600"></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expenses</span>
                  </div>
                </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={LINE_DATA} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#F8F9FA" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
                      dy={15}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
                      tickFormatter={(val) => `${val / 1000}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="revenue" stroke={COLORS.green} strokeWidth={3} dot={false} activeDot={{ r: 4, fill: '#fff', stroke: COLORS.revenue, strokeWidth: 2 }} />
                    <Line type="monotone" dataKey="expenses" stroke={COLORS.red} strokeWidth={3} dot={false} activeDot={{ r: 4, fill: '#fff', stroke: COLORS.expenses, strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-md border border-slate-100/50 shadow-sm p-8">
              <h3 className="text-base font-bold font-primary text-slate-900 tracking-tight mb-1">Employee Distribution</h3>
              <p className="text-[11px] font-bold text-slate-400 mb-6 uppercase tracking-widest">Total: 50</p>

              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={DONUT_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={6}
                      dataKey="value"
                      stroke="none"
                    >
                      {DONUT_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-primary text-slate-900 leading-none">100%</span>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                {DONUT_DATA.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs font-bold text-slate-900">{item.name}</span>
                    </div>
                    <span className="text-xs text-slate-900">{(item.value / 50) * 100}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar Chart + Subscription Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-md border border-slate-100/50 shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-base font-primary font-bold text-slate-900 tracking-tight">Customer Metrics</h3>
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded bg-teal-600" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Customers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded bg-yellow-600 border border-yellow-600" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customers Requested For Quote</span>
                  </div>
                </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={TRANSACTION_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#F8F9FA" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
                      dy={15}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
                      tickFormatter={(val) => `${val / 1000}k`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8F9FA', opacity: 0.5 }} />
                    <Bar dataKey="active" fill={COLORS.green} radius={[3, 3, 0, 0]} barSize={18} />
                    <Bar dataKey="rfq" fill={COLORS.yellow} radius={[3, 3, 0, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-md border border-slate-100/50 shadow-sm p-8">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-base font-primary text-slate-900 tracking-tight">Employment Stats</h3>
                <div className="relative" ref={periodDropdownRef}>
                  <button
                    onClick={() => setIsPeriodOpen(!isPeriodOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                  >
                    {selectedPeriod} <ChevronDown size={12} className={`transition-transform duration-300 ${isPeriodOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isPeriodOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-36 bg-white border border-slate-100 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] z-50 p-1.5 overflow-hidden"
                      >
                        {['Last Week', 'Last Month', 'Last Year'].map((period) => (
                          <button
                            key={period}
                            onClick={() => {
                              setSelectedPeriod(period);
                              setIsPeriodOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${selectedPeriod === period
                              ? 'bg-teal-50 text-teal-700'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                              }`}
                          >
                            {period}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="space-y-10 py-2">
                {EMPLOYMENT_STATS[selectedPeriod].map((sub, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-bold text-slate-500 tracking-widest uppercase">{sub.name}</h4>
                      <span className="text-xs text-slate-900">
                        {sub.value >= 1000 ? `${(sub.value / 1000).toFixed(1)}k` : sub.value}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(sub.value / sub.total) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: sub.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 flex justify-between px-1 text-[9px] text-slate-300 uppercase tracking-tighter font-bold">
                {(() => {
                  const total = EMPLOYMENT_STATS[selectedPeriod][0].total;
                  const steps = [0, total * 0.15, total * 0.3, total * 0.55, total * 0.7, total * 0.85, total];
                  return steps.map((v, i) => (
                    <span key={i}>{v === 0 ? 0 : v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0)}</span>
                  ));
                })()}
              </div>
            </div>
          </div>

          {/* Footer Grid Row */}
          <div className="grid lg:grid-cols-3 gap-6 pb-8">
            <div className="bg-white rounded-md border border-slate-100/50 shadow-sm p-8 relative overflow-hidden flex flex-col min-h-[400px]">
              <AnimatePresence mode="wait">
                {!selectedUser ? (
                  <motion.div
                    key="list"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex-1 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-base font-primary font-bold text-slate-800 tracking-tight">Recent Customers</h3>
                    </div>
                    <div className="space-y-6 flex-1">
                      {RECENT_CUSTOMERS.map((user, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedUser(user)}
                          className="flex items-center justify-between group cursor-pointer hover:bg-slate-50/50 p-2 -m-2 rounded-xl transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-md bg-teal-50 border border-teal-600 flex items-center justify-center text-teal-700 font-bold text-base shadow-xs group-hover:bg-teal-600 group-hover:text-white transition-all uppercase">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-[13px] font-bold text-slate-800 tracking-tight leading-none mb-1.5">{user.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.email}</p>
                            </div>
                          </div>
                          <div className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 bg-slate-50 text-slate-300 group-hover:bg-teal-50 group-hover:text-teal-600 transition-all">
                            <ChevronRight size={14} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="detail"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex-1 flex flex-col"
                  >
                    <div className="flex items-center gap-4 mb-8">
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-teal-50 hover:text-teal-600 transition-all border border-slate-100"
                      >
                        <ArrowLeft size={16} />
                      </button>
                      <h3 className="text-base font-primary font-bold text-slate-800 tracking-tight">User Details</h3>
                    </div>

                    <div className="flex-1 space-y-8">
                      <div className="flex items-center gap-5 p-4 bg-teal-50/50 rounded-2xl border border-teal-100/50">
                        <div className="h-16 w-16 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-black text-2xl shadow-lg uppercase">
                          {selectedUser.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 leading-none mb-1.5">{selectedUser.name}</h4>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-teal-100 text-teal-700">
                            {selectedUser.location}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-6 px-1">
                        <div className="flex items-start gap-4">
                          <div className="h-9 w-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 flex-shrink-0">
                            <Mail size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Contact Email</p>
                            <p className="text-[13px] font-bold text-slate-700">{selectedUser.email}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="h-9 w-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 flex-shrink-0">
                            <Calendar size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Services Started</p>
                            <p className="text-[13px] font-bold text-slate-700">{selectedUser.startDate}</p>
                          </div>
                        </div>

                        <div className="space-y-3 pt-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle2 size={12} className="text-teal-600" />
                            Availed Services
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {selectedUser.services.map((s, i) => (
                              <span key={i} className="px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-xs font-bold text-slate-600 shadow-sm">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-white rounded-md border border-slate-100/50 shadow-sm p-8">
              <h3 className="text-base font-primary font-bold text-slate-800 tracking-tight mb-10">Popular Services</h3>
              <div className="space-y-8">
                {servicesLoading ? (
                  <p className="text-sm text-slate-400">Loading popular services...</p>
                ) : dynamicTopServices.length > 0 ? (
                  dynamicTopServices.map((service, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[13px] font-bold text-slate-600">{service.name}</h4>
                        <span className="text-[13px] text-teal-800">{service.percentage}%</span>
                      </div>
                      <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-600/20 rounded-full" style={{ width: `${service.percentage}%` }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No services found.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-md border border-slate-100/50 shadow-sm p-8">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-primary font-bold text-slate-800 tracking-tight">Ratings</h3>
                  <div className="flex items-center gap-1.5 text-[#FFB800] bg-amber-50 px-2 py-0.5 rounded-md">
                    <Star size={14} fill="currentColor" />
                    <span className="text-sm text-slate-900">{averageRating}</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-10">{totalReviews} TOTAL REVIEWS</p>

              <div className="space-y-6">
                {RATINGS_DISTRIBUTION.map((rating, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <span>{rating.label}</span>
                      <span className="text-slate-900">{rating.percentage}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-50 rounded-full p-0.5 shadow-inner">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${rating.percentage}%`, backgroundColor: rating.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
