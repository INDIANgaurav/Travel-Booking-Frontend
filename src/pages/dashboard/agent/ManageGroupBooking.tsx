import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import Loader from '../../../components/common/Loader';
import { ArrowLeft, Save } from 'lucide-react';

export default function ManageGroupBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passengers, setPassengers] = useState<any[]>([]);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data } = await api.get('/api/group-bookings/my-requests');
        const currentBooking = data.find((b: any) => b._id === id);
        
        if (!currentBooking) {
          toast.error('Booking not found');
          navigate('/b2b/group-bookings');
          return;
        }

        setBooking(currentBooking);
        
        // Initialize passenger forms based on requested seats if not already filled
        if (currentBooking.passengers && currentBooking.passengers.length > 0) {
          setPassengers(currentBooking.passengers);
        } else {
          const initialForms = [];
          for (let i = 0; i < currentBooking.requestedSeats.adults; i++) initialForms.push({ type: 'Adult', title: 'Mr', firstName: '', lastName: '', gender: 'Male', dob: '' });
          for (let i = 0; i < currentBooking.requestedSeats.child; i++) initialForms.push({ type: 'Child', title: 'Mstr', firstName: '', lastName: '', gender: 'Male', dob: '' });
          for (let i = 0; i < currentBooking.requestedSeats.infants; i++) initialForms.push({ type: 'Infant', title: 'Mstr', firstName: '', lastName: '', gender: 'Male', dob: '' });
          setPassengers(initialForms);
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
        toast.error('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id, navigate]);

  const handleInputChange = (index: number, field: string, value: string) => {
    const updated = [...passengers];
    updated[index][field] = value;
    
    // Auto-update title based on gender if gender changes
    if (field === 'gender') {
      if (updated[index].type === 'Adult') {
        updated[index].title = value === 'Male' ? 'Mr' : 'Ms';
      } else {
        updated[index].title = value === 'Male' ? 'Mstr' : 'Miss';
      }
    }
    
    setPassengers(updated);
  };

  const handleSavePassengers = async () => {
    // Basic validation
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.firstName || !p.lastName || !p.dob) {
        toast.error(`Please fill all required fields for Passenger ${i + 1}`);
        return;
      }
    }

    try {
      setSaving(true);
      await api.post(`/api/group-bookings/${id}/passengers`, { passengers });
      toast.success('Passenger details submitted successfully!');
      navigate('/b2b/group-bookings');
    } catch (error: any) {
      console.error('Error saving passengers:', error);
      toast.error(error.response?.data?.message || 'Failed to save passengers');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/b2b/group-bookings')} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Passenger Details</h1>
          <p className="mt-2 text-sm text-gray-600">
            {booking.flightDetails.origin} to {booking.flightDetails.destination} | {booking.flightDetails.onwardDate}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-blue-50/50">
          <h3 className="font-bold text-[#0c1a40]">Dynamic Passenger Form</h3>
          <p className="text-xs text-gray-500 mt-1">Please provide accurate details for all {booking.requestedSeats.total} passengers exactly as they appear on their Govt ID.</p>
        </div>
        
        <div className="p-6 space-y-8">
          {passengers.map((p, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-6 relative bg-gray-50/30">
              <span className="absolute -top-3 left-4 bg-white px-3 py-0.5 text-xs font-bold text-blue-600 border border-blue-100 rounded-full shadow-sm">
                Passenger {index + 1} ({p.type})
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Title *</label>
                  <select 
                    value={p.title} 
                    onChange={(e) => handleInputChange(index, 'title', e.target.value)}
                    className="w-full h-[38px] px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Mr">Mr</option>
                    <option value="Ms">Ms</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Mstr">Mstr</option>
                    <option value="Miss">Miss</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">First Name *</label>
                  <input 
                    type="text" 
                    value={p.firstName} 
                    onChange={(e) => handleInputChange(index, 'firstName', e.target.value)}
                    placeholder="First & Middle Name"
                    className="w-full h-[38px] px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Last Name *</label>
                  <input 
                    type="text" 
                    value={p.lastName} 
                    onChange={(e) => handleInputChange(index, 'lastName', e.target.value)}
                    placeholder="Last Name"
                    className="w-full h-[38px] px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Gender *</label>
                  <select 
                    value={p.gender} 
                    onChange={(e) => handleInputChange(index, 'gender', e.target.value)}
                    className="w-full h-[38px] px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Date of Birth *</label>
                  <input 
                    type="date" 
                    value={p.dob} 
                    onChange={(e) => handleInputChange(index, 'dob', e.target.value)}
                    className="w-full h-[38px] px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button 
            onClick={handleSavePassengers}
            disabled={saving || booking.status === 'COMPLETED'}
            className={`px-8 py-3 font-bold rounded-xl shadow-md transition-all flex items-center gap-2 ${
              booking.status === 'COMPLETED' 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#0c1a40] hover:bg-blue-900 text-white'
            }`}
          >
            <Save size={18} />
            {saving ? 'Saving...' : booking.status === 'COMPLETED' ? 'Already Submitted' : 'Submit Passenger Details'}
          </button>
        </div>
      </div>
    </div>
  );
}
