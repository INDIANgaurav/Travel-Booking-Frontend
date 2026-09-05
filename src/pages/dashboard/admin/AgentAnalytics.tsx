import React, { useState, useEffect, useRef } from 'react';
import api from '../../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { Users, TrendingUp, DollarSign, Activity, Download, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import DateRangeFilter from '../../../components/ui/DateRangeFilter';

const AgentAnalytics = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      let url = '/api/reports/agent-analytics';
      if (startDate || endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await api.get(url);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    try {
      const canvas = await html2canvas(dashboardRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const currentDate = new Date().toISOString().split('T')[0];
      let filename = `Agent-Analytics-Report-${currentDate}`;
      if (startDate && endDate) filename += `_(${startDate}_to_${endDate})`;
      else if (startDate) filename += `_(${startDate}_onwards)`;
      else if (endDate) filename += `_(upto_${endDate})`;
      
      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleExportExcel = async () => {
    if (!data) return;
    try {
      const workbook = new ExcelJS.Workbook();
      
      // 1. All Agents Sheet (Primary Sheet)
      const agentsSheet = workbook.addWorksheet('All Agents Details');
      agentsSheet.columns = [
        { header: 'Agent Name', key: 'name', width: 30 },
        { header: 'Email', key: 'email', width: 35 },
        { header: 'Total Bookings', key: 'bookings', width: 15 },
        { header: 'Total Revenue (₹)', key: 'sales', width: 20 },
        { header: 'Commission (₹)', key: 'commission', width: 20 },
      ];
      
      if (data.allAgentsPerformance && data.allAgentsPerformance.length > 0) {
        data.allAgentsPerformance.forEach((agent: any) => {
          agentsSheet.addRow({ 
            name: agent.name || 'N/A', 
            email: agent.email || 'N/A',
            bookings: agent.totalBookings || 0, 
            sales: agent.totalSales || 0, 
            commission: agent.totalCommission || 0 
          });
        });
      } else {
        agentsSheet.addRow({ name: 'No agent data found for this period' });
      }

      // 2. Summary Sheet
      const summarySheet = workbook.addWorksheet('Overview Summary');
      summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 25 },
        { header: 'Value', key: 'value', width: 20 },
      ];
      summarySheet.addRow({ metric: 'Total Revenue', value: data.summary.totalRevenue });
      summarySheet.addRow({ metric: 'Total Commission', value: data.summary.totalCommission });
      summarySheet.addRow({ metric: 'Total Bookings', value: data.summary.totalBookings });
      summarySheet.addRow({ metric: 'Active Agents', value: data.activeAgentsCount });

      // 3. Daily Trends Sheet
      const trendsSheet = workbook.addWorksheet('Daily Trends');
      trendsSheet.columns = [
        { header: 'Date', key: 'date', width: 20 },
        { header: 'Bookings Count', key: 'count', width: 20 },
        { header: 'Revenue Amount', key: 'amount', width: 20 },
      ];
      if (data.bookingTrends && data.bookingTrends.length > 0) {
        data.bookingTrends.forEach((trend: any) => {
          trendsSheet.addRow({ date: trend.date, count: trend.count, amount: trend.amount });
        });
      } else {
        trendsSheet.addRow({ date: 'No trends for this period' });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const currentDate = new Date().toISOString().split('T')[0];
      let filename = `Agent-Analytics-Data-${currentDate}`;
      if (startDate && endDate) filename += `_(${startDate}_to_${endDate})`;
      else if (startDate) filename += `_(${startDate}_onwards)`;
      else if (endDate) filename += `_(upto_${endDate})`;
      
      saveAs(blob, `${filename}.xlsx`);
    } catch (error) {
      console.error('Error generating Excel:', error);
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
    <div className="p-8 bg-gray-50 min-h-screen" ref={dashboardRef}>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Agent Analytics</h1>
          <p className="text-gray-500 mt-2">Comprehensive performance overview of your travel agents.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportExcel}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md hover:scale-105 transition-all duration-200"
          >
            <FileText size={16} className="mr-2 text-green-600" />
            Export Excel
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm text-sm font-medium hover:bg-indigo-700 hover:shadow-md hover:scale-105 transition-all duration-200"
          >
            <Download size={16} className="mr-2" />
            Export PDF
          </button>
        </div>
      </div>
      
      <DateRangeFilter 
        fromDate={startDate}
        toDate={endDate}
        onFromChange={setStartDate}
        onToChange={setEndDate}
      />

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

      {/* Detailed Agents Table */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-6">All Agents Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Agent Name</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Email</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Total Bookings</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right">Total Revenue</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right">Commission</th>
              </tr>
            </thead>
            <tbody>
              {data.allAgentsPerformance && data.allAgentsPerformance.length > 0 ? (
                data.allAgentsPerformance.map((agent: any, index: number) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-gray-800">{agent.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{agent.email || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{agent.totalBookings}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">₹{agent.totalSales.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm font-medium text-emerald-600 text-right">₹{agent.totalCommission.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500 text-sm">No agent performance data found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgentAnalytics;
