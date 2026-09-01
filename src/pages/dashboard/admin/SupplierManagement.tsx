import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { PlusCircle, Edit2, DollarSign, Activity, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Dropdown from '../../../components/ui/Dropdown';

interface Commission {
  percentage: number;
  fixedAmount: number;
}

interface ApiConfig {
  endpoint?: string;
  apiKey?: string;
  secretKey?: string;
}

interface Supplier {
  _id: string;
  name: string;
  type: 'API' | 'MANUAL';
  balance: number;
  creditLimit: number;
  commission: Commission;
  apiConfig?: ApiConfig;
  isActive: boolean;
  cugEnabled?: boolean;
}

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Partial<Supplier>>({
    name: '',
    type: 'MANUAL',
    balance: 0,
    creditLimit: 0,
    commission: { percentage: 0, fixedAmount: 0 },
    isActive: true,
  });

  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [topupData, setTopupData] = useState({ supplierId: '', amount: 0, type: 'TOPUP', description: '' });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const { data } = await api.get('/api/suppliers');
      setSuppliers(data.suppliers || data);
    } catch (err: any) {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentSupplier._id) {
        await api.put(`/api/suppliers/${currentSupplier._id}`, currentSupplier);
        toast.success('Supplier Updated!');
      } else {
        await api.post('/api/suppliers', currentSupplier);
        toast.success('Supplier Created!');
      }
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving supplier');
    }
  };

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/api/suppliers/${topupData.supplierId}/transactions`, {
        type: topupData.type,
        amount: Number(topupData.amount),
        description: topupData.description
      });
      toast.success('Transaction Successful');
      setIsTopupModalOpen(false);
      fetchSuppliers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Transaction failed');
    }
  };

  const handleSyncBalance = async (supplierId: string) => {
    try {
      const { data } = await api.post(`/api/suppliers/${supplierId}/sync`, {});
      toast.success(data.synced ? `Synced! Diff: ${data.difference}` : 'Already in sync');
      fetchSuppliers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Sync Failed');
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supplier Management</h1>
          <p className="text-sm text-gray-500">Manage B2B Suppliers, API Wallets, and Commission Configs</p>
        </div>
        <button 
          onClick={() => {
            setCurrentSupplier({ name: '', type: 'MANUAL', balance: 0, creditLimit: 0, commission: { percentage: 0, fixedAmount: 0 }, isActive: true });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <PlusCircle className="w-5 h-5" />
          Add Supplier
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Activity className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map(supplier => (
            <div key={supplier._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    {supplier.name}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${supplier.type === 'API' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                      {supplier.type}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500">Credit Limit: ₹{supplier.creditLimit.toLocaleString()}</p>
                </div>
                <button onClick={() => {
                  setCurrentSupplier(supplier);
                  setIsModalOpen(true);
                }} className="text-gray-400 hover:text-blue-600">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-500 mb-1">Available Advance</div>
                <div className={`text-2xl font-bold ${supplier.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ₹{supplier.balance.toLocaleString()}
                </div>
              </div>

              <div className="flex justify-between text-sm text-gray-600 mb-4 px-2">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">Comm (%)</span>
                  <span className="font-semibold">{supplier.commission?.percentage || 0}%</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-xs text-gray-400">Fixed (₹)</span>
                  <span className="font-semibold">₹{supplier.commission?.fixedAmount || 0}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {supplier.type !== 'MANUAL' && (
                  <button 
                    onClick={() => {
                      setTopupData({ supplierId: supplier._id, amount: 0, type: 'TOPUP', description: '' });
                      setIsTopupModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 bg-green-50 text-green-700 border border-green-200 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition"
                  >
                    <DollarSign className="w-4 h-4" />
                    Top-up
                  </button>
                )}
                {supplier.type === 'API' && (
                  <button 
                    onClick={() => handleSyncBalance(supplier._id)}
                    className="flex-1 flex items-center justify-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Sync
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE SUPPLIER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{currentSupplier._id ? 'Edit' : 'Add'} Supplier</h2>
            <form onSubmit={handleSaveSupplier} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required type="text" value={currentSupplier.name} onChange={e => setCurrentSupplier({...currentSupplier, name: e.target.value})} className="w-full bg-white border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <Dropdown 
                    options={[
                      { value: 'API', label: 'API (e.g. Nexus)' },
                      { value: 'MANUAL', label: 'MANUAL (Agent/Bulk)' }
                    ]}
                    value={currentSupplier.type || 'MANUAL'}
                    onChange={(val) => setCurrentSupplier({...currentSupplier, type: val as any})}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Credit Limit</label>
                  <input type="number" value={currentSupplier.creditLimit} onChange={e => setCurrentSupplier({...currentSupplier, creditLimit: Number(e.target.value)})} className="w-full bg-white border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Comm (%)</label>
                  <input type="number" step="0.1" value={currentSupplier.commission?.percentage === 0 && currentSupplier.commission?.percentage?.toString() !== "0" ? "" : currentSupplier.commission?.percentage ?? ""} onChange={e => setCurrentSupplier({...currentSupplier, commission: { ...currentSupplier.commission!, percentage: e.target.value === "" ? "" as any : Number(e.target.value) }})} className="w-full bg-white border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Fixed Comm (₹)</label>
                  <input type="number" value={currentSupplier.commission?.fixedAmount === 0 && currentSupplier.commission?.fixedAmount?.toString() !== "0" ? "" : currentSupplier.commission?.fixedAmount ?? ""} onChange={e => setCurrentSupplier({...currentSupplier, commission: { ...currentSupplier.commission!, fixedAmount: e.target.value === "" ? "" as any : Number(e.target.value) }})} className="w-full bg-white border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                <input 
                  type="checkbox" 
                  id="cugEnabled" 
                  checked={!!currentSupplier.cugEnabled} 
                  onChange={e => setCurrentSupplier({...currentSupplier, cugEnabled: e.target.checked})}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="cugEnabled" className="text-sm font-bold text-indigo-900 cursor-pointer flex-1">
                  Enable CUG Network <span className="font-normal text-indigo-700 text-xs ml-1">(Hides inventory from regular agents)</span>
                </label>
              </div>

              {currentSupplier.type === 'API' && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-3 mt-4 border border-gray-100">
                  <h4 className="font-semibold text-xs text-gray-500 uppercase">API Configuration</h4>
                  <input type="text" placeholder="Endpoint URL" value={currentSupplier.apiConfig?.endpoint || ''} onChange={e => setCurrentSupplier({...currentSupplier, apiConfig: {...currentSupplier.apiConfig, endpoint: e.target.value}})} className="w-full bg-white border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                  <input type="password" placeholder="API Key" value={currentSupplier.apiConfig?.apiKey || ''} onChange={e => setCurrentSupplier({...currentSupplier, apiConfig: {...currentSupplier.apiConfig, apiKey: e.target.value}})} className="w-full bg-white border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Save Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOPUP MODAL */}
      {isTopupModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Supplier Transaction</h2>
            <form onSubmit={handleTopup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <Dropdown 
                  options={[
                    { value: 'TOPUP', label: 'TOP-UP (Add Funds)' },
                    { value: 'DEDUCTION', label: 'DEDUCTION (Manual Reduce)' }
                  ]}
                  value={topupData.type}
                  onChange={(val) => setTopupData({ ...topupData, type: val as any })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount (₹)</label>
                <input required type="number" min="1" value={topupData.amount || ''} onChange={e => setTopupData({...topupData, amount: Number(e.target.value)})} className="w-full bg-white border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description / UTR</label>
                <input required type="text" placeholder="e.g. Bank Trf UTR..." value={topupData.description} onChange={e => setTopupData({...topupData, description: e.target.value})} className="w-full bg-white border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsTopupModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManagement;





