import React, { useState, useEffect } from 'react';
import { Plus, Server, CheckCircle, XCircle, Activity, Key, Copy, Eye, EyeOff, Download, ExternalLink, Edit } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

interface B2BClient {
  _id: string;
  companyName: string;
  contactName: string;
  email: string;
  testApiKey: string;
  liveApiKey: string;
  status: 'Pending' | 'Testing' | 'Live' | 'Suspended';
  apiWalletBalance: number;
  rateLimitPerMinute: number;
  markupPercentage: number;
  createdAt: string;
}

export default function AdminB2BPartners() {
  const [partners, setPartners] = useState<B2BClient[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<B2BClient | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    status: 'Testing',
    rateLimitPerMinute: 60,
    markupPercentage: 0
  });

  // UI state
  const [showTestKey, setShowTestKey] = useState(false);
  const [showLiveKey, setShowLiveKey] = useState(false);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/b2b-clients');
      if (res.data.success) {
        setPartners(res.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch partners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/admin/b2b-clients', formData);
      if (res.data.success) {
        toast.success('B2B Partner created successfully!');
        setPartners([res.data.data, ...partners]);
        setIsAddModalOpen(false);
        setFormData({
          companyName: '',
          contactName: '',
          email: '',
          status: 'Testing',
          rateLimitPerMinute: 60,
          markupPercentage: 0
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create partner');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const openDocs = (partner: B2BClient) => {
    setSelectedPartner(partner);
    setShowTestKey(false);
    setShowLiveKey(false);
    setIsDocsModalOpen(true);
  };

  const openFullDocs = (env: 'test' | 'live') => {
    if (!selectedPartner) return;
    const key = env === 'test' ? selectedPartner.testApiKey : selectedPartner.liveApiKey;
    const url = `/api-docs?partner=${encodeURIComponent(selectedPartner.companyName)}&env=${env}&key=${encodeURIComponent(key)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Server className="text-blue-600" /> B2B API Partners
          </h1>
          <p className="text-gray-500">Manage external companies consuming TrippeChalo APIs</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
        >
          <Plus size={20} />
          Add New Partner
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Activity className="animate-spin text-blue-600" size={32} /></div>
      ) : partners.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <Server className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900">No B2B Partners yet</h3>
          <p className="text-gray-500 mt-2">Add your first partner to generate their API keys.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map(partner => (
            <div key={partner._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
              <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{partner.companyName}</h3>
                  <p className="text-sm text-gray-500">{partner.contactName} • {partner.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    partner.status === 'Live' ? 'bg-green-100 text-green-700 border-green-200' :
                    partner.status === 'Testing' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                    partner.status === 'Suspended' ? 'bg-red-100 text-red-700 border-red-200' :
                    'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    {partner.status}
                  </span>
                  <button 
                    onClick={() => {
                      setFormData(partner);
                      setIsAddModalOpen(true);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 transition"
                    title="Edit Partner"
                  >
                    <Edit size={16} />
                  </button>
                </div>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium mb-1">API Wallet</p>
                    <p className="font-bold text-gray-900">₹{partner.apiWalletBalance.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium mb-1">Added Markup</p>
                    <p className="font-bold text-gray-900">{partner.markupPercentage}%</p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <button 
                    onClick={() => openDocs(partner)}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-lg transition text-sm font-medium"
                  >
                    <Key size={16} /> View Keys & Docs
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Partner Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-lg">Onboard New B2B Partner</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-red-500"><XCircle size={20}/></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input required type="text" className="w-full p-2 border border-gray-300 rounded-lg" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                  <input required type="text" className="w-full p-2 border border-gray-300 rounded-lg" value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input required type="email" className="w-full p-2 border border-gray-300 rounded-lg" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-bold text-gray-900 mb-3">API Configuration</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Initial Status</label>
                    <select className="w-full p-2 border border-gray-300 rounded-lg text-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="Testing">Testing</option>
                      <option value="Live">Live</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Added Markup (%)</label>
                    <input type="number" min="0" className="w-full p-2 border border-gray-300 rounded-lg text-sm" value={formData.markupPercentage} onChange={e => setFormData({...formData, markupPercentage: Number(e.target.value)})} />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">Generate Keys & Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Docs Modal */}
      {isDocsModalOpen && selectedPartner && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Key className="text-blue-600"/> API Credentials: {selectedPartner.companyName}
              </h2>
              <button onClick={() => setIsDocsModalOpen(false)} className="text-gray-500 hover:text-red-500"><XCircle size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-gray-50">
              
              {/* Credentials Card */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Authentication Keys</h3>
                
                <div>
                  <label className="flex justify-between items-center text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span>Test API Key</span>
                      <span className="text-orange-500 lowercase normal-case text-[10px]">(Doesn't deduct real balance)</span>
                    </div>
                    <button onClick={() => openFullDocs('test')} className="text-blue-600 hover:text-blue-700 flex items-center gap-1 normal-case bg-blue-50 px-2 py-0.5 rounded">
                      View Test Docs <ExternalLink size={12}/>
                    </button>
                  </label>
                  <div className="flex">
                    <input 
                      type={showTestKey ? "text" : "password"} 
                      readOnly 
                      value={selectedPartner.testApiKey}
                      className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-l-lg text-sm font-mono focus:outline-none"
                    />
                    <button onClick={() => setShowTestKey(!showTestKey)} className="px-3 bg-gray-100 border-y border-gray-200 text-gray-600 hover:bg-gray-200 transition">
                      {showTestKey ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                    <button onClick={() => copyToClipboard(selectedPartner.testApiKey)} className="px-4 bg-blue-50 border border-blue-200 border-l-0 rounded-r-lg text-blue-700 hover:bg-blue-100 transition flex items-center gap-1 font-medium text-sm">
                      <Copy size={14}/> Copy
                    </button>
                  </div>
                </div>

                <div>
                  <label className="flex justify-between items-center text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider mt-4">
                    <div className="flex items-center gap-2">
                      <span>Live Production Key</span>
                      <span className="text-green-600 lowercase normal-case text-[10px]">(Deducts real balance)</span>
                    </div>
                    <button onClick={() => openFullDocs('live')} className="text-green-600 hover:text-green-700 flex items-center gap-1 normal-case bg-green-50 px-2 py-0.5 rounded">
                      View Live Docs <ExternalLink size={12}/>
                    </button>
                  </label>
                  <div className="flex">
                    <input 
                      type={showLiveKey ? "text" : "password"} 
                      readOnly 
                      value={selectedPartner.liveApiKey}
                      className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-l-lg text-sm font-mono focus:outline-none"
                    />
                    <button onClick={() => setShowLiveKey(!showLiveKey)} className="px-3 bg-gray-100 border-y border-gray-200 text-gray-600 hover:bg-gray-200 transition">
                      {showLiveKey ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                    <button onClick={() => copyToClipboard(selectedPartner.liveApiKey)} className="px-4 bg-red-50 border border-red-200 border-l-0 rounded-r-lg text-red-700 hover:bg-red-100 transition flex items-center gap-1 font-medium text-sm">
                      <Copy size={14}/> Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* Endpoints Doc */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <h3 className="font-bold text-gray-900">API Documentation Snippet</h3>
                  <span className="text-xs text-gray-500">Use the buttons above to view full docs</span>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs overflow-x-auto text-green-400">
                  <div className="text-gray-400 mb-2">// Base URL</div>
                  <div className="mb-4">https://api.trippechalo.com/api/v1/b2b</div>
                  
                  <div className="text-gray-400 mb-2">// 1. Search Flights</div>
                  <div className="text-blue-400 mb-1">GET /flights/search?origin=DEL&destination=GOI&date=2026-10-15</div>
                  <div className="mb-4 text-gray-300">
                    Headers: <br/>
                    <span className="text-pink-400">x-api-key:</span> {'<YOUR_API_KEY>'}
                  </div>

                  <div className="text-gray-400 mb-2">// 2. Book Flight</div>
                  <div className="text-yellow-400 mb-1">POST /flights/book</div>
                  <div className="mb-1 text-gray-300">
                    Headers: <br/>
                    <span className="text-pink-400">x-api-key:</span> {'<YOUR_API_KEY>'} <br/>
                    <span className="text-pink-400">Content-Type:</span> application/json
                  </div>
                  <div className="text-gray-300 whitespace-pre">
{`Body:
{
  "sfId": "SF-12345",
  "passengers": [
    {
      "title": "Mr",
      "firstName": "John",
      "lastName": "Doe",
      "type": "ADT",
      "gender": "M"
    }
  ],
  "contactEmail": "agent@partner.com",
  "contactPhone": "9876543210"
}`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
