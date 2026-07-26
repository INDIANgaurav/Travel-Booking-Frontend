import React, { useState } from 'react';
import { Plane, Building2, MapPin, Star, User, ArrowLeft, Map, Car, ChevronDown, Check, Wifi, Coffee } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setAgentBookingMode } from '../../store/authSlice';

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

export default function AgentHotelSearchResults(props: any) {
  const dispatch = useDispatch();
  const {
    filteredHotels,
    loading,
    priceFilters,
    togglePriceFilter,
    starFilters,
    toggleStarFilter,
    city,
    checkIn,
    checkOut,
    user,
    navigate
  } = props;

  const [sortBy, setSortBy] = useState('Popularity');

  const getAmenityIcon = (amenity: string) => {
    const a = amenity.toLowerCase();
    if (a.includes('wifi')) return <Wifi size={14} className="text-green-600" />;
    if (a.includes('breakfast') || a.includes('coffee')) return <Coffee size={14} className="text-orange-600" />;
    if (a.includes('parking') || a.includes('car')) return <Car size={14} className="text-blue-600" />;
    return <Check size={14} className="text-blue-600" />;
  };

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
    <div className="min-h-screen bg-[#f4f4f4] font-sans pb-20">
      
      {/* Custom B2B White Header */}
      <div className="bg-white border-b border-gray-200 py-2 px-8 z-30 relative">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-orange-500 p-1.5 rounded text-white">
                <Building2 size={24} />
              </div>
              <span className="text-2xl font-black tracking-tight text-gray-900">
                Trippe<span className="text-orange-500">Biz</span>
              </span>
            </div>

            <div className="ml-4 flex items-center p-1 rounded-full bg-gray-100 transition-colors">
              <button 
                onClick={() => dispatch(setAgentBookingMode('PERSONAL'))}
                className="px-4 py-1.5 rounded-full text-xs font-bold transition-all text-gray-600 hover:bg-gray-200"
              >
                PERSONAL
              </button>
              <button 
                className="px-4 py-1.5 rounded-full text-xs font-bold transition-all bg-white text-gray-900 shadow-md"
              >
                MYBIZ
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center cursor-pointer text-gray-500 hover:text-orange-500 transition" onClick={() => navigate('/?tab=Flights')}>
              <Plane size={20} />
              <span className="text-[10px] font-bold mt-1">Flights</span>
            </div>
            <div className="flex flex-col items-center cursor-pointer text-orange-500">
              <Building2 size={20} />
              <span className="text-[10px] font-bold mt-1">Hotels</span>
            </div>
            <div className="flex flex-col items-center cursor-pointer text-gray-500 hover:text-orange-500 transition" onClick={() => navigate('/?tab=Villas & Homestays')}>
              <Map size={20} />
              <span className="text-[10px] font-bold mt-1">Villas</span>
            </div>
            <div className="flex flex-col items-center cursor-pointer text-gray-500 hover:text-orange-500 transition" onClick={() => navigate('/?tab=Cabs')}>
              <Car size={20} />
              <span className="text-[10px] font-bold mt-1">Cabs</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-orange-200 bg-orange-50 text-gray-700 cursor-pointer">
               <div className="flex flex-col">
                 <span className="text-[11px] font-bold">myBiz Wallet</span>
              </div>
             </div>
             
             <div className="group relative py-2 cursor-pointer">
              <button className="flex items-center gap-2 bg-orange-50/50 px-3 py-1.5 rounded-full border border-orange-100 hover:bg-orange-50 transition">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs uppercase">
                  {user?.name?.charAt(0) || <User size={14} />}
                </div>
                <span className="text-xs font-bold text-gray-800">Hi, {user?.name?.split(' ')[0] || 'Agent'}</span>
                <ChevronDown size={14} className="text-orange-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dark Blue Header (Sticky) */}
      <div className="bg-[#1a2530] text-white pt-4 pb-4 px-8 sticky top-0 z-40 shadow-md border-b-2 border-orange-500">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between text-sm">
          
          <div className="flex items-center gap-6 divide-x divide-gray-600/50">
            <div className="pr-6 cursor-pointer hover:bg-white/5 p-2 rounded">
              <p className="text-[#f97b61] text-[10px] font-bold uppercase mb-1 flex items-center gap-1">CITY, AREA OR PROPERTY <ChevronDown size={12} /></p>
              <p className="font-bold text-lg">{city}</p>
            </div>
            
            <div className="px-6 cursor-pointer hover:bg-white/5 p-2 rounded">
              <p className="text-[#f97b61] text-[10px] font-bold uppercase mb-1">CHECK-IN</p>
              <p className="font-bold">{checkIn ? new Date(checkIn).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Select Date'}</p>
            </div>
            
            <div className="px-6 cursor-pointer hover:bg-white/5 p-2 rounded">
              <p className="text-[#f97b61] text-[10px] font-bold uppercase mb-1">CHECK-OUT</p>
              <p className="font-bold">{checkOut ? new Date(checkOut).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Select Date'}</p>
            </div>

            <div className="px-6 cursor-pointer hover:bg-white/5 p-2 rounded">
              <p className="text-[#f97b61] text-[10px] font-bold uppercase mb-1">ROOMS & GUESTS</p>
              <p className="font-bold">1 Room, 2 Adults</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <p className="text-[#f97b61] text-[10px] font-bold uppercase mb-1">BOOKING FOR</p>
              <p className="font-bold">{user?.name || 'Self'}</p>
            </div>
            <button className="bg-[#ff4f4f] hover:bg-[#ff3b3b] text-white font-bold py-2 px-8 rounded text-sm uppercase shadow-md transition">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-6 flex flex-col lg:flex-row gap-6">
        
        {/* B2B Sidebar Filters */}
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
               <div className="flex items-center gap-2 bg-gray-50 p-2 rounded text-sm text-gray-500">
                 <Map size={16} /> Search for locality
               </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-sm">Applied Filters</h3>
              <button className="text-orange-500 text-xs font-bold uppercase hover:underline">Clear</button>
            </div>
            {priceFilters.length === 0 && starFilters.length === 0 && (
              <p className="text-xs text-gray-500">No filters applied.</p>
            )}
            <div className="flex flex-wrap gap-2">
              {priceFilters.map((f: string) => (
                <div key={f} className="bg-orange-50 text-orange-800 border border-orange-200 text-xs px-2 py-1 rounded flex items-center gap-1">
                  {f} <span className="cursor-pointer font-bold" onClick={() => togglePriceFilter(f)}>×</span>
                </div>
              ))}
              {starFilters.map((s: number) => (
                <div key={s} className="bg-orange-50 text-orange-800 border border-orange-200 text-xs px-2 py-1 rounded flex items-center gap-1">
                  {s} Star <span className="cursor-pointer font-bold" onClick={() => toggleStarFilter(s)}>×</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Price Range</h3>
            <div className="space-y-3">
              {['0-2000', '2000-5000', '5000+'].map((range) => (
                <label key={range} onClick={(e) => { e.preventDefault(); togglePriceFilter(range); }} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${priceFilters.includes(range) ? 'bg-orange-500 border-orange-500' : 'border-gray-300 group-hover:border-orange-500'}`}>
                    {priceFilters.includes(range) && <Check size={12} className="text-white" />}
                  </div>
                  <span className="text-sm text-gray-700">{range.replace('-', ' - ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Star Rating</h3>
            <div className="space-y-3">
              {[3, 4, 5].map((star) => (
                <label key={star} onClick={(e) => { e.preventDefault(); toggleStarFilter(star); }} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${starFilters.includes(star) ? 'bg-orange-500 border-orange-500' : 'border-gray-300 group-hover:border-orange-500'}`}>
                    {starFilters.includes(star) && <Check size={12} className="text-white" />}
                  </div>
                  <span className="text-sm text-gray-700 flex items-center gap-1">{star} <Star size={12} className="fill-orange-400 text-orange-400" /></span>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Main Content */}
        <div className="flex-1 w-full space-y-4">
          
          <div>
            <h1 className="text-2xl font-black text-gray-900 mb-4">{filteredHotels.length} Properties in {city}</h1>
            
            <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
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

          <div className="bg-red-50/80 border border-red-100 rounded-lg p-4 flex items-center justify-between">
            <div>
              <span className="bg-white border border-red-200 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Free Breakfast</span>
              <p className="text-gray-900 font-bold mt-2">myBiz Exclusive: Get Complimentary Breakfast on your stay.</p>
              <p className="text-gray-700 text-sm">Choose from breakfast-inclusive hotels at room-only rates</p>
            </div>
            <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer shadow-inner">
               <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow"></div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">myBiz recommended properties</h2>

          {loading ? (
             <div className="p-8 text-center text-gray-500 font-bold bg-white rounded-lg border border-gray-200 shadow-sm">Loading hotels...</div>
          ) : sortedHotels.length === 0 ? (
             <div className="p-8 text-center text-gray-500 font-bold bg-white rounded-lg border border-gray-200 shadow-sm">No hotels found.</div>
          ) : (
             sortedHotels.map((hotel: Hotel) => (
               <div key={hotel._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col sm:flex-row">
                 
                 <div className="w-full sm:w-64 h-48 sm:h-auto relative shrink-0">
                   <img src={hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'} alt={hotel.name} className="w-full h-full object-cover" />
                   <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md border border-white/20">
                     115 Photos & Videos →
                   </div>
                 </div>

                 <div className="flex-1 p-5 flex flex-col sm:flex-row border-l border-gray-100">
                   
                   <div className="flex-1 pr-4">
                     <div className="flex items-center gap-2 mb-2">
                       <span className="bg-[#1a2530] text-white text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 tracking-wide">
                         <Check size={10} className="text-red-500" /> MYBIZ ASSURED
                       </span>
                     </div>
                     
                     <div className="flex items-center gap-2 mb-1">
                       <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{hotel.rating || 4.1}</span>
                       <span className="text-blue-600 font-bold text-xs">Very Good</span>
                       <span className="text-gray-500 text-[10px]">(2110 Business Ratings)</span>
                     </div>
                     
                     <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                       {hotel.name}
                       <div className="flex text-orange-400">
                         {Array.from({ length: Math.floor(hotel.rating || 3) }).map((_, i) => (
                           <Star key={i} size={12} className="fill-current" />
                         ))}
                       </div>
                     </h3>
                     
                     <p className="text-sm text-blue-600 mb-3">{hotel.address} <span className="text-gray-400">| 6 minutes walk to Metro Station</span></p>

                     <div className="space-y-1 mt-2">
                       {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                         <div key={idx} className="flex items-center gap-1.5 text-xs text-teal-700">
                           {getAmenityIcon(amenity)}
                           <span>{amenity}</span>
                         </div>
                       ))}
                       {hotel.amenities.length > 3 && (
                         <div className="flex items-center gap-1.5 text-xs text-teal-700">
                           <Check size={14} className="text-blue-600" />
                           <span>+{hotel.amenities.length - 3} more facilities</span>
                         </div>
                       )}
                     </div>
                   </div>

                   <div className="sm:w-48 pt-4 sm:pt-0 sm:border-l border-gray-200 sm:pl-4 flex flex-col items-end justify-between text-right">
                     <div>
                       <span className="border border-teal-500 text-teal-600 text-[10px] font-bold px-2 py-0.5 rounded-full">Last Minute Deal</span>
                       <div className="text-red-500 text-xs font-bold mt-2">Savings ₹ 3,839</div>
                       <div className="text-[10px] text-gray-500">Per room/night</div>
                       <div className="text-2xl font-black text-gray-900 mt-1">₹ {hotel.pricePerNight}</div>
                       <div className="text-[10px] text-gray-500 font-medium">₹ {hotel.pricePerNight + 1200} with<br/>taxes & service fee</div>
                     </div>
                     <button 
                       onClick={() => navigate(`/hotels/${hotel._id}`, { state: { hotel, city, checkIn, checkOut, guests: 2 } })}
                       className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 w-full rounded mt-4 transition text-sm"
                     >
                       VIEW DETAILS
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
