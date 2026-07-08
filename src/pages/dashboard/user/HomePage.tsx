import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Building2, Map, Bus, Car, Navigation, ChevronDown, CheckCircle, Ticket, Globe, CreditCard, Shield, Users } from 'lucide-react';
import api from '../../../services/api';
import TopNavbar from '../../../components/layout/TopNavbar';

import CustomCalendar from '../../../components/common/CustomCalendar';
import TravellerPicker from '../../../components/common/TravellerPicker';
import CabinClassPicker from '../../../components/common/CabinClassPicker';
import { format } from 'date-fns';

interface Destination {
  name: string;
  price: number;
  imgUrl: string;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Flights');
  const [tripType, setTripType] = useState('One Way');
  const [destinations, setDestinations] = useState<Destination[]>([]);

  useEffect(() => {
    api.get('/api/cms/destinations')
      .then((res) => setDestinations(res.data))
      .catch((err) => console.error("Error fetching destinations:", err));
  }, []);

  const [searchFrom, setSearchFrom] = useState('New Delhi');
  const [searchTo, setSearchTo] = useState('Mumbai');
  const [departureDate, setDepartureDate] = useState<Date | null>(new Date());
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabinClass, setCabinClass] = useState('Economy/ Premium Economy');
  const [isTravellerPickerOpen, setIsTravellerPickerOpen] = useState(false);
  const [isCabinPickerOpen, setIsCabinPickerOpen] = useState(false);

  // Handle Search Execution
  const handleSearch = () => {
    const fromCode = searchFrom.toLowerCase().includes('del') ? 'DEL' : searchFrom.substring(0,3).toUpperCase();
    const toCode = searchTo.toLowerCase().includes('mum') || searchTo.toLowerCase().includes('bom') ? 'BOM' : searchTo.substring(0,3).toUpperCase();
    
    const query = new URLSearchParams({
      tab: activeTab,
      from: fromCode,
      to: toCode,
      date: departureDate ? departureDate.toISOString() : '',
      returnDate: returnDate ? returnDate.toISOString() : '',
      tripType: tripType
    }).toString();

    navigate(`/flights/search?${query}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20 relative">
      <TopNavbar forceWhite={false} />

      {/* Massive Hero Section */}
      <div className="relative min-h-[650px] w-full flex flex-col items-center pt-24 pb-16">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542224566-6e85f2e6772f?q=80&w=2000&auto=format&fit=crop" 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent"></div>
        </div>

        {/* Floating Top Tabs Pill */}
        <div className="relative z-20 bg-white rounded-[40px] shadow-lg flex items-center justify-between px-6 py-2 mx-auto max-w-[1100px] w-[95%] mb-[-24px]">
          {[
            { name: 'Flights', icon: Plane },
            { name: 'Hotels', icon: Building2 },
            { name: 'Villas & Homestays', icon: Building2 },
            { name: 'Holiday Packages', icon: Map },
            { name: 'Trains', icon: Navigation },
            { name: 'Buses', icon: Bus },
            { name: 'Cabs', icon: Car },
            { name: 'Forex Card', icon: CreditCard },
            { name: 'Travel Insurance', icon: Shield },
          ].map((cat) => (
            <button 
              key={cat.name}
              onClick={() => setActiveTab(cat.name)}
              className={`flex flex-col items-center gap-1 px-2 group relative`}
            >
              <div className={`p-1.5 transition-colors ${activeTab === cat.name ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'}`}>
                <cat.icon size={22} className={activeTab === cat.name ? 'fill-blue-600 text-blue-600' : ''} />
              </div>
              <span className={`text-[12px] font-bold text-center leading-tight transition-colors ${activeTab === cat.name ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-600'}`}>
                {cat.name.split(' ').map((word, i) => <React.Fragment key={i}>{word}<br/></React.Fragment>)}
              </span>
              {activeTab === cat.name && (
                <div className="absolute -bottom-3 left-1 right-1 h-[3px] bg-blue-600 rounded-t-full shadow-[0_-2px_10px_rgba(37,99,235,0.5)]"></div>
              )}
            </button>
          ))}
        </div>

        {/* Search Widget Container */}
        <div className="relative z-10 w-full max-w-[1200px] px-6">
          <div className="bg-white rounded-xl shadow-2xl relative pt-12">
            
            {/* Form Area */}
            <div className="p-8 pb-16">
              
              {/* Trip Type Radio */}
              <div className="flex items-center gap-6 mb-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="tripType" checked={tripType === 'One Way'} onChange={() => setTripType('One Way')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                  <span className={`text-sm font-bold transition-colors ${tripType === 'One Way' ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>One Way</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="tripType" checked={tripType === 'Round Trip'} onChange={() => setTripType('Round Trip')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                  <span className={`text-sm font-bold transition-colors ${tripType === 'Round Trip' ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>Round Trip</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="tripType" checked={tripType === 'Multi City'} onChange={() => setTripType('Multi City')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                  <span className={`text-sm font-bold transition-colors ${tripType === 'Multi City' ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>Multi City</span>
                </label>
                
                <div className="ml-auto text-[13px] font-bold text-gray-600">
                  Book International and Domestic Flights
                </div>
              </div>

              {/* Main Inputs Box */}
              <div className="flex border border-gray-300 rounded-lg overflow-visible h-[120px] relative hover:border-gray-400 transition-colors">
                
                <div className="flex-1 p-4 border-r border-gray-200 hover:bg-blue-50/30 transition-colors group relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">From</span>
                  </div>
                  <input 
                    type="text"
                    value={searchFrom}
                    onChange={(e) => setSearchFrom(e.target.value)}
                    className="w-full text-3xl font-black text-gray-900 truncate bg-transparent focus:outline-none"
                  />
                  
                  {/* Swap Button */}
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center cursor-pointer hover:shadow-md transition">
                    <Navigation size={14} className="text-blue-600 transform rotate-90" />
                  </div>
                </div>

                <div className="flex-1 p-4 border-r border-gray-200 hover:bg-blue-50/30 transition-colors group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">To</span>
                  </div>
                  <input 
                    type="text"
                    value={searchTo}
                    onChange={(e) => setSearchTo(e.target.value)}
                    className="w-full text-3xl font-black text-gray-900 truncate bg-transparent focus:outline-none"
                  />
                </div>

                <div className="relative flex">
                  <div 
                    className="w-[180px] p-4 border-r border-gray-200 cursor-pointer hover:bg-blue-50/30 transition-colors group"
                    onClick={() => { setIsDatePickerOpen(true); setIsTravellerPickerOpen(false); setIsCabinPickerOpen(false); }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">Departure</span>
                      <ChevronDown size={16} className="text-blue-600" />
                    </div>
                    {departureDate ? (
                      <>
                        <div className="flex items-baseline gap-1">
                          <h3 className="text-3xl font-black text-gray-900">{format(departureDate, 'd')}</h3>
                          <span className="text-xl font-bold text-gray-900">{format(departureDate, "MMM''yy")}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mt-1">{format(departureDate, 'EEEE')}</p>
                      </>
                    ) : (
                      <p className="text-sm font-bold text-gray-400 mt-3">Select Date</p>
                    )}
                  </div>

                  <div 
                    className="w-[180px] p-4 border-r border-gray-200 cursor-pointer hover:bg-blue-50/30 transition-colors group"
                    onClick={() => { setIsDatePickerOpen(true); setIsTravellerPickerOpen(false); setIsCabinPickerOpen(false); }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">Return</span>
                      <ChevronDown size={16} className="text-blue-600" />
                    </div>
                    {returnDate ? (
                      <>
                        <div className="flex items-baseline gap-1">
                          <h3 className="text-3xl font-black text-gray-900">{format(returnDate, 'd')}</h3>
                          <span className="text-xl font-bold text-gray-900">{format(returnDate, "MMM''yy")}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mt-1">{format(returnDate, 'EEEE')}</p>
                      </>
                    ) : (
                      <p className="text-[11px] text-gray-500 mt-2 leading-tight font-medium">Tap to add a return date for bigger discounts</p>
                    )}
                  </div>

                  {isDatePickerOpen && (
                    <div className="absolute top-[100%] left-[-100px] z-50">
                      <CustomCalendar 
                        startDate={departureDate} 
                        endDate={returnDate}
                        onChange={(start, end) => { setDepartureDate(start); setReturnDate(end); }}
                        onClose={() => setIsDatePickerOpen(false)}
                      />
                    </div>
                  )}
                </div>

                <div className="relative flex">
                  <div 
                    className="w-[120px] p-4 border-r border-gray-200 cursor-pointer hover:bg-blue-50/30 transition-colors group"
                    onClick={() => { setIsTravellerPickerOpen(true); setIsDatePickerOpen(false); setIsCabinPickerOpen(false); }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">Travellers</span>
                      <ChevronDown size={16} className="text-blue-600" />
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <h3 className="text-3xl font-black text-gray-900">{adults + children + infants}</h3>
                      <span className="text-xl font-bold text-gray-900 truncate">Traveller</span>
                    </div>
                  </div>

                  {isTravellerPickerOpen && (
                    <div className="absolute top-[100%] right-[-100px] z-50">
                      <TravellerPicker 
                        adults={adults}
                        children={children}
                        infants={infants}
                        cabinClass={cabinClass}
                        onChange={(a, c, i, cls) => {
                          setAdults(a); setChildren(c); setInfants(i); setCabinClass(cls);
                        }}
                        onClose={() => setIsTravellerPickerOpen(false)}
                      />
                    </div>
                  )}
                </div>

                <div className="relative flex">
                  <div 
                    className="w-[160px] p-4 cursor-pointer hover:bg-blue-50/30 transition-colors group"
                    onClick={() => { setIsCabinPickerOpen(true); setIsDatePickerOpen(false); setIsTravellerPickerOpen(false); }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">Cabin Class</span>
                      <ChevronDown size={16} className="text-blue-600" />
                    </div>
                    <h3 className="text-[14px] font-black text-gray-900 mt-2 truncate leading-tight">{cabinClass}</h3>
                  </div>

                  {isCabinPickerOpen && (
                    <div className="absolute top-[100%] right-0 z-50">
                      <CabinClassPicker 
                        cabinClass={cabinClass}
                        onChange={(cls) => {
                          setCabinClass(cls);
                          setIsCabinPickerOpen(false);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Special Fares */}
              <div className="mt-6 flex items-center gap-4">
                <span className="text-xs font-black text-gray-900 uppercase">Special<br/>Fares</span>
                <div className="flex gap-2">
                  <button className="flex flex-col items-center justify-center border border-blue-600 bg-blue-50 text-blue-600 rounded-lg px-3 py-1 min-w-[90px]">
                    <span className="text-[13px] font-bold">Regular</span>
                    <span className="text-[10px] opacity-80">Regular fares</span>
                  </button>
                  <button className="flex flex-col items-center justify-center border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg px-3 py-1 min-w-[90px]">
                    <span className="text-[13px] font-bold">Student</span>
                    <span className="text-[10px] text-gray-500">Extra discounts</span>
                  </button>
                  <button className="flex flex-col items-center justify-center border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg px-3 py-1 min-w-[90px]">
                    <span className="text-[13px] font-bold">Armed Forces</span>
                    <span className="text-[10px] text-gray-500">Up to ₹600 off</span>
                  </button>
                  <button className="flex flex-col items-center justify-center border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg px-3 py-1 min-w-[100px]">
                    <div className="flex items-center gap-1">
                      <span className="text-[13px] font-bold">Have a GST number?</span>
                      <span className="text-[9px] font-black bg-pink-600 text-white px-1 rounded uppercase">New</span>
                    </div>
                    <span className="text-[10px] text-gray-500">Upto 10% Extra Savings!</span>
                  </button>
                  <button className="flex flex-col items-center justify-center border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg px-3 py-1 min-w-[90px]">
                    <span className="text-[13px] font-bold">Senior Citizen</span>
                    <span className="text-[10px] text-gray-500">Up to ₹600 off</span>
                  </button>
                </div>
              </div>

              {/* Price Drop Protection Banner */}
              <div className="mt-6 flex items-center justify-between bg-blue-50/50 border border-blue-100 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">Add Price Drop Protection</span>
                    <span className="text-sm text-gray-600">If the price drops, we'll refund the difference.</span>
                    <button className="text-sm font-bold text-blue-600">View Details</button>
                  </div>
                </div>
              </div>

            </div>

            {/* Massive Search Button Overlapping Bottom */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
              <button 
                onClick={handleSearch}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-black text-2xl px-20 py-3 rounded-full shadow-[0_4px_15px_rgba(37,99,235,0.4)] transition-all active:scale-95"
              >
                SEARCH
              </button>
            </div>
          </div>
          
          {/* Explore More Strip */}
          <div className="text-center mt-12 mb-6">
            <button className="flex items-center gap-1 mx-auto text-white font-bold hover:text-blue-200 transition">
              <ChevronDown size={16} /> Explore More <ChevronDown size={16} />
            </button>
          </div>

          {/* Bottom Pill Banners */}
          <div className="bg-white rounded-full shadow-lg flex items-center justify-between px-8 py-3 mx-auto max-w-[900px] gap-6 text-sm">
            <div className="flex items-center gap-2 border-r border-gray-200 pr-6">
              <Globe size={20} className="text-blue-600" />
              <span className="font-bold text-gray-700">Where2Go</span>
            </div>
            <div className="flex items-center gap-2 border-r border-gray-200 pr-6">
              <Map size={20} className="text-blue-600" />
              <div>
                <span className="font-bold text-gray-700">How2Go <span className="text-[10px] bg-pink-600 text-white px-1 rounded uppercase">New</span></span>
                <p className="text-[10px] text-gray-500">Find routes to anywhere</p>
              </div>
            </div>
            <div className="flex items-center gap-2 border-r border-gray-200 pr-6">
              <CreditCard size={20} className="text-blue-600" />
              <div>
                <span className="font-bold text-gray-700">MakeMyTrip ICICI Credit Card</span>
                <p className="text-[10px] text-gray-500">Never expiring rewards & big benefits</p>
              </div>
            </div>
            <div className="flex items-center gap-2 border-r border-gray-200 pr-6">
              <Users size={20} className="text-blue-600" />
              <div>
                <span className="font-bold text-gray-700">MICE</span>
                <p className="text-[10px] text-gray-500">Offsites, Events & Meetings</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Ticket size={20} className="text-blue-600" />
              <span className="font-bold text-gray-700">Gift Cards</span>
            </div>
          </div>

        </div>
      </div>

      {/* Popular Destinations Section */}
      <div id="destinations" className="max-w-7xl mx-auto px-6 py-20 w-full mt-10">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Popular Destinations</h2>
            <p className="text-gray-500 font-medium">Explore our highly rated tour packages and places.</p>
          </div>
          <button onClick={() => navigate('/dashboard/search?tab=Packages')} className="hidden md:flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800 transition">
            See all
          </button>
        </div>

        {destinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((dest) => (
              <div 
                key={dest.name} 
                onClick={() => navigate(`/dashboard/search?tab=Packages&dest=${dest.name}`)}
                className="group cursor-pointer rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 bg-white flex flex-col"
              >
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={dest.imgUrl} 
                    alt={dest.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                  <h3 className="absolute bottom-4 left-4 text-white text-xl font-bold">{dest.name}</h3>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <p className="text-gray-500 text-sm font-medium">Starting from</p>
                  <p className="text-lg font-bold text-blue-600">₹{dest.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-6 overflow-hidden opacity-50">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-64 w-full bg-gray-200 animate-pulse rounded-2xl"></div>)}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white py-20 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Why Book With TravelGo?</h2>
            <p className="text-gray-500">We provide the best booking experience for travelers and agents globally.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Globe size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Global Coverage</h3>
              <p className="text-gray-500 leading-relaxed">Access to millions of flights and hotels worldwide at your fingertips.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <CreditCard size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Best Price Guarantee</h3>
              <p className="text-gray-500 leading-relaxed">We match prices. Find a lower price online and we will refund the difference.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Booking</h3>
              <p className="text-gray-500 leading-relaxed">Your data and payments are protected with enterprise-grade security.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 text-sm mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4 text-white">
              <Plane size={24} className="text-blue-500" />
              <span className="text-xl font-black tracking-tight">TravelGo</span>
            </div>
            <p className="mb-4 text-gray-500">The world's leading travel booking platform for users and agents.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2">
              <li><button className="hover:text-white transition">About Us</button></li>
              <li><button className="hover:text-white transition">Careers</button></li>
              <li><button className="hover:text-white transition">Blog</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Support</h4>
            <ul className="space-y-2">
              <li><button className="hover:text-white transition">Help Center</button></li>
              <li><button className="hover:text-white transition">Cancellation Policy</button></li>
              <li><button className="hover:text-white transition">Contact Us</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Partner With Us</h4>
            <ul className="space-y-2">
              <li><button className="hover:text-white transition text-blue-400 font-semibold">Join as Travel Agent</button></li>
              <li><button className="hover:text-white transition">List your Hotel</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} TravelGo Inc. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <button className="hover:text-white transition">Privacy Policy</button>
            <button className="hover:text-white transition">Terms of Service</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
