import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { Loader2, Printer, ArrowLeft, Plane, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../../../components/common/Loader';
import TopNavbar from '../../../components/layout/TopNavbar';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../store/authSlice';
import Barcode from 'react-barcode';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';

export default function FlightTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [booking, setBooking] = useState<any>(null);
  const [platformInfo, setPlatformInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingAndPlatformInfo = async () => {
      if (!id) return;
      try {
        const [bookingRes, platformRes] = await Promise.all([
          api.get(`/api/bookings/${id}`),
          api.get('/api/admin/platform-info').catch(() => ({ data: null }))
        ]);
        setBooking(bookingRes.data);
        if (platformRes.data) setPlatformInfo(platformRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load ticket');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBookingAndPlatformInfo();
  }, [id]);

  if (loading) {
    return <Loader fullScreen={false} />;
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500">Booking not found.</p>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    const element = document.getElementById('ticket-content');
    if (!element) return;
    
    const toastId = toast.loading('Generating PDF...');
    
    try {
      // Temporarily hide UI controls for PDF generation
      const originalTitle = document.title;
      document.title = `Ticket_${displayPnr}`;
      
      const canvas = await htmlToImage.toCanvas(element, { pixelRatio: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Ticket_${pnr}.pdf`);
      
      document.title = originalTitle;
      toast.success('PDF downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF', { id: toastId });
    }
  };

  // Helper functions for mock/formatted data
  const passengers = booking.details?.passengers?.length > 0 
    ? booking.details.passengers 
    : [{ name: booking.user?.name || 'PASSENGER' }];
    
  const nexusData = booking.details?.nexus_response?._data;
  
  const flight = nexusData?.booking_items?.[0]?.flight;
  const leg = flight?.legs?.[0];
  
  const flightNo = leg ? `${leg.airline} ${leg.flight_number}` : `FL-${Math.floor(Math.random() * 900) + 100}`;
  const cabinClass = flight?.cabin_class?.toUpperCase() || 'ECONOMY';
  
  // Create a 3-letter code from city name (mock logic)
  const getAirportCode = (city: string) => city ? city.substring(0, 3).toUpperCase() : 'XXX';
  const originCode = booking.type === 'FLIGHT' ? (leg?.origin || getAirportCode(booking.details?.from)) : '';
  const destCode = booking.type === 'FLIGHT' ? (leg?.destination || getAirportCode(booking.details?.to)) : '';
  const dateStr = new Date(booking.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  
  // For Series Fare: use booking.date (which is the actual flight departure time/date)
  // For Nexus: use nexusData.travel_date
  const travelDateRaw = nexusData?.travel_date 
    ? nexusData.travel_date 
    : (booking.date || null);

  const travelDateStr = travelDateRaw 
    ? new Date(travelDateRaw).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) 
    : dateStr;
  
  const depTime = leg?.departure_time 
    ? new Date(leg.departure_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) 
    : (travelDateRaw 
        ? new Date(travelDateRaw).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) 
        : '19:30');
  const arrTime = leg?.arrival_time 
    ? new Date(leg.arrival_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) 
    : depTime;
  
  const handBaggage = flight?.cabin_baggage || '7kg (1 piece)';
  const checkinBaggage = flight?.checkin_baggage || '15kg (1 piece)';
  
  const pnr = nexusData?.booking_reference || booking.details?.pnr || booking.bookingId;
  const displayPnr = pnr ? pnr.toUpperCase() : 'N/A';
  const agentRef = nexusData?.agent_reference || booking.bookingId;

  const handleWebCheckIn = () => {
    toast.success('Redirecting to Airline Web Check-in portal...');
    setTimeout(() => {
      window.open('https://www.google.com/search?q=web+check+in+' + booking.details?.airline, '_blank');
    }, 1500);
  };

  return (
    <>
      <div className="min-h-[calc(100vh-80px)] bg-transparent pb-8 font-sans print:bg-white print:py-0 print:px-0 flex flex-col items-center justify-start">
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      
      {/* Controls */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-8 mt-2 print:hidden">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200"
        >
          <ArrowLeft size={18} />
          Back to Bookings
        </button>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleDownloadPDF}
            className={`flex items-center gap-2 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-colors ${booking.type === 'HOTEL' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-900'}`}
          >
            <Download size={18} />
            Download PDF
          </button>
          
          {booking.type === 'FLIGHT' && booking.status === 'CONFIRMED' && (
            <button 
              onClick={handleWebCheckIn}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-colors"
            >
              <Plane size={18} />
              Web Check-in
            </button>
          )}
        </div>
      </div>

      {booking.type === 'HOTEL' ? (
        <div id="ticket-content" className="w-full max-w-4xl bg-white p-6 md:p-10 shadow-lg border border-gray-200 print:shadow-none print:border-none print:p-0 rounded-2xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 border-b-2 border-blue-500 pb-4 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-600 mb-4">Hotel Booking Voucher</h1>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Booking Ref: <span className="font-bold text-gray-900">{booking.bookingId}</span></p>
                <p>Booking Date: {new Date(booking.createdAt).toLocaleDateString()}</p>
                <p>Status: <span className="font-bold text-green-600">{booking.status}</span></p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter flex items-center justify-end gap-1">
                Trippe<span className="text-blue-500">Chalo</span>
              </h2>
            </div>
          </div>

          <div className="mb-6 border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">{booking.details?.hotelName || 'Hotel Name'}</h3>
              <p className="text-sm text-gray-500 mt-1">{booking.details?.address || 'Hotel Address'}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200 text-sm">
              <div className="p-4 border-r md:border-r-0 border-gray-200">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Check In</p>
                <p className="font-bold text-gray-800">{booking.details?.checkIn || 'N/A'}</p>
              </div>
              <div className="p-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Check Out</p>
                <p className="font-bold text-gray-800">{booking.details?.checkOut || 'N/A'}</p>
              </div>
              <div className="p-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Guests</p>
                <p className="font-bold text-gray-800">{booking.details?.guests || 1} Guests</p>
              </div>
              <div className="p-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Room Type</p>
                <p className="font-bold text-gray-800">{booking.details?.roomType || 'Standard Room'}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold text-blue-600 mb-2">Primary Guest</h3>
            <div className="border border-gray-200 p-4 rounded-xl text-sm">
              <p className="font-bold text-gray-800 uppercase">{booking.user?.name}</p>
              <p className="text-gray-500">{booking.user?.email}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold text-blue-600 mb-2">Payment Details</h3>
            <div className="border border-gray-200 rounded-xl p-4 flex justify-between items-center bg-gray-50">
              <span className="font-bold text-gray-800">Total Amount Paid</span>
              <span className="text-xl font-black text-gray-900">₹ {booking.totalAmount.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="text-[10px] text-gray-500 mt-8 pt-4 border-t border-gray-200 text-center">
            <p>Please present this voucher along with a valid photo ID at the time of check-in.</p>
          </div>
        </div>
      ) : (
        <div id="ticket-content" className="w-full max-w-5xl bg-white p-6 md:p-8 shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0 rounded-sm text-black box-border mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-gray-300 pb-4 mb-6 gap-4">
            <div>
              <h2 className="text-3xl font-black text-[#0b1031] tracking-tight flex items-center gap-2 mb-1">
                <Plane size={28} className="text-blue-600" />
                <span>{platformInfo?.companyName?.split(' ')[0] || 'Trippe'}<span className="text-blue-600">{platformInfo?.companyName?.split(' ').slice(1).join(' ') || 'Chalo'}</span></span>
              </h2>
              <p className="text-[11px] text-gray-500 font-medium tracking-widest uppercase">E-Ticket / Reservation Voucher</p>
            </div>
            <div className="text-left md:text-right text-[11px] text-gray-700">
              <p className="font-bold text-gray-900 mb-1 uppercase">{platformInfo?.companyName || 'TRIPPECHALO INDIA PRIVATE LIMITED'}</p>
              <p>{platformInfo?.officeAddress || 'First Floor, D 42, Greater Noida Expressway, Sector 108, Noida, Uttar Pradesh - 201304'}</p>
              <p className="font-bold mt-1">GSTIN: {platformInfo?.gstn || '09AAMCT8505A1ZB'}</p>
              <p>Phone: +91 {platformInfo?.officePhone || '95559 34205'}</p>
            </div>
          </div>

          {/* Booking Info */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-6 text-[12px] gap-2">
            <div>
              <p>Agency Booking ID: <span className="font-bold">{agentRef}</span></p>
              <p>Booking Reference: <span className="font-bold">{displayPnr}</span></p>
              <p>Issued On: <span className="font-bold">{dateStr}</span></p>
            </div>
          </div>

          {/* Content Box */}
          <div className="border-2 border-gray-300 rounded-sm overflow-hidden mb-8">
            {/* Flight Details */}
            <div>
              <div className="bg-gray-200 px-3 py-1.5 flex flex-wrap justify-between items-center text-[10px] font-bold gap-2">
                <span className="uppercase">Flight Details</span>
                <span className="uppercase tracking-wider text-[9px]">ALL TIMINGS MENTIONED ARE IN 24HRS FORMAT AND LOCAL AIRPORT TIMINGS AT THE DEPARTURE/ARRIVAL AIRPORT.</span>
              </div>
              <div className="w-full">
                <table className="w-full text-left text-[9px] md:text-[11px] border-b border-gray-200">
                  <thead className="border-b border-gray-200 bg-white text-[8px] md:text-[11px]">
                    <tr>
                      <th className="p-1 md:p-3 font-normal text-gray-500 w-[20%]">Flight</th>
                      <th className="p-1 md:p-3 font-normal text-gray-500 w-[25%]">Depart</th>
                      <th className="p-1 md:p-3 font-normal text-gray-500 w-[25%]">Arrive</th>
                      <th className="p-1 md:p-3 font-normal text-gray-500 border-l border-gray-200 w-[15%]">Duration/Stops</th>
                      <th className="p-1 md:p-3 font-normal text-gray-500 border-l border-gray-200 w-[15%] text-center">Status</th>
                    </tr>
                  </thead>
                <tbody>
                  <tr>
                    <td className="p-1 md:p-3 align-top">
                      <div className="flex gap-1 md:gap-2 items-start">
                        <div className="text-blue-500 font-bold text-lg md:text-xl leading-none"><Plane size={16} className="md:w-[18px] md:h-[18px]" /></div>
                        <div>
                          <p className="font-bold whitespace-nowrap">{flightNo}</p>
                          <p className="font-bold text-[8px] md:text-[11px]">{cabinClass}</p>
                          <p className="text-gray-600 text-[8px] md:text-[11px] hidden md:block">Aircraft Type-32Y</p>
                          <p className="text-gray-600 text-[8px] md:text-[11px]">Refundable</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-1 md:p-3 align-top">
                      <p className="font-bold uppercase text-[9px] md:text-[12px] whitespace-nowrap">{booking.details?.from} <span className="font-normal text-gray-500 hidden md:inline">({originCode})</span></p>
                      <p className="font-bold whitespace-nowrap">{depTime}</p>
                      <p className="font-normal text-gray-600 whitespace-nowrap text-[8px] md:text-[11px]">{travelDateStr}</p>
                      <p className="text-gray-600 text-[8px] md:text-[11px] whitespace-nowrap">Terminal 1</p>
                    </td>
                    <td className="p-1 md:p-3 align-top">
                      <p className="font-bold uppercase text-[9px] md:text-[12px] whitespace-nowrap">{booking.details?.to} <span className="font-normal text-gray-500 hidden md:inline">({destCode})</span></p>
                      <p className="font-bold whitespace-nowrap">{arrTime}</p>
                      <p className="font-normal text-gray-600 whitespace-nowrap text-[8px] md:text-[11px]">{travelDateStr}</p>
                    </td>
                    <td className="p-1 md:p-3 align-top border-l border-gray-200 text-blue-600 font-medium">
                      <p className="whitespace-nowrap">{flight?.duration ? `${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m` : '02:00'}</p>
                      <p className="text-gray-500 text-[8px] md:text-[11px] whitespace-nowrap">{leg ? 'Non-Stop' : 'Non-Stop'}</p>
                    </td>
                    <td className="p-1 md:p-3 align-top border-l border-gray-200 font-medium text-center">
                      <span className="bg-green-100 text-green-700 px-1 py-0.5 md:px-2 md:py-1 rounded text-[8px] md:text-[11px] whitespace-nowrap capitalize">{booking.status.toLowerCase()}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              </div>
            </div>

            {/* Passenger Details */}
            <div className="border-t-2 border-gray-300">
              <div className="bg-gray-200 px-3 py-1.5 flex flex-wrap justify-between items-center text-[10px] font-bold gap-2">
                <span className="uppercase">Passenger Details</span>
                <span className="text-[9px] text-gray-700 font-semibold">( Phone: 9555934205 | Email: trippechaloindia@gmail.com )</span>
              </div>
              <div className="w-full mt-1">
                <table className="w-full text-left text-[9px] md:text-[11px]">
                  <thead className="border-b border-gray-200 bg-white text-[8px] md:text-[11px]">
                  <tr>
                    <th className="py-1 px-1 md:py-2 md:px-3 font-normal text-gray-500 w-[20%] border-r border-gray-200">PNR</th>
                    <th className="py-1 px-1 md:py-2 md:px-3 font-normal text-gray-500 w-[50%] border-r border-gray-200">Passenger / Baggage Details</th>
                    <th className="py-1 px-1 md:py-2 md:px-3 font-normal text-gray-500 w-[15%] border-r border-gray-200 text-center">Seat</th>
                    <th className="py-1 px-1 md:py-2 md:px-3 font-normal text-gray-500 w-[15%] text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {passengers.map((pax: any, i: number) => {
                    const paxConfirmation = nexusData?.booking_items?.[0]?.confirmations?.find((c: any) => c.pax_id === pax.id || c.pax_id === i);
                    const tktNo = paxConfirmation?.pnr || `${displayPnr}${i}`;
                    const seatNo = booking.details?.seats?.[i] || pax.seat || 'Unassigned';
                    const paxType = pax.type || pax.passengerType || (pax.name?.toLowerCase().includes('child') ? 'Child' : pax.name?.toLowerCase().includes('infant') ? 'Infant' : 'Adult');
                    return (
                      <tr key={i}>
                        <td className="py-1 px-1 md:py-3 md:px-3 align-top border-r border-gray-200 overflow-hidden">
                          <p className="mb-1 font-bold whitespace-nowrap">{tktNo}</p>
                        </td>
                        <td className="py-1 px-1 md:py-3 md:px-3 align-top border-r border-gray-200">
                          <p className="font-bold text-[9px] md:text-[12px] uppercase">
                            {(pax.gender === 'Male' ? 'Mr ' : pax.gender === 'Female' ? 'Mrs ' : '')}
                            {pax.name || pax.first_name + ' ' + pax.last_name} 
                            <span className="text-[8px] md:text-[10px] font-normal lowercase ml-1 hidden md:inline"> {paxType}</span>
                          </p>
                          <div className="mt-1 md:mt-1.5 space-y-0.5 text-[8px] md:text-[10px]">
                            <p className="text-gray-700 whitespace-nowrap"><span className="hidden md:inline">Hand Baggage </span><span className="font-bold">Onward:</span> {handBaggage}</p>
                            <p className="text-gray-700 whitespace-nowrap"><span className="hidden md:inline">CheckIn Baggage </span><span className="font-bold">Onward:</span> {checkinBaggage}</p>
                          </div>
                        </td>
                        <td className="py-1 px-1 md:py-3 md:px-3 align-top border-r border-gray-200 font-bold text-gray-800 text-center">
                          {seatNo}
                        </td>
                        <td className="py-1 px-1 md:py-3 md:px-3 align-top font-medium text-center">
                          <span className="bg-green-100 text-green-700 px-1 py-0.5 md:px-2 md:py-1 rounded text-[8px] md:text-[11px] whitespace-nowrap">{booking.status === 'CONFIRMED' ? 'Confirmed' : booking.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

            {/* Payment Details */}
            <div>
              <div className="bg-gray-200 px-3 py-1.5 text-[10px] font-bold uppercase">
                Payment Details
              </div>
              <table className="w-full text-[11px] text-gray-700 bg-white">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-1.5 px-2">Base Fare</td>
                    <td className="py-1.5 px-2 text-right">₹ {(booking.totalAmount * 0.6).toFixed(2)}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-1.5 px-2">Taxes and Fees</td>
                    <td className="py-1.5 px-2 text-right">₹ {(booking.totalAmount * 0.4).toFixed(2)}</td>
                  </tr>
                  <tr className="bg-gray-50 font-bold text-gray-900 border-t-2 border-gray-200">
                    <td className="py-1.5 px-2">Gross Fare</td>
                    <td className="py-1.5 px-2 text-right">₹ {booking.totalAmount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
          {/* End of Content Box */}
          </div>

          <div className="text-[10px] text-gray-500 mt-4 text-center">
            <p className="font-bold mb-1">IMPORTANT INFORMATION</p>
            <p>1. This is an E-Ticket. A boarding pass will be issued after Web Check-in on the airline's website.</p>
            <p>2. Passengers must carry a valid photo ID and this E-Ticket to enter the airport.</p>
            <p>3. Web Check-in usually opens 48 hours prior to the scheduled departure time.</p>
          </div>
          
        </div>
      )}
    </div>
    </>
  );
}
