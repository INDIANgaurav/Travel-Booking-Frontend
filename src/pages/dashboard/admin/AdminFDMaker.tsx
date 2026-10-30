import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Edit2, Trash2, Copy, Check, Search, Filter, ArrowLeftRight, Calendar, UserCheck, ArrowLeft, X, Plane, RefreshCw, Upload, Download, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import api from '../../../services/api';
import Dropdown from '../../../components/ui/Dropdown';
import DOBCalendar from '../../../components/ui/DOBCalendar';
import CityPicker from '../../../components/common/CityPicker';
import toast from 'react-hot-toast';
import RefreshButton from '../../../components/ui/RefreshButton';
import ConfirmModal from '../../../components/ui/ConfirmModal';

interface ISeriesFareSegment {
  origin: string;
  destination: string;
  airline: string;
  flightNo: string;
  departureTime: string;
  arrivalTime: string;
  departureTerminal?: string;
  arrivalTerminal?: string;
}

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
  supplierName?: string;
  supplierId?: string;
  isTestFlight?: boolean;
  segments?: ISeriesFareSegment[];
}

const CitySelect = ({ 
  value, 
  onChange, 
  placeholder = 'Select City',
  heightClass = 'h-10'
}: { 
  value: string; 
  onChange: (val: string) => void; 
  placeholder?: string;
  heightClass?: string;
}) => {
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
        className={`w-full text-xs px-3.5 ${heightClass} border border-gray-300 rounded-lg bg-white font-bold uppercase cursor-pointer flex items-center justify-between hover:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs`}
      >
        <span className={value ? 'text-gray-900 font-extrabold tracking-wide' : 'text-gray-400 font-normal normal-case'}>
          {value || placeholder}
        </span>
        <ChevronDown size={14} className="text-gray-400 shrink-0" />
      </div>
      {isOpen && (
        <div className="absolute top-[100%] mt-1 left-0 z-[60] shadow-2xl rounded-xl">
          <CityPicker 
            value={value} 
            onChange={(code) => {
              onChange(code);
              setIsOpen(false);
            }} 
            onClose={() => setIsOpen(false)} 
            title="SELECT AIRPORT CITY" 
          />
        </div>
      )}
    </div>
  );
};

const AdminSeriesFareMaker: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const supplierName = (user as any)?.companyName || user?.name || (user as any)?.firstName || 'Supplier';

  // Generate time options from 00:00 to 23:55 (5-minute interval)
  const timeOptions = useMemo(() => {
    const opts = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 5) {
        const hh = h.toString().padStart(2, '0');
        const mm = m.toString().padStart(2, '0');
        opts.push({ value: `${hh}:${mm}`, label: `${hh}:${mm}` });
      }
    }
    return opts;
  }, []);

  const cancellationPolicyOptions = [
    { value: '100% Non-Refundable Charter', label: '100% Non-Refundable Charter (Series Fare)' },
    { value: 'Standard Cancellation (₹3,000 Fee / Pax)', label: 'Standard Cancellation (₹3,000 Fee / Pax)' },
    { value: 'Partially Refundable (Airport Taxes Only)', label: 'Partially Refundable (Airport Taxes Only)' },
    { value: 'Fully Refundable (Free cancellation up to 48h prior)', label: 'Fully Refundable (Free up to 48h prior)' }
  ];

  // Sidebar context from AdminLayout
  const { isSidebarOpen, setIsSidebarOpen } = useOutletContext<{
    isSidebarOpen?: boolean;
    setIsSidebarOpen?: (open: boolean) => void;
  }>() || {};
  const sidebarWasOpenRef = useRef(false);

  // Custom Delete Modal state
  const [fareToDelete, setFareToDelete] = useState<ISeriesFare | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const closeSidebarIfOpen = () => {
    if (isSidebarOpen && setIsSidebarOpen) {
      sidebarWasOpenRef.current = true;
      setIsSidebarOpen(false);
    }
    window.dispatchEvent(new CustomEvent('set-admin-sidebar', { detail: { open: false } }));
  };

  const handleToggleExpand = (fare: ISeriesFare) => {
    if (expandedId === fare._id) {
      setExpandedId(null);
    } else {
      setExpandedId(fare._id);
      // Smoothly close sidebar if open to give maximum wide screen to the edit table
      closeSidebarIfOpen();
      setEditFlags({
        adtFare: false,
        commission: false,
        chdFare: false,
        infFare: false,
        totalSeat: false,
        availSeat: false,
        airPnr: false,
      });
      setEditBuffer({
        adtFare: fare.adtFare,
        agentCommission: fare.agentCommission,
        chdFare: fare.chdFare,
        infFare: fare.infFare,
        totalSeats: fare.totalSeats,
        availableSeats: fare.availableSeats,
        flightNo: fare.flightNo,
        airlinePnr: fare.airlinePnr
      });
    }
  };

  // Filters
  const [travelDateFilter, setTravelDateFilter] = useState('');
  const [airlineFilter, setAirlineFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('All');
  const [suppliersList, setSuppliersList] = useState<{value: string, label: string}[]>([{ value: 'All', label: 'All Suppliers' }]);
  const [travelTypeFilter, setTravelTypeFilter] = useState('All');
  const [moreOptionsFilter, setMoreOptionsFilter] = useState('Active');
  const [flightModeFilter, setFlightModeFilter] = useState<'All' | 'LIVE' | 'TEST'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showFlightModModal, setShowFlightModModal] = useState(false);
  const [flightModData, setFlightModData] = useState({ departureTime: '', arrivalTime: '', flightNo: '' });
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [travelClassAdd, setTravelClassAdd] = useState('ECONOMY');
  const [newFare, setNewFare] = useState({
    isTestFlight: false,
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
    travelDate: '2026-12-25',
    adtFare: '' as number | '',
    chdFare: '' as number | '',
    infFare: '' as number | '',
    agentCommission: '' as number | '',
    totalSeats: '' as number | '',
    availableSeats: '' as number | '',
    status: 'Active',
    cancellationPolicy: '100% Non-Refundable Charter',
    isRefundable: false,
    closeBeforeDepartureDays: '' as number | '',
    closeBeforeDepartureHours: '' as number | ''
  });

  const [isConnectingFlight, setIsConnectingFlight] = useState(false);
  const [segments, setSegments] = useState([
    { origin: '', destination: '', airline: '', flightNo: '', departureTime: '', arrivalTime: '', departureTerminal: '', arrivalTerminal: '' },
    { origin: '', destination: '', airline: '', flightNo: '', departureTime: '', arrivalTime: '', departureTerminal: '', arrivalTerminal: '' }
  ]);

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

  const isFirstRender = useRef(true);

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

  // Auto-fetch whenever mode or filters change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchFares();
  }, [flightModeFilter, moreOptionsFilter, supplierFilter, travelTypeFilter, travelDateFilter]);

  const fetchFares = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (travelDateFilter) params.append('date', travelDateFilter);
      if (airlineFilter.trim()) params.append('airline', airlineFilter.trim());
      if (supplierFilter && supplierFilter !== 'All') params.append('supplierName', supplierFilter);
      if (travelTypeFilter && travelTypeFilter !== 'All') params.append('bookingType', travelTypeFilter);
      if (moreOptionsFilter && moreOptionsFilter !== 'All') params.append('status', moreOptionsFilter);
      if (flightModeFilter === 'LIVE') params.append('isTestFlight', 'false');
      if (flightModeFilter === 'TEST') params.append('isTestFlight', 'true');
      
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
      const payload: any = { 
        ...newFare,
        supplierName: supplierName || 'Super Admin',
        supplierId: (user as any)?._id || undefined
      };

      if (!payload.travelDate) {
        toast.error('Kripya Journey Travel Date select karein!');
        return;
      }

      if (isConnectingFlight) {
        payload.segments = segments.filter(s => s.origin && s.destination && s.flightNo);
        if (payload.segments.length < 2) {
          toast.error('Connecting flight ke liye kam se kam 2 legs (e.g. Leg 1: DEL -> BOM, Leg 2: BOM -> DXB) complete fill karein!');
          return;
        }
        for (let i = 0; i < payload.segments.length; i++) {
          const seg = payload.segments[i];
          if (!seg.departureTime || !seg.arrivalTime) {
            toast.error(`Flight Leg ${i + 1} ka Depart Time aur Arrival Time select karein!`);
            return;
          }
        }
        payload.origin = payload.segments[0].origin;
        payload.destination = payload.segments[payload.segments.length - 1].destination;
        payload.flightNo = payload.segments.map((s: any) => s.flightNo).join(', ');
        payload.departureTime = payload.segments[0].departureTime;
        payload.arrivalTime = payload.segments[payload.segments.length - 1].arrivalTime;
      } else {
        if (!payload.origin || !payload.destination) {
          toast.error('Origin aur Destination city select karein!');
          return;
        }
        if (!payload.flightNo) {
          toast.error('Flight Number enter karein!');
          return;
        }
        if (!payload.departureTime || !payload.arrivalTime) {
          toast.error('Departure Time aur Arrival Time select karein!');
          return;
        }
      }

      if (!payload.airline) {
        toast.error('Airline name enter karein!');
        return;
      }
      if (!payload.adtFare) {
        toast.error('Adult Fare enter karein!');
        return;
      }

      const response = await api.post('/api/series-fare', payload);
      if (response.data) {
        setFares(prev => [response.data, ...(Array.isArray(prev) ? prev : [])]);
        toast.success(newFare.isTestFlight ? 'Test Flight (Sandbox 999 seats) created!' : 'Live Series Fare created successfully!');
        setShowAddModal(false);
      }
    } catch (err: any) {
      console.error('Failed to create series fare:', err);
      const errMsg = err.response?.data?.message || err.message || 'Server error: Series Fare save nahi ho paya.';
      toast.error(errMsg);
    }
  };

  const handleSaveEdit = async () => {
    if (!expandedId) return;
    try {
      await api.put(`/api/series-fare/${expandedId}`, editBuffer);
      setFares(prev => (Array.isArray(prev) ? prev : []).map(f => (f._id === expandedId ? { ...f, ...editBuffer } : f)));
      toast.success('Fare details updated successfully!');
    } catch (err) {
      setFares(prev => (Array.isArray(prev) ? prev : []).map(f => (f._id === expandedId ? { ...f, ...editBuffer } : f)));
      toast.success('Fare details updated locally (mock)');
    }
  };

  const handleDeleteClick = (fare: ISeriesFare) => {
    setFareToDelete(fare);
  };

  const handleConfirmDelete = async () => {
    if (!fareToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/api/series-fare/${fareToDelete._id}`);
      setFares(prev => (Array.isArray(prev) ? prev : []).filter(f => f._id !== fareToDelete._id));
      toast.success(`Series Fare ${fareToDelete.sfId || ''} deleted successfully`);
      if (expandedId === fareToDelete._id) {
        setExpandedId(null);
      }
    } catch (err) {
      setFares(prev => (Array.isArray(prev) ? prev : []).filter(f => f._id !== fareToDelete._id));
      toast.success('Series Fare deleted locally (mock)');
      if (expandedId === fareToDelete._id) {
        setExpandedId(null);
      }
    } finally {
      setIsDeleting(false);
      setFareToDelete(null);
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
    if (flightModeFilter === 'LIVE' && f.isTestFlight === true) return false;
    if (flightModeFilter === 'TEST' && f.isTestFlight !== true) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return f.sfId.toLowerCase().includes(q) || f.airlinePnr.toLowerCase().includes(q) || f.origin.toLowerCase().includes(q) || f.destination.toLowerCase().includes(q);
    }
    return true;
  });

  const totalRecords = filteredFares.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedFares = filteredFares.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, airlineFilter, flightModeFilter, travelDateFilter, supplierFilter, moreOptionsFilter]);

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
      '2026-12-25', '5000', '4500', '1500', '200',
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(6,1fr)_auto] gap-4">
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
                { value: 'Expired', label: 'Show Expired' },
                { value: 'SoldOut', label: 'Show Sold Out' },
                { value: 'All', label: 'Show All' }
              ]}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">Mode / Environment</label>
            <Dropdown 
              value={flightModeFilter}
              onChange={(val: any) => setFlightModeFilter(val)}
              options={[
                { value: 'All', label: 'All Modes' },
                { value: 'LIVE', label: 'Live Inventory' },
                { value: 'TEST', label: 'Sandbox Test (999)' }
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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="overflow-x-auto rounded-t-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f8fafc] text-gray-900 font-black border-b border-gray-200">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    checked={paginatedFares.length > 0 && paginatedFares.every(f => selectedIds.includes(f._id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(Array.from(new Set([...selectedIds, ...paginatedFares.map(f => f._id)])));
                      } else {
                        setSelectedIds(selectedIds.filter(id => !paginatedFares.some(f => f._id === id)));
                      }
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
                <th className="p-3 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedFares.map(fare => {
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
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${fare.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-600/20' : fare.status === 'SoldOut' ? 'bg-purple-50 text-purple-600 border-purple-600/20' : 'bg-gray-50 text-gray-600 border-gray-600/20'}`}>
                            {fare.status}
                          </span>
                          {fare.isTestFlight ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-300 tracking-tight" title="Test Flight for B2B Sandbox Testing">
                              TEST (999)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 tracking-tight" title="Commercial Live Flight">
                              LIVE
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{fare.supplierName || 'Admin'}</span>
                          <span className="text-[10px] text-gray-500 uppercase">{fare.airline}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-blue-600 font-bold">{fare.airlinePnr || 'PENDING'}</td>
                      <td className="p-3 font-bold text-gray-800">
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-gray-900">{fare.origin} - {fare.destination}</span>
                          {fare.segments && fare.segments.length > 1 ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-extrabold rounded bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs" title={`Connecting flight via ${fare.segments[0].destination}`}>
                              ✈️ {fare.segments.length - 1}-Stop (via {fare.segments[0].destination})
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400 font-medium">Non-Stop</span>
                          )}
                        </div>
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
                        <span className="font-mono text-gray-500 text-[11px]">{fare.sfId}</span>
                      </td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => handleToggleExpand(fare)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-1.5 rounded transition-colors cursor-pointer"
                          title="Edit Fare"
                        >
                          <Edit2 size={14} />
                        </button>
                      </td>
                    </tr>

                    {/* Inline Fare & Seat Manager Drawer */}
                    {isExpanded && (
                      <tr className="bg-[#f8fafc] border-b-2 border-blue-600">
                        <td colSpan={14} className="p-4 sm:p-5">
                          <div className="bg-white rounded-xl shadow-lg border border-blue-600/20 overflow-hidden space-y-4 p-5 w-full">
                            {/* Card Header Summary with Status on Top */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50/70 text-gray-900 p-4 rounded-xl flex flex-wrap items-center justify-between border border-blue-200/60 gap-4">
                              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 text-xs font-bold flex-1 min-w-0">
                                <div className="min-w-0"><span className="block text-[9px] uppercase tracking-wider text-blue-800 font-extrabold opacity-75">FARE ID</span><span className="truncate block font-mono text-gray-900">{fare.sfId}</span></div>
                                <div className="min-w-0"><span className="block text-[9px] uppercase tracking-wider text-blue-800 font-extrabold opacity-75">Airline</span><span className="truncate block text-gray-900">{fare.airline}</span></div>
                                <div className="min-w-0"><span className="block text-[9px] uppercase tracking-wider text-blue-800 font-extrabold opacity-75">Origin</span><span className="truncate block font-mono font-bold text-blue-700">{fare.origin}</span></div>
                                <div className="min-w-0"><span className="block text-[9px] uppercase tracking-wider text-blue-800 font-extrabold opacity-75">Destination</span><span className="truncate block font-mono font-bold text-blue-700">{fare.destination}</span></div>
                                <div className="min-w-0"><span className="block text-[9px] uppercase tracking-wider text-blue-800 font-extrabold opacity-75">Flight Details</span><span className="truncate block text-gray-900">{fare.flightNo}</span></div>
                                <div className="min-w-0"><span className="block text-[9px] uppercase tracking-wider text-blue-800 font-extrabold opacity-75">Journey Details</span><span className="truncate block text-gray-900">{formattedDate} {fare.departureTime}-{fare.arrivalTime}</span></div>
                                <div className="min-w-0"><span className="block text-[9px] uppercase tracking-wider text-blue-800 font-extrabold opacity-75">Total Seats</span><span className="truncate block text-gray-900">{fare.totalSeats}</span></div>
                                <div className="min-w-0"><span className="block text-[9px] uppercase tracking-wider text-blue-800 font-extrabold opacity-75">Available Seats</span><span className="truncate block text-emerald-700">{fare.availableSeats}</span></div>
                              </div>

                              {/* Status Badges & Close Button on Top Right */}
                              <div className="flex items-center gap-2.5 shrink-0">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold border shadow-xs ${
                                  fare.status === 'Active' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                                  fare.status === 'SoldOut' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                                  'bg-gray-100 text-gray-800 border-gray-300'
                                }`}>
                                  {fare.status}
                                </span>

                                <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-tight border shadow-xs ${
                                  fare.isTestFlight ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-blue-100 text-blue-800 border-blue-300'
                                }`}>
                                  {fare.isTestFlight ? 'TEST (999)' : 'LIVE'}
                                </span>

                                <button 
                                  onClick={() => handleToggleExpand(fare)}
                                  className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 shrink-0 shadow-md transition-all cursor-pointer hover:scale-105"
                                  title="Close Drawer"
                                >
                                  <X size={15} strokeWidth={2.5} />
                                </button>
                              </div>
                            </div>

                            {/* Connecting Flight Segments Breakdown if Multi-Leg */}
                            {fare.segments && fare.segments.length > 1 && (
                              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-black text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                                    <span>✈️ Connecting Flight Route Breakdown ({fare.segments.length - 1}-Stop)</span>
                                  </span>
                                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300">
                                    Total Legs: {fare.segments.length}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 pt-1">
                                  {fare.segments.map((seg, sIdx) => (
                                    <div key={sIdx} className="flex items-center gap-2.5 bg-white px-3 py-2 rounded-lg border border-amber-300 shadow-2xs">
                                      <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-black flex items-center justify-center text-[10px]">{sIdx + 1}</span>
                                      <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                                          <span>{seg.origin}</span>
                                          <span className="text-gray-400">→</span>
                                          <span>{seg.destination}</span>
                                        </div>
                                        <div className="text-[10px] text-gray-500 font-medium">
                                          {seg.airline} <span className="font-mono font-bold text-blue-600">{seg.flightNo}</span> • {seg.departureTime} - {seg.arrivalTime}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Inner Controls Table spanning full width */}
                            <div className="w-full overflow-x-auto border border-gray-200 rounded-xl shadow-xs bg-white">
                              <table className="w-full text-xs text-left border-collapse">
                                <thead className="bg-[#f8fafc] text-gray-900 font-black text-[10px] uppercase border-b border-gray-300">
                                  <tr>
                                    <th className="py-3 px-2 text-center w-12">S.NO</th>
                                    <th className="py-3 px-2 text-center w-10"><input type="checkbox" className="rounded border-gray-300" /></th>
                                    <th className="py-3 px-3 whitespace-nowrap">TRAVEL DATE</th>
                                    <th className="py-3 px-3 whitespace-nowrap">DEPARTURE</th>
                                    <th className="py-3 px-3 whitespace-nowrap">ARRIVAL</th>
                                    <th className="py-3 px-2">
                                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                                        <span>ADT FARE</span>
                                        <input type="checkbox" className="rounded text-blue-600" checked={editFlags.adtFare} onChange={e => setEditFlags({ ...editFlags, adtFare: e.target.checked })} />
                                      </div>
                                    </th>
                                    <th className="py-3 px-2">
                                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                                        <span>COMMISSION</span>
                                        <input type="checkbox" className="rounded text-blue-600" checked={editFlags.commission} onChange={e => setEditFlags({ ...editFlags, commission: e.target.checked })} />
                                      </div>
                                    </th>
                                    <th className="py-3 px-2">
                                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                                        <span>CHD FARE</span>
                                        <input type="checkbox" className="rounded text-blue-600" checked={editFlags.chdFare} onChange={e => setEditFlags({ ...editFlags, chdFare: e.target.checked })} />
                                      </div>
                                    </th>
                                    <th className="py-3 px-2">
                                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                                        <span>INF FARE</span>
                                        <input type="checkbox" className="rounded text-blue-600" checked={editFlags.infFare} onChange={e => setEditFlags({ ...editFlags, infFare: e.target.checked })} />
                                      </div>
                                    </th>
                                    <th className="py-3 px-2 text-center">
                                      <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                                        <span>TOTAL SEAT</span>
                                        <input type="checkbox" className="rounded text-blue-600" checked={editFlags.totalSeat} onChange={e => setEditFlags({ ...editFlags, totalSeat: e.target.checked })} />
                                      </div>
                                    </th>
                                    <th className="py-3 px-2 text-center">
                                      <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                                        <span>AVAIL SEAT</span>
                                        <input type="checkbox" className="rounded text-blue-600" checked={editFlags.availSeat} onChange={e => setEditFlags({ ...editFlags, availSeat: e.target.checked })} />
                                      </div>
                                    </th>
                                    <th className="py-3 px-3 text-center whitespace-nowrap">REALTIME BOOK</th>
                                    <th className="py-3 px-2">
                                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                                        <span>AIR PNR</span>
                                        <input type="checkbox" className="rounded text-blue-600" checked={editFlags.airPnr} onChange={e => setEditFlags({ ...editFlags, airPnr: e.target.checked })} />
                                      </div>
                                    </th>
                                    <th className="py-3 px-3 text-center whitespace-nowrap">STATUS & ACTIONS</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white text-xs">
                                  <tr className="hover:bg-blue-50/40">
                                    <td className="py-3 px-2 text-center font-bold text-gray-700">1</td>
                                    <td className="py-3 px-2 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
                                    <td className="py-3 px-3 font-bold text-blue-600 whitespace-nowrap">{formattedDate}</td>
                                    <td className="py-3 px-3 font-mono font-medium whitespace-nowrap">{fare.departureTime}</td>
                                    <td className="py-3 px-3 font-mono font-medium whitespace-nowrap">{fare.arrivalTime}</td>
                                    <td className="py-3 px-2">
                                      <input 
                                        type="text" 
                                        value={editBuffer.adtFare === 0 ? '' : (editBuffer.adtFare ?? fare.adtFare)}
                                        onChange={e => setEditBuffer({ ...editBuffer, adtFare: e.target.value === '' ? ('' as any) : Number(e.target.value.replace(/[^0-9.-]+/g,"")) })}
                                        disabled={!editFlags.adtFare}
                                        className={`w-full min-w-[75px] px-2.5 py-1.5 border border-gray-300 rounded-lg font-bold text-xs ${!editFlags.adtFare ? 'bg-gray-100 text-gray-500' : 'text-gray-900 bg-white focus:ring-2 focus:ring-blue-500'}`}
                                      />
                                    </td>
                                    <td className="py-3 px-2">
                                      <input 
                                        type="text" 
                                        value={editBuffer.agentCommission === 0 ? '' : (editBuffer.agentCommission ?? fare.agentCommission ?? 0)}
                                        onChange={e => setEditBuffer({ ...editBuffer, agentCommission: e.target.value === '' ? ('' as any) : Number(e.target.value.replace(/[^0-9.-]+/g,"")) })}
                                        disabled={!editFlags.commission}
                                        className={`w-full min-w-[70px] px-2.5 py-1.5 border border-gray-300 rounded-lg font-bold text-xs ${!editFlags.commission ? 'bg-gray-100 text-gray-500' : 'text-emerald-600 bg-white focus:ring-2 focus:ring-emerald-500'}`}
                                        title="Agent Commission"
                                      />
                                    </td>
                                    <td className="py-3 px-2">
                                      <input 
                                        type="text" 
                                        value={editBuffer.chdFare === 0 ? '' : (editBuffer.chdFare ?? fare.chdFare)}
                                        onChange={e => setEditBuffer({ ...editBuffer, chdFare: e.target.value === '' ? ('' as any) : Number(e.target.value.replace(/[^0-9.-]+/g,"")) })}
                                        disabled={!editFlags.chdFare}
                                        className={`w-full min-w-[75px] px-2.5 py-1.5 border border-gray-300 rounded-lg font-bold text-xs ${!editFlags.chdFare ? 'bg-gray-100 text-gray-500' : 'text-gray-800 bg-white focus:ring-2 focus:ring-blue-500'}`}
                                      />
                                    </td>
                                    <td className="py-3 px-2">
                                      <input 
                                        type="text" 
                                        value={editBuffer.infFare === 0 ? '' : (editBuffer.infFare ?? fare.infFare)}
                                        onChange={e => setEditBuffer({ ...editBuffer, infFare: e.target.value === '' ? ('' as any) : Number(e.target.value.replace(/[^0-9.-]+/g,"")) })}
                                        disabled={!editFlags.infFare}
                                        className={`w-full min-w-[75px] px-2.5 py-1.5 border border-gray-300 rounded-lg font-bold text-xs ${!editFlags.infFare ? 'bg-gray-100 text-gray-500' : 'text-gray-800 bg-white focus:ring-2 focus:ring-blue-500'}`}
                                      />
                                    </td>
                                    <td className="py-3 px-2 text-center">
                                      <input 
                                        type="text" 
                                        value={editBuffer.totalSeats === 0 ? '' : (editBuffer.totalSeats ?? fare.totalSeats)}
                                        onChange={e => setEditBuffer({ ...editBuffer, totalSeats: e.target.value === '' ? ('' as any) : Number(e.target.value.replace(/[^0-9.-]+/g,"")) })}
                                        disabled={!editFlags.totalSeat}
                                        className={`w-full min-w-[65px] px-2 py-1.5 border border-gray-300 rounded-lg text-center font-bold text-xs ${!editFlags.totalSeat ? 'bg-gray-100 text-gray-500' : 'text-gray-900 bg-white focus:ring-2 focus:ring-blue-500'}`}
                                      />
                                    </td>
                                    <td className="py-3 px-2 text-center font-bold">
                                      <input 
                                        type="text" 
                                        value={editBuffer.availableSeats === 0 ? '' : (editBuffer.availableSeats ?? fare.availableSeats)}
                                        onChange={e => setEditBuffer({ ...editBuffer, availableSeats: e.target.value === '' ? ('' as any) : Number(e.target.value.replace(/[^0-9.-]+/g,"")) })}
                                        disabled={!editFlags.availSeat}
                                        className={`w-full min-w-[65px] px-2 py-1.5 border border-gray-300 rounded-lg text-center font-bold text-xs ${!editFlags.availSeat ? 'bg-gray-100 text-gray-500' : 'text-gray-900 bg-white focus:ring-2 focus:ring-blue-500'}`}
                                      />
                                    </td>
                                    <td className="py-3 px-3 text-center font-bold text-emerald-700 whitespace-nowrap">
                                      {fare.realtimeBook ? 'YES' : 'NO'}
                                    </td>
                                    <td className="py-3 px-2">
                                      <input 
                                        type="text" 
                                        value={editBuffer.airlinePnr ?? fare.airlinePnr}
                                        onChange={e => setEditBuffer({ ...editBuffer, airlinePnr: e.target.value })}
                                        disabled={!editFlags.airPnr}
                                        className={`w-full min-w-[85px] px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-mono font-bold uppercase ${!editFlags.airPnr ? 'bg-gray-100 text-gray-500 font-normal' : 'text-gray-900 bg-white focus:ring-2 focus:ring-blue-500'}`}
                                      />
                                    </td>
                                    <td className="py-3 px-3 text-center whitespace-nowrap">
                                      <div className="flex items-center justify-center gap-2">
                                        <button 
                                          onClick={handleSaveEdit}
                                          className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                          title="Save & Apply Changes"
                                        >
                                          <Check size={16} strokeWidth={2} />
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteClick(fare)} 
                                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                          title="Delete Series Fare"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${fare.isTestFlight ? 'bg-amber-100 text-amber-800' : 'bg-gray-200 text-gray-800'}`}>
                                          {fare.isTestFlight ? 'Test' : 'Live'}
                                        </span>
                                      </div>
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
        
        {/* Pagination Bar */}
        <div className="bg-white px-5 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
            <span>
              Showing <span className="font-bold text-gray-900">{totalRecords === 0 ? 0 : startIndex + 1}</span> to <span className="font-bold text-gray-900">{endIndex}</span> of <span className="font-bold text-gray-900">{totalRecords}</span> FDs
            </span>
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-gray-300">|</span>
              <span className="font-semibold text-gray-600">Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-xs font-bold text-gray-700 bg-white outline-none cursor-pointer hover:border-gray-400"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              Prev
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce((acc: (number | string)[], p, idx, arr) => {
                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) {
                  acc.push('...');
                }
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) => (
                typeof p === 'string' ? (
                  <span key={`dots-${idx}`} className="px-1 text-xs text-gray-400">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-7 h-7 text-xs font-bold rounded-lg transition-all ${
                      currentPage === p
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {p}
                  </button>
                )
              ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
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
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden z-[100]">
                <button onClick={handleDownloadReport} className="text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 w-full">Download Report</button>
                <button onClick={handleTLDExport} className="text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 w-full">TLD Export</button>
              </div>
            </div>

            <div className="relative group">
              <button className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all">
                Bulk Actions
                <ChevronDown size={14} />
              </button>
              <div className="absolute bottom-full right-0 mb-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden z-[100]">
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-black text-slate-400 tracking-wider">Flight Management</div>
                <button onClick={() => { 
                  if(selectedIds.length === 0) {
                    toast.error('Select fares first'); 
                  } else {
                    if (selectedIds.length === 1) {
                      const flight = fares.find(f => f._id === selectedIds[0]);
                      if (flight) {
                        const parseTime = (t: string) => {
                          if(!t) return '';
                          if(/^\d{2}:\d{2}$/.test(t)) return t;
                          const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
                          if(m) {
                            let h = parseInt(m[1], 10);
                            if(h === 12) h = 0;
                            if(m[3].toUpperCase() === 'PM') h += 12;
                            return `${h.toString().padStart(2, '0')}:${m[2]}`;
                          }
                          return t;
                        };
                        setFlightModData({ flightNo: flight.flightNo || '', departureTime: parseTime(flight.departureTime), arrivalTime: parseTime(flight.arrivalTime) });
                      }
                    } else {
                      setFlightModData({ flightNo: '', departureTime: '', arrivalTime: '' });
                    }
                    setShowFlightModModal(true);
                  }
                }} className="text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 w-full">Flight Modifications (FLT-MOD)</button>
                <button onClick={handleConnectionFlights} className="text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 w-full">Connection Flights (CXN)</button>
                <button onClick={handleRunAutoSync} className="text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 w-full">Mark Expired Flights</button>
                
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
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 overflow-y-auto font-sans p-4 md:p-6 flex items-start justify-center animate-fade-in">
          <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-12">
            {/* Header Bar */}
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center">
                  <Plane size={18} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold tracking-wide uppercase text-white">
                    Add New Series Fare
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Configure wholesale fixed departure flight inventory, seat allocations, and B2B pricing
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateFare} className="p-6 md:p-8 space-y-6 text-xs text-gray-800 bg-slate-50/50">
              {/* Flight Environment / Mode Selector Banner */}
              <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-gray-900">Inventory Mode:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                      newFare.isTestFlight 
                        ? 'bg-amber-100 text-amber-800 border-amber-300' 
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      {newFare.isTestFlight ? 'SANDBOX TEST (API Testing Only • 999 Seats)' : 'LIVE PRODUCTION (Real Flight Inventory)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {newFare.isTestFlight 
                      ? 'Sandbox test flights appear only in test queries. Partner test bookings will not deduct real balance.' 
                      : 'Live flight will be published immediately to public search and production B2B APIs.'}
                  </p>
                </div>
                <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 shrink-0 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setNewFare({
                      ...newFare,
                      isTestFlight: false,
                      totalSeats: newFare.totalSeats === 999 ? 10 : newFare.totalSeats,
                      availableSeats: newFare.availableSeats === 999 ? 10 : newFare.availableSeats
                    })}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      !newFare.isTestFlight
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Live Flight
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewFare({
                      ...newFare,
                      isTestFlight: true,
                      totalSeats: 999,
                      availableSeats: 999
                    })}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      newFare.isTestFlight
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Test Flight (999 Seats)
                  </button>
                </div>
              </div>

              {/* CARD 1: Route & Flight Information */}
              <div className="bg-white border border-gray-200 shadow-xs rounded-xl p-5 md:p-6 space-y-4">
                <div className="font-extrabold text-sm text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Plane size={16} className="text-blue-600" />
                  <span>1. Route & Flight Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Supplier */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Supplier *</label>
                    <Dropdown 
                      value={supplierName}
                      onChange={() => {}}
                      options={[{ value: supplierName, label: supplierName }]}
                      className="h-10"
                    />
                  </div>

                  {/* Travel Type */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Travel Type *</label>
                    <Dropdown 
                      value={newFare.bookingType}
                      onChange={(value) => setNewFare({ ...newFare, bookingType: value as any })}
                      options={[
                        { value: 'ONE_WAY', label: 'Domestic' },
                        { value: 'ROUND_TRIP', label: 'International' }
                      ]}
                      className="h-10"
                    />
                  </div>

                  {/* Airline */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Airline *</label>
                    <input
                      type="text"
                      value={newFare.airline}
                      onChange={(e) => setNewFare({ ...newFare, airline: e.target.value })}
                      placeholder="e.g. IndiGo, Air India"
                      required
                      className="w-full h-10 px-3.5 text-xs font-semibold border border-gray-300 rounded-lg bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
                    />
                  </div>

                  {/* Flight No */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Flight Number *</label>
                    <input
                      type="text"
                      value={newFare.flightNo}
                      onChange={(e) => setNewFare({ ...newFare, flightNo: e.target.value.toUpperCase() })}
                      placeholder="e.g. 6E-2045"
                      required
                      className="w-full h-10 px-3.5 text-xs font-bold uppercase border border-gray-300 rounded-lg bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
                    />
                  </div>

                  {/* Airline PNR */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Airline PNR *</label>
                    <input
                      type="text"
                      value={newFare.airlinePnr}
                      onChange={(e) => setNewFare({ ...newFare, airlinePnr: e.target.value.toUpperCase() })}
                      placeholder="e.g. ABCD12"
                      required
                      className="w-full h-10 px-3.5 text-xs font-mono font-bold uppercase border border-gray-300 rounded-lg bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
                    />
                  </div>

                  {/* Travel Class */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Travel Class *</label>
                    <Dropdown 
                      value={travelClassAdd}
                      onChange={setTravelClassAdd}
                      options={[
                        { value: 'ECONOMY', label: 'ECONOMY' },
                        { value: 'PREMIUM_ECONOMY', label: 'PREMIUM ECONOMY' },
                        { value: 'BUSINESS', label: 'BUSINESS' }
                      ]}
                      className="h-10"
                    />
                  </div>

                  {/* Origin City */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Origin City (From) *</label>
                    <CitySelect
                      value={newFare.origin}
                      onChange={(val) => setNewFare({ ...newFare, origin: val })}
                      placeholder="Select Origin"
                    />
                  </div>

                  {/* Dep Terminal */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Departure Terminal <span className="font-normal text-gray-400">(Optional)</span></label>
                    <input
                      type="text"
                      placeholder="e.g. T1, T2"
                      value={(newFare as any).departureTerminal || ''}
                      onChange={(e) => setNewFare({ ...newFare, departureTerminal: e.target.value.toUpperCase() } as any)}
                      className="w-full h-10 px-3.5 text-xs font-semibold uppercase border border-gray-300 rounded-lg bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
                    />
                  </div>

                  {/* Destination City */}
                  <div className="sm:col-start-1 lg:col-start-3">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Destination City (To) *</label>
                    <CitySelect
                      value={newFare.destination}
                      onChange={(val) => setNewFare({ ...newFare, destination: val })}
                      placeholder="Select Destination"
                    />
                  </div>

                  {/* Arr Terminal */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Arrival Terminal <span className="font-normal text-gray-400">(Optional)</span></label>
                    <input
                      type="text"
                      placeholder="e.g. T2, T3"
                      value={(newFare as any).arrivalTerminal || ''}
                      onChange={(e) => setNewFare({ ...newFare, arrivalTerminal: e.target.value.toUpperCase() } as any)}
                      className="w-full h-10 px-3.5 text-xs font-semibold uppercase border border-gray-300 rounded-lg bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 2: Schedule & Timings */}
              <div className="bg-white border border-gray-200 shadow-xs rounded-xl p-5 md:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                    <Calendar size={16} className="text-blue-600" />
                    <span>2. Schedule & Flight Timings</span>
                  </div>
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/70 text-blue-800 text-xs font-bold cursor-pointer hover:bg-blue-100/70 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={isConnectingFlight} 
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setIsConnectingFlight(isChecked);
                        if (isChecked) {
                          setSegments(prev => {
                            if (prev.length >= 2) return prev;
                            return [
                              { origin: newFare.origin || '', destination: '', airline: '', flightNo: '', departureTime: '', arrivalTime: '', departureTerminal: '', arrivalTerminal: '' },
                              { origin: '', destination: newFare.destination || '', airline: '', flightNo: '', departureTime: '', arrivalTime: '', departureTerminal: '', arrivalTerminal: '' }
                            ];
                          });
                        }
                      }} 
                      className="rounded text-blue-600 border-gray-300 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Connecting Flight (Multi-Leg / 1-Stop)?</span>
                  </label>
                </div>

                {/* Helpful Note for Direct vs Connecting Flight */}
                <div className={`p-3 rounded-lg border text-xs leading-relaxed transition-all ${
                  isConnectingFlight 
                    ? 'bg-amber-50/80 border-amber-200 text-amber-900' 
                    : 'bg-blue-50/60 border-blue-200 text-blue-900'
                }`}>
                  {isConnectingFlight ? (
                    <div className="space-y-1">
                      <p className="font-extrabold flex items-center gap-1.5 text-amber-900">
                        <span>✈️ Connecting Flight Mode (Multi-Leg):</span>
                      </p>
                      <p className="text-[11px] text-amber-800">
                        Connecting flight ke liye <strong>kam se kam 2 legs compulsory hain</strong> (Leg 1: Pehla safar, Leg 2: Doosra safar). Aap chahein toh 3rd leg add kar sakte hain, par 2 legs hamesha rahenge.
                      </p>
                      <p className="text-[11px] text-amber-900 font-bold bg-amber-100/70 px-2 py-1 rounded border border-amber-300/50 mt-1">
                        💡 Zaroori: Agar New Delhi se Dubai Direct / Non-Stop flight hai, toh upar diye checkbox ko <strong>UNCHECK (band)</strong> rakhein!
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] text-blue-800">
                        <strong>Direct Flight Mode:</strong> Yeh direct non-stop flight hai. Neeche seedha Travel Date, Departure & Arrival time select karein. (Agar flight kisi aur shahar ruk kar plane badalti hai, tabhi upar Connecting Flight check karein).
                      </p>
                    </div>
                  )}
                </div>

                {/* Journey Travel Date & Timings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  {/* Travel Date (Always Visible) */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Journey Travel Date *</label>
                    <DOBCalendar
                      value={newFare.travelDate}
                      onChange={(date) => setNewFare({ ...newFare, travelDate: date })}
                      placeholder="dd-mm-yyyy"
                    />
                  </div>

                  {!isConnectingFlight && (
                    <>
                      {/* Depart Time */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Departure Time *</label>
                        <Dropdown 
                          value={newFare.departureTime} 
                          onChange={(val) => setNewFare({ ...newFare, departureTime: val })} 
                          options={timeOptions}
                          placeholder="Select Time"
                          searchable={true}
                          direction="auto"
                          className="w-full h-10"
                        />
                      </div>

                      {/* Arrival Time */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Arrival Time *</label>
                        <Dropdown 
                          value={newFare.arrivalTime} 
                          onChange={(val) => setNewFare({ ...newFare, arrivalTime: val })} 
                          options={timeOptions}
                          placeholder="Select Time"
                          searchable={true}
                          direction="auto"
                          className="w-full h-10"
                        />
                      </div>

                      {/* Duration & Day Change */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Duration</label>
                          <input 
                            type="text" 
                            value={(newFare as any).duration || '--:--'} 
                            readOnly 
                            className="w-full h-10 px-3 text-xs font-bold text-center border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed shadow-2xs" 
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Day Change</label>
                          <input 
                            type="text" 
                            value={`+${(newFare as any).dayChange || 0} Day`} 
                            readOnly 
                            className="w-full h-10 px-2 text-xs font-bold text-center border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed shadow-2xs" 
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {isConnectingFlight && (
                  <div className="space-y-4 pt-2">
                    {/* Segments */}
                    {segments.map((seg, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wide">
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                              Flight Leg {idx + 1} {idx === 0 ? '(Pehla Segment)' : idx === 1 ? '(Doosra Segment)' : ''}
                            </span>
                            {idx < 2 && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                Compulsory
                              </span>
                            )}
                          </div>
                          {idx >= 2 && segments.length > 2 && (
                            <button 
                              type="button" 
                              onClick={() => setSegments(segments.filter((_, i) => i !== idx))}
                              className="text-rose-600 hover:text-rose-800 text-xs font-bold flex items-center gap-1 cursor-pointer bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-md transition-colors"
                            >
                              <X size={14} /> Remove Leg {idx + 1}
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-1">Flight No *</label>
                            <input 
                              type="text" 
                              value={seg.flightNo} 
                              onChange={e => { const s = [...segments]; s[idx].flightNo = e.target.value.toUpperCase(); setSegments(s); }} 
                              placeholder="e.g. AI-887"
                              required 
                              className="w-full h-9 px-3 text-xs font-bold border border-gray-300 rounded-lg bg-white outline-none" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-1">Airline Code *</label>
                            <input 
                              type="text" 
                              value={seg.airline} 
                              onChange={e => { const s = [...segments]; s[idx].airline = e.target.value.toUpperCase(); setSegments(s); }} 
                              placeholder="e.g. AI" 
                              className="w-full h-9 px-3 text-xs font-bold border border-gray-300 rounded-lg bg-white outline-none" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-1">Origin *</label>
                            <CitySelect
                              value={seg.origin}
                              onChange={(val) => {
                                const s = [...segments];
                                s[idx].origin = val;
                                setSegments(s);
                              }}
                              placeholder="Select Origin"
                              heightClass="h-9"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-1">Destination *</label>
                            <CitySelect
                              value={seg.destination}
                              onChange={(val) => {
                                const s = [...segments];
                                s[idx].destination = val;
                                setSegments(s);
                              }}
                              placeholder="Select Destination"
                              heightClass="h-9"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-1">Depart Time *</label>
                            <Dropdown 
                              value={seg.departureTime} 
                              onChange={(val) => { const s = [...segments]; s[idx].departureTime = val; setSegments(s); }} 
                              options={timeOptions}
                              placeholder="06:00"
                              searchable={true}
                              direction="auto"
                              className="w-full h-9"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-1">Arrival Time *</label>
                            <Dropdown 
                              value={seg.arrivalTime} 
                              onChange={(val) => { const s = [...segments]; s[idx].arrivalTime = val; setSegments(s); }} 
                              options={timeOptions}
                              placeholder="08:15"
                              searchable={true}
                              direction="auto"
                              className="w-full h-9"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-1">Dep Terminal</label>
                            <input 
                              type="text" 
                              value={seg.departureTerminal || ''} 
                              onChange={e => { const s = [...segments]; s[idx].departureTerminal = e.target.value.toUpperCase(); setSegments(s); }} 
                              placeholder="T1" 
                              className="w-full h-9 px-3 text-xs border border-gray-300 rounded-lg bg-white outline-none uppercase" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-1">Arr Terminal</label>
                            <input 
                              type="text" 
                              value={seg.arrivalTerminal || ''} 
                              onChange={e => { const s = [...segments]; s[idx].arrivalTerminal = e.target.value.toUpperCase(); setSegments(s); }} 
                              placeholder="T2" 
                              className="w-full h-9 px-3 text-xs border border-gray-300 rounded-lg bg-white outline-none uppercase" 
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button 
                      type="button" 
                      onClick={() => setSegments([...segments, { origin: '', destination: '', airline: '', flightNo: '', departureTime: '', arrivalTime: '', departureTerminal: '', arrivalTerminal: '' }])}
                      className="px-4 py-2 border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus size={14} /> Add Another Leg
                    </button>
                  </div>
                )}
              </div>

              {/* CARD 3: Seats & Inventory Policy */}
              <div className="bg-white border border-gray-200 shadow-xs rounded-xl p-5 md:p-6 space-y-4">
                <div className="font-extrabold text-sm text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <UserCheck size={16} className="text-blue-600" />
                  <span>3. Seats & Inventory Policy</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Total Seats */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Total Inventory Seats *</label>
                    <input
                      type="number"
                      value={(newFare as any).totalSeats ?? ''}
                      onChange={(e) => setNewFare({ 
                        ...newFare, 
                        totalSeats: e.target.value === '' ? '' : Number(e.target.value), 
                        availableSeats: e.target.value === '' ? '' : Number(e.target.value) 
                      } as any)}
                      readOnly={newFare.isTestFlight}
                      required
                      placeholder="e.g. 50"
                      className={`w-full h-10 px-3.5 text-xs font-bold border border-gray-300 rounded-lg outline-none transition-all shadow-2xs ${
                        newFare.isTestFlight 
                          ? 'bg-amber-50 text-amber-900 border-amber-300 cursor-not-allowed' 
                          : 'bg-white text-blue-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                      }`}
                    />
                    {newFare.isTestFlight && (
                      <p className="text-[10px] text-amber-700 mt-1 font-semibold">Locked at 999 seats in Sandbox test mode</p>
                    )}
                  </div>

                  {/* Cutoff Days */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Close Before Departure (Days)</label>
                    <input
                      type="number"
                      value={(newFare as any).closeBeforeDepartureDays ?? ''}
                      onChange={(e) => setNewFare({ ...newFare, closeBeforeDepartureDays: e.target.value === '' ? '' : Number(e.target.value) } as any)}
                      placeholder="0"
                      className="w-full h-10 px-3.5 text-xs font-semibold border border-gray-300 rounded-lg bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
                    />
                  </div>

                  {/* Cutoff Hours */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Close Before Departure (Hours) *</label>
                    <input
                      type="number"
                      value={(newFare as any).closeBeforeDepartureHours ?? ''}
                      onChange={(e) => setNewFare({ ...newFare, closeBeforeDepartureHours: e.target.value === '' ? '' : Number(e.target.value) } as any)}
                      placeholder="4"
                      required
                      className="w-full h-10 px-3.5 text-xs font-semibold border border-gray-300 rounded-lg bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 4: Fares, Commercials & Baggage */}
              <div className="bg-white border border-gray-200 shadow-xs rounded-xl p-5 md:p-6 space-y-5">
                <div className="font-extrabold text-sm text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <span className="text-blue-600 font-serif font-black text-base">₹</span>
                  <span>4. Fares, Commercials & Baggage</span>
                </div>

                {/* Sub-section: Passenger Fares */}
                <div>
                  <h4 className="text-[11px] font-extrabold uppercase text-gray-500 tracking-wider mb-2">Per-Passenger Fare Breakdown (INR)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Adult Fare * (₹)</label>
                      <input
                        type="number"
                        value={(newFare as any).adtFare ?? ''}
                        onChange={(e) => setNewFare({ ...newFare, adtFare: e.target.value === '' ? '' : Number(e.target.value) } as any)}
                        placeholder="e.g. 4200"
                        required
                        className="w-full h-10 px-3.5 text-xs font-extrabold text-emerald-700 border-2 border-emerald-400 rounded-lg bg-emerald-50/20 outline-none focus:ring-2 focus:ring-emerald-200 transition-all shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Child Fare (₹)</label>
                      <input
                        type="number"
                        value={(newFare as any).chdFare ?? ''}
                        onChange={(e) => setNewFare({ ...newFare, chdFare: e.target.value === '' ? '' : Number(e.target.value) } as any)}
                        placeholder="e.g. 4200"
                        className="w-full h-10 px-3.5 text-xs font-semibold border border-gray-300 rounded-lg bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Infant Fare (₹) <span className="text-blue-600 font-normal">(Dedicated Seat)</span></label>
                      <input
                        type="number"
                        value={(newFare as any).infFare ?? ''}
                        onChange={(e) => setNewFare({ ...newFare, infFare: e.target.value === '' ? '' : Number(e.target.value) } as any)}
                        placeholder="e.g. 1500"
                        className="w-full h-10 px-3.5 text-xs font-semibold border border-gray-300 rounded-lg bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Sub-section: Baggage & Policy */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-[11px] font-extrabold uppercase text-gray-500 tracking-wider mb-2">Baggage Allowance & Commercial Terms</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Check-In Baggage</label>
                      <input 
                        type="text" 
                        defaultValue="15 Kg" 
                        className="w-full h-10 px-3.5 text-xs font-semibold border border-gray-300 rounded-lg bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Hand / Cabin Baggage</label>
                      <input 
                        type="text" 
                        defaultValue="7 Kg" 
                        className="w-full h-10 px-3.5 text-xs font-semibold border border-gray-300 rounded-lg bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Agent Commission (₹)</label>
                      <input 
                        type="number"
                        min="0"
                        value={(newFare as any).agentCommission ?? ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                          setNewFare({ ...newFare, agentCommission: val } as any);
                        }}
                        placeholder="0 (e.g. 200)"
                        className="w-full h-10 px-3.5 text-xs font-semibold border border-gray-300 rounded-lg bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Cancellation Policy</label>
                      <Dropdown 
                        value={(newFare as any).cancellationPolicy || '100% Non-Refundable Charter'}
                        onChange={(val) => setNewFare({ 
                          ...newFare, 
                          cancellationPolicy: val, 
                          isRefundable: val !== '100% Non-Refundable Charter' 
                        } as any)}
                        options={cancellationPolicyOptions}
                        direction="auto"
                        className="w-full h-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Action Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs transition-all cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <Plane size={15} /> Save & Publish Series Fare
                </button>
              </div>
            </form>

            <div className="bg-gray-100 py-2.5 px-6 text-right text-[10px] text-gray-500 font-bold border-t border-gray-200">
              © 2026 TrippeChalo India. All rights reserved.
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
              <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
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
              {(() => {
                const selectedFlightsData = fares.filter(f => selectedIds.includes(f._id));
                const isSingleFlight = selectedFlightsData.length === 1;
                const singleFlight = isSingleFlight ? selectedFlightsData[0] : null;

                return isSingleFlight && singleFlight ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm flex justify-between items-center mb-4">
                    <div>
                      <div className="font-bold text-gray-900">{singleFlight.airline}</div>
                      <div className="text-xs text-gray-600 font-mono">{singleFlight.airlinePnr}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-700">{singleFlight.origin} ✈ {singleFlight.destination}</div>
                      <div className="text-xs text-gray-600">{new Date(singleFlight.travelDate).toLocaleDateString('en-GB')}</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs mb-4 max-h-32 overflow-y-auto">
                    <div className="font-bold text-gray-700 mb-2">Selected Flights ({selectedFlightsData.length}):</div>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 font-mono">
                      {selectedFlightsData.map(f => (
                        <li key={f._id}>{f.airlinePnr || 'NO-PNR'} | {f.origin}-{f.destination} | {new Date(f.travelDate).toLocaleDateString('en-GB')}</li>
                      ))}
                    </ul>
                  </div>
                );
              })()}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">New Departure Time</label>
                  <input
                    type="text"
                    value={flightModData.departureTime}
                    onChange={e => setFlightModData(prev => ({ ...prev, departureTime: e.target.value }))}
                    className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">New Arrival Time</label>
                  <input
                    type="text"
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

      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(fareToDelete)}
        title="Delete Series Fare"
        message={`Are you sure you want to permanently delete Series Fare ${fareToDelete?.sfId} (${fareToDelete?.airline} ${fareToDelete?.flightNo}: ${fareToDelete?.origin}-${fareToDelete?.destination})? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Fare'}
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setFareToDelete(null)}
      />
    </div>
  );
};

export default AdminSeriesFareMaker;
