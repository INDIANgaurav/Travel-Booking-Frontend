import React, { useState } from 'react';
import { Search, Download, Users, Plane, Calendar, UserCheck, Loader2 } from 'lucide-react';
import api from '../../../services/api';
import DOBCalendar from '../../../components/ui/DOBCalendar';
import toast from 'react-hot-toast';

interface IPassenger {
  id: string;
  title: string;
  gender: string;
  firstName: string;
  lastName: string;
  dob: string;
  type: string;
  pnr: string;
  ticketId: string;
  passportNo: string;
  passportExpiry: string;
  passportIssuance: string;
  remarks: string;
}

interface IFDDetails {
  flight: string;
  sector: string;
  travelDate: string;
  pnr: string;
}

export default function AdminFDReport() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [airline, setAirline] = useState('');
  const [pnrSearch, setPnrSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [passengers, setPassengers] = useState<IPassenger[]>([]);
  const [fdDetails, setFdDetails] = useState<IFDDetails | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pnrSearch) {
      setError('Please enter a PNR or FARE ID to search.');
      return;
    }
    
    setIsSearching(true);
    setError('');
    
    try {
      // Assuming pnrSearch holds the sfId for the backend route
      const { data } = await api.get(`/api/series-fare/report/manifest/${pnrSearch}`);
      setPassengers(data.manifest || []);
      setFdDetails(data.seriesFare || null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch manifest. Please check the ID.');
      setPassengers([]);
      setFdDetails(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleExportToExcel = () => {
    if (passengers.length === 0) return toast.error('No data to export');
    
    const headers = ['Sr. No.', 'Pax ID', 'Title', 'First Name', 'Last Name', 'Gender', 'DOB', 'Type', 'PNR', 'Ticket ID', 'Passport No', 'Passport Expiry', 'Passport Issuance', 'Remarks'];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + passengers.map((p, index) => 
          `${index + 1},${p.id},${p.title},${p.firstName},${p.lastName},${p.gender},${p.dob},${p.type},${p.pnr},${p.ticketId},${p.passportNo},${p.passportExpiry},${p.passportIssuance},${p.remarks}`
        ).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Manifest_${fdDetails?.flight || 'Report'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report downloaded');
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Users className="text-blue-600" />
            FD Passenger Manifest
          </h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Detailed Report of Fixed Departure Bookings</p>
        </div>
        
        <button onClick={handleExportToExcel} className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
          <Download size={16} />
          Export to Excel
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">From Date</label>
            <DOBCalendar 
              value={fromDate}
              onChange={setFromDate}
              placeholder="Select from date..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">To Date</label>
            <DOBCalendar 
              value={toDate}
              onChange={setToDate}
              placeholder="Select to date..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Airline</label>
            <select 
              value={airline}
              onChange={(e) => setAirline(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">-- All Airlines --</option>
              <option value="6E">IndiGo (6E)</option>
              <option value="AI">Air India (AI)</option>
              <option value="QP">Akasa Air (QP)</option>
              <option value="SG">SpiceJet (SG)</option>
            </select>
          </div>
          <div className="space-y-1 lg:col-span-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase">PNR Reference</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Enter PNR or FARE ID..."
              value={pnrSearch}
              onChange={(e) => setPnrSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono uppercase"
            />
          </div>
        </div>
        <div>
          <button 
            type="submit"
            disabled={isSearching}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center justify-center min-h-[36px]"
          >
            {isSearching ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
          </button>
        </div>
      </form>
      {error && <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">{error}</div>}
    </div>

    {/* Results Header */}
    {fdDetails && (
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 text-blue-900">
        <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-lg shadow-sm border border-blue-100 w-full sm:w-auto">
          <Plane className="text-blue-500" size={18} />
          <div>
            <span className="block text-[10px] font-bold text-gray-500 uppercase">Flight / Sector</span>
            <span className="font-black text-sm">{fdDetails.flight} <span className="mx-2 text-gray-300">|</span> {fdDetails.sector}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-lg shadow-sm border border-blue-100 w-full sm:w-auto">
          <Calendar className="text-blue-500" size={18} />
          <div>
            <span className="block text-[10px] font-bold text-gray-500 uppercase">Journey Date</span>
            <span className="font-black text-sm">{new Date(fdDetails.travelDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-lg shadow-sm border border-blue-100 w-full sm:w-auto">
          <UserCheck className="text-blue-500" size={18} />
          <div>
            <span className="block text-[10px] font-bold text-gray-500 uppercase">Master PNR</span>
            <span className="font-black text-sm font-mono tracking-widest text-blue-600">{fdDetails.pnr}</span>
          </div>
        </div>
      </div>
    )}

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f8fafc] text-gray-900 font-black border-b border-gray-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3 w-12 text-center">S.NO</th>
                <th className="p-3">TITLE</th>
                <th className="p-3">FIRST NAME</th>
                <th className="p-3">LAST NAME</th>
                <th className="p-3">GENDER</th>
                <th className="p-3">TYPE</th>
                <th className="p-3">DOB</th>
                <th className="p-3 text-center">PNR</th>
                <th className="p-3">PASSPORT NO.</th>
                <th className="p-3">PASSPORT EXP</th>
                <th className="p-3">REMARKS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {passengers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-gray-500 font-bold">No passengers found. Search for a valid FARE ID to see the manifest.</td>
                </tr>
              ) : passengers.map((pax, index) => (
                <tr key={pax.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="p-3 text-center font-bold text-gray-500">{index + 1}</td>
                  <td className="p-3 text-gray-600 font-medium">{pax.title}</td>
                  <td className="p-3 font-bold text-gray-900 uppercase">{pax.firstName}</td>
                  <td className="p-3 font-bold text-gray-900 uppercase">{pax.lastName}</td>
                  <td className="p-3 text-gray-600">{pax.gender}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      pax.type === 'Adult' || pax.type === 'ADULT' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                      {pax.type}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">{pax.dob || '-'}</td>
                  <td className="p-3 text-center font-mono font-bold text-blue-600">{pax.pnr}</td>
                  <td className="p-3 text-gray-600">{pax.passportNo || '-'}</td>
                  <td className="p-3 text-gray-600">{pax.passportExpiry || '-'}</td>
                  <td className="p-3 text-gray-400 italic">{pax.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
