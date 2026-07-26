import React, { useState } from 'react';
import Dropdown from '../../components/ui/Dropdown';

const statuses = [{ value: 'ALL', label: 'ALL' }, { value: 'ACTIVE', label: 'ACTIVE' }, { value: 'INACTIVE', label: 'INACTIVE' }];
const products = [{ value: 'Flight', label: 'Flight' }, { value: 'Hotel', label: 'Hotel' }];
const types = [{ value: 'Select Biller', label: 'Select Biller' }];
const operators = [{ value: 'Select Operator', label: 'Select Operator' }];
const fareTypes = [{ value: 'BASIC', label: 'BASIC' }, { value: 'PREMIUM', label: 'PREMIUM' }];

const B2BMarkup: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Add Form state
  const [product, setProduct] = useState('Flight');
  const [type, setType] = useState('Select Biller');
  const [operator, setOperator] = useState('Select Operator');
  const [fareType, setFareType] = useState('BASIC');

  return (
    <div className="flex-1 w-full bg-[#fafbfd] p-6 text-[#0c1a40]">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        
        {/* Header Title Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#0c1a40]">MARK-UP</h2>
        </div>

        {!showAddForm ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
            
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold">Status</span>
                <Dropdown value={statusFilter} onChange={setStatusFilter} options={statuses} className="w-[120px]" />
              </div>
              
              <div className="flex items-center gap-4">
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="w-[200px] h-[34px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500" 
                />
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="w-8 h-8 rounded-full bg-[#0b1031] text-white flex items-center justify-center shadow-md hover:bg-blue-900 transition"
                >
                  <span className="text-lg font-bold leading-none mb-1">+</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0b1031] text-white">
                  <tr>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">PRODUCT</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">TYPE</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">AIRLINE</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">FARE TYPE</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">VALUE</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">MINIMUM VALUE</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">MAXIMUM VALUE</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">STATUS</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">ACTION</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-amber-500 font-bold text-xs">
                      No Records Found Yet...!
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Product <span className="text-red-500">*</span></label>
                <Dropdown value={product} onChange={setProduct} options={products} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Type <span className="text-red-500">*</span></label>
                <Dropdown value={type} onChange={setType} options={types} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Operator <span className="text-red-500">*</span></label>
                <Dropdown value={operator} onChange={setOperator} options={operators} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Fare Type <span className="text-red-500">*</span></label>
                <Dropdown value={fareType} onChange={setFareType} options={fareTypes} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Value <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type="text" className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500" placeholder="Value*" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-[500px]">
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Minimum Value <span className="text-red-500">*</span></label>
                <input type="text" className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Maximum Value <span className="text-red-500">*</span></label>
                <input type="text" className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 pb-4">
              <button 
                onClick={() => setShowAddForm(false)}
                className="bg-[#0b1031] text-white px-8 py-2.5 rounded-full text-xs font-bold shadow-md hover:bg-blue-900 transition"
              >
                Back
              </button>
              <button className="bg-[#0b1031] text-white px-8 py-2.5 rounded-full text-xs font-bold shadow-md hover:bg-blue-900 transition">
                Submit
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default B2BMarkup;
