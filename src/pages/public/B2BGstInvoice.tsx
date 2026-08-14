import React, { useState, useEffect } from 'react';
import Dropdown from '../../components/ui/Dropdown';
import DOBCalendar from '../../components/ui/DOBCalendar';
import api from '../../services/api';
import toast from 'react-hot-toast';

const months = [
  { value: 'January', label: 'January' },
  { value: 'February', label: 'February' },
  { value: 'March', label: 'March' },
  { value: 'April', label: 'April' },
  { value: 'May', label: 'May' },
  { value: 'June', label: 'June' },
  { value: 'July', label: 'July' },
  { value: 'August', label: 'August' },
  { value: 'September', label: 'September' },
  { value: 'October', label: 'October' },
  { value: 'November', label: 'November' },
  { value: 'December', label: 'December' },
];

const years = [
  { value: '2026', label: '2026' },
  { value: '2025', label: '2025' },
  { value: '2024', label: '2024' },
];

const B2BGstInvoice: React.FC = () => {
  const [activeTab, setActiveTab] = useState('GST INPUT INVOICE');
  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });
  const currentYearStr = new Date().getFullYear().toString();
  const [month, setMonth] = useState(currentMonthName);
  const [year, setYear] = useState(currentYearStr);
  const [billNumber, setBillNumber] = useState('');
  const [billDate, setBillDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Dynamic GST Data
  const [gstData, setGstData] = useState({
    taxableValue: 0,
    sgst: 0,
    cgst: 0,
    igst: 0,
    totalAmount: 0
  });

  useEffect(() => {
    const fetchGstData = async () => {
      try {
        setFetching(true);
        const res = await api.get(`/api/gst-invoices/calculate?month=${month}&year=${year}`);
        if (res.data) {
          setGstData({
            taxableValue: res.data.taxableValue || 0,
            sgst: res.data.sgst || 0,
            cgst: res.data.cgst || 0,
            igst: res.data.igst || 0,
            totalAmount: res.data.totalAmount || 0
          });
        }
      } catch (error) {
        console.error('Error fetching GST data:', error);
      } finally {
        setFetching(false);
      }
    };
    fetchGstData();
  }, [month, year]);

  const handleSubmit = async () => {
    if (!billNumber || !billDate) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      setLoading(true);
      await api.post('/api/gst-invoices', {
        month,
        year,
        billNumber,
        billDate,
        taxableValue: gstData.taxableValue,
        sgst: gstData.sgst,
        cgst: gstData.cgst,
        igst: gstData.igst,
        invoiceValue: gstData.igst + gstData.cgst + gstData.sgst,
        totalAmount: gstData.totalAmount
      });
      toast.success('GST Invoice submitted successfully!');
      setBillNumber('');
      setBillDate('');
    } catch (error) {
      console.error('Error submitting GST invoice:', error);
      toast.error('Failed to submit GST invoice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-[#fafbfd] p-6 text-[#0c1a40]">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        
        {/* Tabs and Content Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 px-6 pt-4 gap-8">
            {['GST INPUT INVOICE', 'UPLOAD GST INVOICE FILE'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === tab ? 'text-[#0c1a40] border-b-2 border-[#0c1a40]' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'GST INPUT INVOICE' && (
            <div className="p-8">
              {/* Select Month / Year */}
              <div className="flex gap-6 mb-8 border-b border-gray-50 pb-8">
                <div className="w-[180px]">
                  <label className="block text-[11px] font-bold text-[#0c1a40] mb-2">GST Month</label>
                  <Dropdown 
                    value={month}
                    onChange={setMonth}
                    options={months}
                  />
                </div>
                <div className="w-[180px]">
                  <label className="block text-[11px] font-bold text-[#0c1a40] mb-2">GST Year</label>
                  <Dropdown 
                    value={year}
                    onChange={setYear}
                    options={years}
                  />
                </div>
              </div>

              {/* GST Info Details row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 border-b border-gray-50 pb-8">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 mb-1">TrippeChalo GST Number</p>
                  <p className="text-[13px] font-black text-[#0c1a40]">18AAJCT4798C1ZW</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 mb-1">Agent GST Number</p>
                  <p className="text-[13px] font-black text-[#0c1a40]">—</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 mb-1">GST Description</p>
                  <p className="text-[13px] font-black text-[#0c1a40]">{`Commission for the Month of ${months.findIndex(m => m.value === month) + 1}-${year}`}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 mb-1">GST SAC</p>
                  <p className="text-[13px] font-black text-[#0c1a40]">998551</p>
                </div>
              </div>

              {/* Amounts row */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mb-8 border-b border-gray-50 pb-8 relative">
                {fetching && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                    <span className="text-xs font-bold text-gray-500 animate-pulse">Calculating...</span>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-bold text-gray-500 mb-1">Taxable Value</p>
                  <p className="text-[13px] font-black text-[#0c1a40]">{gstData.taxableValue}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 mb-1">SGST(9%)</p>
                  <p className="text-[13px] font-black text-[#0c1a40]">{gstData.sgst}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 mb-1">CGST(9%)</p>
                  <p className="text-[13px] font-black text-[#0c1a40]">{gstData.cgst}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 mb-1">IGST(18%)</p>
                  <p className="text-[13px] font-black text-[#0c1a40]">{gstData.igst}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 mb-1">Invoice Value</p>
                  <p className="text-[13px] font-black text-[#0c1a40]">{gstData.igst + gstData.cgst + gstData.sgst}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 mb-1">Total Amount</p>
                  <p className="text-[13px] font-black text-[#0c1a40]">{gstData.totalAmount}</p>
                </div>
              </div>

              {/* Inputs row */}
              <div className="flex gap-6 mb-12">
                <div className="w-[200px]">
                  <label className="block text-[11px] font-bold text-[#0c1a40] mb-2">GST Bill Number <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                    className="w-full h-[38px] px-3 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 font-bold"
                  />
                </div>
                <div className="w-[200px]">
                  <label className="block text-[11px] font-bold text-[#0c1a40] mb-2">GST Bill Date <span className="text-red-500">*</span></label>
                  <DOBCalendar 
                    value={billDate}
                    onChange={setBillDate}
                    placeholder="dd-mm-yyyy"
                  />
                </div>
              </div>

              <div className="flex justify-center pb-8">
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-[#0b1031] text-white px-10 py-3 rounded-full text-sm font-bold shadow-md hover:bg-blue-900 transition disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </div>

            </div>
          )}

          {activeTab === 'UPLOAD GST INVOICE FILE' && (
            <div className="p-8 h-[300px] flex flex-col items-center justify-center gap-4">
              <p className="text-gray-400 font-semibold">Upload functionality coming soon.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default B2BGstInvoice;
