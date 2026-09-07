import React, { useState } from 'react';
import Dropdown from '../../components/ui/Dropdown';
import DOBCalendar from '../../components/ui/DOBCalendar';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plane } from 'lucide-react';

const FALLBACK_CITIES = [
  { code: 'DEL', name: 'DELHI', airport: 'Indira Gandhi International Airport', country: 'India' },
  { code: 'BOM', name: 'MUMBAI', airport: 'Chhatrapati Shivaji Airport', country: 'India' },
  { code: 'GOI', name: 'GOA', airport: 'Dabolim Airport', country: 'India' },
  { code: 'HYD', name: 'HYDERABAD', airport: 'Begumpet Airport', country: 'India' },
  { code: 'BLR', name: 'BENGALURU', airport: 'Kempegowda International Airport', country: 'India' },
  { code: 'CCU', name: 'KOLKATA', airport: 'Netaji Subhash Chandra Bose', country: 'India' },
  { code: 'MAA', name: 'CHENNAI', airport: 'Chennai International Airport', country: 'India' }
];

const CitySelect = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder?: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [cities, setCities] = React.useState<any[]>(FALLBACK_CITIES);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    api.get('/api/searches/cities').then(res => {
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setCities(res.data);
      }
    }).catch(() => {});
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCity = cities.find(c => c.code === value);
  const displayValue = selectedCity ? `${selectedCity.name.charAt(0) + selectedCity.name.slice(1).toLowerCase()} (${selectedCity.code})` : value;

  const filteredCities = searchQuery
    ? cities.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.airport && c.airport.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.country && c.country.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : cities;

  return (
    <div className="relative w-full h-full flex items-center bg-white border border-gray-200 rounded text-xs outline-none focus-within:border-blue-500" ref={dropdownRef}>
      <input
        type="text"
        value={isOpen ? searchQuery : displayValue}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          if (!isOpen) setIsOpen(true);
        }}
        onFocus={() => { setIsOpen(true); setSearchQuery(''); }}
        placeholder={placeholder}
        className="w-full h-[38px] px-3 bg-transparent outline-none text-[#0c1a40] placeholder:text-gray-400"
      />
      {isOpen && (
        <div className="absolute top-[calc(100%+5px)] left-0 z-[60] bg-white border border-gray-200 rounded shadow-xl w-[280px] max-h-[250px] overflow-y-auto animate-in fade-in duration-200">
          <div className="text-[10px] text-gray-500 font-bold px-3 py-2 uppercase tracking-wider bg-gray-50/80 sticky top-0 border-b border-gray-100">{searchQuery ? 'Search Results' : 'Popular Cities'}</div>
          <div className="py-1">
            {filteredCities.length === 0 ? (
              <div className="px-4 py-3 text-xs text-gray-500 text-center">No cities found</div>
            ) : (
              filteredCities.map(city => (
                <div 
                  key={city.code}
                  onClick={() => { onChange(city.code); setIsOpen(false); setSearchQuery(''); }}
                  className="flex justify-between items-center px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                >
                  <div>
                    <div className="font-bold text-[12px] text-[#0c1a40] capitalize">{city.name.toLowerCase()}</div>
                    <div className="text-[9px] text-gray-500 flex items-center gap-1 mt-0.5"><Plane size={8} className="transform rotate-45"/> {city.airport}</div>
                  </div>
                  <div className="bg-gray-100 text-gray-600 text-[9px] px-1.5 py-0.5 rounded font-bold">{city.code}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const bookingTypes = [{ value: 'One-Way', label: 'One-Way' }, { value: 'Return', label: 'Return' }];
const travelTypes = [{ value: 'Domestic', label: 'Domestic' }, { value: 'International', label: 'International' }];
const classes = [{ value: 'Economy', label: 'Economy' }, { value: 'Business', label: 'Business' }];

const B2BOfflineBooking: React.FC = () => {
  const [activeTab, setActiveTab] = useState('GROUP BOOKING');
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    origin: '',
    destination: '',
    bookingType: 'One-Way',
    travelType: 'Domestic',
    onwardDate: '',
    classOnward: 'Economy',
    airlineCode: '',
    flightCode: '',
    adults: 1,
    child: 0,
    infants: 0,
    remarks: '',
    flexibilityPrice: false,
    flexibilityDate: false,
    flexibilityFlight: false
  });
  
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [fetchingHistory, setFetchingHistory] = useState(false);

  const fetchHistory = async () => {
    try {
      setFetchingHistory(true);
      const res = await api.get('/api/group-bookings/my-requests');
      setHistory(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingHistory(false);
    }
  };

  React.useEffect(() => {
    fetchHistory();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.mobile || !formData.email || !formData.origin || !formData.destination || !formData.onwardDate || !formData.remarks) {
      toast.error('Please fill all required fields (*)');
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'GROUP BOOKING' || activeTab === 'INTERNATIONAL BOOKING') {
        const payload = {
          contactInfo: {
            name: formData.name,
            mobile: formData.mobile,
            email: formData.email,
            address: formData.address
          },
          flightDetails: {
            origin: formData.origin,
            destination: formData.destination,
            bookingType: formData.bookingType,
            travelType: activeTab === 'INTERNATIONAL BOOKING' ? 'International' : formData.travelType,
            onwardDate: formData.onwardDate,
            classOnward: formData.classOnward,
            airlineCode: formData.airlineCode,
            flightCode: formData.flightCode
          },
          requestedSeats: {
            adults: formData.adults,
            children: formData.child,
            infants: formData.infants,
            total: formData.adults + formData.child + formData.infants
          },
          flexibility: {
            price: formData.flexibilityPrice,
            date: formData.flexibilityDate,
            flight: formData.flexibilityFlight
          },
          remarks: formData.remarks
        };

        await api.post('/api/group-bookings/request', payload);
        toast.success('Group Booking Request Submitted Successfully!');
        fetchHistory(); // Refresh history table
      } else {
        toast.success(`${activeTab} request submitted successfully! (Simulated)`);
        await api.post('/api/offline-booking', {
          ...formData,
          tabType: activeTab,
          status: 'PENDING'
        });
        toast.success('Offline booking request submitted successfully!');
      }
      
      // Reset form
      setFormData({
        name: '', mobile: '', email: '', address: '', origin: '', destination: '',
        bookingType: 'One-Way', travelType: 'Domestic', onwardDate: '', classOnward: 'Economy',
        airlineCode: '', flightCode: '', adults: 1, child: 0, infants: 0, remarks: '',
        flexibilityPrice: false, flexibilityDate: false, flexibilityFlight: false
      });
    } catch (error) {
      console.error('Error submitting offline booking:', error);
      toast.error('Failed to submit offline booking request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-[#fafbfd] p-6 text-[#0c1a40]">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        
        {/* Header Title Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#0c1a40]">OFFLINE BOOKING</h2>
        </div>

        {/* Tabs and Form Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 text-[11px] font-black uppercase tracking-wider">
            {['GROUP BOOKING', 'INTERNATIONAL BOOKING'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-center transition-colors ${activeTab === tab ? 'text-[#0c1a40] border-b-2 border-[#0c1a40] bg-gray-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-8">
            <h3 className="text-sm font-bold text-[#0c1a40] mb-4">Name & Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Name <span className="text-red-500">*</span></label>
                <input type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Mobile <span className="text-red-500">*</span></label>
                <input type="text" value={formData.mobile} onChange={(e) => handleInputChange('mobile', e.target.value)} className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Email <span className="text-red-500">*</span></label>
                <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Address</label>
                <input type="text" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500" />
              </div>
            </div>

            <h3 className="text-sm font-bold text-[#0c1a40] mb-4">Booking Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Origin <span className="text-red-500">*</span></label>
                <div className="h-[38px]">
                  <CitySelect value={formData.origin} onChange={(val) => handleInputChange('origin', val)} placeholder="Select Origin" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Destination <span className="text-red-500">*</span></label>
                <div className="h-[38px]">
                  <CitySelect value={formData.destination} onChange={(val) => handleInputChange('destination', val)} placeholder="Select Destination" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Booking Type <span className="text-red-500">*</span></label>
                <Dropdown value={formData.bookingType} onChange={(val) => handleInputChange('bookingType', val)} options={bookingTypes} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Travel Type <span className="text-red-500">*</span></label>
                <Dropdown value={formData.travelType} onChange={(val) => handleInputChange('travelType', val)} options={travelTypes} />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Onward Date <span className="text-red-500">*</span></label>
                <DOBCalendar value={formData.onwardDate} onChange={(val) => handleInputChange('onwardDate', val)} placeholder="dd-mm-yyyy" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Class Onward</label>
                <Dropdown value={formData.classOnward} onChange={(val) => handleInputChange('classOnward', val)} options={classes} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Airline Code</label>
                <input type="text" value={formData.airlineCode} onChange={(e) => handleInputChange('airlineCode', e.target.value)} className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500 uppercase" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Flight Code</label>
                <input type="text" value={formData.flightCode} onChange={(e) => handleInputChange('flightCode', e.target.value)} className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500 uppercase" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Adult</label>
                <input type="text" inputMode="numeric" pattern="[0-9]*" value={formData.adults} onChange={(e) => handleInputChange('adults', e.target.value === '' ? '' : (parseInt(e.target.value) || 1))} onBlur={(e) => { if (e.target.value === '' || parseInt(e.target.value) < 1) handleInputChange('adults', 1); }} className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Child</label>
                <input type="text" inputMode="numeric" pattern="[0-9]*" value={formData.child} onChange={(e) => handleInputChange('child', e.target.value === '' ? '' : (parseInt(e.target.value) || 0))} onBlur={(e) => { if (e.target.value === '') handleInputChange('child', 0); }} className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Infant</label>
                <input type="text" inputMode="numeric" pattern="[0-9]*" value={formData.infants} onChange={(e) => handleInputChange('infants', e.target.value === '' ? '' : (parseInt(e.target.value) || 0))} onBlur={(e) => { if (e.target.value === '') handleInputChange('infants', 0); }} className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Remarks <span className="text-red-500">*</span></label>
                <input type="text" value={formData.remarks} onChange={(e) => handleInputChange('remarks', e.target.value)} className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="flex gap-8 items-center mb-8 text-xs font-semibold text-gray-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.flexibilityPrice} onChange={(e) => handleInputChange('flexibilityPrice', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-[#0c1a40] focus:ring-[#0c1a40]" />
                Flexibility Price
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.flexibilityDate} onChange={(e) => handleInputChange('flexibilityDate', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-[#0c1a40] focus:ring-[#0c1a40]" />
                Flexibility Date
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.flexibilityFlight} onChange={(e) => handleInputChange('flexibilityFlight', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-[#0c1a40] focus:ring-[#0c1a40]" />
                Flexibility Flight
              </label>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="bg-[#0b1031] text-white px-10 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-blue-900 transition disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
        
        {/* History Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-black text-[13px] text-[#0c1a40] uppercase tracking-wider">
              My {activeTab === 'INTERNATIONAL BOOKING' ? 'International' : 'Domestic'} Group Bookings
            </h3>
            <button 
              onClick={fetchHistory}
              disabled={fetchingHistory}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 disabled:opacity-50 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded"
            >
              {fetchingHistory ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Travel Date</th>
                  <th className="px-4 py-3">Pax</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Quote (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history
                  .filter(h => activeTab === 'INTERNATIONAL BOOKING' ? h.flightDetails?.travelType === 'International' : h.flightDetails?.travelType !== 'International')
                  .map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-bold text-[#0c1a40]">{item.flightDetails?.origin} → {item.flightDetails?.destination}</td>
                    <td className="px-4 py-3">{item.flightDetails?.onwardDate}</td>
                    <td className="px-4 py-3">{item.requestedSeats?.total}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                        item.status === 'QUOTED' ? 'bg-blue-100 text-blue-700' :
                        item.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        item.status === 'APPROVED' || item.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-green-600">
                      {item.quotePrice ? `₹${item.quotePrice.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))}
                {history.filter(h => activeTab === 'INTERNATIONAL BOOKING' ? h.flightDetails?.travelType === 'International' : h.flightDetails?.travelType !== 'International').length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400 font-bold">No requests found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default B2BOfflineBooking;
