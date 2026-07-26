import React, { useRef } from 'react';
import { X, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import Barcode from 'react-barcode';

interface ETicketModalProps {
  booking: any;
  onClose: () => void;
}

export default function ETicketModal({ booking, onClose }: ETicketModalProps) {
  const componentRef = useRef(null);
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Ticket_${booking?.bookingId}`,
  });

  if (!booking) return null;

  const passengers = booking.details?.passengers?.length > 0 
    ? booking.details.passengers 
    : [{ name: booking.user?.name || 'PASSENGER', type: 'Adult' }];
    
  const flightNo = `IX-1617`; // mock or from booking.details
  const airline = booking.details?.airline || 'Air India Express';
  const pnr = booking.details?.pnr || booking.bookingId?.slice(-6).toUpperCase() || 'G347MF';
  
  const getAirportCode = (city: string) => city ? city.substring(0, 3).toUpperCase() : 'XXX';
  const originCode = getAirportCode(booking.details?.from);
  const destCode = getAirportCode(booking.details?.to);
  const travelDate = booking.details?.date ? new Date(booking.details.date) : new Date(booking.createdAt);
  const dateStr = travelDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const depTime = '13:50'; // Mock based on screenshot
  const arrTime = '15:50'; // Mock
  
  const issueDate = new Date(booking.createdAt);

  const agencyName = booking.user?.role === 'TRAVEL_AGENT' ? (booking.user?.name?.toUpperCase() || 'TRAVEL AGENT') : 'TRIPPECHALO INDIA PVT LTD';

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
          <div ref={componentRef} className="bg-white w-full max-w-[820px] shadow-sm border border-gray-300 p-6 md:p-8 text-black font-sans print:shadow-none print:border-none box-border my-auto">
            
            <style>{`
              @media print {
                @page { size: auto; margin: 10mm; }
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              }
            `}</style>

            {/* Ticket Header */}
            <div className="text-center mb-6">
              <h1 className="text-lg font-bold tracking-widest uppercase">TICKET CONFIRMATION</h1>
              <div className="border-b border-gray-300 w-full mt-2"></div>
            </div>

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
                <div className="text-orange-500 font-bold text-4xl my-1">X</div>
                <p className="font-black text-2xl tracking-widest">{pnr}</p>
                <p className="text-gray-600">Airline PNR</p>
              </div>

              {/* Right: Meta & Barcode */}
              <div className="w-1/3 text-right">
                <p>Reference Number: <span className="font-bold">{booking.bookingId}</span></p>
                <p>Issued On: <span className="font-bold">{issueDate.toLocaleDateString('en-GB')} {issueDate.toLocaleTimeString('en-GB')}</span></p>
                <div className="mt-2 flex justify-end">
                  <Barcode value={pnr} height={40} width={1.5} displayValue={false} margin={0} background="transparent" />
                </div>
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
                        <div className="text-orange-500 font-bold text-xl leading-none">X</div>
                        <div>
                          <p className="font-bold">{flightNo}</p>
                          <p className="font-bold">ECONOMY</p>
                          <p className="text-gray-600">Aircraft Type-32Y</p>
                          <p className="text-gray-600">Refundable</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 align-top">
                      <p className="font-bold uppercase text-[12px]">{booking.details?.from} ({originCode})</p>
                      <p className="font-bold">{depTime} <span className="font-normal text-gray-600">{dateStr}</span></p>
                      <p className="text-gray-600">Terminal 1</p>
                    </td>
                    <td className="p-3 align-top">
                      <p className="font-bold uppercase text-[12px]">{booking.details?.to} ({destCode})</p>
                      <p className="font-bold">{arrTime} <span className="font-normal text-gray-600">{dateStr}</span></p>
                    </td>
                    <td className="p-3 align-top border-l border-gray-200 text-blue-600 font-medium">
                      02:00 / Non-Stop
                    </td>
                    <td className="p-3 align-top border-l border-gray-200 font-medium">
                      Confirmed
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
                    <th className="py-2 px-3 font-normal text-gray-500 w-1/4 border-r border-gray-200">Ticket No.</th>
                    <th className="py-2 px-3 font-normal text-gray-500 w-1/2 border-r border-gray-200">Passenger / Baggage Details</th>
                    <th className="py-2 px-3 font-normal text-gray-500 w-[12.5%] border-r border-gray-200">Seat</th>
                    <th className="py-2 px-3 font-normal text-gray-500 w-[12.5%] text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {passengers.map((pax: any, i: number) => {
                    const tktNo = `${pnr}${i}`;
                    const seatNo = booking.details?.seats?.[i] || pax.seat || 'Unassigned';
                    const paxType = pax.type || pax.passengerType || (pax.name?.toLowerCase().includes('child') ? 'Child' : pax.name?.toLowerCase().includes('infant') ? 'Infant' : 'Adult');
                    return (
                      <tr key={i}>
                        <td className="py-3 px-3 align-top border-r border-gray-200 overflow-hidden">
                          <p className="mb-1 font-bold">{tktNo}</p>
                          <div className="max-w-full overflow-hidden">
                            <Barcode value={tktNo} height={20} width={0.8} displayValue={false} margin={0} background="transparent" />
                          </div>
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

            {/* Payment Details */}
            <div className="border-t-2 border-gray-300">
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
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-white px-6 py-4 rounded-b-lg border-t border-gray-200 flex justify-between shrink-0 print:hidden">
          <button 
            onClick={(e) => { e.preventDefault(); onClose(); }}
            className="bg-[#0b1031] text-white px-8 py-2 rounded font-bold shadow-md hover:bg-[#1a235c] transition"
          >
            Back
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); handlePrint(); }}
            className="bg-[#0b1031] text-white px-8 py-2 rounded font-bold shadow-md hover:bg-[#1a235c] transition flex items-center gap-2"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
