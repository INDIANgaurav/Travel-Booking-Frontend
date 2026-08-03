import React, { useState, useEffect } from 'react';
import Dropdown from '../../components/ui/Dropdown';
import DOBCalendar from '../../components/ui/DOBCalendar';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const products = [
  { value: 'airline', label: 'Airline' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'visa', label: 'Visa' },
];

const B2BInvoice: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState('airline');
  const [fromDate, setFromDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/invoices');
      setInvoices(res.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      setLoading(true);
      await api.delete(`/api/invoices/${deleteConfirmId}`);
      toast.success('Invoice deleted successfully');
      setDeleteConfirmId(null);
      fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
      setLoading(false);
      setDeleteConfirmId(null);
    }
  };

  const handleDownloadPDF = (inv: any) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) {
      toast.error('Please allow popups to download the invoice.');
      return;
    }
    
    const htmlContent = `
      <html>
        <head>
          <title>Tax Invoice - ${inv.fromDate} to ${inv.toDate}</title>
          <style>
            body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 40px; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
            .title { font-size: 28px; font-weight: 900; color: #0c1a40; margin: 0; }
            .subtitle { font-size: 14px; color: #64748b; margin-top: 5px; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
            .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
            .box-title { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
            .box-value { font-size: 24px; font-weight: 800; color: #0c1a40; margin: 0; }
            .highlight-box { background: #eff6ff; border: 1px solid #bfdbfe; }
            .highlight-box .box-title { color: #3b82f6; }
            .highlight-box .box-value { color: #1d4ed8; }
            table { w-full: 100%; width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 12px; background: #f1f5f9; color: #475569; font-size: 12px; text-transform: uppercase; font-weight: 700; border-radius: 6px 6px 0 0; }
            td { padding: 16px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 500; color: #0f172a; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; }
            @media print { body { padding: 0; } .box { break-inside: avoid; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">TAX INVOICE SUMMARY</h1>
              <p class="subtitle">Auto-generated financial report</p>
            </div>
            <div style="text-align: right;">
              <p style="margin:0; font-size: 12px; font-weight: 700; color: #64748b;">DATE REQUESTED</p>
              <p style="margin:4px 0 0; font-size: 14px; font-weight: 600;">${new Date(inv.createdAt).toLocaleDateString('en-GB')}</p>
            </div>
          </div>
          
          <div class="details-grid">
            <div class="box">
              <div class="box-title">Total Bookings</div>
              <div class="box-value">${inv.totalBookings || 0}</div>
            </div>
            <div class="box">
              <div class="box-title">Total Sales</div>
              <div class="box-value">${inv.currency || 'INR'} ${(inv.totalSalesAmount || 0).toLocaleString()}</div>
            </div>
            <div class="box highlight-box" style="grid-column: span 2;">
              <div class="box-title">Estimated Taxes (5%)</div>
              <div class="box-value">${inv.currency || 'INR'} ${(inv.totalTaxes || 0).toLocaleString()}</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Product Type</th>
                <th>Period From</th>
                <th>Period To</th>
                <th>Current Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="text-transform: uppercase;">${inv.product}</td>
                <td>${inv.fromDate}</td>
                <td>${inv.toDate}</td>
                <td><span style="background: #fef9c3; color: #a16207; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase;">${inv.status || 'PENDING'}</span></td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer">
            <p>This is a computer generated summary. The final official Tax Invoice PDF will be issued by the administrator.</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Give images/fonts a moment to load if there were any, then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleDownloadExcel = async (inv: any) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Tax Invoice');

      // Set Column Widths FIRST
      sheet.getColumn(1).width = 30;
      sheet.getColumn(2).width = 40;

      // Main Title Heading
      sheet.mergeCells('A1:B1');
      const titleCell = sheet.getCell('A1');
      titleCell.value = 'TAX INVOICE SUMMARY';
      titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF0C1A40' } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
      sheet.getRow(1).height = 40;

      // Add Headers at Row 2
      const headerRow = sheet.getRow(2);
      headerRow.values = ['Property', 'Value'];
      headerRow.height = 30;

      // Styling the Header Cells (Not the whole row)
      ['A2', 'B2'].forEach(cellRef => {
        const cell = sheet.getCell(cellRef);
        cell.font = { name: 'Arial', family: 4, size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0C1A40' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });

      // Add Data
      sheet.addRow(['Product', String(inv.product).toUpperCase()]);
      sheet.addRow(['From Date', inv.fromDate]);
      sheet.addRow(['To Date', inv.toDate]);
      sheet.addRow(['Total Bookings', inv.totalBookings || 0]);
      sheet.addRow([`Total Sales Amount (${inv.currency || 'INR'})`, inv.totalSalesAmount || 0]);
      sheet.addRow(['Estimated Taxes (5%)', inv.totalTaxes || 0]);
      sheet.addRow(['Status', inv.status || 'PENDING']);

      // Style data rows
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber > 2) {
          row.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF333333' } };
          row.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
          row.height = 25;
          
          row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
          
          // Border
          row.eachCell((cell, colNumber) => {
            if (colNumber <= 2) {
              cell.border = {
                top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
              };
            }
          });
        }
      });

      // Highlight Total Sales and Taxes (Rows 7 and 8 now because of the title row)
      const salesRow = sheet.getRow(7);
      if (salesRow && salesRow.getCell(2)) salesRow.getCell(2).font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF059669' } };
      
      const taxesRow = sheet.getRow(8);
      if (taxesRow && taxesRow.getCell(2)) taxesRow.getCell(2).font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF059669' } };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `TaxInvoice_${inv.fromDate}_to_${inv.toDate}.xlsx`);
    } catch (error) {
      console.error('Excel generation error:', error);
      toast.error('Failed to generate Excel file');
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await api.post('/api/invoices', {
        product: selectedProduct,
        fromDate,
        toDate
      });
      toast.success('Invoice requested successfully!');
      fetchInvoices();
    } catch (error) {
      console.error('Error submitting invoice request:', error);
      toast.error('Failed to request invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-[#fafbfd] p-6 text-[#0c1a40]">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        
        {/* Header Title Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#0c1a40]">TAX INVOICE</h2>
        </div>

        {/* Filter Form Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-end gap-6">
          <div className="w-[250px]">
            <label className="block text-[11px] font-bold text-[#0c1a40] mb-2 uppercase tracking-wide">Product</label>
            <Dropdown 
              value={selectedProduct}
              onChange={setSelectedProduct}
              options={products}
              className="w-full"
            />
          </div>
          
          <div className="w-[200px]">
            <label className="block text-[11px] font-bold text-[#0c1a40] mb-2 uppercase tracking-wide">From Date</label>
            <DOBCalendar 
              value={fromDate}
              onChange={setFromDate}
              placeholder="dd-mm-yyyy"
            />
          </div>

          <div className="w-[200px]">
            <label className="block text-[11px] font-bold text-[#0c1a40] mb-2 uppercase tracking-wide">To Date</label>
            <DOBCalendar 
              value={toDate}
              onChange={setToDate}
              placeholder="dd-mm-yyyy"
            />
          </div>

          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#0b1031] text-white px-8 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-blue-900 transition h-[42px] min-w-[120px] disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>

        {/* Results Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[300px]">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-[#0c1a40]">TAX INVOICE REQUESTS</h2>
          </div>
          
          {loading ? (
             <div className="flex-1 flex items-center justify-center p-8 text-gray-500 font-bold">Loading...</div>
          ) : invoices.length === 0 ? (
             <div className="flex-1 flex items-center justify-center p-8">
               <p className="text-amber-600 font-bold text-sm">No Records Found Yet...!</p>
             </div>
          ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-left text-xs whitespace-nowrap">
                 <thead className="bg-[#f8f9fc] text-[#0c1a40] font-bold uppercase tracking-wider">
                   <tr>
                     <th className="px-6 py-4">Product</th>
                     <th className="px-6 py-4">From Date</th>
                     <th className="px-6 py-4">To Date</th>
                     <th className="px-6 py-4">Requested At</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 font-semibold text-gray-600">
                   {invoices.map((inv: any, i) => (
                     <tr key={i} className="hover:bg-blue-50/50 transition">
                       <td className="px-6 py-4 uppercase">{inv.product}</td>
                       <td className="px-6 py-4">{inv.fromDate}</td>
                       <td className="px-6 py-4">{inv.toDate}</td>
                       <td className="px-6 py-4">{inv.createdAt ? format(new Date(inv.createdAt), 'dd MMM yyyy, HH:mm') : ''}</td>
                       <td className="px-6 py-4">
                         <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${inv.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                           {inv.status || 'PENDING'}
                         </span>
                       </td>
                       <td className="px-6 py-4 text-right flex justify-end gap-2">
                         <button 
                           onClick={() => setSelectedItem(inv)}
                           className="px-4 py-1.5 bg-[#0c1a40] text-white text-xs font-bold rounded-lg hover:bg-blue-900 transition"
                         >
                           View Details
                         </button>
                         <button 
                           onClick={() => setDeleteConfirmId(inv._id)}
                           className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition"
                         >
                           Delete
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          )}
        </div>

      </div>

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#0c1a40]">
              <h3 className="text-lg font-bold text-white">Invoice Summary</h3>
              <button onClick={() => setSelectedItem(null)} className="text-white/70 hover:text-white">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Bookings</p>
                  <p className="text-xl font-black text-[#0c1a40]">{selectedItem.totalBookings || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Sales</p>
                  <p className="text-xl font-black text-[#0c1a40]">{selectedItem.currency || 'INR'} {(selectedItem.totalSalesAmount || 0).toLocaleString()}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl col-span-2">
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Estimated Taxes (5%)</p>
                  <p className="text-xl font-black text-blue-700">{selectedItem.currency || 'INR'} {(selectedItem.totalTaxes || 0).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p><strong>Note:</strong> This is an auto-generated summary based on your confirmed {selectedItem.product} bookings from {selectedItem.fromDate} to {selectedItem.toDate}. The final official PDF will be provided by the admin.</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => handleDownloadExcel(selectedItem)}
                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
              >
                Download Excel
              </button>
              <button 
                onClick={() => handleDownloadPDF(selectedItem)}
                className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition"
              >
                Download PDF
              </button>
              <button 
                onClick={() => setSelectedItem(null)}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all duration-300">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Invoice Request?</h3>
              <p className="text-sm text-gray-500">Are you sure you want to delete this invoice? This action cannot be undone.</p>
            </div>
            
            <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-center gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default B2BInvoice;
