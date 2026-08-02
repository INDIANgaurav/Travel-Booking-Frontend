import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Plane } from 'lucide-react';
import Barcode from 'react-barcode';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

interface ETicketModalProps {
  booking: any;
  onClose: () => void;
  autoDownload?: 'ticket' | 'invoice' | 'both' | null;
  onAutoDownloadComplete?: () => void;
}

export default function ETicketModal({ booking, onClose, autoDownload, onAutoDownloadComplete }: ETicketModalProps) {
  const componentRef = useRef<HTMLDivElement>(null);
  const [viewType, setViewType] = useState<'ticket' | 'invoice'>('ticket');
  
  const handleDownloadPDF = async (type: 'ticket' | 'invoice' = viewType) => {
    const element = componentRef.current;
    if (!element) return;
    
    const toastId = toast.loading(`Generating ${type === 'ticket' ? 'Ticket' : 'Invoice'} PDF...`);
    
    try {
      const canvas = await htmlToImage.toCanvas(element, { pixelRatio: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${type === 'ticket' ? 'Ticket' : 'Invoice'}_${booking?.bookingId}.pdf`);
      
      toast.success(`${type === 'ticket' ? 'Ticket' : 'Invoice'} PDF downloaded successfully!`, { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF', { id: toastId });
    }
  };

  const hasAutoDownloaded = useRef(false);
  
  useEffect(() => {
    if (!autoDownload || hasAutoDownloaded.current) return;
    
    const runAutoDownload = async () => {
      hasAutoDownloaded.current = true;
      if (autoDownload === 'ticket' || autoDownload === 'both') {
        setViewType('ticket');
        await new Promise(res => setTimeout(res, 500)); // wait for render
        await handleDownloadPDF('ticket');
      }
      
      if (autoDownload === 'invoice' || autoDownload === 'both') {
        setViewType('invoice');
        await new Promise(res => setTimeout(res, 500)); // wait for render
        await handleDownloadPDF('invoice');
      }
      
      if (onAutoDownloadComplete) {
        onAutoDownloadComplete();
      }
    };
    
    runAutoDownload();
  }, [autoDownload, booking, onAutoDownloadComplete]);

  if (!booking) return null;

  const passengers = booking.details?.passengers?.length > 0 
    ? booking.details.passengers 
    : [{ name: booking.user?.name || 'PASSENGER', type: 'Adult' }];
    
  const nexusData = booking.nexusData || booking.details?.nexus_response?._data;
  
  const flight = nexusData?.booking_items?.[0]?.flight;
  const leg = flight?.legs?.[0];
  
  const flightNo = leg ? `${leg.airline} ${leg.flight_number}` : booking.details?.flightNo || `IX-1617`;
  const airline = leg?.airline_name || booking.details?.airline || 'Air India Express';
  const cabinClass = flight?.cabin_class?.toUpperCase() || 'ECONOMY';

  const pnr = nexusData?.booking_reference || booking.details?.pnr || booking.bookingId;
  const displayPnr = pnr ? pnr.toUpperCase() : 'N/A';
  const agentRef = nexusData?.agent_reference || booking.bookingId || 'N/A';
  
  const getAirportCode = (city: string) => city ? city.substring(0, 3).toUpperCase() : 'XXX';
  const originCode = leg?.origin || getAirportCode(booking.details?.from);
  const destCode = leg?.destination || getAirportCode(booking.details?.to);
  const travelDate = nexusData?.travel_date ? new Date(nexusData.travel_date) : (booking.details?.date ? new Date(booking.details.date) : new Date(booking.createdAt));
  const dateStr = travelDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  
  const depTime = leg?.departure_time ? new Date(leg.departure_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : (booking.details?.date ? new Date(booking.details.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '13:50');
  const arrTime = leg?.arrival_time ? new Date(leg.arrival_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : (booking.details?.arrivalTime ? new Date(booking.details.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '15:50');
  
  const handBaggage = flight?.cabin_baggage || '7kg (1 piece)';
  const checkinBaggage = flight?.checkin_baggage || '15kg (1 piece)';
  
  const issueDate = new Date(booking.createdAt);

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center py-6 px-4 z-50 overflow-hidden">
      <div className="bg-white rounded-lg w-full max-w-[900px] flex flex-col max-h-[92vh] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#0b1031] text-white flex justify-between items-center px-6 py-4 rounded-t-lg shrink-0">
          <h2 className="text-lg font-bold">Print Ticket</h2>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100 flex justify-center w-full">
          
          {/* Printable Area */}
          <div ref={componentRef} className="bg-white w-full max-w-[820px] shadow-sm border border-gray-300 p-6 md:p-8 text-black font-sans box-border my-auto">
            
            {/* Ticket/Invoice Header */}
            <div className="text-center mb-6">
              <h1 className="text-lg font-bold tracking-widest uppercase">
                {viewType === 'ticket' ? 'E-Ticket / Reservation Voucher' : 'TAX INVOICE'}
              </h1>
              <div className="border-b border-gray-300 w-full mt-2"></div>
            </div>

            {viewType === 'invoice' ? (
              <div className="w-full text-black">
                <div className="flex justify-between items-start mb-4 text-[13px]">
                  <div className="w-1/2">
                    <p className="font-bold text-xl mb-6 tracking-widest uppercase text-blue-900">{airline}</p>
                    
                    <div className="flex flex-col space-y-4">
                      <div>
                        <p className="text-gray-500 mb-1 text-[11px] uppercase tracking-wider">Agency Booking ID</p>
                        <p className="font-bold text-gray-900">{agentRef}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1 text-[11px] uppercase tracking-wider">Booking Reference</p>
                        <p className="font-bold text-gray-900">{displayPnr}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1 text-[11px] uppercase tracking-wider">Issue Date</p>
                        <p className="font-bold text-gray-900">{issueDate.toLocaleDateString('en-GB')} {issueDate.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'})}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-1/2 flex flex-col items-end text-right">
                    <div className="mb-4 text-[11px] text-gray-700">
                      <p className="font-bold text-gray-900 mb-1 uppercase text-[12px]">TRIPPECHALO INDIA PRIVATE LIMITED</p>
                      <p>First Floor, D 42, Greater Noida Expressway</p>
                      <p>Sector 108, Noida, Uttar Pradesh - 201304</p>
                      <p className="font-bold mt-1">GSTIN: 09AAMCT8505A1ZB</p>
                      <p>Phone: +91 95559 34205</p>
                      <p>Email: trippechaloindia@gmail.com</p>
                    </div>
                    <div className="border border-gray-200 rounded p-2 bg-white shadow-sm inline-block">
                      <Barcode value={displayPnr} width={1.5} height={30} displayValue={false} margin={0} />
                      <div className="text-center text-[11px] mt-1 font-bold tracking-widest uppercase">{displayPnr}</div>
                    </div>
                  </div>
                </div>
      
                <div className="border-t-2 border-gray-200 my-6"></div>
      
                {/* Customer & Booked By */}
                <div className="flex justify-between text-[11px] mb-6">
                  <div>
                    <p className="text-gray-500 mb-0.5 uppercase tracking-wider">Customer Name</p>
                    <p className="font-bold text-[13px]">{passengers[0]?.name || passengers[0]?.firstName || booking.user?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 mb-0.5 uppercase tracking-wider">Booked By</p>
                    <p className="font-bold text-[13px]">{booking.user?.name || 'Agent'}</p>
                  </div>
                </div>

                {/* Flight Table */}
                <div className="border border-black rounded-[4px] overflow-hidden mb-8">
                  <div className="flex justify-between items-center p-3 border-b border-black bg-white">
                    <p className="font-bold text-[13px] uppercase">{originCode}-{destCode} ({dateStr.toUpperCase()})</p>
                    <p className="text-[12px] text-gray-700">{flightNo}</p>
                  </div>
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-white border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 font-normal text-gray-600 w-1/3">Passenger Name(s)</th>
                        <th className="px-3 py-2 font-normal text-gray-600 w-1/4">PNR</th>
                        <th className="px-3 py-2 font-normal text-gray-600 w-1/6">Seat No.</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {passengers.map((pax: any, i: number) => {
                        const paxConfirmation = booking.details?.nexus_response?._data?.booking_items?.[0]?.confirmations?.find((c: any) => c.pax_id === pax.id || c.pax_id === i);
                        const tktNo = paxConfirmation?.pnr || `${displayPnr}${i}`;
                        return (
                          <tr key={i} className="border-b border-gray-100 last:border-b-0">
                            <td className="px-3 py-3 font-bold text-[13px] uppercase">{pax.name || pax.firstName + ' ' + pax.lastName}</td>
                            <td className="px-3 py-3 text-gray-600">{tktNo}</td>
                            <td className="px-3 py-3 text-gray-600 font-bold">{booking.details?.seats?.[i] || pax.seat || 'Unassigned'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Payment Details */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-blue-600 mb-2 uppercase">Payment Details</h3>
                  <table className="w-full text-left text-[11px] border border-gray-300">
                    <thead className="bg-gray-100 border-b border-gray-300">
                      <tr>
                        <th className="p-2 text-gray-700">Description</th>
                        <th className="p-2 text-gray-700 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="p-2">Base Fare</td>
                        <td className="p-2 text-right">₹ {(booking.totalAmount * 0.6).toFixed(2)}</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="p-2">Taxes and Fees</td>
                        <td className="p-2 text-right">₹ {(booking.totalAmount * 0.4).toFixed(2)}</td>
                      </tr>
                      <tr className="bg-gray-50 font-bold">
                        <td className="p-2 text-lg">Total Gross Fare</td>
                        <td className="p-2 text-right text-lg text-blue-700">₹ {booking.totalAmount.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="text-[10px] text-gray-500 mt-8 pt-4 border-t border-gray-200 text-center">
                  <p>This is a computer generated invoice and does not require a physical signature.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-6 text-[11px] leading-relaxed gap-4">
              {/* Left: Agency Details */}
              <div className="w-1/3">
                <p className="font-bold text-[13px] uppercase mb-1">TRIPPECHALO INDIA PRIVATE LIMITED</p>
                <p>First Floor, D 42, Greater Noida Expressway</p>
                <p>Sector 108, Noida, Uttar Pradesh - 201304</p>
                <p className="font-bold mt-1">GSTIN: 09AAMCT8505A1ZB</p>
                <p className="mt-1">Email : trippechaloindia@gmail.com</p>
                <p className="font-bold text-[12px]">Mobile No : 9555934205</p>
              </div>

              {/* Center: Airline & PNR */}
              <div className="w-1/3 flex flex-col items-center justify-center pt-2">
                <p className="font-semibold text-gray-800">{airline}</p>
                <div className="text-blue-500 my-1"><Plane size={32} /></div>
                <h1 className="text-3xl font-black tracking-wider text-black mt-2">{displayPnr}</h1>
                <p className="text-[12px] text-gray-500 mt-1">Booking Reference</p>
              </div>

              {/* Right: Meta & Barcode */}
              <div className="w-1/3 text-right">
                <p>Agency Booking ID: <span className="font-bold">{agentRef}</span></p>
                <p>Issued On: <span className="font-bold">{issueDate.toLocaleDateString('en-GB')} {issueDate.toLocaleTimeString('en-GB')}</span></p>
              </div>
            </div>

            {/* Content Box */}
            <div className="border-2 border-gray-300 rounded-sm overflow-hidden mb-8 w-full">
              {/* Flight Details */}
              <div>
                <div className="bg-gray-200 px-3 py-1.5 flex flex-wrap justify-between items-center text-[10px] font-bold gap-2">
                  <span className="uppercase">Flight Details</span>
                  <span className="text-[9px] text-gray-700 font-semibold">ALL TIMINGS IN 24HRS & LOCAL AIRPORT TIME</span>
                </div>
                <table className="w-full text-left text-[11px] border-b border-gray-200 table-fixed">
                  <thead className="border-b border-gray-200 bg-white">
                    <tr>
                      <th className="p-3 font-normal text-gray-500 w-1/4">Flight</th>
                      <th className="p-3 font-normal text-gray-500 w-1/4">Depart</th>
                      <th className="p-3 font-normal text-gray-500 w-1/4">Arrive</th>
                      <th className="p-3 font-normal text-gray-500 border-l border-gray-200 w-1/8">Duration/Stops</th>
                      <th className="p-3 font-normal text-gray-500 border-l border-gray-200 w-1/8">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                  <tr>
                    <td className="p-3 align-top">
                      <div className="flex gap-2 items-start">
                        <div className="text-blue-500 font-bold text-xl leading-none"><Plane size={18} /></div>
                        <div>
                          <p className="font-bold">{flightNo}</p>
                          <p className="font-bold">{cabinClass}</p>
                          <p className="text-gray-600">Aircraft Type-32Y</p>
                          <p className="text-gray-600">Refundable</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 align-top">
                      <p className="font-bold uppercase text-[12px]">{booking.details?.from} ({originCode})</p>
                      <p className="font-bold">{depTime} <span className="font-normal text-gray-600">{dateStr}</span></p>
                      <p className="text-gray-600">{leg?.origin_terminal ? `Terminal ${leg.origin_terminal}` : ''}</p>
                    </td>
                    <td className="p-3 align-top">
                      <p className="font-bold uppercase text-[12px]">{booking.details?.to} ({destCode})</p>
                      <p className="font-bold">{arrTime} <span className="font-normal text-gray-600">{dateStr}</span></p>
                    </td>
                    <td className="p-3 align-top border-l border-gray-200 text-blue-600 font-medium">
                      {flight?.duration ? `${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m` : '02:00'} / {flight?.legs?.length > 1 ? `${flight.legs.length - 1} Stop(s)` : 'Non-Stop'}
                    </td>
                    <td className="p-3 align-top border-l border-gray-200 font-medium">
                      {booking.status === 'CONFIRMED' ? 'Confirmed' : booking.status}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Passenger Details */}
            <div className="border-t-2 border-gray-300">
              <div className="bg-gray-200 px-3 py-1.5 flex flex-wrap justify-between items-center text-[10px] font-bold gap-2">
                <span className="uppercase">Passenger Details</span>
                <span className="text-[9px] text-gray-700 font-semibold">( Phone: 9555934205 | Email: trippechaloindia@gmail.com )</span>
              </div>
              <table className="w-full text-left text-[11px] table-fixed">
                <thead className="border-b border-gray-200 bg-white">
                  <tr>
                    <th className="py-2 px-3 font-normal text-gray-500 w-[20%] border-r border-gray-200">PNR</th>
                    <th className="py-2 px-3 font-normal text-gray-500 w-[55%] border-r border-gray-200">Passenger / Baggage Details</th>
                    <th className="py-2 px-3 font-normal text-gray-500 w-[12.5%] border-r border-gray-200">Seat</th>
                    <th className="py-2 px-3 font-normal text-gray-500 w-[12.5%] text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {passengers.map((pax: any, i: number) => {
                    const paxConfirmation = booking.details?.nexus_response?._data?.booking_items?.[0]?.confirmations?.find((c: any) => c.pax_id === pax.id || c.pax_id === i);
                    const tktNo = paxConfirmation?.pnr || `${displayPnr}${i}`;
                    const seatNo = booking.details?.seats?.[i] || pax.seat || 'Unassigned';
                    const paxType = pax.type || pax.passengerType || (pax.name?.toLowerCase().includes('child') ? 'Child' : pax.name?.toLowerCase().includes('infant') ? 'Infant' : 'Adult');
                    return (
                      <tr key={i}>
                        <td className="py-3 px-3 align-top border-r border-gray-200 overflow-hidden">
                          <p className="mb-1 font-bold">{tktNo}</p>
                        </td>
                        <td className="py-3 px-3 align-top border-r border-gray-200">
                          <p className="font-bold text-[12px] uppercase">
                            {(pax.gender === 'Male' ? 'Mr ' : pax.gender === 'Female' ? 'Mrs ' : '')}
                            {pax.name} 
                            <span className="text-[10px] font-normal lowercase ml-1"> {paxType}</span>
                          </p>
                          <div className="mt-1.5 space-y-0.5">
                            <p className="text-gray-700">Hand Baggage <span className="font-bold">Onward:</span> 7kg (1 piece)</p>
                            <p className="text-gray-700">CheckIn Baggage <span className="font-bold">Onward:</span> 15kg (1 piece)</p>
                          </div>
                        </td>
                        <td className="py-3 px-3 align-top border-r border-gray-200 font-bold text-gray-800">
                          {seatNo}
                        </td>
                        <td className="py-3 px-3 align-top text-right font-medium">
                          Confirmed
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* End of Content Box */}
            </div>
            </>
            )}

            <div className="text-[10px] text-gray-500 mt-4 text-center">
              <p className="font-bold mb-1">IMPORTANT INFORMATION</p>
              <p>1. This is an E-Ticket. A boarding pass will be issued after Web Check-in on the airline's website.</p>
              <p>2. Passengers must carry a valid photo ID and this E-Ticket to enter the airport.</p>
              <p>3. Web Check-in usually opens 48 hours prior to the scheduled departure time.</p>
            </div>
            
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-gray-100 px-6 py-4 rounded-b-lg flex justify-end gap-3 shrink-0 print:hidden">
          <button 
            onClick={(e) => { e.preventDefault(); setViewType(viewType === 'ticket' ? 'invoice' : 'ticket'); }}
            className="px-6 py-2.5 rounded-lg font-medium text-blue-600 bg-white border border-blue-600 hover:bg-blue-50 transition mr-auto"
          >
            {viewType === 'ticket' ? 'View Invoice' : 'View Ticket'}
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); onClose(); }}
            className="px-6 py-2.5 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); handleDownloadPDF(); }}
            className="px-6 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Download size={18} />
            Download {viewType === 'ticket' ? 'Ticket' : 'Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
}
