import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CreditCard, TrendingUp, ArrowUpRight, Activity, Wallet, PieChart as PieChartIcon, Bell, CheckCircle, Clock } from 'lucide-react';
import api from '../../../services/api';
import Loader from '../../../components/common/Loader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import Dropdown from '../../../components/ui/Dropdown';
import { useAdminSocket } from '../../../hooks/useAdminSocket';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pendingQueue, setPendingQueue] = useState<any>(null);
  
  // Real-time socket events
  const { activities } = useAdminSocket();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, queueRes] = await Promise.all([
          api.get('/api/admin/dashboard-stats'),
          api.get('/api/admin/pending-queue')
        ]);
        
        setStats(statsRes.data);
        setPendingQueue(queueRes.data.summary);
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Revenue', value: `₹ ${stats.totalRevenue.toLocaleString()}`, icon: <TrendingUp size={24} />, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+18.2%', path: '/admin/finance' },
    { title: 'Total Bookings', value: stats.totalBookings, icon: <CreditCard size={24} />, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+5.4%', path: '/admin/bookings' },
    { title: 'Active Users', value: stats.totalUsers, icon: <Users size={24} />, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+12.1%', path: '/admin/users' },
    { title: 'System Funds (Wallets)', value: `₹ ${stats.systemFunds.toLocaleString()}`, icon: <Wallet size={24} />, color: 'text-purple-600', bg: 'bg-purple-50', trend: 'Live', path: '/admin/ledger' },
  ];

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      {/* Header with Quick Actions */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Super Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Real-time overview of your platform's performance
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/admin/users')} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition shadow-sm">
            + Add Agent
          </button>
          <button onClick={() => toast.error('Global Markups settings coming soon!')} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition shadow-sm shadow-blue-500/30">
            Update Markups
          </button>
        </div>
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

      {/* Grid Layout for Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Revenue Analytics</h2>
              <p className="text-xs text-gray-500">Monthly revenue breakdown (Current Year)</p>
            </div>
            <div className="w-32">
              <Dropdown
                value="This Year"
                onChange={() => {}}
                options={[{ value: 'This Year', label: 'This Year' }]}
              />
            </div>
          </div>
          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

        {/* Revenue by Category (Donut) */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><PieChartIcon size={20} className="text-blue-600"/> Revenue by Service</h2>
            <p className="text-xs text-gray-500">Sales distribution across categories</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
            {stats.revenueByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.revenueByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.revenueByCategory.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: any) => `₹ ${value?.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm">No revenue data yet.</p>
            )}
            
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {stats.revenueByCategory.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-xs font-bold text-gray-700">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Activity Feed */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Activity size={20} className="text-blue-600"/> Live Activity</h2>
            <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse uppercase tracking-widest">Live</span>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <div 
                  key={index} 
                  onClick={() => { if (activity.type === 'USER') navigate('/admin/users'); }}
                  className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors animate-in fade-in slide-in-from-right-4 duration-300 cursor-pointer border border-transparent hover:border-gray-100 group"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform ${
                    activity.type === 'BOOKING' ? 'bg-green-100 text-green-600' :
                    activity.type === 'USER' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                  }`}>
                    {activity.type === 'BOOKING' ? <CheckCircle size={14} /> : <Users size={14} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-tight">{activity.message}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Clock size={10}/> {new Date(activity.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Bell size={32} className="mb-2 opacity-30" />
                <p className="text-sm font-medium">Waiting for new events...</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Agents */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 h-[400px] flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Top Agents</h2>
            <p className="text-xs text-gray-500">By total sales volume</p>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {stats.topAgents && stats.topAgents.length > 0 ? (
              <div className="flex flex-col gap-3">
                {stats.topAgents.map((agent: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-blue-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center shadow-sm">
                        {agent.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{agent.name}</h4>
                        <p className="text-xs text-gray-500 font-medium">Sales: <span className="text-gray-700 font-bold">{agent.sales}</span></p>
                      </div>
                    </div>
                    {idx === 0 && (
                      <div className="text-amber-600 bg-amber-50 px-2 py-1 rounded text-[10px] font-black border border-amber-200 uppercase tracking-widest">
                        #1 Agent
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Users size={32} className="mb-2 opacity-30" />
                <p className="text-sm font-medium">No sales data yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Approvals Widget */}
        <div className="lg:col-span-1 bg-gradient-to-br from-gray-900 to-blue-950 p-6 rounded-2xl shadow-xl text-white h-[400px] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="mb-6 relative z-10">
            <h2 className="text-lg font-black tracking-tight">Pending Actions</h2>
            <p className="text-xs text-blue-200">Items requiring your attention</p>
          </div>
          <div className="flex-1 flex flex-col justify-center gap-4 relative z-10">
            <div className="bg-white/10 hover:bg-white/20 transition cursor-pointer p-4 rounded-xl border border-white/10 flex justify-between items-center backdrop-blur-sm" onClick={() => navigate('/admin/manage-users')}>
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/30 p-2 rounded-lg text-blue-300"><Users size={18}/></div>
                <span className="font-bold text-sm">Agent KYC</span>
              </div>
              <span className="bg-red-500 text-white font-black text-xs px-2.5 py-1 rounded-full">{pendingQueue?.agents || 0}</span>
            </div>
            <div className="bg-white/10 hover:bg-white/20 transition cursor-pointer p-4 rounded-xl border border-white/10 flex justify-between items-center backdrop-blur-sm" onClick={() => navigate('/admin/offline-topups')}>
              <div className="flex items-center gap-3">
                <div className="bg-green-500/30 p-2 rounded-lg text-green-300"><Wallet size={18}/></div>
                <span className="font-bold text-sm">Wallet Top-ups</span>
              </div>
              <span className="bg-yellow-500 text-white font-black text-xs px-2.5 py-1 rounded-full">{pendingQueue?.topups || 0}</span>
            </div>
            <div className="bg-white/10 hover:bg-white/20 transition cursor-pointer p-4 rounded-xl border border-white/10 flex justify-between items-center backdrop-blur-sm" onClick={() => navigate('/admin/ledger')}>
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/30 p-2 rounded-lg text-purple-300"><ArrowUpRight size={18}/></div>
                <span className="font-bold text-sm">Withdrawals</span>
              </div>
              <span className="bg-blue-500 text-white font-black text-xs px-2.5 py-1 rounded-full">{pendingQueue?.withdrawals || 0}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
