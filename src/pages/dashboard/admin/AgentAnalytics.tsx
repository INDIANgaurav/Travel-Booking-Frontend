import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { Users, TrendingUp, DollarSign, Activity } from 'lucide-react';

const AgentAnalytics = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/agent-analytics');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!data) return <div className="p-6">Failed to load data</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Agent Analytics</h1>
        <p className="text-gray-500 mt-2">Comprehensive performance overview of your travel agents.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center transition-all hover:shadow-md hover:-translate-y-1">
          <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-4">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900">₹{data.summary.totalRevenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center transition-all hover:shadow-md hover:-translate-y-1">
          <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mr-4">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Commission</p>
            <h3 className="text-2xl font-bold text-gray-900">₹{data.summary.totalCommission.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center transition-all hover:shadow-md hover:-translate-y-1">
          <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mr-4">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Bookings</p>
            <h3 className="text-2xl font-bold text-gray-900">{data.summary.totalBookings.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center transition-all hover:shadow-md hover:-translate-y-1">
          <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 mr-4">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Agents</p>
            <h3 className="text-2xl font-bold text-gray-900">{data.activeAgentsCount}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top 5 Agents Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Top 5 Agents by Revenue</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topAgents} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(val) => `₹${val/1000}k`} />
                <RechartsTooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                />
                <Legend iconType="circle" />
                <Bar dataKey="totalSales" name="Total Revenue (₹)" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="totalCommission" name="Commission (₹)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Booking Trends Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Booking Volume (Last 30 Days)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.bookingTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} 
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
                  }}
                />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <RechartsTooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                />
                <Legend iconType="circle" />
                <Line yAxisId="left" type="monotone" dataKey="amount" name="Daily Revenue (₹)" stroke="#6366f1" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                <Line yAxisId="right" type="monotone" dataKey="count" name="Bookings Count" stroke="#f59e0b" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentAnalytics;
