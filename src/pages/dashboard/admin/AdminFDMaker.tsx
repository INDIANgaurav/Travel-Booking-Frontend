import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Copy, Check, Search, Filter, ArrowLeftRight, Calendar, UserCheck, ArrowLeft, X, Plane, RefreshCw, Upload, Download, ChevronDown } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import api from '../../../services/api';
import Dropdown from '../../../components/ui/Dropdown';
import DOBCalendar from '../../../components/ui/DOBCalendar';
import CityPicker from '../../../components/common/CityPicker';
import toast from 'react-hot-toast';
import RefreshButton from '../../../components/ui/RefreshButton';

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

const AdminSeriesFareMaker: React.FC = () => {
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
  const [supplierFilter, setSupplierFilter] = useState('All');
  const [suppliersList, setSuppliersList] = useState<{value: string, label: string}[]>([{ value: 'All', label: 'All Suppliers' }]);
  const [travelTypeFilter, setTravelTypeFilter] = useState('All');
  const [moreOptionsFilter, setMoreOptionsFilter] = useState('Active');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showFlightModModal, setShowFlightModModal] = useState(false);
  const [flightModData, setFlightModData] = useState({ departureTime: '', arrivalTime: '', flightNo: '' });
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);
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
    status: 'Active',
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
    const fetchSuppliers = async () => {
      try {
        const { data } = await api.get('/api/admin/users?role=SUPPLIER_AGENT&limit=100');
        const supplierOptions = (data.data || []).map((u: any) => ({
          value: u.companyName || u.name,
          label: u.companyName || u.name
        }));
        setSuppliersList([{ value: 'All', label: 'All Suppliers' }, ...supplierOptions]);
      } catch (err) {}
    };
    fetchSuppliers();
    fetchFares();
  }, []);

  const fetchFares = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (travelDateFilter) params.append('date', travelDateFilter);
      if (airlineFilter) params.append('airline', airlineFilter);
      if (supplierFilter !== 'All') params.append('supplierName', supplierFilter);
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
      toast.success('Series Fare deleted');
    } catch (err) {
      setFares(prev => (Array.isArray(prev) ? prev : []).filter(f => f._id !== id));
      toast.success('Deleted locally (mock)');
    }
  };

  const handleBulkStatusUpdate = async (status: 'Active' | 'Inactive') => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one fare.');
      return;
    }
    const loadingToast = toast.loading(`Updating status to ${status}...`);
    try {
      await api.put('/api/series-fare/bulk-status', { ids: selectedIds, status });
      setFares(prev => prev.map(f => selectedIds.includes(f._id) ? { ...f, status } : f));
      toast.success(`Successfully updated ${selectedIds.length} items to ${status}`, { id: loadingToast });
      setSelectedIds([]); // clear selection
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status', { id: loadingToast });
    }
  };

  const handleBulkArchive = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one fare.');
      return;
    }
    const loadingToast = toast.loading(`Archiving ${selectedIds.length} fares...`);
    try {
      await api.put('/api/series-fare/bulk-archive', { ids: selectedIds, isArchived: true });
      // Remove archived from the main list
      setFares(prev => prev.filter(f => !selectedIds.includes(f._id)));
      toast.success(`Successfully archived ${selectedIds.length} items`, { id: loadingToast });
      setSelectedIds([]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to archive', { id: loadingToast });
    }
  };

  const handleDownloadReport = () => {
    if (fares.length === 0) {
      toast.error('No fares to export');
      return;
    }
    const headers = ['SF ID', 'Airline', 'PNR', 'Origin', 'Destination', 'Flight No', 'Travel Date', 'Status', 'Adult Fare'];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + fares.map(f => `${f.sfId},${f.airline},${f.airlinePnr},${f.origin},${f.destination},${f.flightNo},${f.travelDate},${f.status},${f.adtFare}`).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SeriesFares_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report downloaded');
  };

  const mockToast = (featureName: string) => {
    toast('Feature Coming Soon: ' + featureName, {
      icon: '🚀',
    });
  };

  const handleFlightMod = async () => {
    if (selectedIds.length === 0) return toast.error('No flights selected');
    if (!flightModData.departureTime && !flightModData.arrivalTime && !flightModData.flightNo) {
      return toast.error('Please provide at least one field to modify');
    }
    
    const updates: any = {};
    if (flightModData.departureTime) updates.departureTime = flightModData.departureTime;
    if (flightModData.arrivalTime) updates.arrivalTime = flightModData.arrivalTime;
    if (flightModData.flightNo) updates.flightNo = flightModData.flightNo;

    const loadingToast = toast.loading('Modifying flights...');
    try {
      await api.put('/api/series-fare/bulk-modify', { ids: selectedIds, updates });
      setFares(prev => prev.map(f => selectedIds.includes(f._id) ? { ...f, ...updates } : f));
      toast.success('Flights modified successfully', { id: loadingToast });
      setShowFlightModModal(false);
      setFlightModData({ departureTime: '', arrivalTime: '', flightNo: '' });
      setSelectedIds([]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to modify flights', { id: loadingToast });
    }
  };

  const handleConnectionFlights = async () => {
    if (selectedIds.length < 2) return toast.error('Select at least 2 flights to connect');
    const loadingToast = toast.loading('Connecting flights...');
    try {
      const response = await api.put('/api/series-fare/bulk-connect', { ids: selectedIds });
      toast.success(response.data.message || 'Flights connected successfully', { id: loadingToast });
      fetchFares();
      setSelectedIds([]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to connect flights', { id: loadingToast });
    }
  };

  const handleRunAutoSync = async () => {
    const loadingToast = toast.loading('Running Auto Sync...');
    try {
      const response = await api.post('/api/series-fare/auto-sync');
      toast.success(response.data.message || 'Auto Sync Complete', { id: loadingToast });
      fetchFares();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Auto Sync Failed', { id: loadingToast });
    }
  };

  const handlePopulateSectors = async () => {
    const loadingToast = toast.loading('Populating Sectors...');
    try {
      const response = await api.post('/api/series-fare/populate-sectors');
      toast.success(response.data.message || 'Sectors Populated', { id: loadingToast });
      fetchFares();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to populate sectors', { id: loadingToast });
    }
  };

  const handleTLDExport = () => {
    if (fares.length === 0) return toast.error('No fares to export');
    const headers = ['PNR', 'Origin', 'Destination', 'Flight', 'Dept Time', 'Arr Time', 'Adult Fare', 'Child Fare', 'Infant Fare'];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + fares.map(f => `${f.airlinePnr},${f.origin},${f.destination},${f.airline}-${f.flightNo},${f.departureTime},${f.arrivalTime},${f.adtFare},${f.chdFare},${f.infFare}`).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TLD_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('TLD Export downloaded');
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

  const downloadTemplate = () => {
    const headers = [
      'SF ID', 'Airline', 'PNR', 'Booking Type', 'Origin', 'Destination', 'Flight No',
      'Departure Time', 'Arrival Time', 'Departure Terminal', 'Arrival Terminal',
      'Travel Date', 'Adult Fare', 'Child Fare', 'Infant Fare', 'Agent Commission',
      'Total Seats', 'Available Seats', 'Realtime Book', 'Status'
    ];
    
    // Sample row
    const sampleData = [
      '', 'IndiGo', 'ABCD12', 'ONE_WAY', 'DEL', 'BOM', '6E123',
      '10:00', '12:00', 'T3', 'T2',
      '2024-12-01', '5000', '4500', '1500', '200',
      '50', '50', 'true', 'Active'
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + "\n" 
      + sampleData.join(',');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Series_Fare_Bulk_Upload_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setBulkUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', bulkFile);
      
      const response = await api.post('/api/series-fare/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success(response.data.message || 'Bulk upload successful');
      setShowBulkUploadModal(false);
      setBulkFile(null);
      fetchFares();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Bulk upload failed');
    } finally {
      setBulkUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white border-l-4 border-blue-600 p-5 rounded-xl shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-wide uppercase">Series Fare Manager</h2>
          <p className="text-xs text-gray-500 font-medium mt-1">Manage and update your flight inventory efficiently</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowBulkUploadModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold text-sm transition-all shadow-md"
            title="Bulk Upload Fares"
          >
            <Upload size={18} />
            Bulk Upload
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-[#155685] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold text-sm transition-all shadow-md"
            title="Add New Series Fare"
          >
            <Plus size={18} />
            Add New Fare
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(5,1fr)_auto] gap-5">
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">Travel Date</label>
            <DOBCalendar 
              value={travelDateFilter}
              onChange={setTravelDateFilter}
              placeholder="Select date..."
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
              options={suppliersList}
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
              className="bg-gray-900 text-white text-xs font-bold px-8 py-2 rounded-lg hover:bg-gray-900 transition-all h-[36px] w-full lg:w-auto shadow-sm"
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
              placeholder="Search By FARE ID, PNR, Origin..."
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
            <thead className="bg-[#f8fafc] text-gray-900 font-black border-b border-gray-200">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    checked={filteredFares.length > 0 && selectedIds.length === filteredFares.length}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(filteredFares.map(f => f._id));
                      else setSelectedIds([]);
                    }}
                  />
                </th>
                <th className="p-3">STATUS</th>
                <th className="p-3">OWNER / AIRLINE</th>
                <th className="p-3">AIRLINE PNR</th>
                <th className="p-3">SECTOR</th>
                <th className="p-3">JOURNEY DATE & TIME</th>
                <th className="p-3 text-center" title="Total Seats">TTL</th>
                <th className="p-3 text-center" title="Blocked Seats">BLK</th>
                <th className="p-3 text-center" title="Available Seats">AVL</th>
                <th className="p-3 text-right">BUY FARE</th>
                <th className="p-3 text-right">SELL FARE</th>
                <th className="p-3 text-center">FLIGHT</th>
                <th className="p-3 text-center">FARE ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFares.map(fare => {
                const isExpanded = expandedId === fare._id;
                const formattedDate = new Date(fare.travelDate).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
                
                const blockedSeats = 0; // Placeholder for blocked seats logic
                const buyFare = fare.adtFare - (fare.agentCommission || 0);
                const sellFare = fare.adtFare;

                return (
                  <React.Fragment key={fare._id}>
                    <tr key={fare._id} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="p-3 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300" 
                          checked={selectedIds.includes(fare._id)}
                          onChange={() => setSelectedIds(prev => prev.includes(fare._id) ? prev.filter(id => id !== fare._id) : [...prev, fare._id])}
                        />
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${fare.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-600/20' : 'bg-gray-50 text-gray-600 border-gray-600/20'}`}>
                          {fare.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{supplierName}</span>
                          <span className="text-[10px] text-gray-500 uppercase">{fare.airline}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-blue-600 font-bold">{fare.airlinePnr || 'PENDING'}</td>
                      <td className="p-3 font-bold text-gray-800">
                        {fare.origin} - {fare.destination}
                      </td>
                      <td className="p-3 text-gray-600">
                        <span className="text-gray-900">{formattedDate}</span>
                        <span className="block text-[10px] opacity-75">{fare.departureTime} - {fare.arrivalTime}</span>
                      </td>
                      <td className="p-3 text-center font-bold text-blue-800 bg-blue-50/50">{fare.totalSeats}</td>
                      <td className="p-3 text-center font-bold text-gray-600 bg-gray-50">{blockedSeats}</td>
                      <td className="p-3 text-center font-bold text-emerald-600 bg-emerald-50/50">{fare.availableSeats}</td>
                      <td className="p-3 text-right font-bold text-gray-900">₹{buyFare}</td>
                      <td className="p-3 text-right font-bold text-blue-600">₹{sellFare}</td>
                      <td className="p-3 text-center font-mono text-gray-500 text-[10px]">{fare.flightNo}</td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => setExpandedId(isExpanded ? null : fare._id)}
                          className="text-blue-600 font-bold hover:underline font-mono text-[11px]"
                        >
                          {fare.sfId}
                        </button>
                      </td>
                    </tr>

                    {/* Inline Fare & Seat Manager Drawer */}
                    {isExpanded && (
                      <tr className="bg-[#f8fafc] border-b-2 border-blue-600">
                        <td colSpan={13} className="p-5">
                          <div className="bg-white rounded-xl shadow-lg border border-blue-600/20 overflow-hidden space-y-4 p-5">
                            {/* Card Header Summary */}
                            <div className="bg-blue-50 text-gray-900 p-4 rounded-lg flex items-center justify-between border border-blue-600/20">
                              <div className="grid grid-cols-8 gap-4 text-xs font-bold w-full items-center">
                                <div><span className="block text-[9px] opacity-75">FARE ID</span>{fare.sfId}</div>
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
                                  className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 shrink-0 ml-4 shadow transition-all"
                                  title="Close Drawer"
                                >
                                ←
                              </button>
                            </div>

                            {/* Inner Controls Table */}
                            <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-inner">
                              <table className="w-full text-xs text-left">
                                <thead className="bg-[#f8fafc] text-gray-900 font-black text-[10px] uppercase border-b border-gray-300">
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
                                        onChange={e => setNewFare({ ...newFare, totalSeats: e.target.value === '' ? '' : Number(e.target.value), availableSeats: e.target.value === '' ? '' : Number(e.target.value) } as any)}
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
        
        {/* Footer Summary & Action Bar - Redesigned for brand uniqueness */}
        <div className="bg-slate-50 border-t border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Total Capacity: <span className="font-black text-slate-900">{filteredFares.reduce((acc, curr) => acc + curr.totalSeats, 0)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Available: <span className="font-black text-slate-900">{filteredFares.reduce((acc, curr) => acc + curr.availableSeats, 0)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Sold: <span className="font-black text-slate-900">{filteredFares.reduce((acc, curr) => acc + (curr.totalSeats - curr.availableSeats), 0)}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
              <button className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all">
                Export Options
                <ChevronDown size={14} />
              </button>
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden">
                <button onClick={handleDownloadReport} className="text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 w-full">Download Report</button>
                <button onClick={handleTLDExport} className="text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 w-full">TLD Export</button>
              </div>
            </div>

            <div className="relative group">
              <button className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all">
                Bulk Actions
                <ChevronDown size={14} />
              </button>
              <div className="absolute bottom-full right-0 mb-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden z-50">
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-black text-slate-400 tracking-wider">Flight Management</div>
                <button onClick={() => { if(selectedIds.length === 0) toast.error('Select fares first'); else setShowFlightModModal(true); }} className="text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 w-full">Flight Modifications (FLT-MOD)</button>
                <button onClick={handleConnectionFlights} className="text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 w-full">Connection Flights (CXN)</button>
                <button onClick={handlePopulateSectors} className="text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 w-full">Populate Sectors</button>
                <button onClick={handleRunAutoSync} className="text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 w-full">Run Auto Sync</button>
                
                <div className="px-4 py-2 bg-slate-50 border-y border-slate-100 text-[10px] uppercase font-black text-slate-400 tracking-wider">Status Update</div>
                <button onClick={() => handleBulkStatusUpdate('Active')} className="text-left px-4 py-2.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 w-full">Approve Selected</button>
                <button onClick={() => handleBulkStatusUpdate('Inactive')} className="text-left px-4 py-2.5 text-xs font-bold text-orange-600 hover:bg-orange-50 w-full">Mark as Inactive</button>
                <button onClick={() => handleBulkArchive()} className="text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 w-full">Send to Archive</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Series Fare Fullscreen Form Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 overflow-y-auto font-sans p-4 md:p-6 flex items-start justify-center">
          <div className="w-full max-w-6xl bg-white rounded-xl shadow-2xl border border-blue-600/20 overflow-visible mb-12">
            {/* Header Bar */}
            <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
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
                <div className="font-black text-sm text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Plane size={18} className="text-blue-600" />
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
                            <button type="button" className="w-9 h-9 bg-blue-600 hover:bg-[#155685] text-white rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-all" title="Add Another Date">
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                        <div>
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
                      </div>
                      
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
                  <div className="font-black text-sm text-gray-900 flex items-center gap-2">
                    <Check size={18} className="text-blue-600" />
                    Flight Details
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Flight Number(Comma Seperated)</span>
                    <input type="text" className="w-32 text-xs px-3 py-1.5 border border-gray-300 rounded-lg bg-white" />
                    <button type="button" className="bg-gray-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors shadow-sm">Auto</button>
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
                          <button type="button" className="w-9 h-9 bg-blue-600 hover:bg-[#155685] text-white rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-all" title="Add another flight">
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
                <div className="font-black text-sm text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <span className="text-blue-600 font-serif text-lg leading-none">₹</span>
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
                  className="bg-blue-600 hover:bg-[#155685] text-white font-bold text-xs px-10 py-2.5 rounded-lg transition-all shadow-md"
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
      
      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="bg-[#0b1031] text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                <Upload size={16} /> Bulk Upload Fares
              </h2>
              <button onClick={() => setShowBulkUploadModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-xs">
                Upload a CSV file containing your Series Fares. Please ensure it matches the standard template.
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload size={20} className="text-blue-600" />
                </div>
                <div className="text-sm font-bold text-gray-700 mb-1">Click to upload or drag and drop</div>
                <div className="text-xs text-gray-500">CSV or Excel files only (max 5MB)</div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => e.target.files && setBulkFile(e.target.files[0])}
                  id="bulk-file"
                />
                <label htmlFor="bulk-file" className="absolute inset-0 cursor-pointer"></label>
              </div>

              {bulkFile && (
                <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                  <div className="flex items-center gap-2 text-gray-700 font-medium">
                    <Check size={16} className="text-emerald-500" />
                    {bulkFile.name}
                  </div>
                  <button onClick={() => setBulkFile(null)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowBulkUploadModal(false)}
                className="px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpload}
                disabled={!bulkFile || bulkUploading}
                className="bg-blue-600 hover:bg-[#155685] disabled:opacity-50 text-white text-sm font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
              >
                {bulkUploading ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                {bulkUploading ? 'Uploading...' : 'Upload Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flight Modification Modal */}
      {showFlightModModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="bg-[#0b1031] text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                <Edit2 size={16} /> Modify {selectedIds.length} Flights
              </h2>
              <button onClick={() => setShowFlightModModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-orange-50 text-orange-700 p-4 rounded-lg text-xs mb-4">
                Leave fields empty if you do not wish to modify them.
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">New Flight Number</label>
                <input
                  type="text"
                  placeholder="e.g. 6E-2023"
                  value={flightModData.flightNo}
                  onChange={e => setFlightModData(prev => ({ ...prev, flightNo: e.target.value }))}
                  className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">New Departure Time</label>
                  <input
                    type="time"
                    value={flightModData.departureTime}
                    onChange={e => setFlightModData(prev => ({ ...prev, departureTime: e.target.value }))}
                    className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">New Arrival Time</label>
                  <input
                    type="time"
                    value={flightModData.arrivalTime}
                    onChange={e => setFlightModData(prev => ({ ...prev, arrivalTime: e.target.value }))}
                    className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowFlightModModal(false)}
                className="px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFlightMod}
                className="bg-blue-600 hover:bg-[#155685] text-white text-sm font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSeriesFareMaker;
