import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TopNavbar from '../../components/layout/TopNavbar';
import { MapPin, Star, Building2, Check, Wifi, Coffee, Car, ArrowLeft, Heart } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectAgentBookingMode } from '../../store/authSlice';
import AgentHotelSearchResults from './AgentHotelSearchResults';

interface Hotel {
  _id: string;
  name: string;
  city: string;
  address: string;
  description: string;
  pricePerNight: number;
  images: string[];
  amenities: string[];
  rating: number;
  source: string;
}

export default function HotelSearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [priceFilters, setPriceFilters] = useState<string[]>([]);
  const [starFilters, setStarFilters] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState('Popularity');

  const city = searchParams.get('city') || 'Delhi';
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');

  const user = useSelector(selectCurrentUser);
  const agentMode = useSelector(selectAgentBookingMode);
  const isAgentDiscount = user?.role === 'TRAVEL_AGENT' && agentMode === 'MYBIZ';

  useEffect(() => {
    fetchHotels();
  }, [city, checkIn, checkOut]);

  useEffect(() => {
    let result = hotels;

    if (priceFilters.length > 0) {
      result = result.filter(hotel => {
        return priceFilters.some(filter => {
          const price = Number(hotel.pricePerNight);
          if (filter === '0-2000') return price <= 2000;
          if (filter === '2000-5000') return price > 2000 && price <= 5000;
          if (filter === '5000+') return price > 5000;
          return false;
        });
      });
    }

    if (starFilters.length > 0) {
      result = result.filter(hotel => starFilters.includes(Math.floor(Number(hotel.rating) || 3)));
    }

    setFilteredHotels(result);
  }, [hotels, priceFilters, starFilters]);

  const togglePriceFilter = (range: string) => {
    setPriceFilters(prev => prev.includes(range) ? prev.filter(f => f !== range) : [...prev, range]);
  };

  const toggleStarFilter = (star: number) => {
    setStarFilters(prev => prev.includes(star) ? prev.filter(s => s !== star) : [...prev, star]);
  };

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (city) query.append('city', city);
      if (checkIn) query.append('checkIn', checkIn);
      if (checkOut) query.append('checkOut', checkOut);

      const response = await api.get(`/api/hotels/search?${query.toString()}`);
      if (response.data) {
        setHotels(response.data);
      } else {
        console.error("Failed to fetch hotels");
      }
    } catch (error) {
      console.error("Error fetching hotels:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const a = amenity.toLowerCase();
    if (a.includes('wifi')) return <Wifi size={14} />;
    if (a.includes('breakfast') || a.includes('coffee')) return <Coffee size={14} />;
    if (a.includes('parking') || a.includes('car')) return <Car size={14} />;
    return <Check size={14} />;
  };

  if (isAgentDiscount) {
    return (
      <AgentHotelSearchResults 
        filteredHotels={filteredHotels}
        loading={loading}
        priceFilters={priceFilters}
        togglePriceFilter={togglePriceFilter}
        starFilters={starFilters}
        toggleStarFilter={toggleStarFilter}
        city={city}
        checkIn={checkIn}
        checkOut={checkOut}
        user={user}
        navigate={navigate}
      />
    );
  }

  const sortedHotels = [...filteredHotels].sort((a, b) => {
    const priceA = Number(a.pricePerNight) || 0;
    const priceB = Number(b.pricePerNight) || 0;
    const ratingA = Number(a.rating) || 0;
    const ratingB = Number(b.rating) || 0;

    if (sortBy === 'Price (Low to High)') return priceA - priceB;
    if (sortBy === 'Price (High to Low)') return priceB - priceA;
    if (sortBy === 'User Rating (Highest)') return ratingB - ratingA;
    if (sortBy === 'Lowest Price & Best Rated') {
      if (priceA === priceB) return ratingB - ratingA;
      return priceA - priceB;
    }
    return 0; // Popularity
  });

  return (
    <div className="min-h-screen bg-[#f4f4f4] pb-20">
      <TopNavbar forceWhite={true} />

      {/* MakeMyTrip Style Horizontal Header */}
      <div className="bg-gradient-to-b from-[#f2f6f9] to-[#ffffff] border-b border-gray-200 pt-24 pb-4">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex flex-col bg-gray-50 border border-gray-300 rounded-md px-3 py-1.5 cursor-pointer hover:bg-gray-100 flex-1 relative">
              <span className="text-[10px] text-gray-500 font-bold uppercase mb-1">CITY, AREA OR PROPERTY</span>
              <span className="text-lg font-bold text-gray-900 truncate">{city}, India</span>
              <div className="absolute right-3 top-4">
                <span className="text-blue-500 font-bold text-xs">▼</span>
              </div>
            </div>
            <div className="flex flex-col bg-gray-50 border border-gray-300 rounded-md px-3 py-1.5 cursor-pointer hover:bg-gray-100 w-40">
              <span className="text-[10px] text-gray-500 font-bold uppercase mb-1">CHECK-IN</span>
              <span className="text-sm font-bold text-gray-900 truncate">{checkIn ? new Date(checkIn).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Select Date'}</span>
            </div>
            <div className="flex flex-col bg-gray-50 border border-gray-300 rounded-md px-3 py-1.5 cursor-pointer hover:bg-gray-100 w-40">
              <span className="text-[10px] text-gray-500 font-bold uppercase mb-1">CHECK-OUT</span>
              <span className="text-sm font-bold text-gray-900 truncate">{checkOut ? new Date(checkOut).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Select Date'}</span>
            </div>
            <div className="flex flex-col bg-gray-50 border border-gray-300 rounded-md px-3 py-1.5 cursor-pointer hover:bg-gray-100 w-48">
              <span className="text-[10px] text-gray-500 font-bold uppercase mb-1">ROOMS & GUESTS</span>
              <span className="text-sm font-bold text-gray-900 truncate">1 Room, 2 Adults</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 ml-6">
            <button 
              onClick={() => navigate('/?tab=Hotels')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-black text-sm transition shadow-lg shadow-blue-200 uppercase tracking-widest"
            >
              Search
            </button>
            <div className="bg-teal-50 border border-teal-200 p-2 rounded-lg flex items-center gap-2 cursor-pointer shadow-sm hidden lg:flex">
              <div className="bg-teal-600 rounded-full w-6 h-6 flex items-center justify-center text-white text-[10px] font-bold">new</div>
              <span className="text-xs font-bold text-teal-800 leading-tight">OneCircle<br/>Rewards</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-6 flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-4">
          
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-white relative overflow-hidden">
               <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80" alt="Map" className="w-full h-24 object-cover rounded opacity-80" />
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <button className="bg-white text-blue-600 border border-blue-600 font-bold text-xs px-4 py-1.5 rounded-full shadow-sm pointer-events-auto flex items-center gap-1 hover:bg-blue-50">
                   EXPLORE ON MAP <MapPin size={12} />
                 </button>
               </div>
            </div>
            <div className="p-2 border-t border-gray-100">
               <div className="flex items-center gap-2 bg-white p-2 border border-gray-200 rounded text-sm text-gray-500">
                 <span className="text-blue-500 font-bold text-lg">⚲</span> Search for locality /
               </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-4 text-sm">Suggested For You</h3>
            <div className="space-y-3 mb-6">
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded border border-gray-300 group-hover:border-blue-500 flex items-center justify-center"></div>
                  <span className="text-sm text-gray-700">Rush Deal</span>
                </div>
                <span className="text-[10px] text-gray-400">(463)</span>
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded border border-gray-300 group-hover:border-blue-500 flex items-center justify-center"></div>
                  <span className="text-sm text-gray-700">Last Minute Deals</span>
                </div>
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded border border-gray-300 group-hover:border-blue-500 flex items-center justify-center"></div>
                  <span className="text-sm text-gray-700">Beachfront Properties</span>
                </div>
                <span className="text-[10px] text-gray-400">(143)</span>
              </label>
            </div>
            
            <h3 className="font-bold text-gray-900 mb-4 text-sm">Price Per Night</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={priceFilters.includes('0-2000')} onChange={() => togglePriceFilter('0-2000')} className="rounded text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">₹0 - ₹2000</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={priceFilters.includes('2000-5000')} onChange={() => togglePriceFilter('2000-5000')} className="rounded text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">₹2000 - ₹5000</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={priceFilters.includes('5000+')} onChange={() => togglePriceFilter('5000+')} className="rounded text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">₹5000+</span>
                </label>
              </div>
            
            <div className="mt-6">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Star Rating</h4>
              <div className="flex gap-2">
                {[3, 4, 5].map(star => (
                  <button 
                    key={star} 
                    onClick={() => toggleStarFilter(star)}
                    className={`flex-1 py-1.5 border rounded text-sm font-medium transition flex items-center justify-center gap-1 ${starFilters.includes(star) ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600'}`}
                  >
                    {star} <Star size={12} className="fill-current" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-blue-500 hover:underline cursor-pointer">Home</span>
              <span className="text-xs text-gray-400">›</span>
              <span className="text-sm text-gray-500">Hotels and more in {city}</span>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-2xl font-black text-gray-900">{filteredHotels.length} Properties in {city}</h1>
              <div className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold cursor-pointer hover:bg-purple-100 flex items-center gap-1 shadow-sm">
                <MapPin size={12} /> Explore Travel Tips →
              </div>
            </div>
            
            <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm mb-4">
              <button className="px-3 text-gray-400 hover:text-gray-900 transition"><ArrowLeft size={16} /></button>
              
              <div className="flex-1 flex divide-x divide-gray-200 overflow-x-auto hide-scrollbar">
                {['Popularity', 'Price (Low to High)', 'Price (High to Low)', 'User Rating (Highest)', 'Lowest Price & Best Rated'].map(tab => (
                  <div 
                    key={tab}
                    onClick={() => setSortBy(tab)}
                    className={`px-4 py-3 whitespace-nowrap text-sm cursor-pointer transition ${sortBy === tab ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {tab}
                  </div>
                ))}
              </div>
              
              <button className="px-3 text-gray-400 hover:text-gray-900 transition"><ArrowLeft size={16} className="transform rotate-180" /></button>
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-100 rounded-lg p-4 flex items-center justify-between mb-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-teal-800 rounded-full flex items-center justify-center text-white font-bold text-xl border-4 border-teal-300 shadow">O</div>
              <div>
                <h3 className="font-bold text-gray-900">OneCircle Rewards</h3>
                <p className="text-sm text-gray-700">Earn & redeem points on eligible properties for additional savings! <span className="font-bold underline cursor-pointer">Learn More</span></p>
              </div>
            </div>
            <button className="bg-white border border-gray-900 text-gray-900 font-bold px-4 py-2 rounded text-xs shadow-sm hover:bg-gray-50">
              SHOW PROPERTIES
            </button>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">Properties recommended for Women</h2>
          <p className="text-sm text-gray-900 font-medium mb-4">Stays rated 4+ overall and highly on safety</p>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((skeleton) => (
                <div key={skeleton} className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col sm:flex-row animate-pulse">
                  {/* Image Skeleton */}
                  <div className="w-full sm:w-72 h-48 sm:h-[220px] bg-gray-200 shrink-0"></div>
                  {/* Content Skeleton */}
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <div className="h-4 w-1/4 bg-gray-200 rounded mb-3"></div>
                      <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 w-1/2 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-full bg-gray-200 rounded mt-4"></div>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                      <div className="flex gap-2">
                        <div className="h-6 w-16 bg-gray-200 rounded"></div>
                        <div className="h-6 w-16 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="h-8 w-24 bg-gray-200 rounded mb-2"></div>
                        <div className="h-10 w-32 bg-blue-100 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : sortedHotels.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Building2 size={48} className="text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-700">No hotels found in {city}</h2>
              <p className="text-gray-500 mt-2">Try changing your search destination.</p>
            </div>
          ) : (
            sortedHotels.map((hotel, idx) => (
              <div key={hotel._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition relative">
                <button className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/50 backdrop-blur rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 transition shadow-sm">
                  <Heart size={16} />
                </button>
                {/* Image */}
                <div className="w-full sm:w-72 h-48 sm:h-auto relative shrink-0">
                  <img 
                    src={hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'} 
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                  {hotel.source === 'external' && (
                    <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-md">
                      Verified Partner
                    </div>
                  )}
                  {hotel.source === 'direct' && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-md">
                      TrippeChalo Exclusive
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 p-5 flex flex-col relative">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        {Array.from({ length: Math.floor(hotel.rating || 3) }).map((_, i) => (
                          <Star key={i} size={14} className="fill-orange-400 text-orange-400" />
                        ))}
                      </div>
                      <h3 className="text-xl font-black text-gray-900">{hotel.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin size={14} /> {hotel.address}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-black text-gray-900">₹{hotel.pricePerNight}</div>
                      <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">+ ₹{Math.floor(hotel.pricePerNight * 0.12)} TAXES & FEES</div>
                      <div className="text-xs text-gray-500 mt-1">Per Night</div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-4 max-w-lg">
                    {hotel.description}
                  </p>

                  <div className="mt-auto flex items-end justify-between">
                    <div className="flex flex-wrap gap-2">
                      {hotel.amenities.slice(0, 4).map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          {getAmenityIcon(amenity)}
                          <span>{amenity}</span>
                        </div>
                      ))}
                      {hotel.amenities.length > 4 && (
                        <div className="flex items-center text-xs text-gray-500 px-1 font-medium">
                          +{hotel.amenities.length - 4} more
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => navigate(`/hotels/${hotel._id || idx}`, { state: { hotel, city, checkIn: checkIn || new Date().toISOString().split('T')[0], checkOut: checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0], guests: 2 } })}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-2 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-md shadow-blue-200"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
