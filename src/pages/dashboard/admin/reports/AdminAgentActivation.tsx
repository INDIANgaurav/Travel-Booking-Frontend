import React, { useState, useEffect } from 'react';
import ReportHeader from '../../../../components/ui/ReportHeader';
import ReportTable from '../../../../components/ui/ReportTable';
import DateRangeFilter from '../../../../components/ui/DateRangeFilter';
import { reportsApi } from '../../../../api/reportsApi';
import { exportToCSV } from '../../../../utils/exportToCSV';
import toast from 'react-hot-toast';

export default function AdminAgentActivation() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const headers = [
    'Staff-Id', 'Name', 'Mobile No', 'Email Id', 'Role Name', 'Status', 
    'Cash Balance', 'Credit Balance', 'Branch Name', 'Street / Lane', 
    'City', 'Country', 'State', 'Pin Code', 'Landline', 'Fax', 'Creation Date'
  ];

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await reportsApi.getAgentActivation({
        fromDate,
        toDate,
      });
      if (res.success) {
        setData(res.data);
      }
    } catch (error: any) {
      toast.error('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fromDate, toDate]);

  const handleDownload = () => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }
    exportToCSV(data, 'Agent_Activation_Report');
    toast.success('Report exported successfully');
  };

  const renderRow = (row: any) => (
    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-6 py-4">{row.staffId}</td>
      <td className="px-6 py-4 font-bold text-slate-800">{row.name}</td>
      <td className="px-6 py-4">{row.mobile}</td>
      <td className="px-6 py-4">{row.email}</td>
      <td className="px-6 py-4">{row.role}</td>
      <td className="px-6 py-4">
        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">{row.status}</span>
      </td>
      <td className="px-6 py-4 font-bold text-indigo-700">₹ {row.cash}</td>
      <td className="px-6 py-4 font-bold text-orange-600">₹ {row.credit}</td>
      <td className="px-6 py-4">{row.branch}</td>
      <td className="px-6 py-4">{row.street}</td>
      <td className="px-6 py-4">{row.city}</td>
      <td className="px-6 py-4">{row.country}</td>
      <td className="px-6 py-4">{row.state}</td>
      <td className="px-6 py-4">{row.pin}</td>
      <td className="px-6 py-4">{row.landline}</td>
      <td className="px-6 py-4">{row.fax}</td>
      <td className="px-6 py-4">{row.creationDate}</td>
    </tr>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full overflow-hidden pb-20">
      <ReportHeader 
        title="Agent Activation Reports" 
        description="Detailed demographic and balance view for all agents"
        onDownload={handleDownload}
      />

      <div className="flex-1 mb-6">
        <DateRangeFilter
          fromDate={fromDate}
          toDate={toDate}
          onFromChange={setFromDate}
          onToChange={setToDate}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <ReportTable 
          headers={headers}
          data={data}
          renderRow={renderRow}
          emptyMessage="No agent activation records found for this period"
        />
      )}
    </div>
  );
}
