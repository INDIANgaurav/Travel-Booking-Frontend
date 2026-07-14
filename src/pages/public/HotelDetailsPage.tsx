import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import TopNavbar from '../../components/layout/TopNavbar';
import { MapPin, Star, Check, Info, Users, Bed, ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/authSlice';
import LoginModal from '../../components/auth/LoginModal';
import toast from 'react-hot-toast';

const HotelSkeleton = () => (
  <div className="max-w-[1200px] mx-auto p-4 mt-8 w-full">
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Title block */}
      <div className="h-10 w-1/3 bg-gray-200 rounded"></div>
      
      {/* Left side: Images (Mocking the MMT layout) */}
      <div className="flex gap-4">
        {/* Main Image */}
        <div className="w-2/3 h-[400px] bg-gray-200 rounded-lg"></div>
        {/* Smaller Images Column */}
        <div className="w-1/3 flex flex-col gap-4">
          <div className="w-full h-[190px] bg-gray-200 rounded-lg"></div>
          <div className="w-full h-[190px] bg-gray-200 rounded-lg"></div>
        </div>
      </div>
      
      {/* Details block */}
      <div className="w-full bg-white p-6 rounded-lg border border-gray-100 shadow-sm space-y-6 mt-4">
        <div className="space-y-3">
          <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
        </div>
        <hr className="border-gray-100" />
        <div className="space-y-4">
           <div className="h-24 w-full bg-gray-200 rounded-lg"></div>
           <div className="h-24 w-full bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  </div>
);

export default function HotelDetailsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useSelector(selectCurrentUser);
  
  const [loading, setLoading] = useState(true);
  const [hotel, setHotel] = useState<any>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // MOCK DATA for specific hotel rooms since our DB only has one base price
  const rooms = [
    { id: 'R1', name: 'Standard Room', priceMultiplier: 1, maxGuests: 2, beds: '1 Queen Bed', features: ['Free WiFi', 'AC'] },
    { id: 'R2', name: 'Deluxe Room', priceMultiplier: 1.5, maxGuests: 3, beds: '1 King Bed', features: ['Free WiFi', 'AC', 'Breakfast Included', 'City View'] },
    { id: 'R3', name: 'Executive Suite', priceMultiplier: 2.2, maxGuests: 4, beds: '2 Queen Beds', features: ['Free WiFi', 'AC', 'Breakfast Included', 'Bathtub', 'Lounge Access'] }
  ];

  useEffect(() => {
    // If state is passed from search results, use it, otherwise we'd fetch from API
    if (state && state.hotel) {
      setHotel(state.hotel);
      // Fake loading to show the skeleton loader user requested
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    } else {
      // Fallback if accessed directly (Not implemented in this demo, redirecting back)
      navigate('/hotels/search');
    }
  }, [state, navigate]);

  const handleBookRoom = (room: any) => {
    if (!user) {
      toast.error('Please login or signup first to book hotels.');
      setIsLoginModalOpen(true);
      return;
    }

    const checkIn = state?.checkIn || new Date().toISOString().split('T')[0];
    const checkOut = state?.checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const guests = state?.guests || 1;
    
    navigate('/hotels/checkout', {
      state: {
        hotel,
        room,
        checkIn,
        checkOut,
        guests
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <TopNavbar />
        <div className="pt-24 bg-white pb-4 border-b border-gray-200 shadow-sm mb-4">
          <div className="max-w-[1200px] mx-auto px-4 flex justify-between">
            <div className="flex gap-4">
              <div className="h-10 w-48 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-100 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <HotelSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f2] font-sans pb-32">
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <TopNavbar />
      
      {/* Modification Search Bar Area (Static for now) */}
      <div className="pt-20 bg-gradient-to-r from-[#0a1a3a] to-[#1a365d] pb-6 shadow-md">
        <div className="max-w-[1200px] mx-auto px-4 text-white">
          <div className="flex items-center text-sm font-medium opacity-80 mb-2 gap-2">
            <span>Home</span> <ChevronRight size={14} /> <span>Hotels in {hotel.city}</span> <ChevronRight size={14} /> <span>{hotel.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto w-full p-4 mt-6">
        
        {/* Top Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex text-[#ff9e00]">
                {[...Array(Math.floor(hotel.rating || 4))].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 border border-gray-300 px-1.5 rounded bg-gray-100">Hotel</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900">{hotel.name}</h1>
            <p className="text-gray-600 flex items-center gap-1 mt-2 font-medium">
              <MapPin size={16} className="text-blue-500" /> {hotel.address || `Central Area, ${hotel.city}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-sm font-bold">Starts from</p>
            <p className="text-3xl font-black text-gray-900">₹{hotel.pricePerNight}</p>
            <p className="text-xs text-gray-500">+ taxes & fees / per night</p>
          </div>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[450px] mb-8 rounded-xl overflow-hidden shadow-sm">
          <div className="col-span-2 row-span-2 bg-gray-100 flex items-center justify-center relative overflow-hidden group">
            <img 
              src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'} 
              alt="Hotel Main" 
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80' }}
            />
          </div>
          <div className="bg-gray-100 flex items-center justify-center relative overflow-hidden group">
            <img 
              src={hotel.images?.[1] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80'} 
              alt="Hotel View 2" 
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80' }}
            />
          </div>
          <div className="bg-gray-100 flex items-center justify-center relative overflow-hidden group">
            <img 
              src={hotel.images?.[2] || 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=400&q=80'} 
              alt="Hotel View 3" 
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=400&q=80' }}
            />
          </div>
          <div className="bg-gray-100 flex items-center justify-center relative overflow-hidden group">
            <img 
              src={hotel.images?.[3] || 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=400&q=80'} 
              alt="Hotel View 4" 
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=400&q=80' }}
            />
          </div>
          <div className="bg-gray-100 relative cursor-pointer flex items-center justify-center overflow-hidden group">
            <img 
              src={hotel.images?.[4] || 'https://images.unsplash.com/photo-1618773928121-c32242fa11f5?auto=format&fit=crop&w=400&q=80'} 
              alt="Hotel View 5" 
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1618773928121-c32242fa11f5?auto=format&fit=crop&w=400&q=80' }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center hover:bg-opacity-50 transition z-10">
              <span className="text-white font-bold">View All Photos</span>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Main Info */}
          <div className="flex-1 space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-black text-gray-900 mb-4">About this property</h2>
              <p className="text-gray-600 leading-relaxed font-medium">
                {hotel.description || "Experience world-class service at this beautiful property. Located in the heart of the city, offering premium amenities and easy access to major tourist attractions."}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-black text-gray-900 mb-4">Popular Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4">
                {hotel.amenities?.map((amenity: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-gray-700 font-medium">
                    <Check size={18} className="text-green-500" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Room Selection */}
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-6">Select a Room</h2>
              <div className="space-y-4">
                {rooms.map((room) => {
                  const roomPrice = Math.round(hotel.pricePerNight * room.priceMultiplier);
                  return (
                    <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-[250px] h-[150px] rounded-lg overflow-hidden flex-shrink-0">
                         {/* Mock room image based on index */}
                        <img src={`https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&q=80`} alt={room.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-black text-gray-900">{room.name}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 font-medium">
                            <span className="flex items-center gap-1"><Users size={16} /> Max {room.maxGuests} Guests</span>
                            <span className="flex items-center gap-1"><Bed size={16} /> {room.beds}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {room.features.map(f => (
                              <span key={f} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-green-50 text-green-700 rounded border border-green-100">
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="w-full md:w-[200px] border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center items-end">
                        <p className="text-2xl font-black text-gray-900">₹{roomPrice}</p>
                        <p className="text-xs text-gray-500 font-medium mb-4">+ ₹{Math.round(roomPrice * 0.12)} taxes & fees</p>
                        <button 
                          onClick={() => handleBookRoom(room)}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-bold shadow-md transition"
                        >
                          SELECT ROOM
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
