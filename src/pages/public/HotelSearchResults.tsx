import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TopNavbar from '../../components/layout/TopNavbar';
import { MapPin, Star, Building2, Check, Wifi, Coffee, Car } from 'lucide-react';

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

  const city = searchParams.get('city') || 'Delhi';
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');

  useEffect(() => {
    fetchHotels();
  }, [city, checkIn, checkOut]);

  useEffect(() => {
    let result = hotels;

    if (priceFilters.length > 0) {
      result = result.filter(hotel => {
        return priceFilters.some(filter => {
          if (filter === '0-2000') return hotel.pricePerNight <= 2000;
          if (filter === '2000-5000') return hotel.pricePerNight > 2000 && hotel.pricePerNight <= 5000;
          if (filter === '5000+') return hotel.pricePerNight > 5000;
          return false;
        });
      });
    }

    if (starFilters.length > 0) {
      result = result.filter(hotel => starFilters.includes(hotel.rating || 3)); // Fallback rating to 3 if missing
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopNavbar forceWhite={true} />

      {/* Header Search Info */}
      <div className="bg-blue-900 pt-24 pb-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex flex-col md:flex-row items-center justify-between border border-white/20">
            <div className="flex items-center gap-4 text-white">
              <div className="bg-white/20 p-3 rounded-full">
                <MapPin size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black">Hotels in {city}</h1>
                <p className="text-sm text-blue-200">
                  {checkIn && checkOut ? `${checkIn} to ${checkOut} • 1 Room, 2 Adults` : 'Select dates for exact prices'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/?tab=Hotels')}
              className="mt-4 md:mt-0 bg-white text-blue-900 px-6 py-2.5 rounded-lg font-bold hover:bg-blue-50 transition"
            >
              Modify Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-8 flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-4">Filters</h3>
            
            <div className="mb-6">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Price Range</h4>
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
            </div>

            <div>
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
          ) : filteredHotels.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Building2 size={48} className="text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-700">No hotels found in {city}</h2>
              <p className="text-gray-500 mt-2">Try changing your search destination.</p>
            </div>
          ) : (
            filteredHotels.map((hotel, idx) => (
              <div key={hotel._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition">
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
                      TravelGo Exclusive
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
