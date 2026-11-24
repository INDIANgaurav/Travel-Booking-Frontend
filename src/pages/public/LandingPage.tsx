import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Plane, Building2, Map, Search, Globe, Shield, CreditCard, ChevronRight, User, Briefcase, Calendar, ChevronDown, Bus, Car, Navigation, Ticket, Users, Gift, History, ArrowRightLeft, Baby, Smile, Heart, Share2, ThumbsUp, X, Check, EyeOff, Eye, Sparkles, Copy, ArrowRight, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../../store/authSlice';
import api from '../../services/api';
import LoginModal from '../../components/auth/LoginModal';
import TopNavbar from '../../components/layout/TopNavbar';
import ChatBot from '../../components/common/ChatBot';
import ScrollAirplane from '../../components/common/ScrollAirplane';
import InteractiveGlobe from '../../components/common/InteractiveGlobe';

import CustomCalendar from '../../components/common/CustomCalendar';
import DualMonthCalendar from '../../components/ui/DualMonthCalendar';
import TravellerPicker from '../../components/common/TravellerPicker';
import CabinClassPicker from '../../components/common/CabinClassPicker';
import CityPicker from '../../components/common/CityPicker';
import TripTypePicker from '../../components/common/TripTypePicker';
import { format } from 'date-fns';

interface Destination {
  name: string;
  price: number;
  imgUrl: string;
}

const CITIES: Record<string, string> = {
  DEL: 'New Delhi',
  BOM: 'Mumbai',
  NMI: 'Navi Mumbai',
  BLR: 'Bengaluru',
  GOI: 'Goa (Dabolim)',
  GOX: 'Goa (Mopa)',
  CCU: 'Kolkata',
  HYD: 'Hyderabad',
  MAA: 'Chennai',
  AMD: 'Ahmedabad',
  PNQ: 'Pune',
  JAI: 'Jaipur',
  LKO: 'Lucknow',
  COK: 'Kochi',
  TRV: 'Thiruvananthapuram',
  CCJ: 'Kozhikode',
  IXB: 'Bagdogra',
  GAU: 'Guwahati',
  SXR: 'Srinagar',
  IXC: 'Chandigarh',
  PAT: 'Patna',
  VNS: 'Varanasi',
  NAG: 'Nagpur',
  BBI: 'Bhubaneswar',
  ATQ: 'Amritsar',
  IDR: 'Indore',
  RPR: 'Raipur',
  IXZ: 'Port Blair',
  BDQ: 'Vadodara',
  STV: 'Surat',
  BHO: 'Bhopal',
  DXB: 'Dubai',
  SHJ: 'Sharjah',
  AUH: 'Abu Dhabi',
  BKK: 'Bangkok',
  DMK: 'Bangkok (Don Mueang)',
  LHR: 'London',
  SYD: 'Sydney',
  BNE: 'Brisbane',
  AKL: 'Auckland',
  DPS: 'Bali',
  SIN: 'Singapore',
  KUL: 'Kuala Lumpur',
  DOH: 'Doha'
};

const AIRPORT_NAMES: Record<string, string> = {
  DEL: 'DEL, Indira Gandhi International Airport',
  BOM: 'BOM, Chhatrapati Shivaji International Airport',
  NMI: 'NMI, Navi Mumbai International Airport',
  BLR: 'BLR, Kempegowda International Airport India',
  GOI: 'GOI, Dabolim Airport India',
  GOX: 'GOX, Manohar International Airport Goa',
  CCU: 'CCU, Netaji Subhash Chandra Bose Airport',
  HYD: 'HYD, Rajiv Gandhi International Airport',
  MAA: 'MAA, Chennai International Airport',
  AMD: 'AMD, Sardar Vallabhbhai Patel Airport',
  PNQ: 'PNQ, Pune International Airport',
  JAI: 'JAI, Jaipur International Airport',
  LKO: 'LKO, Chaudhary Charan Singh Airport',
  COK: 'COK, Cochin International Airport',
  TRV: 'TRV, Trivandrum International Airport',
  CCJ: 'CCJ, Calicut International Airport',
  IXB: 'IXB, Bagdogra Airport',
  GAU: 'GAU, Lokpriya Gopinath Bordoloi Airport',
  SXR: 'SXR, Sheikh ul-Alam International Airport',
  IXC: 'IXC, Shaheed Bhagat Singh Airport',
  PAT: 'PAT, Jay Prakash Narayan Airport',
  VNS: 'VNS, Lal Bahadur Shastri Airport',
  NAG: 'NAG, Dr. Babasaheb Ambedkar Airport',
  BBI: 'BBI, Biju Patnaik International Airport',
  ATQ: 'ATQ, Sri Guru Ram Dass Jee Airport',
  IDR: 'IDR, Devi Ahilyabai Holkar Airport',
  RPR: 'RPR, Swami Vivekananda Airport',
  IXZ: 'IXZ, Veer Savarkar International Airport',
  BDQ: 'BDQ, Vadodara Airport',
  STV: 'STV, Surat Airport',
  BHO: 'BHO, Raja Bhoj Airport',
  DXB: 'DXB, Dubai International Airport UAE',
  SHJ: 'SHJ, Sharjah International Airport UAE',
  AUH: 'AUH, Abu Dhabi International Airport UAE',
  BKK: 'BKK, Suvarnabhumi Airport Thailand',
  DMK: 'DMK, Don Mueang International Airport',
  LHR: 'LHR, Heathrow Airport UK',
  SYD: 'SYD, Kingsford Smith Airport Australia',
  BNE: 'BNE, Brisbane Airport Australia',
  AKL: 'AKL, Auckland Airport New Zealand',
  DPS: 'DPS, Ngurah Rai International Airport Bali',
  SIN: 'SIN, Changi Airport Singapore',
  KUL: 'KUL, Kuala Lumpur International Airport',
  DOH: 'DOH, Hamad International Airport Qatar'
};

const getAirportSubtext = (code: string) => {
  if (!code) return 'Select City';
  return AIRPORT_NAMES[code] || `${code}, Airport`;
};

export default function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  // Redirect B2B agents away from consumer landing page
  useEffect(() => {
    if (isAuthenticated && user && (user.roles?.includes('SUPPLIER_AGENT'))) {
      navigate('/b2b/home', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const formattedTab = tabParam ? tabParam.charAt(0).toUpperCase() + tabParam.slice(1).toLowerCase() : 'Flights';
  const [activeTab, setActiveTab] = useState(formattedTab);
  const [tripType, setTripType] = useState('One Way');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Automatically open login modal if redirected with ?login=true, then immediately clean the URL
  useEffect(() => {
    if (searchParams.get('login') === 'true') {
      if (!isAuthenticated) {
        setIsLoginModalOpen(true);
      }
      // Clean query params so Back button or history navigation never re-triggers the modal
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('login');
      const cleanSearch = newParams.toString();
      navigate({ search: cleanSearch ? `?${cleanSearch}` : '' }, { replace: true });
    }
  }, [searchParams, isAuthenticated, navigate]);

  const CITY_LANDMARKS: Record<string, { landmark: string; img: string }> = {
    BOM: { landmark: 'Gateway of India', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=500&q=80' },
    DEL: { landmark: 'India Gate', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=500&q=80' },
    BLR: { landmark: 'Vidhana Soudha', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=500&q=80' },
    GOI: { landmark: 'Goa Beaches', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&q=80' },
    GOX: { landmark: 'Goa Beaches', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&q=80' },
    CCU: { landmark: 'Victoria Memorial', img: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=500&q=80' },
    HYD: { landmark: 'Charminar', img: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=500&q=80' },
    JAI: { landmark: 'Hawa Mahal', img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=500&q=80' },
    DXB: { landmark: 'Burj Khalifa', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500&q=80' },
    DPS: { landmark: 'Ulun Danu Temple', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&q=80' },
    BKK: { landmark: 'Wat Arun', img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=500&q=80' },
    KUL: { landmark: 'Petronas Towers', img: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=500&q=80' },
    ATQ: { landmark: 'Golden Temple', img: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=500&q=80' },
    MAA: { landmark: 'Kapaleeshwarar Temple', img: 'https://images.unsplash.com/photo-1616843413587-9e3a37f7bbd8?w=500&q=80' },
    AMD: { landmark: 'Atal Bridge & Sabarmati', img: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=500&q=80' },
    NMI: { landmark: 'Mumbai Skyline', img: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=500&q=80' },
    SXR: { landmark: 'Dal Lake Shikara', img: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=500&q=80' },
    VNS: { landmark: 'Ganga Ghats', img: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=500&q=80' }
  };

  const DEFAULT_TOP_ROUTES = [
    { from: 'Delhi', to: 'Mumbai', codeFrom: 'DEL', codeTo: 'BOM', landmark: 'Gateway of India', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=500&q=80' },
    { from: 'Mumbai', to: 'Delhi', codeFrom: 'BOM', codeTo: 'DEL', landmark: 'India Gate', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=500&q=80' },
    { from: 'Delhi', to: 'Bangalore', codeFrom: 'DEL', codeTo: 'BLR', landmark: 'Vidhana Soudha', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=500&q=80' },
    { from: 'Delhi', to: 'Goa', codeFrom: 'DEL', codeTo: 'GOI', landmark: 'Goa Beaches', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&q=80' },
    { from: 'Delhi', to: 'Dubai', codeFrom: 'DEL', codeTo: 'DXB', landmark: 'Burj Khalifa', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500&q=80' },
    { from: 'Delhi', to: 'Bali', codeFrom: 'DEL', codeTo: 'DPS', landmark: 'Ulun Danu Temple', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&q=80' },
    { from: 'Kolkata', to: 'Delhi', codeFrom: 'CCU', codeTo: 'DEL', landmark: 'India Gate', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=500&q=80' },
    { from: 'Hyderabad', to: 'Mumbai', codeFrom: 'HYD', codeTo: 'BOM', landmark: 'Gateway of India', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=500&q=80' },
    { from: 'Delhi', to: 'Jaipur', codeFrom: 'DEL', codeTo: 'JAI', landmark: 'Hawa Mahal', img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=500&q=80' },
    { from: 'Bangalore', to: 'Mumbai', codeFrom: 'BLR', codeTo: 'BOM', landmark: 'Gateway of India', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=500&q=80' }
  ];

  const [topFlightRoutes, setTopFlightRoutes] = useState<any[]>(DEFAULT_TOP_ROUTES);
  const [activeFestiveBanner, setActiveFestiveBanner] = useState<any>(null);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isPromoCopied, setIsPromoCopied] = useState(false);

  const FESTIVE_THEMES: Record<string, { gradient: string; badgeBg: string; buttonBg: string; textAccent: string; icon: string }> = {
    DIWALI_GOLD: {
      gradient: 'from-[#420b05] via-[#7c2d03] to-[#b45309]',
      badgeBg: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
      buttonBg: 'bg-amber-400 hover:bg-amber-300 text-slate-950',
      textAccent: 'text-amber-200',
      icon: 'Festival of Lights'
    },
    HOLI_COLORS: {
      gradient: 'from-[#831843] via-[#581c87] to-[#1e40af]',
      badgeBg: 'bg-pink-500/20 text-pink-200 border-pink-400/30',
      buttonBg: 'bg-white hover:bg-slate-100 text-slate-900',
      textAccent: 'text-pink-200',
      icon: 'Spring Festival'
    },
    NEW_YEAR_MIDNIGHT: {
      gradient: 'from-[#030712] via-[#0f172a] to-[#312e81]',
      badgeBg: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30',
      buttonBg: 'bg-amber-400 hover:bg-amber-300 text-slate-950',
      textAccent: 'text-amber-200',
      icon: 'New Year 2026'
    },
    CHRISTMAS_RED: {
      gradient: 'from-[#7f1d1d] via-[#881337] to-[#14532d]',
      badgeBg: 'bg-red-500/20 text-red-200 border-red-400/30',
      buttonBg: 'bg-white hover:bg-slate-100 text-red-900',
      textAccent: 'text-red-200',
      icon: 'Merry Christmas'
    },
    EID_EMERALD: {
      gradient: 'from-[#064e3b] via-[#047857] to-[#854d0e]',
      badgeBg: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
      buttonBg: 'bg-amber-400 hover:bg-amber-300 text-slate-950',
      textAccent: 'text-emerald-200',
      icon: 'Eid Mubarak'
    },
    TRICOLOR_INDIA: {
      gradient: 'from-[#9a3412] via-[#0f172a] to-[#15803d]',
      badgeBg: 'bg-orange-500/20 text-orange-200 border-orange-400/30',
      buttonBg: 'bg-white hover:bg-slate-100 text-slate-900',
      textAccent: 'text-orange-200',
      icon: 'National Celebration'
    },
    ROYAL_PURPLE: {
      gradient: 'from-[#3b0764] via-[#581c87] to-[#701a75]',
      badgeBg: 'bg-purple-500/20 text-purple-200 border-purple-400/30',
      buttonBg: 'bg-white hover:bg-slate-100 text-purple-950',
      textAccent: 'text-purple-200',
      icon: 'Exclusive Offer'
    },
    SUNSET_ORANGE: {
      gradient: 'from-[#9a3412] via-[#be123c] to-[#831843]',
      badgeBg: 'bg-orange-500/20 text-orange-200 border-orange-400/30',
      buttonBg: 'bg-white hover:bg-slate-100 text-rose-950',
      textAccent: 'text-orange-200',
      icon: 'Seasonal Special'
    },
    CUSTOM: {
      gradient: 'from-[#0f172a] to-[#1e293b]',
      badgeBg: 'bg-slate-500/20 text-slate-200 border-slate-400/30',
      buttonBg: 'bg-white hover:bg-slate-100 text-slate-900',
      textAccent: 'text-slate-200',
      icon: 'Featured Special'
    }
  };

  const handleCopyPromo = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setIsPromoCopied(true);
    setTimeout(() => setIsPromoCopied(false), 2500);
  };

  useEffect(() => {
    const fetchTopRoutes = async () => {
      try {
        const response = await api.get('/searches/flights/top-routes');
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const dynamicRoutes = response.data.map((r: any) => {
            const destInfo = CITY_LANDMARKS[r.codeTo] || CITY_LANDMARKS[r.codeFrom] || {
              landmark: 'Iconic Landmark',
              img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=500&q=80'
            };
            return {
              from: r.from || CITIES[r.codeFrom] || r.codeFrom,
              to: r.to || CITIES[r.codeTo] || r.codeTo,
              codeFrom: r.codeFrom,
              codeTo: r.codeTo,
              landmark: destInfo.landmark,
              img: destInfo.img,
              count: r.count
            };
          });

          // Show only top 10 most booked flights in the tool
          setTopFlightRoutes(dynamicRoutes.slice(0, 10));
        }
      } catch (error) {
        console.error('Failed to fetch top routes:', error);
      }
    };
    fetchTopRoutes();
  }, []);

  useEffect(() => {
    const fetchFestiveBanner = async () => {
      try {
        const response = await api.get('/api/festive-banners/active');
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setActiveFestiveBanner(response.data[0]);
        }
      } catch (error) {
        // Silently ignore if festive banners can't be fetched
      }
    };
    fetchFestiveBanner();
  }, []);
  const [searchFrom, setSearchFrom] = useState('DEL');
  const [searchTo, setSearchTo] = useState('BOM');
  const [departureDate, setDepartureDate] = useState<Date | null>(new Date());
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  
  // Pickers state
  const [activeDatePicker, setActiveDatePicker] = useState<'depart' | 'return' | null>(null);
  const [isTravellerPickerOpen, setIsTravellerPickerOpen] = useState(false);
  const [isCabinPickerOpen, setIsCabinPickerOpen] = useState(false);
  const [isBookingForOpen, setIsBookingForOpen] = useState(false);
  const [bookingFor, setBookingFor] = useState('MYSELF');
  const [isFromPickerOpen, setIsFromPickerOpen] = useState(false);
  const [isToPickerOpen, setIsToPickerOpen] = useState(false);
  const [isTripTypePickerOpen, setIsTripTypePickerOpen] = useState(false);

  // Multi-City State (MakeMyTrip Style)
  const [multiCityLegs, setMultiCityLegs] = useState<Array<{ id: string; from: string; to: string; date: Date }>>([
    { id: '1', from: 'DEL', to: 'BLR', date: new Date() },
    { id: '2', from: 'BLR', to: 'BOM', date: new Date(Date.now() + 86400000) }
  ]);
  const [activeMultiPicker, setActiveMultiPicker] = useState<{ legIndex: number; type: 'from' | 'to' | 'date' } | null>(null);

  const handleAddMultiCityLeg = () => {
    if (multiCityLegs.length >= 5) {
      toast.error('Maximum 5 cities can be added for Multi-City itineraries');
      return;
    }
    const lastLeg = multiCityLegs[multiCityLegs.length - 1];
    const nextDate = new Date(lastLeg.date.getTime() + 86400000);
    setMultiCityLegs(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(7),
        from: lastLeg.to || 'DEL',
        to: '',
        date: nextDate
      }
    ]);
  };

  const handleRemoveMultiCityLeg = (index: number) => {
    if (multiCityLegs.length <= 2) return;
    setMultiCityLegs(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // Auto connect previous destination to next departure
      for (let i = 1; i < updated.length; i++) {
        if (updated[i - 1].to) {
          updated[i].from = updated[i - 1].to;
        }
      }
      return updated;
    });
    if (activeMultiPicker?.legIndex === index) {
      setActiveMultiPicker(null);
    }
  };

  const handleUpdateMultiCityLeg = (index: number, field: 'from' | 'to' | 'date', value: any) => {
    setMultiCityLegs(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      // MMT Auto-fill: changing leg i 'to' automatically updates leg i+1 'from'
      if (field === 'to' && updated[index + 1]) {
        updated[index + 1] = { ...updated[index + 1], from: value };
      }
      return updated;
    });
  };

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabinClass, setCabinClass] = useState('Economy/ Premium Economy');

  const [show30DaysWarning, setShow30DaysWarning] = useState(false);

  useEffect(() => {
    if (departureDate && returnDate) {
      const diffTime = returnDate.getTime() - departureDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 30) {
        setShow30DaysWarning(true);
        const timer = setTimeout(() => setShow30DaysWarning(false), 4000);
        return () => clearTimeout(timer);
      } else {
        setShow30DaysWarning(false);
      }
    }
  }, [returnDate, departureDate]);

  const closeAllPickers = () => {
    setActiveDatePicker(null);
    setIsTravellerPickerOpen(false);
    setIsCabinPickerOpen(false);
    setIsBookingForOpen(false);
    setIsFromPickerOpen(false);
    setIsToPickerOpen(false);
    setIsTripTypePickerOpen(false);
    setActiveMultiPicker(null);
  };

  // Close all pickers on outside click without requiring blocking overlay
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('.picker-popup') || target.closest('.picker-trigger')) {
        return;
      }
      closeAllPickers();
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Handle scroll for sticky nav
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Public Destinations
  useEffect(() => {
    api.get('/api/cms/destinations')
      .then((res) => setDestinations(res.data))
      .catch((err) => console.error("Error fetching destinations:", err));
  }, []);

  const getLocalISO = (d: Date | null) => {
    if (!d) return '';
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
  };

  const handleSearch = () => {
    if (activeTab === 'Hotels') {
      const query = new URLSearchParams({
        city: searchTo, // We can use 'searchTo' state as the destination city
        checkIn: getLocalISO(departureDate),
        checkOut: getLocalISO(returnDate)
      }).toString();
      navigate(`/hotels/search?${query}`);
      return;
    }

    if (tripType === 'Multi City') {
      for (let i = 0; i < multiCityLegs.length; i++) {
        const leg = multiCityLegs[i];
        if (!leg.from) {
          toast.error(`Please select Departure City for Flight #${i + 1}`);
          return;
        }
        if (!leg.to) {
          toast.error(`Please select Destination City for Flight #${i + 1}`);
          return;
        }
        if (leg.from === leg.to) {
          toast.error(`Flight #${i + 1}: Departure and Destination cannot be the same city`);
          return;
        }
      }

      const serializedLegs = multiCityLegs.map(l => ({
        from: l.from,
        to: l.to,
        date: getLocalISO(l.date)
      }));

      const query = new URLSearchParams({
        tab: activeTab,
        tripType: 'Multi City',
        from: multiCityLegs[0].from,
        to: multiCityLegs[0].to,
        date: getLocalISO(multiCityLegs[0].date),
        legs: JSON.stringify(serializedLegs),
        adults: adults.toString(),
        children: children.toString(),
        infants: infants.toString(),
        cabinClass: cabinClass
      }).toString();

      navigate(`/flights/search?${query}`);
      return;
    }

    const query = new URLSearchParams({
      tab: activeTab,
      from: searchFrom,
      to: searchTo,
      date: getLocalISO(departureDate),
      returnDate: getLocalISO(returnDate),
      tripType: tripType,
      adults: adults.toString(),
      children: children.toString(),
      infants: infants.toString(),
      cabinClass: cabinClass
    }).toString();

    navigate(`/flights/search?${query}`);
  };

  const isNavWhite = isScrolled || isHovered;

  return (
    <div className={`min-h-[100dvh] bg-gray-50 flex flex-col font-sans relative ${isAuthenticated ? 'pb-24 lg:pb-0' : ''}`}>
      
      {/* Scroll Background Airplane */}
      <ScrollAirplane />

      {/* Public Navbar */}
      <TopNavbar 
        festiveBanner={!isBannerDismissed ? activeFestiveBanner : null} 
        onDismissFestiveBanner={() => setIsBannerDismissed(true)} 
      />

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => {
          setIsLoginModalOpen(false);
          if (searchParams.get('login') === 'true') {
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('login');
            const cleanSearch = newParams.toString();
            navigate({ search: cleanSearch ? `?${cleanSearch}` : '' }, { replace: true });
          }
        }} 
      />

      {/* Massive Hero Section */}
      <div className={`relative ${activeFestiveBanner && activeFestiveBanner.showTopStrip && !isBannerDismissed ? 'pt-24 sm:pt-28 lg:pt-32' : 'pt-16 pb-20 lg:pt-20 lg:pb-24'} pb-20 lg:pb-24 bg-[#00224f]`}>
        
        {/* Dynamic Background Elements */}
          <div className="absolute inset-0 z-0 overflow-hidden bg-[#001f3f]">
            {/* Main Image with slow zoom effect */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-80" style={{ animation: 'zoomInOut 30s infinite alternate ease-in-out' }}></div>
            
            {/* Atmospheric Sky Vignette */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#070b24]/90 via-[#0b1031]/75 to-[#031538]/95 pointer-events-none"></div>
            {/* Smooth transition into page content at the very bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10"></div>
            
            {/* Extra inline style for the subtle zoom animation */}
            <style>{`
              @keyframes zoomInOut {
                0% { transform: scale(1); }
                100% { transform: scale(1.1); }
              }
              @keyframes fadeInUp {
                0% { opacity: 0; transform: translateY(20px); }
                100% { opacity: 1; transform: translateY(0); }
              }
            `}</style>
          </div>        {/* Search Widget Container */}
        <div className={`mx-auto w-full px-4 relative z-40 transition-all duration-300 max-w-[1250px]`}>
          
          {/* Welcome Headline */}
            <div className="text-center mb-7 lg:mb-9 animate-[fadeInUp_1s_ease-out]">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold mb-3.5 shadow-sm">
                <Sparkles size={14} className="text-amber-300 animate-pulse" />
                <span>Special Deals & Guaranteed Best Fares</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2 tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]">
                Let's Book Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-indigo-200 to-purple-200">Dream Vacation</span>
              </h1>
            </div>
          {/* Top Tabs Pill - Floating Glass Capsule */}
          <div className="flex bg-white/85 backdrop-blur-2xl border border-white/90 rounded-full shadow-[0_12px_36px_rgba(0,18,50,0.18),0_0_0_1px_rgba(255,255,255,0.7)_inset] items-center justify-center p-1.5 mx-auto relative z-30 w-fit mb-[-24px] lg:mb-[-28px] gap-2">
            {[
              { name: 'Flights', icon: Plane },
              { name: 'Hotels', icon: Building2 }
            ].map(tab => {
              const isActive = activeTab === tab.name;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.name}
                  type="button"
                  className={`flex items-center gap-2.5 px-6 sm:px-8 py-2.5 rounded-full cursor-pointer transition-all duration-300 font-black text-xs sm:text-sm tracking-wide ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white shadow-[0_4px_18px_rgba(37,99,235,0.45)] scale-[1.02]' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-white/60'
                  }`}
                  onClick={() => setActiveTab(tab.name)}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500'} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Main Glass Card */}
          <div className="relative z-20">
            {/* Ambient Backlight Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/25 via-indigo-500/20 to-sky-400/25 rounded-3xl blur-2xl opacity-75 -z-10 pointer-events-none"></div>

            <div className="bg-white/[0.84] backdrop-blur-2xl rounded-3xl border border-white/90 shadow-[0_25px_65px_-15px_rgba(8,30,80,0.22),0_0_0_1px_rgba(255,255,255,0.7)_inset] pt-9 lg:pt-12 pb-14 lg:pb-16 px-4 sm:px-6 lg:px-8 relative">
            
            {activeTab === 'Flights' ? (
              <div className="pb-6 lg:pb-8">
                {/* Flight Types & Tagline */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5 lg:mb-6 relative">
                  <div className="inline-flex items-center p-1 bg-slate-900/[0.04] backdrop-blur-md border border-slate-200/60 rounded-full gap-1">
                    {[
                      { label: 'One Way', value: 'One Way' },
                      { label: 'Round Trip', value: 'Round Trip' },
                      { label: 'Multi City', value: 'Multi City' }
                    ].map(item => {
                      const isSelected = tripType === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => {
                            setTripType(item.value as any);
                            if (item.value === 'One Way') {
                              setReturnDate(null);
                            } else if (item.value === 'Round Trip' && !returnDate) {
                              setReturnDate(new Date((departureDate || new Date()).getTime() + 86400000 * 2));
                            } else if (item.value === 'Multi City') {
                              setMultiCityLegs(prev => {
                                const copy = [...prev];
                                copy[0].from = searchFrom || 'DEL';
                                if (searchTo) {
                                  copy[0].to = searchTo;
                                  if (copy[1]) copy[1].from = searchTo;
                                }
                                if (departureDate) copy[0].date = departureDate;
                                return copy;
                              });
                            }
                          }}
                          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black transition-all duration-200 cursor-pointer ${
                            isSelected 
                              ? 'bg-white text-blue-700 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-200/70' 
                              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full transition-all ${isSelected ? 'bg-blue-600 scale-100 ring-2 ring-blue-200' : 'bg-slate-300'}`}></span>
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="hidden lg:inline-flex items-center gap-2 text-xs font-bold text-slate-600 bg-white/70 backdrop-blur-xs border border-white/80 px-3.5 py-1.5 rounded-full shadow-xs">
                    <Plane size={13} className="text-blue-600" />
                    <span>Book International and Domestic Flights</span>
                  </div>
                </div>

                {tripType === 'Multi City' ? (
                  /* MULTI-CITY STACKED ROWS (MakeMyTrip Architecture) */
                  <div className="space-y-3 relative z-30">
                    {multiCityLegs.map((leg, index) => {
                      const isFirstLeg = index === 0;
                      const isLastLeg = index === multiCityLegs.length - 1;
                      const canRemove = multiCityLegs.length > 2 && index >= 2;
                      const isPickerOpen = activeMultiPicker?.legIndex === index;

                      return (
                        <div 
                          key={leg.id}
                          className={`flex flex-col lg:flex-row bg-white/85 backdrop-blur-xl border border-white/95 rounded-2xl shadow-[0_6px_25px_rgba(15,23,42,0.07),0_0_0_1px_rgba(255,255,255,0.85)_inset] overflow-visible lg:h-[105px] relative divide-y lg:divide-y-0 lg:divide-x divide-slate-200/70 transition-all duration-200 ${
                            isPickerOpen ? 'z-50 ring-2 ring-blue-500/25' : 'z-20'
                          }`}
                        >
                          {/* FROM */}
                          <div
                            className="w-full lg:flex-1 min-w-0 p-3 px-5 border-b lg:border-b-0 cursor-pointer hover:bg-gradient-to-b hover:from-blue-500/[0.06] hover:to-indigo-500/[0.03] rounded-t-2xl lg:rounded-t-none lg:rounded-l-2xl transition-all group relative picker-trigger"
                            onClick={(e) => {
                              e.stopPropagation();
                              closeAllPickers();
                              setActiveMultiPicker({ legIndex: index, type: 'from' });
                            }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">
                                From <span className="text-blue-600 font-extrabold ml-1">#{index + 1}</span>
                              </span>
                            </div>
                            <div className="w-full text-2xl lg:text-[28px] leading-none font-black text-slate-900 truncate bg-transparent flex flex-col mt-1">
                              {CITIES[leg.from] || leg.from || 'Select City'}
                            </div>
                            <p className="text-[12px] font-semibold text-slate-500 truncate mt-1">
                              {getAirportSubtext(leg.from)}
                            </p>

                            {isPickerOpen && activeMultiPicker?.type === 'from' && (
                              <div className="absolute top-[100%] left-0 z-[100] mt-1 shadow-2xl picker-popup" onClick={e => e.stopPropagation()}>
                                <CityPicker
                                  value={leg.from}
                                  onChange={(c) => {
                                    handleUpdateMultiCityLeg(index, 'from', c);
                                    setActiveMultiPicker(null);
                                  }}
                                  onClose={() => setActiveMultiPicker(null)}
                                  title={`FLIGHT #${index + 1} - FROM`}
                                />
                              </div>
                            )}
                          </div>

                          {/* TO */}
                          <div
                            className="w-full lg:flex-1 min-w-0 p-3 px-5 border-b lg:border-b-0 cursor-pointer hover:bg-gradient-to-b hover:from-blue-500/[0.06] hover:to-indigo-500/[0.03] transition-all group relative picker-trigger"
                            onClick={(e) => {
                              e.stopPropagation();
                              closeAllPickers();
                              setActiveMultiPicker({ legIndex: index, type: 'to' });
                            }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">
                                To
                              </span>
                            </div>
                            <div className={`w-full text-2xl lg:text-[28px] leading-none font-black truncate bg-transparent flex flex-col mt-1 ${
                              leg.to ? 'text-slate-900' : 'text-slate-400 font-bold'
                            }`}>
                              {leg.to ? (CITIES[leg.to] || leg.to) : 'Select City'}
                            </div>
                            <p className="text-[12px] font-semibold text-slate-500 truncate mt-1">
                              {leg.to ? getAirportSubtext(leg.to) : 'Tap to select destination'}
                            </p>

                            {isPickerOpen && activeMultiPicker?.type === 'to' && (
                              <div className="absolute top-[100%] left-0 z-[100] mt-1 shadow-2xl picker-popup" onClick={e => e.stopPropagation()}>
                                <CityPicker
                                  value={leg.to}
                                  onChange={(c) => {
                                    handleUpdateMultiCityLeg(index, 'to', c);
                                    setActiveMultiPicker(null);
                                  }}
                                  onClose={() => setActiveMultiPicker(null)}
                                  title={`FLIGHT #${index + 1} - TO`}
                                />
                              </div>
                            )}
                          </div>

                          {/* DEPARTURE */}
                          <div
                            className="flex-1 lg:w-[150px] p-3 px-3 lg:px-5 cursor-pointer hover:bg-gradient-to-b hover:from-blue-500/[0.06] hover:to-indigo-500/[0.03] transition-all group relative picker-trigger"
                            onClick={(e) => {
                              e.stopPropagation();
                              closeAllPickers();
                              setActiveMultiPicker({ legIndex: index, type: 'date' });
                            }}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">Departure</span>
                              <ChevronDown size={14} className="text-blue-600 group-hover:translate-y-0.5 transition-transform" />
                            </div>
                            <div className="flex items-baseline gap-1 mt-1">
                              <h3 className="text-3xl lg:text-[34px] leading-none font-black text-slate-900">{format(leg.date, 'd')}</h3>
                              <span className="text-xl font-bold text-slate-900">{format(leg.date, "MMM''yy")}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-semibold mt-1">{format(leg.date, 'EEEE')}</p>

                            {isPickerOpen && activeMultiPicker?.type === 'date' && (
                              <div className="absolute top-[100%] left-0 sm:left-[-80px] z-[100] mt-1 shadow-2xl picker-popup" onClick={e => e.stopPropagation()}>
                                <CustomCalendar
                                  startDate={leg.date}
                                  endDate={null}
                                  isOneWay={true}
                                  minDate={index > 0 ? multiCityLegs[index - 1].date : new Date()}
                                  onChange={(start) => {
                                    if (start) {
                                      handleUpdateMultiCityLeg(index, 'date', start);
                                    }
                                    setActiveMultiPicker(null);
                                  }}
                                  onClose={() => setActiveMultiPicker(null)}
                                  origin={leg.from}
                                  destination={leg.to}
                                />
                              </div>
                            )}
                          </div>

                          {/* ROW 1: TRAVELLERS & CABIN CLASS (Global for trip) */}
                          {isFirstLeg ? (
                            <div className="relative flex flex-col sm:flex-row w-full lg:w-auto divide-y sm:divide-y-0 sm:divide-x divide-slate-200/70">
                              {/* Travellers */}
                              <div
                                className="w-full sm:flex-1 lg:w-[125px] p-3 px-3 lg:px-5 cursor-pointer hover:bg-gradient-to-b hover:from-blue-500/[0.06] hover:to-indigo-500/[0.03] transition-all group picker-trigger"
                                onClick={(e) => { e.stopPropagation(); closeAllPickers(); setIsTravellerPickerOpen(!isTravellerPickerOpen); }}
                              >
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">Travellers</span>
                                  <ChevronDown size={14} className="text-blue-600 group-hover:translate-y-0.5 transition-transform" />
                                </div>
                                <div className="flex items-baseline gap-1 mt-1">
                                  <h3 className="text-3xl lg:text-[34px] leading-none font-black text-slate-900">{adults + children + infants}</h3>
                                </div>
                                <p className="text-[12px] text-slate-700 font-bold mt-1 flex items-center gap-2">
                                  <span className="flex items-center gap-0.5"><User size={13} className="text-slate-800" /> {adults}</span>
                                  {children > 0 && <span className="flex items-center gap-0.5"><Smile size={13} className="text-slate-800" /> {children}</span>}
                                  {infants > 0 && <span className="flex items-center gap-0.5"><Baby size={13} className="text-slate-800" /> {infants}</span>}
                                </p>
                              </div>

                              {isTravellerPickerOpen && (
                                <div className="absolute top-[100%] right-0 z-[100] mt-1 shadow-2xl picker-popup" onClick={e => e.stopPropagation()}>
                                  <TravellerPicker
                                    adults={adults}
                                    children={children}
                                    infants={infants}
                                    cabinClass={cabinClass}
                                    onChange={(a, c, i, cabin) => {
                                      setAdults(a);
                                      setChildren(c);
                                      setInfants(i);
                                      setCabinClass(cabin);
                                    }}
                                    onClose={() => setIsTravellerPickerOpen(false)}
                                  />
                                </div>
                              )}

                              {/* Cabin Class */}
                              <div
                                className="w-full sm:flex-1 lg:w-[170px] p-3 px-3 lg:px-5 cursor-pointer hover:bg-gradient-to-b hover:from-blue-500/[0.06] hover:to-indigo-500/[0.03] rounded-b-2xl sm:rounded-b-none lg:rounded-r-2xl transition-all group picker-trigger"
                                onClick={(e) => { e.stopPropagation(); closeAllPickers(); setIsCabinPickerOpen(!isCabinPickerOpen); }}
                              >
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">Cabin Class</span>
                                  <ChevronDown size={14} className="text-blue-600 group-hover:translate-y-0.5 transition-transform" />
                                </div>
                                <p className="text-[14px] font-black text-slate-900 mt-2 leading-tight truncate" title={cabinClass}>
                                  {cabinClass}
                                </p>
                              </div>

                              {isCabinPickerOpen && (
                                <div className="absolute top-[100%] right-0 z-[100] mt-1 shadow-2xl picker-popup" onClick={e => e.stopPropagation()}>
                                  <CabinClassPicker cabinClass={cabinClass} onChange={(c) => { setCabinClass(c); setIsCabinPickerOpen(false); }} />
                                </div>
                              )}
                            </div>
                          ) : (
                            /* ROW 2 & BEYOND: + ADD ANOTHER CITY / REMOVE */
                            <div className="flex items-center justify-between lg:justify-end gap-3 p-3 px-5 lg:w-[295px] rounded-b-2xl lg:rounded-b-none lg:rounded-r-2xl bg-slate-50/50">
                              {canRemove && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMultiCityLeg(index)}
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                                  title="Remove this city leg"
                                >
                                  <X size={15} />
                                  <span>Remove</span>
                                </button>
                              )}

                              {isLastLeg && multiCityLegs.length < 5 && (
                                <button
                                  type="button"
                                  onClick={handleAddMultiCityLeg}
                                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border-2 border-blue-600 text-blue-600 font-extrabold text-xs tracking-wider uppercase hover:bg-blue-600 hover:text-white transition-all shadow-xs active:scale-95 cursor-pointer ml-auto"
                                >
                                  <Plus size={15} strokeWidth={2.8} />
                                  <span>+ ADD ANOTHER CITY</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Main Inputs Glass Box (One Way & Round Trip) */
                  <div className={`flex flex-col lg:flex-row bg-white/85 backdrop-blur-xl border border-white/95 rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.08),0_0_0_1px_rgba(255,255,255,0.85)_inset] overflow-visible lg:h-[110px] relative divide-y lg:divide-y-0 lg:divide-x divide-slate-200/70 transition-all duration-200 ${
                    (isFromPickerOpen || isToPickerOpen || activeDatePicker || isTravellerPickerOpen || isCabinPickerOpen || isBookingForOpen) ? 'z-50' : 'z-20'
                  }`}>
                  
                  {/* FROM */}
                  <div 
                    className="w-full lg:flex-1 min-w-0 p-3 px-5 border-b lg:border-b-0 cursor-pointer hover:bg-gradient-to-b hover:from-blue-500/[0.06] hover:to-indigo-500/[0.03] rounded-t-2xl lg:rounded-t-none lg:rounded-l-2xl transition-all group relative picker-trigger"
                    onClick={(e) => { e.stopPropagation(); closeAllPickers(); setIsFromPickerOpen(true); }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">From</span>
                    </div>
                    <div className="w-full text-2xl lg:text-[30px] leading-none font-black text-slate-900 truncate bg-transparent flex flex-col mt-1">
                      {CITIES[searchFrom] || searchFrom}
                    </div>
                    <p className="text-[12px] font-semibold text-slate-500 truncate mt-1">{getAirportSubtext(searchFrom)}</p>
                    
                    {isFromPickerOpen && (
                      <div className="absolute top-[100%] left-0 z-[100] mt-1 shadow-2xl picker-popup" onClick={e => e.stopPropagation()}>
                        <CityPicker value={searchFrom} onChange={(c) => { setSearchFrom(c); setIsFromPickerOpen(false); }} onClose={() => setIsFromPickerOpen(false)} title="FROM" />
                      </div>
                    )}
                    
                    {/* Swap Button */}
                    <div 
                      className="absolute right-4 lg:-right-4.5 top-[100%] lg:top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-[0_4px_14px_rgba(0,0,0,0.12)] flex items-center justify-center cursor-pointer hover:bg-blue-600 hover:text-white hover:border-blue-600 group/swap transition-all duration-300 hover:scale-110 active:scale-95"
                      onClick={(e) => {
                        e.stopPropagation();
                        const temp = searchFrom;
                        setSearchFrom(searchTo);
                        setSearchTo(temp);
                      }}
                      title="Swap Origin and Destination"
                    >
                      <ArrowRightLeft size={14} className="text-blue-600 group-hover/swap:text-white transform lg:rotate-0 rotate-90 transition-colors" />
                    </div>
                  </div>

                  {/* TO */}
                  <div 
                    className="w-full lg:flex-1 min-w-0 p-3 px-5 border-b lg:border-b-0 cursor-pointer hover:bg-gradient-to-b hover:from-blue-500/[0.06] hover:to-indigo-500/[0.03] transition-all group relative picker-trigger"
                    onClick={(e) => { e.stopPropagation(); closeAllPickers(); setIsToPickerOpen(true); }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">To</span>
                    </div>
                    <div className="w-full text-2xl lg:text-[30px] leading-none font-black text-slate-900 truncate bg-transparent flex flex-col mt-1">
                      {CITIES[searchTo] || searchTo}
                    </div>
                    <p className="text-[12px] font-semibold text-slate-500 truncate mt-1">{getAirportSubtext(searchTo)}</p>

                    {isToPickerOpen && (
                      <div className="absolute top-[100%] left-0 z-[100] mt-1 shadow-2xl picker-popup" onClick={e => e.stopPropagation()}>
                        <CityPicker value={searchTo} onChange={(c) => { setSearchTo(c); setIsToPickerOpen(false); }} onClose={() => setIsToPickerOpen(false)} title="TO" />
                      </div>
                    )}
                  </div>

                <div className="relative flex flex-row w-full lg:w-auto divide-x divide-slate-200/70">
                  <div 
                    className="flex-1 lg:w-[150px] p-3 px-3 lg:px-5 cursor-pointer hover:bg-gradient-to-b hover:from-blue-500/[0.06] hover:to-indigo-500/[0.03] transition-all group picker-trigger"
                    onClick={(e) => { e.stopPropagation(); closeAllPickers(); setActiveDatePicker('depart'); }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">Departure</span>
                      <ChevronDown size={14} className="text-blue-600 group-hover:translate-y-0.5 transition-transform" />
                    </div>
                    {departureDate ? (
                      <>
                        <div className="flex items-baseline gap-1 mt-1">
                          <h3 className="text-3xl lg:text-[38px] leading-none font-black text-slate-900">{format(departureDate, 'd')}</h3>
                          <span className="text-xl font-bold text-slate-900">{format(departureDate, "MMM''yy")}</span>
                        </div>
                        <p className="text-[12px] text-slate-500 font-semibold mt-1">{format(departureDate, 'EEEE')}</p>
                      </>
                    ) : (
                      <p className="text-sm font-bold text-slate-400 mt-3">Select Date</p>
                    )}
                  </div>

                  {/* Return Column - ONLY visible when Round Trip is selected */}
                  {tripType === 'Round Trip' && (
                    <div 
                      className="flex-1 lg:w-[150px] p-3 px-3 lg:px-5 cursor-pointer hover:bg-gradient-to-b hover:from-blue-500/[0.06] hover:to-indigo-500/[0.03] transition-all group relative animate-in fade-in duration-200 picker-trigger"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        closeAllPickers(); 
                        setActiveDatePicker('return'); 
                      }}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">Return</span>
                        <ChevronDown size={14} className="text-blue-600 group-hover:translate-y-0.5 transition-transform" />
                      </div>
                      {returnDate ? (
                        <>
                          <div className="flex items-baseline gap-1 mt-1">
                            <h3 className="text-3xl lg:text-[38px] leading-none font-black text-slate-900">{format(returnDate, 'd')}</h3>
                            <span className="text-xl font-bold text-slate-900">{format(returnDate, "MMM''yy")}</span>
                          </div>
                          <p className="text-[12px] text-slate-500 font-semibold mt-1">{format(returnDate, 'EEEE')}</p>
                        </>
                      ) : (
                        <p className="text-sm font-bold text-slate-400 mt-3">Select Date</p>
                      )}

                      {show30DaysWarning && (
                        <div className="absolute top-[85%] left-4 bg-[#cc7700] text-white text-[12px] px-3 py-1.5 rounded shadow-lg z-50 whitespace-nowrap animate-fade-in-up">
                          <div className="absolute -top-1 left-4 w-3 h-3 bg-[#cc7700] transform rotate-45"></div>
                          You are booking for more than 30 days
                        </div>
                      )}
                    </div>
                  )}

                  {activeDatePicker === 'depart' && (
                    <div className="absolute top-[100%] sm:top-[calc(100%-4px)] left-0 sm:left-[-80px] z-[100] mt-1 sm:mt-0 shadow-2xl picker-popup" onClick={e => e.stopPropagation()}>
                      <CustomCalendar 
                        startDate={departureDate} 
                        endDate={null}
                        isOneWay={true}
                        onChange={(start) => { 
                          if (start) setDepartureDate(start); 
                          setActiveDatePicker(tripType === 'Round Trip' ? 'return' : null);
                        }}
                        onClose={() => setActiveDatePicker(null)}
                        origin={searchFrom}
                        destination={searchTo}
                      />
                    </div>
                  )}

                  {activeDatePicker === 'return' && tripType === 'Round Trip' && (
                    <div className="absolute top-[100%] sm:top-[calc(100%-4px)] right-0 sm:left-[-80px] sm:right-auto z-[100] mt-1 sm:mt-0 shadow-2xl picker-popup" onClick={e => e.stopPropagation()}>
                      <CustomCalendar 
                        startDate={returnDate} 
                        endDate={null}
                        minDate={departureDate}
                        isOneWay={true}
                        onChange={(start) => { 
                          if (start) setReturnDate(start); 
                          setActiveDatePicker(null);
                        }}
                        onClose={() => setActiveDatePicker(null)}
                        origin={searchTo}
                        destination={searchFrom}
                      />
                    </div>
                  )}
                </div>

                <div className="relative flex flex-col sm:flex-row w-full lg:w-auto divide-y sm:divide-y-0 sm:divide-x divide-slate-200/70">
                  {/* Travellers */}
                  <div 
                    className="w-full sm:flex-1 lg:w-[125px] p-3 px-3 lg:px-5 cursor-pointer hover:bg-gradient-to-b hover:from-blue-500/[0.06] hover:to-indigo-500/[0.03] transition-all group picker-trigger"
                    onClick={(e) => { e.stopPropagation(); closeAllPickers(); setIsTravellerPickerOpen(!isTravellerPickerOpen); }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">Travellers</span>
                      <ChevronDown size={14} className="text-blue-600 group-hover:translate-y-0.5 transition-transform" />
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <h3 className="text-3xl lg:text-[38px] leading-none font-black text-slate-900">{adults + children + infants}</h3>
                    </div>
                    <p className="text-[12px] text-slate-700 font-bold mt-1 flex items-center gap-2.5">
                      <span className="flex items-center gap-0.5" title="Adults"><User size={13} className="text-slate-800" /> {adults}</span>
                      <span className="flex items-center gap-0.5" title="Children"><Smile size={13} className="text-slate-800" /> {children}</span>
                      <span className="flex items-center gap-0.5" title="Infants"><Baby size={13} className="text-slate-800" /> {infants}</span>
                    </p>
                  </div>

                  {isTravellerPickerOpen && (
                    <div className="absolute top-[100%] right-0 z-[100] mt-1 shadow-2xl picker-popup" onClick={e => e.stopPropagation()}>
                      <TravellerPicker 
                        adults={adults}
                        children={children}
                        infants={infants}
                        cabinClass={cabinClass}
                        onChange={(a, c, i, cabin) => {
                          setAdults(a);
                          setChildren(c);
                          setInfants(i);
                          setCabinClass(cabin);
                        }}
                        onClose={() => setIsTravellerPickerOpen(false)}
                      />
                    </div>
                  )}
                  
                  {/* Cabin Class */}
                  <div 
                    className="w-full sm:flex-1 lg:w-[170px] p-3 px-3 lg:px-5 cursor-pointer hover:bg-gradient-to-b hover:from-blue-500/[0.06] hover:to-indigo-500/[0.03] rounded-b-2xl sm:rounded-b-none lg:rounded-r-2xl transition-all group picker-trigger"
                    onClick={(e) => { e.stopPropagation(); closeAllPickers(); setIsCabinPickerOpen(!isCabinPickerOpen); }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">Cabin Class</span>
                      <ChevronDown size={14} className="text-blue-600 group-hover:translate-y-0.5 transition-transform" />
                    </div>
                    <p className="text-[15px] font-black text-slate-900 mt-2 leading-tight truncate" title={cabinClass}>
                      {cabinClass}
                    </p>
                  </div>
                  {isCabinPickerOpen && (
                    <div className="absolute top-[100%] right-0 z-[100] mt-1 shadow-2xl picker-popup" onClick={e => e.stopPropagation()}>
                      <CabinClassPicker cabinClass={cabinClass} onChange={(c) => { setCabinClass(c); setIsCabinPickerOpen(false); }} />
                    </div>
                  )}
                </div>

                {user?.roles?.includes('B2B_AGENT') && (
                  <div className="relative flex flex-col sm:flex-row w-full lg:w-[150px] border-t md:border-t-0 md:border-l border-gray-200">
                    <div 
                      className="w-full sm:flex-1 p-3 px-5 cursor-pointer hover:bg-orange-50/30 transition-colors group picker-trigger"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeAllPickers();
                        setIsBookingForOpen(!isBookingForOpen);
                      }}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-sm font-bold text-gray-500 group-hover:text-orange-500 transition-colors">Booking For</span>
                        <ChevronDown size={16} className="text-orange-500" />
                      </div>
                      <p className="text-[13px] font-black text-gray-900 mt-2 leading-tight truncate">
                        {bookingFor === 'MYSELF' ? user.name : bookingFor === 'Others' ? 'Others' : bookingFor}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">
                        {bookingFor === 'MYSELF' ? user.email : bookingFor === 'Others' ? 'Guests, Interviewee, etc' : 'prerna.jha@mbp.in'}
                      </p>
                    </div>

                    {isBookingForOpen && (
                      <div className="absolute top-[100%] right-0 z-[100] w-[300px] bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden py-2 mt-2 animate-in fade-in zoom-in-95 picker-popup" onClick={e => e.stopPropagation()}>
                        <div className="px-4 py-3 bg-blue-50/50 border-b border-gray-100">
                          <input type="text" placeholder="Primary Traveller's Email ID" className="w-full bg-white border border-gray-200 rounded-md px-3 py-1.5 text-xs outline-none focus:border-blue-400" />
                          <p className="text-[10px] text-gray-500 mt-2">Enter Primary Traveller Email ID for whom you are making the booking.</p>
                        </div>
                        
                        <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                          {/* MYSELF */}
                          <div 
                            className={`px-4 py-3 cursor-pointer transition-colors ${bookingFor === 'MYSELF' ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                            onClick={() => { setBookingFor('MYSELF'); setIsBookingForOpen(false); }}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                              <span className="font-bold text-sm text-gray-900">{user.name}</span>
                              <span className="text-[9px] font-bold text-orange-500 bg-orange-100 px-1.5 py-0.5 rounded">MYSELF</span>
                            </div>
                            <p className="text-xs text-gray-500 ml-3">{user.email}</p>
                          </div>

                          {/* Others */}
                          <div 
                            className={`px-4 py-3 cursor-pointer transition-colors ${bookingFor === 'Others' ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                            onClick={() => { setBookingFor('Others'); setIsBookingForOpen(false); }}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                              <span className="font-bold text-sm text-gray-900">Others</span>
                            </div>
                            <p className="text-xs text-gray-500 ml-3">Guests, Interviewee, etc</p>
                          </div>

                        </div>
                      </div>
                    )}
                  </div>
                )}

                </div>
              )}

              </div>
            ) : activeTab === 'Hotels' ? (
              <div className="relative pb-10 md:pb-0">
                {/* Hotel Search Inputs */}
                <div className={`flex flex-col md:flex-row bg-white/75 backdrop-blur-xl border border-white/95 rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.06),0_0_0_1px_rgba(255,255,255,0.85)_inset] overflow-visible md:h-[110px] relative divide-y md:divide-y-0 md:divide-x divide-slate-200/70 transition-all duration-200 ${
                  (isToPickerOpen || activeDatePicker) ? 'z-50' : 'z-20'
                }`}>
                  
                  {/* Destination */}
                  <div 
                    className="w-full md:flex-[2] p-3 px-5 cursor-pointer hover:bg-gradient-to-b hover:from-blue-500/[0.06] hover:to-indigo-500/[0.03] rounded-t-2xl md:rounded-t-none md:rounded-l-2xl transition-all group relative picker-trigger"
                    onClick={(e) => { e.stopPropagation(); closeAllPickers(); setIsToPickerOpen(true); }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">City, Property name or Location</span>
                    </div>
                    <div className="w-full text-2xl lg:text-[30px] font-black text-slate-900 truncate bg-transparent flex flex-col mt-2">
                      {CITIES[searchTo] || searchTo}
                    </div>
                    
                    {isToPickerOpen && (
                      <div className="absolute top-[100%] left-0 z-[100] mt-1 shadow-2xl picker-popup" onClick={e => e.stopPropagation()}>
                        <CityPicker value={searchTo} onChange={(c) => { setSearchTo(c); setIsToPickerOpen(false); }} onClose={() => setIsToPickerOpen(false)} title="DESTINATION" type="hotel" />
                      </div>
                    )}
                  </div>

                  {/* Check-In */}
                  <div 
                    className="w-full md:flex-1 p-3 px-5 cursor-pointer hover:bg-gradient-to-b hover:from-blue-500/[0.06] hover:to-indigo-500/[0.03] transition-all group picker-trigger"
                    onClick={(e) => { e.stopPropagation(); closeAllPickers(); setActiveDatePicker('depart'); }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">Check-In</span>
                      <ChevronDown size={14} className="text-blue-600 group-hover:translate-y-0.5 transition-transform" />
                    </div>
                    {departureDate ? (
                      <>
                        <div className="flex items-baseline gap-1 mt-1">
                          <h3 className="text-3xl lg:text-[38px] leading-none font-black text-slate-900">{format(departureDate, 'd')}</h3>
                          <span className="text-xl font-bold text-slate-900">{format(departureDate, "MMM''yy")}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-semibold mt-1">{format(departureDate, 'EEEE')}</p>
                      </>
                    ) : (
                      <p className="text-sm font-bold text-slate-400 mt-3">Select Date</p>
                    )}
                  </div>

                  {/* Check-Out */}
                  <div 
                    className="w-full md:flex-1 p-3 px-5 cursor-pointer hover:bg-gradient-to-b hover:from-blue-500/[0.06] hover:to-indigo-500/[0.03] transition-all group relative picker-trigger"
                    onClick={(e) => { e.stopPropagation(); closeAllPickers(); setActiveDatePicker('return'); }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">Check-Out</span>
                      <ChevronDown size={14} className="text-blue-600 group-hover:translate-y-0.5 transition-transform" />
                    </div>
                    {returnDate ? (
                      <>
                        <div className="flex items-baseline gap-1 mt-1">
                          <h3 className="text-3xl lg:text-[38px] leading-none font-black text-slate-900">{format(returnDate, 'd')}</h3>
                          <span className="text-xl font-bold text-slate-900">{format(returnDate, "MMM''yy")}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-semibold mt-1">{format(returnDate, 'EEEE')}</p>
                      </>
                    ) : (
                      <p className="text-[10px] text-slate-500 mt-2 leading-tight font-medium">Select checkout date</p>
                    )}

                    {(activeDatePicker === 'depart' || activeDatePicker === 'return') && (
                      <div className="absolute top-[100%] left-0 sm:left-[-200px] z-[100] mt-1 shadow-2xl picker-popup" onClick={e => e.stopPropagation()}>
                        <DualMonthCalendar 
                          checkIn={departureDate} 
                          checkOut={returnDate}
                          onDateChange={(type, date) => {
                            if (type === 'checkIn') {
                              setDepartureDate(date);
                              setActiveDatePicker('return');
                            } else {
                              setReturnDate(date);
                              setActiveDatePicker(null);
                            }
                          }}
                          onClose={() => setActiveDatePicker(null)}
                          origin={searchFrom}
                          destination={searchTo}
                        />
                      </div>
                    )}
                  </div>

                  {/* Rooms & Guests */}
                  <div 
                    className="w-full md:flex-1 p-3 px-5 cursor-pointer hover:bg-gradient-to-b hover:from-blue-500/[0.06] hover:to-indigo-500/[0.03] rounded-b-2xl md:rounded-b-none md:rounded-r-2xl transition-all group"
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">Rooms & Guests</span>
                      <ChevronDown size={14} className="text-blue-600 group-hover:translate-y-0.5 transition-transform" />
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <h3 className="text-2xl font-black text-slate-900">1</h3>
                      <span className="text-lg font-bold text-slate-900">Room, </span>
                      <h3 className="text-2xl font-black text-slate-900">2</h3>
                      <span className="text-lg font-bold text-slate-900">Adults</span>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up">
                 <div className="w-24 h-24 mb-6 bg-blue-50 rounded-full flex items-center justify-center">
                    <Building2 className="text-blue-300" size={48} />
                 </div>
                 <h2 className="text-3xl font-black text-gray-900 mb-2">{activeTab} is Coming Soon!</h2>
                 <p className="text-lg text-gray-500 font-medium max-w-md mx-auto">We are currently building this module. It will be available in the next phase of TrippeChalo India.</p>
              </div>
            )}

            {/* Massive Search Button Overlapping Bottom */}
            <div className="absolute -bottom-6 sm:-bottom-7 left-1/2 -translate-x-1/2 z-10 w-[90%] sm:w-auto">
              <button 
                onClick={handleSearch} 
                className={`w-full sm:w-auto px-10 md:px-16 py-3.5 sm:py-4 rounded-full text-white font-black text-sm md:text-lg tracking-wider uppercase transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 border border-white/30 shadow-[0_12px_32px_rgba(37,99,235,0.45)] hover:shadow-[0_16px_38px_rgba(37,99,235,0.6)] ${
                  activeTab === 'Hotels' && user?.roles?.includes('B2B_AGENT')
                    ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600' 
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] hover:bg-right'
                }`}
              >
                <Search size={20} strokeWidth={2.8} className="shrink-0" />
                <span>{activeTab === 'Hotels' ? 'SEARCH HOTELS' : 'SEARCH FLIGHTS'}</span>
              </button>
            </div>
            </div>
          </div>
          
          {/* Explore More Strip */}
          <div className="text-center mt-12 mb-6">
            <button 
              onClick={() => {
                document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 mx-auto text-white/90 hover:text-white font-bold text-xs uppercase tracking-wider bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 transition-all shadow-sm cursor-pointer"
            >
              <span>Explore Destinations</span>
              <ChevronDown size={14} className="animate-bounce" />
            </button>
          </div>

          {/* Bottom Pill Banners - Frosted Glass Bar */}
          <div className="bg-white/80 backdrop-blur-2xl border border-white/80 rounded-2xl lg:rounded-full shadow-[0_12px_40px_rgba(15,23,42,0.12),0_0_0_1px_rgba(255,255,255,0.7)_inset] flex items-center justify-start lg:justify-between px-5 lg:px-8 py-3 mx-auto w-[95%] lg:max-w-[1100px] gap-6 text-sm overflow-x-auto hidden-scrollbar">
            <div className="flex items-center gap-3 border-r border-slate-200/80 pr-6 shrink-0 cursor-pointer hover:bg-white/60 p-1.5 px-3 rounded-xl transition-all group">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
                <Globe size={18} />
              </div>
              <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Where2Go</span>
            </div>

            <div className="flex items-center gap-3 border-r border-slate-200/80 pr-6 shrink-0 cursor-pointer hover:bg-white/60 p-1.5 px-3 rounded-xl transition-all group">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
                <Shield size={18} />
              </div>
              <div>
                <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Insurance</span>
                <p className="text-[10px] text-slate-500 font-medium">For International Trips</p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-r border-slate-200/80 pr-6 shrink-0 cursor-pointer hover:bg-white/60 p-1.5 px-3 rounded-xl transition-all group">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
                <Plane size={18} />
              </div>
              <div>
                <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Explore International Flights</span>
                <p className="text-[10px] text-slate-500 font-medium">Cheapest Flights to Paris, Bali, Tokyo & more</p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-r border-slate-200/80 pr-6 shrink-0 cursor-pointer hover:bg-white/60 p-1.5 px-3 rounded-xl transition-all group">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
                <Users size={18} />
              </div>
              <div>
                <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">MICE</span>
                <p className="text-[10px] text-slate-500 font-medium">Offsites, Events & Meetings</p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 cursor-pointer hover:bg-white/60 p-1.5 px-3 rounded-xl transition-all group pr-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
                <Gift size={18} />
              </div>
              <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Gift Cards</span>
            </div>
          </div>

        </div>
      </div>

      {/* Active Festive Showcase Banner */}
      {activeFestiveBanner && (
        <div className="w-full bg-white pt-6 sm:pt-8 pb-4 px-3 sm:px-6 relative z-30">
          <div className="max-w-6xl mx-auto">
            <div 
              className={`rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-9 bg-gradient-to-r ${
                FESTIVE_THEMES[activeFestiveBanner.bgTheme]?.gradient || FESTIVE_THEMES.DIWALI_GOLD.gradient
              } text-white shadow-xl relative overflow-hidden transition-all duration-300`}
            >
              {/* Background ambient lighting */}
              <div className="absolute -top-16 -right-16 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
                {/* Content side */}
                <div className="max-w-2xl space-y-2.5 sm:space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-white/20 border border-white/25 backdrop-blur-md shadow-xs">
                      <Sparkles size={12} className="text-amber-300" />
                      {activeFestiveBanner.badgeText || FESTIVE_THEMES[activeFestiveBanner.bgTheme]?.icon || 'Special Campaign'}
                    </span>
                    {activeFestiveBanner.bannerType === 'GREETING' && (
                      <span className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold bg-white/20 text-white backdrop-blur-xs">
                        Holiday Greetings
                      </span>
                    )}
                    {activeFestiveBanner.bannerType === 'PROMOTIONAL' && activeFestiveBanner.discountText && (
                      <span className="px-2.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider shadow-xs">
                        {activeFestiveBanner.discountText}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight drop-shadow-md">
                    {activeFestiveBanner.title}
                  </h2>

                  <p className="text-xs sm:text-sm md:text-base text-white/90 leading-relaxed max-w-xl font-normal">
                    {activeFestiveBanner.subtitle}
                  </p>

                  {/* Promo Code Box for Promotional Banners */}
                  {activeFestiveBanner.bannerType === 'PROMOTIONAL' && activeFestiveBanner.promoCode && (
                    <div className="pt-1 flex items-center gap-2 sm:gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5 sm:gap-2 bg-black/30 backdrop-blur-md border border-white/25 px-3 py-1.5 rounded-lg">
                        <span className="text-[11px] text-white/70 uppercase font-semibold">Promo:</span>
                        <span className="font-mono text-xs sm:text-sm font-bold text-amber-300 tracking-wider">
                          {activeFestiveBanner.promoCode}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyPromo(activeFestiveBanner.promoCode)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 border border-white/25 text-white text-xs font-semibold transition-all cursor-pointer"
                      >
                        {isPromoCopied ? (
                          <>
                            <Check size={13} className="text-emerald-300" />
                            <span className="text-emerald-200">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Action / CTA Button */}
                <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-start md:items-end justify-center gap-2 sm:gap-3 shrink-0 w-full md:w-auto mt-2 md:mt-0">
                  <Link
                    to={activeFestiveBanner.ctaLink || '/'}
                    onClick={(e) => {
                      if (!activeFestiveBanner.ctaLink || activeFestiveBanner.ctaLink === '/' || activeFestiveBanner.ctaLink === '#search') {
                        e.preventDefault();
                        window.scrollTo({ top: 120, behavior: 'smooth' });
                      }
                    }}
                    className={`w-full sm:w-auto text-center justify-center inline-flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm md:text-base shadow-lg hover:shadow-xl transition-all transform hover:scale-105 ${
                      FESTIVE_THEMES[activeFestiveBanner.bgTheme]?.buttonBg || 'bg-white text-slate-900'
                    }`}
                  >
                    <span>{activeFestiveBanner.ctaText || 'Explore Flights'}</span>
                    <ArrowRight size={16} />
                  </Link>

                  <span className="text-[11px] text-white/75 font-medium text-center sm:text-right">
                    {activeFestiveBanner.bannerType === 'GREETING' ? 'Celebrating with TrippeChalo' : 'Limited-time festive offer'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Flight Routes Section */}
      <div className="bg-white py-16 md:py-20 w-full border-t border-gray-100 overflow-hidden relative">
        {/* Subtle Map Background */}
        <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-center bg-no-repeat bg-cover opacity-[0.04] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Top Flight Routes</h2>
            <p className="text-gray-500 font-medium text-sm md:text-base">Most booked destinations across our platform</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 sm:gap-5 md:gap-6 max-w-6xl mx-auto">
            {topFlightRoutes.map((route, i) => (
              <div 
                key={i}
                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(20%-16px)] min-w-[230px] max-w-[320px] flex items-center gap-3.5 bg-white border border-gray-100 hover:border-gray-200 shadow-xs hover:shadow-md p-3.5 rounded-2xl transition-all duration-300"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden shrink-0 shadow-xs bg-slate-100 relative">
                  <img src={route.img} alt={route.to} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-gray-900 font-bold text-sm md:text-base leading-tight truncate">
                    <span>{route.from}</span>
                    <Plane size={13} className="text-blue-500 rotate-90 shrink-0" />
                    <span className="truncate">{route.to}</span>
                  </div>
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                    <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono text-[10px]">{route.codeFrom}-{route.codeTo}</span>
                    {route.landmark && (
                      <span className="text-[10px] text-gray-400 font-medium truncate" title={route.landmark}>
                        {route.landmark}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Network 3D Globe Section */}
      <div
        className="relative bg-[#0f172a] py-20 w-full border-t border-gray-800"
        style={{
          backgroundImage: `
            radial-gradient(2px 2px at 10% 15%, rgba(255,255,255,0.7) 0%, transparent 100%),
            radial-gradient(1px 1px at 25% 45%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(2px 2px at 38% 22%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 68%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 62% 12%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(2px 2px at 75% 38%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 88% 55%, rgba(255,255,255,0.7) 0%, transparent 100%),
            radial-gradient(1px 1px at 5% 75%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(2px 2px at 15% 90%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 30% 80%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 45% 95%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(2px 2px at 55% 5%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 70% 82%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 82% 70%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(2px 2px at 92% 20%, rgba(255,255,255,0.7) 0%, transparent 100%),
            radial-gradient(1px 1px at 96% 88%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 18% 35%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(2px 2px at 42% 55%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 65% 62%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 80% 10%, rgba(255,255,255,0.6) 0%, transparent 100%)
          `,
          backgroundSize: "100% 100%",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-8">
          
          <div className="w-full md:w-1/2 z-10">
            <h2 className="text-4xl font-black text-white mb-6">Seamless Travel Experience</h2>
            <p className="text-gray-400 font-medium text-lg mb-8 leading-relaxed">
              Discover a world of possibilities with TrippeChalo India. We partner with top airlines and premium hotels to bring you an extensive network of travel options. From business trips to family vacations, our intuitive platform ensures your booking is secure, fast, and reliable.
            </p>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={14} className="text-blue-400" />
                </div>
                <span className="text-gray-300">Curated premium travel inventory</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={14} className="text-blue-400" />
                </div>
                <span className="text-gray-300">Instant confirmations and secure payments</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={14} className="text-blue-400" />
                </div>
                <span className="text-gray-300">Dedicated support for B2B agents and partners</span>
              </li>
            </ul>
          </div>
          
          {/* Globe — fills available column width */}
          <div className="w-full md:w-1/2 flex justify-center items-center py-4">
            <div className="w-full" style={{ maxWidth: 480 }}>
              <InteractiveGlobe />
            </div>
          </div>

        </div>
      </div>


      {/* The TrippeChalo Advantage Section */}
      <div id="features-cards" className="relative bg-slate-50/70 py-20 w-full overflow-hidden border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200/70 px-3 py-1 rounded-full inline-block mb-3">
                Built For Modern Travellers
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">The TrippeChalo Advantage</h2>
              <p className="text-slate-500 font-medium text-sm md:text-base mt-1">Direct airline connectivity, transparent pricing, and instant automated refunds.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white border border-slate-200/80 px-4 py-2 rounded-xl shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>100% IATA & Direct Airline Fares</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Official Series & Direct Fares */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-5 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                  <Plane size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60 inline-block mb-2">
                  Direct Airline Inventory
                </span>
                <h3 className="text-lg font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">Exclusive Series Fares</h3>
                <p className="text-slate-500 text-xs leading-relaxed font-medium">Direct GDS & NDC pipeline with IndiGo, SpiceJet, and Akasa Air. Guaranteed lowest live market fares with zero middleman markups.</p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-blue-600">
                <span>Verified Direct Inventory</span>
              </div>
            </div>

            {/* Card 2: 15-Minute Instant Refunds */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-5 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                  <ArrowRightLeft size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 inline-block mb-2">
                  Automated Reversal
                </span>
                <h3 className="text-lg font-black text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">Instant Wallet Refunds</h3>
                <p className="text-slate-500 text-xs leading-relaxed font-medium">Cancellations shouldn't take weeks. Get your refund credited to your wallet in 15 minutes or tracked directly to your source bank account.</p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <span>Zero Manual Queue Delay</span>
              </div>
            </div>

            {/* Card 3: Zero Hidden Fees */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                  <Shield size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60 inline-block mb-2">
                  100% Transparent
                </span>
                <h3 className="text-lg font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">No Sneaky Surcharges</h3>
                <p className="text-slate-500 text-xs leading-relaxed font-medium">What you see on the search screen is what you pay. No forced insurance add-ons, auto-checked seat charges, or hidden convenience surprises.</p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                <span>Clear Itemized Breakdown</span>
              </div>
            </div>

            {/* Card 4: 24/7 Human Concierge */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-5 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                  <Smile size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 inline-block mb-2">
                  Dedicated Desk
                </span>
                <h3 className="text-lg font-black text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">24/7 Travel Assistance</h3>
                <p className="text-slate-500 text-xs leading-relaxed font-medium">Flight delayed or gate changed? Our real-time operations desk and priority WhatsApp helpline support your journey from booking to landing.</p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-amber-600">
                <span>Direct Operations Desk</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Search Flights, Hotels Info Section */}
      <div className="bg-white pt-12 pb-4 w-full">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-black text-gray-900 mb-6 text-center">Search Flights, Hotels, Bus and Holiday Packages</h2>
          <div className="text-gray-600 text-sm leading-relaxed space-y-4 w-full text-center md:text-left">
            <p>TrippeChalo India is a rapidly growing travel platform in India, designed to be a trusted companion for all your journeys. With our "Travel Made Easy" approach, we are building a seamless ecosystem for flight bookings, hotels, buses, and holiday packages, delivering continuous value-added services along the way.</p>
            <p>We understand that planning a trip can be overwhelming, so we have simplified the process to make it easy for you to find the perfect travel deals that suit your needs. Our intuitive website provides a wide range of options to choose from. Whether you're planning a family vacation, a solo adventure, or a business trip, we are constantly expanding to cover everything you need.</p>
            <p>We believe in transparency and honesty in all our dealings. We do not charge any hidden fees, and our prices are highly competitive. With TrippeChalo India, you can be assured of an honest booking experience. If you're looking for a hassle-free and affordable way to plan your next trip, you're at the right place.</p>
          </div>
        </div>
      </div>

      {/* Heritage Banner (Full width with top fade) */}
      <div className="relative w-full h-[400px] md:h-[550px]">
        {/* The background image */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-[center_40%]"></div>
        
        {/* Gradient fading from white at the top to transparent, then maybe dark at the bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-12">
          <div className="text-center md:text-left md:ml-auto md:mr-0 md:max-w-xl">
            <h3 className="text-4xl md:text-6xl font-black text-white mb-2 leading-tight">TrippeChalo India</h3>
            <h4 className="text-2xl md:text-3xl font-bold text-orange-200">Keeping India's Heritage Alive</h4>
          </div>
        </div>
      </div>


      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 pt-16 pb-12 text-sm relative">
        {/* Sleek Runway Strip */}
        <div id="runway-strip" className="absolute top-0 left-0 w-full h-8 bg-[#111827] border-y border-gray-800/50 flex items-center overflow-hidden">
          <div className="w-[150%] h-1 border-t-[3px] border-dashed border-gray-600/40 -ml-10"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 mt-2 relative z-10">

          <div className="order-last md:order-first mt-8 md:mt-0">
            <div className="flex items-center gap-2 mb-6">
              <Plane id="footer-plane-icon" size={24} className="text-blue-500 opacity-0" />
              <span className="text-xl font-black tracking-tight">TrippeChalo India</span>
            </div>
            <p className="mb-4 text-gray-500">The world's leading travel booking platform for users and agents.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2">
              <li><span className="text-gray-400 font-medium">TrippeChalo India Pvt Ltd</span></li>
              <li><a href="mailto:trippechaloindia@gmail.com" className="hover:text-white transition">trippechaloindia@gmail.com</a></li>
              <li><a href="tel:9555934205" className="hover:text-white transition">+91 9555934205</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition">Book Flights</button></li>
              {isAuthenticated && !user?.roles?.includes('B2B_AGENT') && (
                <>
                  <li><Link to="/dashboard/profile" className="hover:text-white transition">My Profile</Link></li>
                  <li><Link to="/dashboard/wallet" className="hover:text-white transition">My Wallet</Link></li>
                </>
              )}
              {isAuthenticated && user?.roles?.includes('B2B_AGENT') && (
                <>
                  <li><Link to="/b2b/home" className="hover:text-white transition">Agent Portal</Link></li>
                  <li><Link to="/b2b/profile" className="hover:text-white transition">Agent Profile</Link></li>
                  <li><Link to="/b2b/dashboard/wallet" className="hover:text-white transition">Agent Wallet</Link></li>
                </>
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Support</h4>
            <ul className="space-y-2">
              <li><span className="text-gray-400 leading-relaxed block mb-2">For refunds, cancellations or queries, reach out to our 24/7 support or chat with TrippeChalo India AI.</span></li>
              <li><a href="mailto:trippechaloindia@gmail.com" className="text-blue-500 hover:text-blue-400 transition">Email Support</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} TrippeChalo India Pvt Ltd. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4 md:mt-0 text-sm">
            <Link to="/page/PrivacyPolicy" className="hover:text-white transition">Privacy Policy</Link>
            <Link to="/page/TermsConditions" className="hover:text-white transition">Terms of Service</Link>
          </div>
        </div>
      </footer>

      {/* AI Chat Bot */}
      <ChatBot />
    </div>
  );
}
