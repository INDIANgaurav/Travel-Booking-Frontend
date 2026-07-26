import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Building2, CreditCard, TrendingUp, DollarSign } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser, setAgentBookingMode } from '../../../store/authSlice';
import api from '../../../services/api';

export default function AgentDashboard() {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [stats, setStats] = useState({ totalBookings: 0, revenue: 0, profit: 0, activeFlights: 0 });

  useEffect(() => {
    if (user?.isApproved) {
      api.get('/api/bookings/my-bookings').then(({ data }) => {
        const myBizBookings = data.filter((b: any) => b.bookingMode === 'MYBIZ' && b.status !== 'CANCELLED');
        const revenue = myBizBookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);
        
        // As per user plan, assuming 10% profit margin on MYBIZ bookings
        const profit = revenue * 0.10;
        
        const activeFlights = myBizBookings.filter((b: any) => {
          if (b.type !== 'FLIGHT') return false;
          const travelDate = new Date(b.date || b.createdAt);
          return travelDate.getTime() >= new Date().getTime();
        }).length;

        setStats({
          totalBookings: myBizBookings.length,
          revenue,
          profit,
          activeFlights
        });
      }).catch(console.error);
    }
  }, [user]);

  const handleBookFlight = () => {
    dispatch(setAgentBookingMode('MYBIZ'));
    navigate('/?tab=Flights');
  };

  const handleBookHotel = () => {
    dispatch(setAgentBookingMode('MYBIZ'));
    navigate('/?tab=Hotels');
  };

  return (
    <div className="space-y-6">
      {!user?.isApproved && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Account Pending Approval</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Your B2B Agent account is currently under review by an administrator. You will not be able to make bookings or access discounted pricing until approved.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <p className="mt-2 text-sm text-gray-600">Here's an overview of your agency's performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <CreditCard size={24} />
          </div>
          <p className="text-sm font-medium text-gray-500">Total Bookings</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalBookings}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <DollarSign size={24} />
          </div>
          <p className="text-sm font-medium text-gray-500">Revenue (INR)</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">₹{stats.revenue.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-4">
            <TrendingUp size={24} />
          </div>
          <p className="text-sm font-medium text-gray-500">Profit Margin (10%)</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">₹{stats.profit.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
            <Plane size={24} />
          </div>
          <p className="text-sm font-medium text-gray-500">Active Flights</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeFlights}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <button 
            disabled={!user?.isApproved}
            onClick={handleBookFlight}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plane size={20} /> Book Flight
          </button>
          <button 
            disabled={!user?.isApproved}
            onClick={handleBookHotel}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Building2 size={20} /> Book Hotel
          </button>
        </div>
      </div>
    </div>
  );
}
