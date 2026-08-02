import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectAgentBookingMode } from '../store/authSlice';
import api from '../services/api';

export interface Flight {
  _id: string;
  airline: string;
  airlineLogo: string;
  flightNumber: string;
  departureCity: string;
  departureAirportCode: string;
  arrivalCity: string;
  arrivalAirportCode: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  price: number;
  stops: number;
  adultPrice?: number;
  childPrice?: number;
  infantPrice?: number;
  nexus_total_price?: number;
  nexus_query?: any;
  isSeriesFare?: boolean;
  agentCommission?: number;
}

export const CITIES: Record<string, string> = {
  DEL: 'New Delhi',
  BOM: 'Mumbai',
  BLR: 'Bengaluru',
  GOI: 'Goa',
  CCU: 'Kolkata',
  HYD: 'Hyderabad',
  MAA: 'Chennai',
  DXB: 'Dubai',
  BKK: 'Bangkok',
  LHR: 'London',
  SYD: 'Sydney',
  BNE: 'Brisbane',
  AKL: 'Auckland',
  DPS: 'Bali',
  SIN: 'Singapore'
};

export function useFlightSearch() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const agentMode = useSelector(selectAgentBookingMode);
  
  const isAgentDiscount = user?.role === 'TRAVEL_AGENT' && agentMode === 'MYBIZ';
  const getDisplayPrice = (price: number) => isAgentDiscount ? Math.floor(price * 0.9) : price;

  const getLocalISO = (d: Date) => {
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
  };
  
  const [defaultDate] = useState(() => new Date().toISOString());
  const [defaultReturnDate] = useState(() => new Date(Date.now() + 86400000 * 2).toISOString());

  const [from, setFrom] = useState(searchParams.get('from') || 'DEL');
  const [to, setTo] = useState(searchParams.get('to') || 'BOM');
  const [date, setDate] = useState<Date>(new Date(searchParams.get('date') || defaultDate));
  const [tripType, setTripType] = useState(searchParams.get('tripType') || 'Round Trip');
  const [returnDate, setReturnDate] = useState<Date>(new Date(searchParams.get('returnDate') || defaultReturnDate));

  const [outboundFlights, setOutboundFlights] = useState<Flight[]>([]);
  const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedOutbound, setSelectedOutbound] = useState<Flight | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<Flight | null>(null);
  const [showFlightDetails, setShowFlightDetails] = useState<Flight | null>(null);

  const [adults, setAdults] = useState(parseInt(searchParams.get('adults') || '1'));
  const [children, setChildren] = useState(parseInt(searchParams.get('children') || '0'));
  const [infants, setInfants] = useState(parseInt(searchParams.get('infants') || '0'));
  const [cabinClass, setCabinClass] = useState(searchParams.get('cabinClass') || 'Economy/ Premium Economy');

  const [nonStopFilter, setNonStopFilter] = useState(false);
  const [morningFilter, setMorningFilter] = useState(false);
  const [sortBy, setSortBy] = useState('CHEAPEST');

  const [suggestedFlights, setSuggestedFlights] = useState<Flight[]>([]);

  const fetchFlights = async (useUrlParams = false) => {
    setLoading(true);
    setSelectedOutbound(null);
    setSelectedReturn(null);
    try {
      const qFrom = useUrlParams ? (searchParams.get('from') || 'DEL') : from;
      const qTo = useUrlParams ? (searchParams.get('to') || 'BOM') : to;
      
      const qDateStr = useUrlParams ? searchParams.get('date') : null;
      const qDate = useUrlParams ? (qDateStr ? new Date(qDateStr) : date) : date;
      
      const qTripType = useUrlParams ? (searchParams.get('tripType') || 'Round Trip') : tripType;
      
      const qReturnDateStr = useUrlParams ? searchParams.get('returnDate') : null;
      const qReturnDate = useUrlParams ? (qReturnDateStr ? new Date(qReturnDateStr) : returnDate) : returnDate;
      
      const qCabinClass = useUrlParams ? (searchParams.get('cabinClass') || 'Economy') : cabinClass;
      
      const qAdults = useUrlParams ? parseInt(searchParams.get('adults') || '1') : adults;
      const qChildren = useUrlParams ? parseInt(searchParams.get('children') || '0') : children;
      const qInfants = useUrlParams ? parseInt(searchParams.get('infants') || '0') : infants;
      const qPassengers = qAdults + qChildren + qInfants;

      let baseParams = `cabinClass=${encodeURIComponent(qCabinClass)}&passengers=${qPassengers}&adults=${qAdults}&children=${qChildren}&infants=${qInfants}`;
      if (nonStopFilter) baseParams += `&stops=0`;
      if (morningFilter) baseParams += `&morningDeparture=true`;

      const outRes = await api.get(`/api/searches/flights?from=${qFrom}&to=${qTo}&date=${getLocalISO(qDate)}&${baseParams}`);
      setOutboundFlights(outRes.data);
      if (outRes.data.length > 0) {
        setSelectedOutbound(outRes.data[0]);
        setSuggestedFlights([]);
      } else {
        const suggRes = await api.get(`/api/searches/flights?date=${getLocalISO(qDate)}`);
        const sorted = suggRes.data.sort((a: Flight, b: Flight) => a.price - b.price).slice(0, 3);
        setSuggestedFlights(sorted);
      }

      if (qTripType === 'Round Trip' && qReturnDate) {
        const retRes = await api.get(`/api/searches/flights?from=${qTo}&to=${qFrom}&date=${getLocalISO(qReturnDate)}&${baseParams}`);
        setReturnFlights(retRes.data);
        if (retRes.data.length > 0) {
          setSelectedReturn(retRes.data[0]);
        } else {
          setSelectedReturn(null);
        }
      }
    } catch (error) {
      console.error("Error fetching flights:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchFlights(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonStopFilter, morningFilter]);

  const handleSearch = () => {
    fetchFlights(false);
    const query = new URLSearchParams({
      tripType,
      from,
      to,
      date: getLocalISO(date),
      returnDate: getLocalISO(returnDate),
      cabinClass,
      adults: adults.toString(),
      children: children.toString(),
      infants: infants.toString()
    }).toString();
    navigate(`/flights/search?${query}`, { replace: true });
  };

  const getSortedFlights = (flights: Flight[]) => {
    switch (sortBy) {
      case 'CHEAPEST':
        return [...flights].sort((a, b) => {
          const priceA = getDisplayPrice(a.price);
          const priceB = getDisplayPrice(b.price);
          if (priceA !== priceB) return priceA - priceB;
          if (a.stops !== b.stops) return a.stops - b.stops;
          if (a.durationMinutes !== b.durationMinutes) return a.durationMinutes - b.durationMinutes;
          return a._id.localeCompare(b._id);
        });
      case 'NON STOP FIRST':
        return [...flights].sort((a, b) => {
          if (a.stops !== b.stops) return a.stops - b.stops;
          const priceA = getDisplayPrice(a.price);
          const priceB = getDisplayPrice(b.price);
          if (priceA !== priceB) return priceA - priceB;
          if (a.durationMinutes !== b.durationMinutes) return a.durationMinutes - b.durationMinutes;
          return a._id.localeCompare(b._id);
        });
      case 'YOU MAY PREFER':
        return [...flights].sort((a, b) => {
          if (a.durationMinutes !== b.durationMinutes) return a.durationMinutes - b.durationMinutes;
          const priceA = getDisplayPrice(a.price);
          const priceB = getDisplayPrice(b.price);
          if (priceA !== priceB) return priceA - priceB;
          return a._id.localeCompare(b._id);
        });
      default:
        return flights;
    }
  };

  const sortedOutboundFlights = getSortedFlights(outboundFlights);
  
  const cheapestFlight = [...outboundFlights].sort((a, b) => getDisplayPrice(a.price) - getDisplayPrice(b.price))[0];
  const nonStopFlight = [...outboundFlights].filter(f => f.stops === 0).sort((a, b) => getDisplayPrice(a.price) - getDisplayPrice(b.price))[0];
  const preferFlight = [...outboundFlights].sort((a, b) => a.durationMinutes - b.durationMinutes)[0];

  return {
    from, setFrom,
    to, setTo,
    date, setDate,
    tripType, setTripType,
    returnDate, setReturnDate,
    adults, setAdults,
    children, setChildren,
    infants, setInfants,
    cabinClass, setCabinClass,
    nonStopFilter, setNonStopFilter,
    morningFilter, setMorningFilter,
    sortBy, setSortBy,
    outboundFlights,
    returnFlights,
    loading,
    selectedOutbound, setSelectedOutbound,
    selectedReturn, setSelectedReturn,
    showFlightDetails, setShowFlightDetails,
    suggestedFlights,
    sortedOutboundFlights,
    cheapestFlight,
    nonStopFlight,
    preferFlight,
    handleSearch,
    getDisplayPrice,
    user,
    agentMode,
    isAgentDiscount,
    navigate
  };
}
