import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plane, Building2, ArrowLeft, Search, Map, Clock, CheckCircle2, Star, Bus } from 'lucide-react';
import api from '../../../services/api';

interface TourPackage {
  _id: string;
  title: string;
  description: string;
  durationDays: number;
  durationNights: number;
  basePrice: number;
  gallery: string[];
  inclusions: string[];
}

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tab = searchParams.get('tab') || 'Flights';
  const from = searchParams.get('from') || 'DEL';
  const to = searchParams.get('to') || 'BOM';
  const type = searchParams.get('type') || 'Round Trip';
  const dest = searchParams.get('dest');

  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    let endpoint = '';
    let params: any = {};

    if (tab === 'Packages' || tab === 'Tour Packages') {
      endpoint = '/api/tours/packages';
    } else if (tab === 'Flights') {
      endpoint = '/api/searches/flights';
      params = { from, to };
    } else if (tab === 'Hotels') {
      endpoint = '/api/searches/hotels';
      params = { location: dest || to };
    } else if (tab === 'Buses') {
      endpoint = '/api/searches/buses';
      params = { from, to };
    }

    if (endpoint) {
      api.get(endpoint, { params })
        .then((res) => {
          let fetchedData = res.data.data || res.data;
          if ((tab === 'Packages' || tab === 'Tour Packages') && dest) {
            fetchedData = fetchedData.filter((p: any) => 
              p.title.toLowerCase().includes(dest.toLowerCase()) || 
              (p.destination && p.destination.name?.toLowerCase() === dest.toLowerCase())
            );
          }
          setResults(fetchedData);
        })
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false));
    } else {
      setResults([]);
      setIsLoading(false);
    }
  }, [tab, dest, from, to]);

  const renderHeader = () => (
    <div className="flex items-center gap-4 mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
      <button 
        onClick={() => navigate('/')}
        className="p-3 hover:bg-gray-100 rounded-full transition text-gray-500 bg-gray-50"
      >
        <ArrowLeft size={20} />
      </button>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          {tab === 'Flights' ? <Plane size={24} className="text-blue-600" /> : 
           tab === 'Hotels' ? <Building2 size={24} className="text-sky-600" /> : 
           tab === 'Buses' ? <Bus size={24} className="text-red-600" /> :
           <Map size={24} className="text-orange-600" />}
          {tab} Search Results
        </h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          {tab === 'Packages' || tab === 'Tour Packages' 
            ? dest ? `Showing top packages for ${dest}` : `Showing all available packages`
            : tab === 'Hotels' ? `Showing hotels in ${dest || to}`
            : `Showing results from ${from} to ${to} (${type})`}
        </p>
      </div>
    </div>
  );

  // Packages View
  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
      {renderHeader()}

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse bg-white rounded-3xl h-64 w-full shadow-sm"></div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-gray-100 shadow-sm text-center">
          <Map size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900">No {tab} Found</h3>
          <p className="text-gray-500 mt-2">We couldn't find any {tab.toLowerCase()} matching your search.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {results.map((item: any) => {
            
            // --- FLIGHT RENDER ---
            if (tab === 'Flights') {
              return (
                <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex justify-between p-6 items-center">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {item.airline.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{item.airline}</h3>
                      <p className="text-xs text-gray-500">{item.flightNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8 text-center">
                    <div>
                      <p className="text-xl font-bold text-gray-900">{new Date(item.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      <p className="text-sm text-gray-500">{item.from}</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-xs text-gray-400 font-medium mb-1">{item.duration}</p>
                      <div className="w-24 h-[1px] bg-gray-300 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1">
                          <Plane size={14} className="text-blue-400" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{item.stops === 0 ? 'Non-stop' : `${item.stops} stop(s)`}</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">{new Date(item.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      <p className="text-sm text-gray-500">{item.to}</p>
                    </div>
                  </div>

                  <div className="text-right border-l border-gray-100 pl-6">
                    <p className="text-2xl font-black text-gray-900">₹{item.price.toLocaleString('en-IN')}</p>
                    <button className="mt-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:scale-95 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all">
                      BOOK NOW
                    </button>
                  </div>
                </div>
              );
            }

            // --- HOTEL RENDER ---
            if (tab === 'Hotels') {
              return (
                <div key={item._id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all flex flex-col md:flex-row">
                  <div className="md:w-64 h-48 md:h-auto relative">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-900 shadow flex items-center gap-1">
                      <Star size={12} className="text-orange-500 fill-orange-500" /> {item.rating} Star
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                      <p className="text-gray-500 text-sm mb-4 flex items-center gap-1"><Map size={14} /> {item.location}</p>
                      <div className="flex flex-wrap gap-2">
                        {item.amenities.map((amenity: string, idx: number) => (
                          <span key={idx} className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">✓ {amenity}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-gray-50 md:w-56 flex flex-col justify-center border-l border-gray-100 text-right">
                    <p className="text-xs text-gray-500 font-semibold mb-1">Per Night</p>
                    <p className="text-2xl font-black text-gray-900 mb-4">₹{item.pricePerNight.toLocaleString('en-IN')}</p>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold py-3 rounded-xl shadow-md transition-all">
                      BOOK NOW
                    </button>
                  </div>
                </div>
              );
            }

            // --- BUS RENDER ---
            if (tab === 'Buses') {
              return (
                <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex justify-between p-6 items-center">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2"><Bus size={18} className="text-blue-600" /> {item.operator}</h3>
                    <p className="text-xs text-gray-500">{item.busType}</p>
                  </div>
                  
                  <div className="flex items-center gap-8 text-center">
                    <div>
                      <p className="text-xl font-bold text-gray-900">{new Date(item.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      <p className="text-sm text-gray-500">{item.from}</p>
                    </div>
                    <div className="w-24 h-[2px] bg-gray-200"></div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">{new Date(item.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      <p className="text-sm text-gray-500">{item.to}</p>
                    </div>
                  </div>

                  <div className="text-right border-l border-gray-100 pl-6">
                    <p className="text-2xl font-black text-gray-900">₹{item.price.toLocaleString('en-IN')}</p>
                    <button className="mt-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:scale-95 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all">
                      SELECT SEAT
                    </button>
                  </div>
                </div>
              );
            }

            // --- PACKAGE RENDER (Default/Fallback) ---
            return (
              <div key={item._id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all group flex flex-col md:flex-row">
                {/* Image Section */}
                <div className="md:w-72 h-48 md:h-auto relative overflow-hidden bg-gray-100 shrink-0">
                  <img 
                    src={item.gallery?.[0] || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=600'} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-900 shadow flex items-center gap-1">
                    <Star size={12} className="text-orange-500 fill-orange-500" /> 4.8
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600 font-medium mb-4 mt-2">
                      <span className="flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-1 rounded-md">
                        <Clock size={14} /> {item.durationDays} Days / {item.durationNights} Nights
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                      {item.description}
                    </p>
                    
                    {/* Inclusions */}
                    <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
                      {item.inclusions?.map((inc: string, idx: number) => (
                        <span key={idx} className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 border border-gray-100 px-2 py-1 rounded-full">
                          <CheckCircle2 size={12} className="text-green-500" /> {inc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price & Action Section */}
                <div className="p-6 bg-gray-50 md:w-64 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 shrink-0">
                  <div className="text-right md:text-left mb-4">
                    <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Starting from</p>
                    <p className="text-3xl font-bold text-gray-900">
                      ₹{item.basePrice?.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">per person</p>
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                    View Details <ArrowLeft size={16} className="rotate-180" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
