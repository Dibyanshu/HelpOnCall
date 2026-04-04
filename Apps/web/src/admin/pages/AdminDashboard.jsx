import React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../admin/auth/AdminAuthContext';
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
import { ChevronDown, ChevronRight, ArrowLeft, Mail, Calendar, Star, CheckCircle2 } from 'lucide-react';
import { useServiceManagement } from '../../appServices/useServiceManagement.js';

// Global Design System Colors
const COLORS = {
  green: '#009689',  // Teal-600
  red: '#e11d48', // Rose-600
  yellow: '#f59e0b',  // Yellow-500
  blue: '#2e61a8ff'
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
  { name: 'Mobility & Companionship', value: 15, color: COLORS.blue },
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
    { name: 'Applied', value: 650, total: 1000, color: COLORS.blue },
    { name: 'Interviewed', value: 320, total: 1000, color: COLORS.yellow },
    { name: 'Hired', value: 120, total: 1000, color: COLORS.green },
  ],
  'Last Month': [
    { name: 'Applied', value: 2800, total: 5000, color: COLORS.blue },
    { name: 'Interviewed', value: 1450, total: 5000, color: COLORS.yellow },
    { name: 'Hired', value: 580, total: 5000, color: COLORS.green },
  ],
  'Last Year': [
    { name: 'Applied', value: 31200, total: 35000, color: COLORS.blue },
    { name: 'Interviewed', value: 24500, total: 35000, color: COLORS.yellow },
    { name: 'Hired', value: 8900, total: 35000, color: COLORS.green },
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



export default function AdminDashboard() {
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
    window.scrollTo(0, 0); // Scroll to top on mount
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
    <>
      {/* Overview Stats Grid */}
      <div className="bg-white rounded-md border border-slate-100/50 shadow-sm p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-y-8 divide-x divide-slate-50">
          {[ 
            { label: 'Employees', value: '50' },
            { label: 'Customers', value: '258' },
            { label: 'Quotations', value: '4,587' },
            { label: 'Job Applications', value: '15' },
            { label: 'Blogs', value: '25' },
            { label: 'Services', value: '9' },
            { label: 'Partners', value: '3' },
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
                <Line type="monotone" dataKey="revenue" stroke={COLORS.green} strokeWidth={3} dot={false} activeDot={{ r: 4, fill: '#fff', stroke: COLORS.green, strokeWidth: 2 }} />
                <Line type="monotone" dataKey="expenses" stroke={COLORS.red} strokeWidth={3} dot={false} activeDot={{ r: 4, fill: '#fff', stroke: COLORS.red, strokeWidth: 2 }} />
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
      <div className="grid lg:grid-cols-3 gap-6">
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
    </>
  );
}
