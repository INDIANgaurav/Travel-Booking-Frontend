import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Copy, Check, Search, Filter, ArrowLeftRight, Calendar, UserCheck, ArrowLeft, X, Plane, RefreshCw } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import api from '../../services/api';
import Dropdown from '../../components/ui/Dropdown';
import DOBCalendar from '../../components/ui/DOBCalendar';
import CityPicker from '../../components/common/CityPicker';
import toast from 'react-hot-toast';

interface ISeriesFare {
  _id: string;
  sfId: string;
  airline: string;
  airlinePnr: string;
  bookingType: 'ONE_WAY' | 'ROUND_TRIP';
  origin: string;
  destination: string;
  flightNo: string;
  departureTime: string;
  arrivalTime: string;
  travelDate: string;
  adtFare: number;
  chdFare: number;
  infFare: number;
  agentCommission: number;
  totalSeats: number;
  availableSeats: number;
  realtimeBook: boolean;
  status: 'Active' | 'Inactive' | 'SoldOut';
}

const CitySelect = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder?: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(true)}
        className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white font-bold uppercase cursor-pointer min-h-[34px] flex items-center"
      >
        {value || placeholder}
      </div>
      {isOpen && (
        <div className="absolute top-[100%] mt-1 left-0 z-[60]">
          <CityPicker 
            value={value} 
            onChange={(code) => {
              onChange(code);
              setIsOpen(false);
            }} 
            onClose={() => setIsOpen(false)} 
            title="SELECT CITY" 
          />
        </div>
      )}
    </div>
  );
};

const SeriesFareManager: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const supplierName = (user as any)?.companyName || user?.name || (user as any)?.firstName || 'Supplier';

  const [fares, setFares] = useState<ISeriesFare[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editFlags, setEditFlags] = useState({
    adtFare: false,
    commission: false,
    chdFare: false,
    infFare: false,
    totalSeat: false,
    availSeat: false,
    airPnr: false,
  });
  const [editBuffer, setEditBuffer] = useState<Partial<ISeriesFare>>({});

  const handleToggleExpand = (fare: ISeriesFare) => {
    if (expandedId === fare._id) {
      setExpandedId(null);
    } else {
      setExpandedId(fare._id);
      setEditFlags({
        adtFare: false,
        commission: false,
        chdFare: false,
        infFare: false,
        totalSeat: false,
        availSeat: false,
        airPnr: false,
      });
      setEditBuffer(fare);
    }
  };

  // Filters
  const [travelDateFilter, setTravelDateFilter] = useState('');
  const [airlineFilter, setAirlineFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState(supplierName);
  const [travelTypeFilter, setTravelTypeFilter] = useState('All');
  const [moreOptionsFilter, setMoreOptionsFilter] = useState('Active');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [travelClassAdd, setTravelClassAdd] = useState('ECONOMY');
  const [newFare, setNewFare] = useState({
    airline: '',
    airlinePnr: '',
    bookingType: 'ONE_WAY' as 'ONE_WAY' | 'ROUND_TRIP',
    origin: '',
    destination: '',
    flightNo: '',
    departureTime: '',
    arrivalTime: '',
    departureTerminal: '',
    arrivalTerminal: '',
    duration: '',
    stopOver: 0,
    dayChange: 0,
    travelDate: '',
    adtFare: '' as number | '',
    chdFare: '' as number | '',
    infFare: '' as number | '',
    agentCommission: '' as number | '',
    totalSeats: '' as number | '',
    availableSeats: '' as number | '',
    realtimeBook: false,
    status: 'Active',
    runningDays: [ ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date().getDay()] ],
    closeBeforeDepartureDays: '' as number | '',
    closeBeforeDepartureHours: '' as number | ''
  });

  useEffect(() => {
    if (newFare.departureTime && newFare.arrivalTime) {
      const [depH, depM] = newFare.departureTime.split(':').map(Number);
      const [arrH, arrM] = newFare.arrivalTime.split(':').map(Number);
      if (!isNaN(depH) && !isNaN(arrH)) {
        let depTotalMins = depH * 60 + depM;
        let arrTotalMins = arrH * 60 + arrM;
        let calculatedDayChange = 0;
        if (arrTotalMins < depTotalMins) {
          arrTotalMins += 24 * 60;
          calculatedDayChange = 1;
        }
        const diffMins = arrTotalMins - depTotalMins;
        const durH = Math.floor(diffMins / 60);
        const durM = diffMins % 60;
        const durationStr = `${durH.toString().padStart(2, '0')}:${durM.toString().padStart(2, '0')}`;
        
        if ((newFare as any).duration !== durationStr || (newFare as any).dayChange !== calculatedDayChange) {
          setNewFare(prev => ({
            ...prev,
            duration: durationStr,
            dayChange: calculatedDayChange
          } as any));
        }
      }
    }
  }, [newFare.departureTime, newFare.arrivalTime]);

  useEffect(() => {
    fetchFares();
  }, []);

  const fetchFares = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (travelDateFilter) params.append('date', travelDateFilter);
      if (airlineFilter) params.append('airline', airlineFilter);
      if (moreOptionsFilter === 'Active') params.append('status', 'Active');
      
      const response = await api.get(`/api/series-fare?${params.toString()}`);
      if (Array.isArray(response.data)) {
        setFares(response.data);
      } else {
        setFares([]);
      }
    } catch (e) {
      setFares([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFare = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/series-fare', newFare);
      if (response.data) {
        setFares(prev => [response.data, ...(Array.isArray(prev) ? prev : [])]);
      }
    } catch (err) {
      const mockCreated: ISeriesFare = {
        _id: Date.now().toString(),
        sfId: Math.floor(5000 + Math.random() * 1000).toString(),
        ...newFare as any,
        status: 'Active' as const
      };
      setFares(prev => [mockCreated, ...(Array.isArray(prev) ? prev : [])]);
    }
    setShowAddModal(false);
  };

  const handleSaveEdit = async () => {
    if (!expandedId) return;
    try {
      await api.put(`/api/series-fare/${expandedId}`, editBuffer);
      setFares(prev => (Array.isArray(prev) ? prev : []).map(f => (f._id === expandedId ? { ...f, ...editBuffer } : f)));
      toast.success('Price updated!');
    } catch (err) {
      setFares(prev => (Array.isArray(prev) ? prev : []).map(f => (f._id === expandedId ? { ...f, ...editBuffer } : f)));
      toast.success('Price updated locally (mock)');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Series Fare?')) return;
    try {
      await api.delete(`/api/series-fare/${id}`);
      setFares(prev => (Array.isArray(prev) ? prev : []).filter(f => f._id !== id));
    } catch (err) {
      setFares(prev => (Array.isArray(prev) ? prev : []).filter(f => f._id !== id));
    }
  };

  const safeFares = Array.isArray(fares) ? fares : [];

  const filteredFares = safeFares.filter(f => {
    if (airlineFilter && !f.airline.toLowerCase().includes(airlineFilter.toLowerCase())) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return f.sfId.toLowerCase().includes(q) || f.airlinePnr.toLowerCase().includes(q) || f.origin.toLowerCase().includes(q) || f.destination.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white border-l-4 border-[#1d6aa3] p-5 rounded-xl shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-[#0b1031] tracking-wide uppercase">Series Fare Manager</h2>
          <p className="text-xs text-gray-500 font-medium mt-1">Manage and update your flight inventory efficiently</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#1d6aa3] hover:bg-[#155685] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold text-sm transition-all shadow-md"
          title="Add New Series Fare"
        >
          <Plus size={18} />
          Add New Fare
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(5,1fr)_auto] gap-5">
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">Travel Date</label>
            <input 
              type="date" 
              value={travelDateFilter}
              onChange={e => setTravelDateFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">Travel Type *</label>
            <Dropdown 
              value={travelTypeFilter}
              onChange={setTravelTypeFilter}
              options={[
                { value: 'All', label: 'All' },
                { value: 'ONE_WAY', label: 'One Way' },
                { value: 'ROUND_TRIP', label: 'Round Trip' }
              ]}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">Airline *</label>
            <input 
              type="text" 
              placeholder="e.g. Akasa Air"
              value={airlineFilter}
              onChange={e => setAirlineFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">Supplier *</label>
            <Dropdown 
              value={supplierFilter}
              onChange={setSupplierFilter}
              options={[
                { value: supplierName, label: supplierName }
              ]}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">More Options</label>
            <Dropdown 
              value={moreOptionsFilter}
              onChange={setMoreOptionsFilter}
              options={[
                { value: 'Active', label: 'Show Active Inventory' },
                { value: 'All', label: 'Show All' }
              ]}
            />
          </div>

          <div className="flex items-end">
            <button 
              onClick={fetchFares}
              className="bg-[#0b1031] text-white text-xs font-bold px-8 py-2 rounded-lg hover:bg-gray-900 transition-all h-[36px] w-full lg:w-auto shadow-sm"
            >
              Fetch
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <div className="relative max-w-xs w-full">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search By SF ID, PNR, Origin..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 font-semibold">
            <span>{filteredFares.length} Records Found</span>
            <button 
              onClick={fetchFares}
              className={`p-1.5 hover:bg-gray-100 rounded-md text-gray-600 transition-all cursor-pointer border border-transparent hover:border-gray-200 ${loading ? 'animate-spin text-blue-600' : ''}`}
              title="Refresh Fares"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Series Fare Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f8fafc] text-[#0b1031] font-black border-b border-gray-200">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="p-3 w-20">ACTIONS</th>
                <th className="p-3">SF ID</th>
                <th className="p-3">AIRLINE</th>
                <th className="p-3">AIRLINE PNR</th>
                <th className="p-3">BOOKING TYPE</th>
                <th className="p-3">ORIGIN</th>
                <th className="p-3">DESTINATION</th>
                <th className="p-3">FLIGHT DETAILS</th>
                <th className="p-3">JOURNEY DETAILS</th>
                <th className="p-3 text-center">TOTAL SEAT</th>
                <th className="p-3 text-center">AVAILABLE SEAT</th>
                <th className="p-3 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFares.map(fare => {
                const isExpanded = expandedId === fare._id;
                const formattedDate = new Date(fare.travelDate).toLocaleDateString('en-GB');

                return (
                  <React.Fragment key={fare._id}>
                    <tr className={`hover:bg-blue-50/50 transition-colors ${isExpanded ? 'bg-blue-50/80 font-medium' : ''}`}>
                      <td className="p-3 text-center">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="p-3 flex items-center gap-2">
                        <button 
                          onClick={() => setExpandedId(isExpanded ? null : fare._id)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="Edit Fares & Seats"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(fare._id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                      <td className="p-3 font-bold text-blue-600">{fare.sfId}</td>
                      <td className="p-3 font-bold text-gray-800">{fare.airline}</td>
                      <td className="p-3 font-bold text-gray-900 uppercase">{fare.airlinePnr}</td>
                      <td className="p-3 font-semibold text-gray-600">{fare.bookingType}</td>
                      <td className="p-3 font-bold">{fare.origin}</td>
                      <td className="p-3 font-bold">{fare.destination}</td>
                      <td className="p-3 text-gray-600 font-mono">{fare.flightNo}</td>
                      <td className="p-3 text-gray-600">
                        {formattedDate} - {fare.departureTime}-{fare.arrivalTime}
                        <button 
                          onClick={() => setExpandedId(isExpanded ? null : fare._id)}
                          className="ml-2 text-blue-600 font-bold hover:underline"
                        >
                          {isExpanded ? 'Hide' : 'Duplicate / Edit'}
                        </button>
                      </td>
                      <td className="p-3 text-center font-bold text-gray-800">{fare.totalSeats}</td>
                      <td className="p-3 text-center font-bold text-blue-600">{fare.availableSeats}</td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 bg-[#f0f7ff] text-[#1d6aa3] px-2 py-0.5 rounded-md text-[10px] font-bold border border-[#1d6aa3]/20">
                          <UserCheck size={12} />
                          {fare.status}
                        </span>
                      </td>
                    </tr>

                    {/* Inline Fare & Seat Manager Drawer */}
                    {isExpanded && (
                      <tr className="bg-[#f8fafc] border-b-2 border-[#1d6aa3]">
                        <td colSpan={13} className="p-5">
                          <div className="bg-white rounded-xl shadow-lg border border-[#1d6aa3]/20 overflow-hidden space-y-4 p-5">
                            {/* Card Header Summary */}
                            <div className="bg-[#f0f7ff] text-[#0b1031] p-4 rounded-lg flex items-center justify-between border border-[#1d6aa3]/20">
                              <div className="grid grid-cols-8 gap-4 text-xs font-bold w-full items-center">
                                <div><span className="block text-[9px] opacity-75">SF ID</span>{fare.sfId}</div>
                                <div><span className="block text-[9px] opacity-75">Airline</span>{fare.airline}</div>
                                <div><span className="block text-[9px] opacity-75">Origin</span>{fare.origin}</div>
                                <div><span className="block text-[9px] opacity-75">Destination</span>{fare.destination}</div>
                                <div><span className="block text-[9px] opacity-75">Flight Details</span>{fare.flightNo}</div>
                                <div><span className="block text-[9px] opacity-75">Journey Details</span>{formattedDate} {fare.departureTime}-{fare.arrivalTime}</div>
                                <div><span className="block text-[9px] opacity-75">Total Seats</span>{fare.totalSeats}</div>
                                <div><span className="block text-[9px] opacity-75">Available Seats</span>{fare.availableSeats}</div>
                              </div>
                                <button 
                                  onClick={() => handleToggleExpand(fare)}
                                  className="w-8 h-8 rounded-full bg-[#0b1031] text-white flex items-center justify-center hover:bg-gray-800 shrink-0 ml-4 shadow transition-all"
                                  title="Close Drawer"
                                >
                                ←
                              </button>
                            </div>

                            {/* Inner Controls Table */}
                            <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-inner">
                              <table className="w-full text-xs text-left">
                                <thead className="bg-[#f8fafc] text-[#0b1031] font-black text-[10px] uppercase border-b border-gray-300">
                                  <tr>
                                    <th className="p-2.5 w-10 text-center">S.NO</th>
                                    <th className="p-2.5 w-10 text-center"><input type="checkbox" className="rounded" /></th>
                                    <th className="p-2.5 w-20">
                                      <button 
                                        onClick={handleSaveEdit}
                                        className="bg-[#2e1065] text-white text-[10px] font-bold px-3 py-1 rounded-md hover:bg-purple-900 shadow-sm transition"
                                      >
                                        Change
                                      </button>
                                    </th>
                                    <th className="p-2.5">TRAVEL DATE</th>
                                    <th className="p-2.5">DEPARTURE</th>
                                    <th className="p-2.5">ARRIVAL</th>
                                    <th className="p-2.5"><div className="flex items-center gap-1.5">ADT FARE<input type="checkbox" className="rounded text-blue-600" checked={editFlags.adtFare} onChange={e => setEditFlags({ ...editFlags, adtFare: e.target.checked })} /></div></th>
                                    <th className="p-2.5"><div className="flex items-center gap-1.5">COMMISSION<input type="checkbox" className="rounded text-blue-600" checked={editFlags.commission} onChange={e => setEditFlags({ ...editFlags, commission: e.target.checked })} /></div></th>
                                    <th className="p-2.5"><div className="flex items-center gap-1.5">CHD FARE<input type="checkbox" className="rounded text-blue-600" checked={editFlags.chdFare} onChange={e => setEditFlags({ ...editFlags, chdFare: e.target.checked })} /></div></th>
                                    <th className="p-2.5"><div className="flex items-center gap-1.5">INF FARE<input type="checkbox" className="rounded text-blue-600" checked={editFlags.infFare} onChange={e => setEditFlags({ ...editFlags, infFare: e.target.checked })} /></div></th>
                                    <th className="p-2.5"><div className="flex items-center justify-center gap-1.5">TOTAL SEAT<input type="checkbox" className="rounded text-blue-600" checked={editFlags.totalSeat} onChange={e => setEditFlags({ ...editFlags, totalSeat: e.target.checked })} /></div></th>
                                    <th className="p-2.5"><div className="flex items-center justify-center gap-1.5">AVAIL SEAT<input type="checkbox" className="rounded text-blue-600" checked={editFlags.availSeat} onChange={e => setEditFlags({ ...editFlags, availSeat: e.target.checked })} /></div></th>
                                    <th className="p-2.5 text-center">REALTIME BOOK</th>
                                    <th className="p-2.5"><div className="flex items-center gap-1.5">AIR PNR<input type="checkbox" className="rounded text-blue-600" checked={editFlags.airPnr} onChange={e => setEditFlags({ ...editFlags, airPnr: e.target.checked })} /></div></th>
                                    <th className="p-2.5 text-center">STATUS</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white text-xs">
                                  <tr className="hover:bg-blue-50/40">
                                    <td className="p-2.5 text-center font-bold text-gray-700">1</td>
                                    <td className="p-2.5 text-center"><input type="checkbox" className="rounded" /></td>
                                    <td className="p-2.5"></td>
                                    <td className="p-2.5 font-bold text-blue-600">{formattedDate}</td>
                                    <td className="p-2.5 font-mono">{fare.departureTime}</td>
                                    <td className="p-2.5 font-mono">{fare.arrivalTime}</td>
                                    <td className="p-2.5">
                                      <input 
                                        type="number" 
                                        value={editBuffer.adtFare === 0 ? '' : (editBuffer.adtFare ?? fare.adtFare)}
                                        onChange={e => setEditBuffer({ ...editBuffer, adtFare: e.target.value === '' ? ('' as any) : Number(e.target.value) })}
                                        disabled={!editFlags.adtFare}
                                        className={`w-20 px-2 py-1 border border-gray-300 rounded font-bold text-xs ${!editFlags.adtFare ? 'bg-gray-100 text-gray-500' : 'text-gray-900 bg-white'}`}
                                      />
                                    </td>
                                    <td className="p-2.5">
                                      <input 
                                        type="number" 
                                        value={editBuffer.agentCommission === 0 ? '' : (editBuffer.agentCommission ?? fare.agentCommission ?? 0)}
                                        onChange={e => setEditBuffer({ ...editBuffer, agentCommission: e.target.value === '' ? ('' as any) : Number(e.target.value) })}
                                        disabled={!editFlags.commission}
                                        className={`w-16 px-2 py-1 border border-gray-300 rounded font-bold text-xs ${!editFlags.commission ? 'bg-gray-100 text-gray-500' : 'text-emerald-600 bg-white'}`}
                                        title="Agent Commission"
                                      />
                                    </td>
                                    <td className="p-2.5">
                                      <input 
                                        type="number" 
                                        value={editBuffer.chdFare === 0 ? '' : (editBuffer.chdFare ?? fare.chdFare)}
                                        onChange={e => setEditBuffer({ ...editBuffer, chdFare: e.target.value === '' ? ('' as any) : Number(e.target.value) })}
                                        disabled={!editFlags.chdFare}
                                        className={`w-20 px-2 py-1 border border-gray-300 rounded font-bold text-xs ${!editFlags.chdFare ? 'bg-gray-100 text-gray-500' : 'text-gray-800 bg-white'}`}
                                      />
                                    </td>
                                    <td className="p-2.5">
                                      <input 
                                        type="number" 
                                        value={editBuffer.infFare === 0 ? '' : (editBuffer.infFare ?? fare.infFare)}
                                        onChange={e => setEditBuffer({ ...editBuffer, infFare: e.target.value === '' ? ('' as any) : Number(e.target.value) })}
                                        disabled={!editFlags.infFare}
                                        className={`w-20 px-2 py-1 border border-gray-300 rounded text-xs ${!editFlags.infFare ? 'bg-gray-100 text-gray-500' : 'text-gray-800 bg-white'}`}
                                      />
                                    </td>
                                    <td className="p-2.5 text-center">
                                      <input 
                                        type="number" 
                                        value={editBuffer.totalSeats === 0 ? '' : (editBuffer.totalSeats ?? fare.totalSeats)}
                                        onChange={e => setEditBuffer({ ...editBuffer, totalSeats: e.target.value === '' ? ('' as any) : Number(e.target.value) })}
                                        disabled={!editFlags.totalSeat}
                                        className={`w-14 px-1 py-1 border border-gray-300 rounded text-center text-xs ${!editFlags.totalSeat ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                                      />
                                    </td>
                                    <td className="p-2.5 text-center font-bold">
                                      <input 
                                        type="number" 
                                        value={editBuffer.availableSeats === 0 ? '' : (editBuffer.availableSeats ?? fare.availableSeats)}
                                        onChange={e => setEditBuffer({ ...editBuffer, availableSeats: e.target.value === '' ? ('' as any) : Number(e.target.value) })}
                                        disabled={!editFlags.availSeat}
                                        className={`w-14 px-1 py-1 border border-gray-300 rounded text-center text-xs font-bold ${!editFlags.availSeat ? 'bg-gray-100 text-gray-500 font-normal' : 'text-gray-900 bg-white'}`}
                                      />
                                    </td>
                                    <td className="p-2.5 text-center font-bold text-emerald-700">
                                      {fare.realtimeBook ? 'YES' : 'NO'}
                                    </td>
                                    <td className="p-2.5">
                                      <input 
                                        type="text" 
                                        value={editBuffer.airlinePnr ?? fare.airlinePnr}
                                        onChange={e => setEditBuffer({ ...editBuffer, airlinePnr: e.target.value })}
                                        disabled={!editFlags.airPnr}
                                        className={`w-20 px-2 py-1 border border-gray-300 rounded text-xs font-mono font-bold uppercase ${!editFlags.airPnr ? 'bg-gray-100 text-gray-500 font-normal' : 'text-gray-900 bg-white'}`}
                                      />
                                    </td>
                                    <td className="p-2.5 flex items-center justify-center gap-2">
                                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">👤</span>
                                      <button onClick={() => handleDelete(fare._id)} className="text-gray-400 hover:text-red-600 transition-colors">🗑️</button>
                                      <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded text-[10px] font-bold">Live</span>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            <div className="text-[11px] font-semibold text-gray-500 pt-1">
                              Number of Records 1 Found
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Series Fare Fullscreen Form Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#0b1031]/60 backdrop-blur-sm z-50 overflow-y-auto font-sans p-4 md:p-6 flex items-start justify-center">
          <div className="w-full max-w-6xl bg-white rounded-xl shadow-2xl border border-[#1d6aa3]/20 overflow-visible mb-12">
            {/* Header Bar */}
            <div className="bg-[#0b1031] text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-sm font-bold tracking-widest uppercase">
                Add New Series Fare
              </h2>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateFare} className="p-8 space-y-8 text-xs text-gray-800">
              {/* SECTION 1: Travel Journey Details */}
              <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-visible p-8">
                <div className="font-black text-sm text-[#0b1031] mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Plane size={18} className="text-[#1d6aa3]" />
                  Travel Journey Details
                </div>
                <div className="space-y-8">
                  {/* Row 1: Journey Type */}
                  <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 items-start">
                    <div className="font-bold text-gray-700 pt-1">Journey Type</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-start">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Supplier*</label>
                      <Dropdown 
                        value={supplierName}
                        onChange={() => {}}
                        options={[
                          { value: supplierName, label: supplierName }
                        ]}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Travel Type*</label>
                      <Dropdown 
                        value={newFare.bookingType}
                        onChange={(value) => setNewFare({ ...newFare, bookingType: value as any })}
                        options={[
                          { value: 'ONE_WAY', label: 'Domestic' },
                          { value: 'ROUND_TRIP', label: 'International' }
                        ]}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Airline*</label>
                      <input
                        type="text"
                        value={newFare.airline}
                        onChange={(e) => setNewFare({ ...newFare, airline: e.target.value })}
                        required
                        className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Airline PNR*</label>
                      <input
                        type="text"
                        value={newFare.airlinePnr}
                        onChange={(e) => setNewFare({ ...newFare, airlinePnr: e.target.value })}
                        required
                        className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-2">Travel Class*</label>
                      <Dropdown 
                        value={travelClassAdd}
                        onChange={setTravelClassAdd}
                        options={[
                          { value: 'ECONOMY', label: 'ECONOMY' },
                          { value: 'PREMIUM_ECONOMY', label: 'PREMIUM ECONOMY' },
                          { value: 'BUSINESS', label: 'BUSINESS' }
                        ]}
                      />
                    </div>
                  </div>
                  </div>
                  </div>

                  {/* Row 2: Travel schedule & Class */}
                  <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 items-start pt-6 border-t border-gray-100">
                    <div className="font-bold text-gray-700 pt-1">Travel schedule & Class</div>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1.5">Origin*</label>
                          <CitySelect
                            value={newFare.origin}
                            onChange={(val) => setNewFare({ ...newFare, origin: val })}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1.5">Destination*</label>
                          <CitySelect
                            value={newFare.destination}
                            onChange={(val) => setNewFare({ ...newFare, destination: val })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1.5">Departure Terminal <span className="font-normal">(Optional)</span></label>
                          <input
                            type="text"
                            placeholder="e.g. T1, T2"
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-[13px] bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all uppercase"
                            value={(newFare as any).departureTerminal || ''}
                            onChange={(e) => setNewFare({ ...newFare, departureTerminal: e.target.value.toUpperCase() } as any)}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1.5">Arrival Terminal <span className="font-normal">(Optional)</span></label>
                          <input
                            type="text"
                            placeholder="e.g. T1, T2"
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-[13px] bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all uppercase"
                            value={(newFare as any).arrivalTerminal || ''}
                            onChange={(e) => setNewFare({ ...newFare, arrivalTerminal: e.target.value.toUpperCase() } as any)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1.5">Journey From*</label>
                          <DOBCalendar
                            value={newFare.travelDate}
                            onChange={(date) => setNewFare({ ...newFare, travelDate: date })}
                            placeholder="dd-mm-yyyy"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1.5">Journey To*</label>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                              <DOBCalendar
                                value={newFare.travelDate}
                                onChange={(date) => setNewFare({ ...newFare, travelDate: date })}
                                placeholder="dd-mm-yyyy"
                              />
                            </div>
                            <button type="button" className="w-9 h-9 bg-[#1d6aa3] hover:bg-[#155685] text-white rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-all" title="Add Another Date">
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="checkbox"
                              id="realtime"
                              checked={newFare.realtimeBook}
                              onChange={(e) => setNewFare({ ...newFare, realtimeBook: e.target.checked })}
                              className="rounded text-blue-600 w-3.5 h-3.5"
                            />
                            <label htmlFor="realtime" className="text-[11px] font-bold text-gray-700 cursor-pointer">Real Time Booking</label>
                          </div>
                          <input
                            type="text"
                            placeholder="Airline PNR"
                            value={newFare.airlinePnr}
                            onChange={(e) => setNewFare({ ...newFare, airlinePnr: e.target.value.toUpperCase() })}
                            className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white uppercase font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Seats & Allocation */}
                  <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 items-start pt-6 border-t border-gray-100">
                    <div className="font-bold text-gray-700 pt-1">Seats & Allocation</div>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1.5">Total Seat*</label>
                          <input
                            type="number"
                            value={(newFare as any).totalSeats ?? ''}
                            onChange={(e) => setNewFare({ ...newFare, totalSeats: e.target.value === '' ? '' : Number(e.target.value), availableSeats: e.target.value === '' ? '' : Number(e.target.value) } as any)}
                            required
                            className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1.5">Seats per day*</label>
                          <input
                            type="number"
                            value={(newFare as any).totalSeats ?? ''}
                            onChange={(e) => setNewFare({ ...newFare, totalSeats: e.target.value === '' ? '' : Number(e.target.value) } as any)}
                            className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1.5">Running Days *</label>
                          <div className="flex items-center gap-3 text-[10px] font-bold text-gray-700 flex-wrap">
                            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                              <label key={day} className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                                <input 
                              type="checkbox" 
                              checked={(newFare as any).runningDays?.includes(day)}
                              onChange={(e) => {
                                const currentDays = (newFare as any).runningDays || [];
                                if (e.target.checked) {
                                  setNewFare({ ...newFare, runningDays: [...currentDays, day] } as any);
                                } else {
                                  setNewFare({ ...newFare, runningDays: currentDays.filter((d: string) => d !== day) } as any);
                                }
                              }}
                              className="rounded text-blue-600 w-3.5 h-3.5" 
                            />
                                <span>{day}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1.5">Close Before Departure Days</label>
                          <input
                            type="number"
                            value={(newFare as any).closeBeforeDepartureDays ?? ''}
                            onChange={(e) => setNewFare({ ...newFare, closeBeforeDepartureDays: e.target.value === '' ? '' : Number(e.target.value) } as any)}
                            className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1.5">Close Before Departure Hours*</label>
                          <input
                            type="number"
                            value={(newFare as any).closeBeforeDepartureHours ?? ''}
                            onChange={(e) => setNewFare({ ...newFare, closeBeforeDepartureHours: e.target.value === '' ? '' : Number(e.target.value) } as any)}
                            className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
              </div>

              {/* SECTION 2: Flight Details */}
              <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden p-8">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
                  <div className="font-black text-sm text-[#0b1031] flex items-center gap-2">
                    <Check size={18} className="text-[#1d6aa3]" />
                    Flight Details
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Flight Number(Comma Seperated)</span>
                    <input type="text" className="w-32 text-xs px-3 py-1.5 border border-gray-300 rounded-lg bg-white" />
                    <button type="button" className="bg-[#0b1031] text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors shadow-sm">Auto</button>
                  </div>
                </div>

                <div className="bg-white">
                  <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 items-start">
                    <div className="font-bold text-gray-700 pt-1">Sector & Schedule</div>
                    <div className="space-y-5">
                      {/* Sub-row 1: Route */}
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-1">Flight No*</label>
                          <input type="text" value={newFare.flightNo} onChange={e => setNewFare({ ...newFare, flightNo: e.target.value })} required className="w-full text-xs px-3 py-2 border border-gray-300 rounded bg-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-1">Origin*</label>
                          <input type="text" value={newFare.origin} onChange={e => setNewFare({ ...newFare, origin: e.target.value.toUpperCase() })} required className="w-full text-xs px-3 py-2 border border-gray-300 rounded bg-white font-bold uppercase focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-1">Terminal</label>
                          <input type="text" placeholder="T1" className="w-full text-xs px-3 py-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-1">Destination*</label>
                          <input type="text" value={newFare.destination} onChange={e => setNewFare({ ...newFare, destination: e.target.value.toUpperCase() })} required className="w-full text-xs px-3 py-2 border border-gray-300 rounded bg-white font-bold uppercase focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-1">Terminal</label>
                          <input type="text" placeholder="T2" className="w-full text-xs px-3 py-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                      </div>

                      {/* Sub-row 2: Time */}
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-1">Depart Time*</label>
                          <input type="time" value={newFare.departureTime} onChange={e => setNewFare({ ...newFare, departureTime: e.target.value })} required placeholder="21:50" className="w-full text-xs px-3 py-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-1">Arrival Time*</label>
                          <input type="time" value={newFare.arrivalTime} onChange={e => setNewFare({ ...newFare, arrivalTime: e.target.value })} required placeholder="23:10" className="w-full text-xs px-3 py-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-1">Duration*</label>
                          <input type="text" value={(newFare as any).duration || ''} readOnly className="w-full text-xs px-3 py-2 border border-gray-300 rounded bg-gray-50 focus:outline-none transition-all cursor-not-allowed text-gray-500" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-1">Stop Over</label>
                          <input type="number" value={(newFare as any).stopOver ?? ''} onChange={e => setNewFare({ ...newFare, stopOver: e.target.value === '' ? '' : Number(e.target.value) } as any)} className="w-full text-xs px-3 py-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <label className="block text-[10px] font-bold text-gray-600 mb-1">Day Change</label>
                            <input type="number" value={(newFare as any).dayChange ?? ''} readOnly className="w-full text-xs px-3 py-2 border border-gray-300 rounded bg-gray-50 focus:outline-none transition-all cursor-not-allowed text-gray-500" />
                          </div>
                          <button type="button" className="w-9 h-9 bg-[#1d6aa3] hover:bg-[#155685] text-white rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-all" title="Add another flight">
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* SECTION 3: Fare Details */}
              <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden p-8">
                <div className="font-black text-sm text-[#0b1031] mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <span className="text-[#1d6aa3] font-serif text-lg leading-none">₹</span>
                  Fare Details
                </div>
                <div className="space-y-8">
                  {/* Row 1: Passenger Fare Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 items-start">
                    <div className="font-bold text-gray-700 pt-1">Passenger Fare Details</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Adult Fare *</label>
                      <input
                        type="number"
                        value={(newFare as any).adtFare ?? ''}
                        onChange={(e) => setNewFare({ ...newFare, adtFare: e.target.value === '' ? '' : Number(e.target.value) } as any)}
                        required
                        className="w-full text-xs px-3 py-1.5 border border-gray-300 rounded bg-white font-bold text-emerald-700 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Child Fare</label>
                      <input
                        type="number"
                        value={(newFare as any).chdFare ?? ''}
                        onChange={(e) => setNewFare({ ...newFare, chdFare: e.target.value === '' ? '' : Number(e.target.value) } as any)}
                        className="w-full text-xs px-3 py-1.5 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Infant Fare</label>
                      <input
                        type="number"
                        value={(newFare as any).infFare ?? ''}
                        onChange={(e) => setNewFare({ ...newFare, infFare: e.target.value === '' ? '' : Number(e.target.value) } as any)}
                        className="w-full text-xs px-3 py-1.5 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    </div>
                  </div>

                  {/* Row 2: Baggage Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 items-start pt-6 border-t border-gray-100">
                    <div className="font-bold text-gray-700 pt-1">Baggage Details</div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Check In Baggage*</label>
                      <input type="text" defaultValue="15 Kg" className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Hand Baggage*</label>
                      <input type="text" defaultValue="7 Kg" className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Warning</label>
                      <input type="text" defaultValue="Special Non refundable fares / Free baggage..." className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Prompt</label>
                      <input type="text" defaultValue="Special Non refundable fares / Free baggage..." className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Fare Rule Description</label>
                      <input type="text" defaultValue="Special Non refundable fares / Free baggage..." className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

              {/* Submit Button */}
              <div className="text-right pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs px-8 py-2.5 rounded-lg transition-all mr-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1d6aa3] hover:bg-[#155685] text-white font-bold text-xs px-10 py-2.5 rounded-lg transition-all shadow-md"
                >
                  Submit
                </button>
              </div>
            </form>

            <div className="bg-gray-100 py-2 px-6 text-right text-[10px] text-gray-500 font-bold border-t border-gray-200">
              © 2026 TrippeChalo All rights reserved.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesFareManager;
