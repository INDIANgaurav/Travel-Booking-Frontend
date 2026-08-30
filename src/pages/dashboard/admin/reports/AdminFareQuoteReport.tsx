import React, { useState } from 'react';
import { reportsApi } from '../../../../api/reportsApi';
import ReportHeader from '../../../../components/ui/ReportHeader';
import ReportTable from '../../../../components/ui/ReportTable';
import DateRangeFilter from '../../../../components/ui/DateRangeFilter';

export default function AdminFareQuoteReport() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('ALL');

  const headers = [
    'Sr No', 'Company Name', 'Sectors', 'Travel Date', 'Total Pax', 
    'Time', 'Channel', 'Type', 'Supplier'
  ];

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await reportsApi.getFareQuotes({ fromDate, toDate, searchBy: searchType, searchQuery });
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [fromDate, toDate, searchType, searchQuery]);

  const handleDownload = () => {
    if (!data || data.length === 0) {
      return;
    }
    import('../../../../utils/exportToCSV').then(({ exportToCSV }) => {
      exportToCSV(data, 'Fare_Quote_Report');
    });
  };

  const renderRow = (row: any) => (
    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-6 py-4">{row.srNo}</td>
      <td className="px-6 py-4 font-bold text-slate-800">{row.company}</td>
      <td className="px-6 py-4">{row.sectors}</td>
      <td className="px-6 py-4">{row.travelDate}</td>
      <td className="px-6 py-4 font-bold text-indigo-700">{row.pax}</td>
      <td className="px-6 py-4">{row.time}</td>
      <td className="px-6 py-4">{row.channel}</td>
      <td className="px-6 py-4">{row.type}</td>
      <td className="px-6 py-4">{row.supplier}</td>
    </tr>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full overflow-hidden pb-20">
      <ReportHeader 
        title="User Fare Quote Details Reports" 
        description="Track all agent flight searches, quotes, and pricing requests"
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
          selectedSearchType={searchType}
          onSearchTypeChange={setSearchType}
          searchOptions={[
            { value: 'ALL', label: '- Search By -' },
            { value: 'AGENCY', label: 'Agency ID' }
          ]}
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
          emptyMessage="No fare quotes found for this period"
        />
      )}
    </div>
  );
}
