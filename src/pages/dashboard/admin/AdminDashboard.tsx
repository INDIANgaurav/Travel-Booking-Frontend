import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CreditCard, TrendingUp, ArrowUpRight, Activity, Globe, Package } from 'lucide-react';
import api from '../../../services/api';
import Loader from '../../../components/common/Loader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import Dropdown from '../../../components/ui/Dropdown';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, bookings: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  const [revenueData, setRevenueData] = useState<any[]>([]);

  const [agentData, setAgentData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, bookingsRes] = await Promise.all([
          api.get('/api/admin/users'),
          api.get('/api/admin/bookings')
        ]);
        
        const users = usersRes.data;
        const bookings = bookingsRes.data;
        
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const revMap: Record<string, number> = {};
        
        let totalRevenue = 0;
        bookings.forEach((b: any) => {
          if (b.status === 'CONFIRMED') {
            totalRevenue += (b.totalAmount || 0);
            if (b.createdAt) {
              const date = new Date(b.createdAt);
              const monthName = months[date.getMonth()];
              revMap[monthName] = (revMap[monthName] || 0) + (b.totalAmount || 0);
            }
          }
        });
        
        const formattedRevData = Object.entries(revMap).map(([name, revenue]) => ({ name, revenue }));
        formattedRevData.sort((a, b) => months.indexOf(a.name) - months.indexOf(b.name));
        
        // If there's no data, give an empty state or just show the current month
        if (formattedRevData.length === 0) {
           const currentMonth = months[new Date().getMonth()];
           formattedRevData.push({ name: currentMonth, revenue: 0 });
        }
        
        setRevenueData(formattedRevData);
        
        setStats({
          users: users.length,
          bookings: bookings.length,
          revenue: totalRevenue
        });

        // Filter for agents and map them for the chart
        const agentsList = users.filter((u: any) => u.role?.toUpperCase() === 'TRAVEL_AGENT');
        if (agentsList.length > 0) {
          const mapped = agentsList.map((a: any) => ({
            name: a.name?.split(' ')[0] || 'Agent', // First name for short labels
            sales: Math.floor(Math.random() * 50) + 10 // Mock sales data for now
          }));
          setAgentData(mapped);
        }
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
    { title: 'API Requests (24h)', value: 'Coming Soon', icon: <Activity size={24} />, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Pending', path: '' },
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
            <div className="w-32">
              <Dropdown
                value="This Year"
                onChange={() => {}}
                options={[
                  { value: 'This Year', label: 'This Year' },
                  { value: 'Last Year', label: 'Last Year' }
                ]}
              />
            </div>
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
              <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: '280px' }}>
                {agentData.map((agent, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-blue-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center shadow-sm">
                        {agent.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{agent.name}</h4>
                        <p className="text-xs text-gray-500 font-medium">Sales Count: <span className="text-gray-700 font-bold">{agent.sales}</span></p>
                      </div>
                    </div>
                    {idx === 0 && (
                      <div className="text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs font-bold border border-amber-200">
                        #1 Agent
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
