import React, { useState } from 'react';
import Dropdown from '../../components/ui/Dropdown';
import DOBCalendar from '../../components/ui/DOBCalendar';
import api from '../../services/api';
import toast from 'react-hot-toast';

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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.mobile || !formData.email || !formData.origin || !formData.destination || !formData.onwardDate || !formData.adults) {
      toast.error('Please fill all required fields (*) before submitting.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/api/offline-booking', {
        ...formData,
        tabType: activeTab,
        status: 'PENDING'
      });
      toast.success('Offline booking request submitted successfully!');
      
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 text-[11px] font-black uppercase tracking-wider">
            {['GROUP BOOKING', 'LTC OFFLINE BOOKING', 'INTERNATIONAL BOOKING'].map(tab => (
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
                <input type="text" value={formData.origin} onChange={(e) => handleInputChange('origin', e.target.value)} className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500 uppercase" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Destination <span className="text-red-500">*</span></label>
                <input type="text" value={formData.destination} onChange={(e) => handleInputChange('destination', e.target.value)} className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500 uppercase" />
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
                <input type="number" min="1" value={formData.adults} onChange={(e) => handleInputChange('adults', parseInt(e.target.value) || 1)} className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Child</label>
                <input type="number" min="0" value={formData.child} onChange={(e) => handleInputChange('child', parseInt(e.target.value) || 0)} className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Infant</label>
                <input type="number" min="0" value={formData.infants} onChange={(e) => handleInputChange('infants', parseInt(e.target.value) || 0)} className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500" />
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

      </div>
    </div>
  );
};

export default B2BOfflineBooking;
