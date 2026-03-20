import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Database,
  Calendar,
  Download,
  MoreVertical,
  Search,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Mail,
  LogOut
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '../../admin/auth/AdminAuthContext.jsx';
import Layout from '../../components/layout/Layout';
import serviceHero from '../../assets/Service_Hero.png';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Advanced Mock Data for different periods
const MOCK_DATA = {
  Weekly: [
    { name: 'Mon', quote: 120, active: 80 },
    { name: 'Tue', quote: 140, active: 95 },
    { name: 'Wed', quote: 200, active: 110 },
    { name: 'Thu', quote: 180, active: 130 },
    { name: 'Fri', quote: 240, active: 160 },
    { name: 'Sat', quote: 150, active: 90 },
    { name: 'Sun', quote: 100, active: 60 },
  ],
  Monthly: [
    { name: 'Jan', quote: 400, active: 240 },
    { name: 'Feb', quote: 300, active: 456 },
    { name: 'Mar', quote: 600, active: 380 },
    { name: 'Apr', quote: 800, active: 590 },
    { name: 'May', quote: 500, active: 710 },
    { name: 'Jun', quote: 700, active: 500 },
  ],
  Yearly: [
    { name: '2021', quote: 4500, active: 2800 },
    { name: '2022', quote: 5200, active: 3900 },
    { name: '2023', quote: 6100, active: 4400 },
    { name: '2024', quote: 7800, active: 5600 },
    { name: '2025', quote: 8900, active: 6200 },
  ]
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-md shadow-2xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#004D40] mb-2">{label} Report</p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-8">
            <span className="text-xs font-bold text-slate-500">Quote Requests</span>
            <span className="text-xs font-black text-teal-900">{payload[0].value}</span>
          </div>
          <div className="flex items-center justify-between gap-8">
            <span className="text-xs font-bold text-slate-500">Active Customers</span>
            <span className="text-xs font-black text-teal-600">{payload[1].value}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const { user, token, signOut } = useAdminAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    usersCount: 0,
    servicesCount: 0,
    employmentCount: 0,
    pendingEmployment: 0
  });
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [metricPeriod, setMetricPeriod] = useState('Monthly');

  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    try {
      const usersRes = await fetch(`${API_BASE_URL}/api/v1/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      const allUsers = Array.isArray(usersData?.data) ? usersData.data : [];
      setUsersList(allUsers);

      const servicesRes = await fetch(`${API_BASE_URL}/api/v1/admin/services`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const servicesData = await servicesRes.json();

      const empRes = await fetch(`${API_BASE_URL}/api/v1/admin/employment`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const empData = await empRes.json();
      const allEmployment = Array.isArray(empData?.data) ? empData.data : [];

      setStats({
        usersCount: allUsers.length,
        servicesCount: Array.isArray(servicesData?.data) ? servicesData.data.length : 0,
        employmentCount: allEmployment.length,
        pendingEmployment: allEmployment.filter(s => s.status === 'new').length
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return usersList.slice(0, 7);
    return usersList.filter(u =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 7);
  }, [usersList, searchQuery]);

  // Dynamic Chart Data based on selection
  const currentChartData = useMemo(() => MOCK_DATA[metricPeriod] || MOCK_DATA.Monthly, [metricPeriod]);

  const StatBox = ({ title, value, trend, isUp, period, link, linkTitle }) => (
    <div className="bg-white rounded-md p-6 border border-slate-200 shadow-md relative overflow-hidden group">
      <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">{value}</h3>
      <div className="flex items-center gap-1.5">
        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${isUp ? 'bg-teal-100 text-teal-800' : 'bg-rose-100 text-rose-800'}`}>
          {isUp ? '+ ' : '- '} {trend}
        </span>
        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">{period}</span>
      </div>
      <Link
        to={link || "#"}
        title={linkTitle || `Go to ${title}`}
        className="absolute bottom-4 right-4 h-8 w-8 rounded-md bg-teal-600 border border-teal-500 flex items-center justify-center text-white hover:bg-teal-700 transition-all cursor-pointer shadow-sm active:scale-90"
      >
        <ArrowUpRight size={14} />
      </Link>
    </div>
  );

  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen pb-20 overflow-hidden">
        {/* Unified Hero Section */}
        <section className="relative px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <img
            src={serviceHero}
            alt="Admin Portal Background"
            className="absolute inset-0 h-full w-full object-cover grayscale opacity-80 mix-blend-multiply"
            loading="eager"
          />
          <div className="absolute inset-0 bg-teal-900/75" aria-hidden="true" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative mx-auto max-w-5xl"
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-100 italic">Command Center</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Welcome {user?.email?.split('@')[0] || "Admin"}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-teal-100 sm:text-lg">
              Monitor system metrics, monitor user lists, and optimize customer service performance across the network.
            </p>
          </motion.div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 space-y-8">
          {/* Action Header Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-md border border-slate-200 bg-white p-6 shadow-md sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-md bg-teal-50 flex items-center justify-center text-teal-700">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Overview</h2>
                  <p className="text-sm text-slate-500">
                    Signed in as <span className="font-semibold text-teal-700">{user?.email?.split('@')[0] || user?.name}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-md border border-slate-200">
                  <div className="flex flex-col px-3 border-r border-slate-200">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="bg-transparent text-xs font-bold text-slate-700 outline-none p-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col px-3">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">End Date</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="bg-transparent text-xs font-bold text-slate-700 outline-none p-0 cursor-pointer"
                    />
                  </div>
                </div>
                <button className="btn-secondary gap-2 px-6 active:scale-95 transition-all">
                  <Download size={16} />
                  Export Reports
                </button>
                <button
                  onClick={signOut}
                  className="btn-primary gap-2 px-6 py-2.5 uppercase tracking-widest active:scale-95 transition-all"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatBox title="ACTIVE USERS" value={loading ? '...' : stats.usersCount} trend="3" isUp={true} period="LAST MONTH" link="/admin/users" linkTitle="Manage Users" />
            <StatBox title="ACTIVE CUSTOMERS" value={loading ? '...' : stats.pendingEmployment} trend="0" isUp={true} period="LAST MONTH" link="/admin/employment" linkTitle="Manage Customers" />
            <StatBox title="ACTIVE SERVICES" value={stats.servicesCount} trend="2" isUp={true} period="TOTAL SERVICES" link="/admin/services" linkTitle="Manage Services" />
            <StatBox title="ACTIVE JOB APPLICATIONS" value={loading ? '...' : stats.employmentCount} trend="0" isUp={true} period="LAST MONTH" link="/admin/employment" linkTitle="Manage Job Applications" />
          </div>

          <div className="grid lg:grid-cols-[1fr_420px] gap-8">
            {/* User List Module */}
            <div className="bg-white rounded-md border border-slate-200 shadow-md p-6 sm:p-8 overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                <h3 className="text-lg font-bold text-slate-900 whitespace-nowrap">User List</h3>
                <div className="relative w-full sm:w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search user names..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-700/5 focus:border-teal-700 transition-all"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-3 py-3 text-left text-[10px] font-bold text-teal-900 uppercase tracking-tighter">Full Name</th>
                      <th className="px-3 py-3 text-left text-[10px] font-bold text-teal-900 uppercase tracking-tighter">Email</th>
                      <th className="px-3 py-3 text-left text-[10px] font-bold text-teal-900 uppercase tracking-tighter">Role</th>
                      <th className="px-3 py-3 text-center text-[10px] font-bold text-teal-900 uppercase tracking-tighter">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredUsers.length > 0 ? filteredUsers.map((u, idx) => (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4 px-3">
                          <span className="text-sm font-semibold text-slate-800">{u.name}</span>
                        </td>
                        <td className="py-4 px-3 text-xs text-slate-500 font-medium">{u.email}</td>
                        <td className="py-4 px-3 text-xs">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${u.role === 'super_admin' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${u.isActive ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-400'}`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </motion.tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-slate-400 italic text-sm">No users matching "{searchQuery}" found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Customer Metrics Card with Dynamic Recharts */}
            <div className="bg-white rounded-md border border-slate-200 shadow-md p-6 sm:p-8 flex flex-col h-full min-h-[500px]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-slate-900 whitespace-nowrap">Customer Metrics</h3>
                <select
                  value={metricPeriod}
                  onChange={(e) => setMetricPeriod(e.target.value)}
                  className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer outline-none focus:border-teal-700 transition-all shadow-inner"
                >
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Yearly</option>
                </select>
              </div>

              {/* Dynamic Chart Area */}
              <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={currentChartData}
                    margin={{ top: 20, right: 30, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                      domain={[0, 'dataMax + 20%']}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                    />
                    <Bar
                      dataKey="quote"
                      fill="#0f766e"
                      radius={[4, 4, 0, 0]}
                      barSize={12}
                      animationDuration={1500}
                      animationBegin={200}
                    >
                      {currentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0f766e' : '#0d9488'} />
                      ))}
                    </Bar>
                    <Bar
                      dataKey="active"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      barSize={12}
                      animationDuration={1500}
                      animationBegin={400}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4 pt-8 border-t border-slate-100 mt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-md bg-teal-700" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Customers Requested For Quote</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">
                    {currentChartData.reduce((acc, curr) => acc + curr.quote, 0)} Units
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-md bg-teal-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Customers</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">
                    {currentChartData.reduce((acc, curr) => acc + curr.active, 0)} Units
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
