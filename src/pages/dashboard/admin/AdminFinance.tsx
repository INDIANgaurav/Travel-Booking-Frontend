import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, TrendingUp, TrendingDown, FileText, CreditCard } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import api from '../../../services/api';
import Loader from '../../../components/common/Loader';

export default function AdminFinance() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    flightRevenue: 0,
    hotelRevenue: 0
  });

  // Mock historical data for charts
  const monthlyRevenue = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Apr', revenue: 8000 },
    { name: 'May', revenue: 6000 },
    { name: 'Jun', revenue: 9000 },
    { name: 'Jul', revenue: 11000 },
  ];

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        // Fetch all bookings to calculate total revenue
        const bookingsRes = await api.get('/api/admin/bookings?limit=100000');
        // The API returns paginated data: { totalRecords, data: [...] }
        const bookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : (bookingsRes.data.data || []);

        let totalRev = 0;
        let flightRev = 0;
        let hotelRev = 0;
        let pendingRef = 0;

        bookings.forEach((b: any) => {
          if (b.status === 'CONFIRMED') {
            totalRev += (b.totalAmount || 0);
            if (b.type === 'FLIGHT') flightRev += (b.totalAmount || 0);
            if (b.type === 'HOTEL') hotelRev += (b.totalAmount || 0);
          }
        });

        setStats({
          totalRevenue: totalRev,
          flightRevenue: flightRev,
          hotelRevenue: hotelRev
        });
      } catch (err) {
        console.error("Error fetching finance data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFinanceData();
  }, []);

  const handleGenerateReport = () => {
    // Generate Enhanced CSV
    const dateStr = new Date().toLocaleString('en-IN');
    
    let csvContent = `TRAVELGO FINANCIAL HUB REPORT\n`;
    csvContent += `Generated On:,${dateStr}\n`;
    csvContent += `Report Type:,Summary Overview\n\n`;
    
    csvContent += `CATEGORY,AMOUNT (INR)\n`;
    
    const rows = [
      ['Total Revenue', stats.totalRevenue],
      ['Flight Revenue', stats.flightRevenue],
      ['Hotel Revenue', stats.hotelRevenue]
    ];
    
    rows.forEach(row => {
      csvContent += `${row[0]},${row[1]}\n`;
    });
    
    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `financial_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader />
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981'];

  const pieData = [
    { name: 'Flights', value: stats.flightRevenue },
    { name: 'Hotels', value: stats.hotelRevenue }
  ];

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">Financial Hub</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Track revenue, process refunds, and view service costs.</p>
        </div>
        <button 
          onClick={handleGenerateReport}
          className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <FileText size={18} />
          Generate Report
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <DollarSign size={24} className="text-emerald-600" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <TrendingUp size={14} /> +18.2%
            </span>
          </div>
          <p className="text-gray-500 font-medium text-sm">Total Revenue</p>
          <h3 className="text-2xl font-black text-gray-900 mt-1">₹ {stats.totalRevenue.toLocaleString()}</h3>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <CreditCard size={24} className="text-blue-600" />
            </div>
          </div>
          <p className="text-gray-500 font-medium text-sm">Flight Revenue</p>
          <h3 className="text-2xl font-black text-gray-900 mt-1">₹ {stats.flightRevenue.toLocaleString()}</h3>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <CreditCard size={24} className="text-indigo-600" />
            </div>
          </div>
          <p className="text-gray-500 font-medium text-sm">Hotel Revenue</p>
          <h3 className="text-2xl font-black text-gray-900 mt-1">₹ {stats.hotelRevenue.toLocaleString()}</h3>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Growth (Current Year)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dx={-10} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`₹ ${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Breakdown Pie Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Breakdown</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `₹ ${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {pieData.map((data, index) => (
              <div key={data.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-sm font-medium text-gray-700">{data.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {stats.totalRevenue > 0 ? ((data.value / stats.totalRevenue) * 100).toFixed(1) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

