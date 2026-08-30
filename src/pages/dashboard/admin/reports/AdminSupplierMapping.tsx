import React, { useState } from 'react';
import ReportHeader from '../../../../components/ui/ReportHeader';
import ReportTable from '../../../../components/ui/ReportTable';
import { Search } from 'lucide-react';
import { reportsApi } from '../../../../api/reportsApi';

export default function AdminSupplierMapping() {
  const [searchQuery, setSearchQuery] = useState('');

  const headers = [
    'Company', 'Contact', 'Domain', 'Supplier/Commission Plan'
  ];

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await reportsApi.getSupplierMapping({ searchQuery });
      if (res.success) {
        setData(res.data);
        setTotal(res.total);
      }
    } catch (error: any) {
      // toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [searchQuery]);

  const handleDownload = () => {
    if (!data || data.length === 0) {
      return;
    }
    import('../../../../utils/exportToCSV').then(({ exportToCSV }) => {
      exportToCSV(data, 'Supplier_Mapping_Report');
    });
  };

  const renderRow = (row: any) => (
    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-6 py-4 font-bold text-slate-800">{row.company}</td>
      <td className="px-6 py-4">{row.contact}</td>
      <td className="px-6 py-4 text-indigo-600">{row.domain}</td>
      <td className="px-6 py-4">
        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200">
          {row.plan}
        </span>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full overflow-hidden pb-20">
      <ReportHeader 
        title="View all Suppliers" 
        description="Supplier and Commission Plan mapping directory"
        onDownload={handleDownload}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100/60 w-full mb-6">
        <span className="text-sm font-bold text-slate-500">Showing {data.length} of {total} Results</span>
        
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Company</label>
          <div className="relative w-64">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-4 pr-10 py-2 bg-slate-50/50 border border-slate-200/80 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
            <button className="absolute right-2 top-1.5 p-1 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-600 transition-colors">
              <Search size={14} />
            </button>
          </div>
        </div>
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
          emptyMessage="No suppliers found"
        />
      )}
    </div>
  );
}
