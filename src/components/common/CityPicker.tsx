import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plane, Building2, MapPin } from 'lucide-react';

interface City {
  code: string;
  name: string;
  airport: string;
  country: string;
}

const POPULAR_CITIES: City[] = [
  { code: 'DEL', name: 'New Delhi', airport: 'Indira Gandhi International Airport', country: 'India' },
  { code: 'BOM', name: 'Mumbai', airport: 'Chhatrapati Shivaji International Airport', country: 'India' },
  { code: 'BLR', name: 'Bengaluru', airport: 'Kempegowda International Airport', country: 'India' },
  { code: 'GOI', name: 'Goa', airport: 'Dabolim Airport', country: 'India' },
  { code: 'CCU', name: 'Kolkata', airport: 'Netaji Subhash Chandra Bose Airport', country: 'India' },
  { code: 'HYD', name: 'Hyderabad', airport: 'Rajiv Gandhi International Airport', country: 'India' },
  { code: 'MAA', name: 'Chennai', airport: 'Chennai International Airport', country: 'India' },
  { code: 'DXB', name: 'Dubai', airport: 'Dubai International Airport', country: 'UAE' },
  { code: 'BKK', name: 'Bangkok', airport: 'Suvarnabhumi Airport', country: 'Thailand' },
  { code: 'LHR', name: 'London', airport: 'Heathrow Airport', country: 'UK' },
  { code: 'SYD', name: 'Sydney', airport: 'Kingsford Smith Airport', country: 'Australia' },
  { code: 'BNE', name: 'Brisbane', airport: 'Brisbane Airport', country: 'Australia' },
  { code: 'AKL', name: 'Auckland', airport: 'Auckland Airport', country: 'New Zealand' },
  { code: 'DPS', name: 'Bali', airport: 'Ngurah Rai International Airport', country: 'Indonesia' },
  { code: 'SIN', name: 'Singapore', airport: 'Changi Airport', country: 'Singapore' },
  { code: 'HR', name: 'Haryana', airport: 'Chandigarh Airport', country: 'India' },
  { code: 'PNQ', name: 'Pune', airport: 'Pune International Airport', country: 'India' },
  { code: 'JAI', name: 'Jaipur', airport: 'Jaipur International Airport', country: 'India' }
];

interface CityPickerProps {
  value: string;
  onChange: (code: string) => void;
  onClose: () => void;
  title?: string;
  type?: 'hotel' | 'flight';
}

export default function CityPicker({ value, onChange, onClose, title = "SELECT CITY", type = 'flight' }: CityPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [availableCities, setAvailableCities] = useState<City[]>(POPULAR_CITIES);

  useEffect(() => {
    if (type === 'hotel') {
      api.get('/api/hotels/cities').then(res => {
        if (res.data && Array.isArray(res.data)) {
          const dynamicCities = res.data;
          const mergedCities = [
            ...dynamicCities,
            ...POPULAR_CITIES.filter(pc => !dynamicCities.some((dc: any) => dc.code === pc.code))
          ];
          setAvailableCities(mergedCities);
        }
      }).catch(err => console.error("Failed to fetch hotel cities", err));
    } else {
      // Flight cities
      api.get('/api/searches/cities').then(res => {
        if (res.data && Array.isArray(res.data)) {
          // If the backend returns a full list, we just use it.
          // Fallback to POPULAR_CITIES if backend fails or returns empty.
          if (res.data.length > 0) {
            setAvailableCities(res.data);
          }
        }
      }).catch(err => console.error("Failed to fetch flight cities", err));
    }
  }, [type]);

  const filteredCities = availableCities.filter(city => 
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    city.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 w-[380px] flex flex-col overflow-hidden cursor-default"
      onClick={e => e.stopPropagation()}
    >
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h3 className="text-xs font-black text-gray-800 mb-3">{title}</h3>
        <div className="relative">
          <input 
            type="text" 
            autoFocus
            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-semibold"
            placeholder="From"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto max-h-[300px]">
        {filteredCities.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            No cities found.
          </div>
        ) : (
          <div className="py-2">
            {filteredCities.map(city => (
              <div 
                key={city.code}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-50 last:border-0"
                onClick={() => { onChange(city.code); onClose(); }}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-gray-400">
                    <Plane size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">{city.name}, {city.country}</span>
                    </div>
                    <span className="text-xs text-gray-500">{city.airport}</span>
                  </div>
                </div>
                <div className="font-bold text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {city.code}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
