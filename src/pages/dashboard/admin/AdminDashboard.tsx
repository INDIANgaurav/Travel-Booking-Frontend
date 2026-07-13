import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CreditCard, TrendingUp, ArrowUpRight, Activity, Globe, Package } from 'lucide-react';
import api from '../../../services/api';
import Loader from '../../../components/common/Loader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, bookings: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  // Mock data for charts (since we don't have historical backend data yet)
  const revenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Apr', revenue: 8000 },
    { name: 'May', revenue: 6000 },
    { name: 'Jun', revenue: 9000 },
    { name: 'Jul', revenue: 11000 },
  ];

  // Empty agent data until Phase 3 backend is connected
  const agentData: any[] = [];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, bookingsRes] = await Promise.all([
          api.get('/api/admin/users'),
          api.get('/api/admin/bookings')
        ]);
        
        const users = usersRes.data;
        const bookings = bookingsRes.data;
        
        const totalRevenue = bookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);
        
        setStats({
          users: users.length,
          bookings: bookings.length,
          revenue: totalRevenue
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Revenue', value: `₹ ${stats.revenue.toLocaleString()}`, icon: <TrendingUp size={24} />, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+18.2%', path: '/admin/finance' },
    { title: 'Total Bookings', value: stats.bookings, icon: <CreditCard size={24} />, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+5.4%', path: '/admin/bookings' },
    { title: 'Active Users', value: stats.users, icon: <Users size={24} />, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+12.1%', path: '/admin/users' },
    { title: 'API Requests (24h)', value: '14.2k', icon: <Activity size={24} />, color: 'text-amber-600', bg: 'bg-amber-50', trend: '+2.4%', path: '' },
  ];

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Super Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time overview of your platform's performance</p>
      </div>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div 
            key={index} 
            onClick={() => card.path && navigate(card.path)}
            className={`bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 hover:border-blue-200 transition-all flex flex-col justify-between group ${card.path ? 'cursor-pointer hover:shadow-md hover:-translate-y-1' : ''}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{card.title}</p>
                <h3 className="text-3xl font-black text-gray-900">{card.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
            </div>
            <p className="text-xs text-green-600 flex items-center mt-4 font-bold bg-green-50 w-fit px-2 py-1 rounded-md">
              <ArrowUpRight size={14} className="mr-1" /> {card.trend}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Revenue Analytics</h2>
              <p className="text-xs text-gray-500">Monthly revenue breakdown (Current Year)</p>
            </div>
            <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 font-medium text-gray-700 outline-none">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agent Performance Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Top Agents</h2>
            <p className="text-xs text-gray-500">By total sales volume (Demo Data)</p>
          </div>
          <div className="h-[300px] w-full">
            {agentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4b5563', fontWeight: 600 }} />
                  <RechartsTooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}/>
                  <Bar dataKey="sales" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Users size={32} className="mb-2 opacity-50" />
                <p className="text-sm font-medium">No agents registered yet.</p>
                <p className="text-xs">Data will appear once agents are added.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
