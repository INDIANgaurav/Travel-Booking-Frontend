import React, { useState, useEffect } from 'react';
import { Plus, Server, CheckCircle, XCircle, Activity, Key, Copy, Eye, EyeOff, Download, ExternalLink, Edit, Trash2 } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

interface B2BClient {
  _id: string;
  companyName: string;
  contactName: string;
  email: string;
  username?: string;
  password?: string;
  basicAuthKey?: string;
  auth_channel?: string;
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
    username: '',
    password: '',
    status: 'Testing',
    rateLimitPerMinute: 60,
    markupPercentage: 0
  });

  // UI state
  const [showTestKey, setShowTestKey] = useState(false);
  const [showLiveKey, setShowLiveKey] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
          username: '',
          password: '',
          status: 'Testing',
          rateLimitPerMinute: 60,
          markupPercentage: 0
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create partner');
    }
  };

  const handleDeletePartner = async (partner: B2BClient) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to permanently delete "${partner.companyName}"?\n\nDeleting this partner will immediately revoke all API keys, access tokens, and API access.`
    );
    if (!isConfirmed) return;

    try {
      const res = await api.delete(`/api/admin/b2b-clients/${partner._id}`);
      if (res.data.success) {
        toast.success('B2B Partner deleted permanently and all access revoked.');
        setPartners(prev => prev.filter(p => p._id !== partner._id));
      }
    } catch (error: any) {
      console.error('Failed to delete partner', error);
      toast.error(error.response?.data?.error || 'Failed to delete partner');
    }
  };

  const copyToClipboard = (text: string) => {

    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const copyWelcomeKit = (partner: B2BClient) => {
    const text = `=========================================
TrippeChalo B2B Flight API Sandbox Access
=========================================
Company: ${partner.companyName}
Contact: ${partner.contactName} (${partner.email})

1. GAPI / OAUTH2 CREDENTIALS:
- Auth URL: https://api.trippechalo.com/api/v1/b2b/oauth2/tokens
- Username / Client ID: ${partner.username || 'N/A'}
- Password: ${partner.password || 'N/A'}
- Auth Channel: ${partner.auth_channel || 'cugtest.trippechalo.com'}
- Basic Auth Header: Basic ${partner.basicAuthKey || ''}

2. DIRECT API KEY:
- Test API Key (Header x-api-key): ${partner.testApiKey}

3. CORE ENDPOINTS:
- Sectors Query: GET /api/v1/b2b/search/sectors
- Flight Search: POST /api/v1/b2b/search/flights
- Flight Booking: POST /api/v1/b2b/flights/book

Documentation & Postman Collection: Check your official onboarding package.
=========================================`;
    navigator.clipboard.writeText(text);
    toast.success('Partner Welcome Kit copied to clipboard! Ready to share.');
  };

  const openDocs = (partner: B2BClient) => {
    setSelectedPartner(partner);
    setShowTestKey(false);
    setShowLiveKey(false);
    setShowPassword(false);
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
            <div key={partner._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col justify-between h-full">
              <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gray-50/50 min-h-[92px]">
                <div className="flex-1 pr-3 min-w-0">
                  <h3 className="font-bold text-lg text-gray-900 truncate" title={partner.companyName}>{partner.companyName}</h3>
                  <p className="text-sm text-gray-500 truncate mt-0.5" title={`${partner.contactName} • ${partner.email}`}>{partner.contactName} • {partner.email}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    partner.status === 'Live' ? 'bg-green-100 text-green-700 border-green-200' :
                    partner.status === 'Testing' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                    partner.status === 'Suspended' ? 'bg-red-100 text-red-700 border-red-200' :
                    'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    {partner.status}
                  </span>
                  <button 
                    onClick={() => {
                      setFormData({
                        companyName: partner.companyName,
                        contactName: partner.contactName,
                        email: partner.email,
                        username: partner.username || '',
                        password: partner.password || '',
                        status: partner.status,
                        rateLimitPerMinute: partner.rateLimitPerMinute,
                        markupPercentage: partner.markupPercentage
                      });
                      setIsAddModalOpen(true);
                    }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition"
                    title="Edit Partner"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeletePartner(partner)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                    title="Delete Partner & Revoke Access"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
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
                
                <div className="pt-2 mt-auto">
                  <button 
                    onClick={() => openDocs(partner)}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-lg transition text-sm font-medium shadow-sm"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-gray-400 text-xs">(Optional)</span></label>
                <input placeholder="e.g. Skyline Travels" type="text" className="w-full p-2 border border-gray-300 rounded-lg" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name <span className="text-gray-400 text-xs">(Optional)</span></label>
                  <input placeholder="Full Name" type="text" className="w-full p-2 border border-gray-300 rounded-lg" value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email <span className="text-gray-400 text-xs">(Optional)</span></label>
                  <input placeholder="agent@company.com" type="email" className="w-full p-2 border border-gray-300 rounded-lg" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Custom Credentials (Optional - Leave blank to auto-generate)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Username (Client ID)</label>
                    <input placeholder="Auto-generated if empty" type="text" className="w-full p-2 border border-gray-300 rounded-lg text-sm" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
                    <input placeholder="Auto-generated if empty" type="text" className="w-full p-2 border border-gray-300 rounded-lg text-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                </div>
              </div>
              
              <div className="pt-2 border-t border-gray-100">
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
              <div>
                <h2 className="font-bold text-lg flex items-center gap-2 text-gray-900">
                  <Key className="text-blue-600"/> API Credentials: {selectedPartner.companyName}
                </h2>
                <p className="text-xs text-gray-500">{selectedPartner.contactName} ({selectedPartner.email})</p>
              </div>
              <button onClick={() => setIsDocsModalOpen(false)} className="text-gray-500 hover:text-red-500"><XCircle size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-gray-50">
              
              {/* Quick Action Welcome Package Button */}
              <div className="flex justify-between items-center bg-blue-50 border border-blue-200 rounded-xl p-3.5">
                <div>
                  <div className="font-bold text-sm text-blue-900">Partner Onboarding Kit</div>
                  <div className="text-xs text-blue-600">Copy formatted credentials to send to partner via WhatsApp or Email.</div>
                </div>
                <button 
                  onClick={() => copyWelcomeKit(selectedPartner)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Copy size={14}/> Copy Welcome Kit
                </button>
              </div>

              {/* GAPI / Basic Auth Credentials Card */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3.5">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Activity size={16} className="text-emerald-600"/> GAPI / OAuth2 Authentication
                  </h3>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    POST /oauth2/tokens
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-gray-500 font-semibold mb-1">Username / Client ID</label>
                    <div className="flex">
                      <input 
                        type="text" 
                        readOnly 
                        value={selectedPartner.username || 'N/A'}
                        className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-l-lg font-mono text-gray-900 select-all"
                      />
                      <button onClick={() => copyToClipboard(selectedPartner.username || '')} className="px-2.5 bg-gray-100 border border-l-0 border-gray-200 rounded-r-lg hover:bg-gray-200 text-gray-600">
                        <Copy size={12}/>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-500 font-semibold mb-1">Password</label>
                    <div className="flex">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        readOnly 
                        value={selectedPartner.password || 'N/A'}
                        className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-l-lg font-mono text-gray-900 select-all"
                      />
                      <button onClick={() => setShowPassword(!showPassword)} className="px-2 bg-gray-100 border border-l-0 border-gray-200 hover:bg-gray-200 text-gray-600">
                        {showPassword ? <EyeOff size={12}/> : <Eye size={12}/>}
                      </button>
                      <button onClick={() => copyToClipboard(selectedPartner.password || '')} className="px-2.5 bg-gray-100 border border-l-0 border-gray-200 rounded-r-lg hover:bg-gray-200 text-gray-600">
                        <Copy size={12}/>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-500 text-xs font-semibold mb-1">Basic Auth Key (Base64)</label>
                  <div className="flex">
                    <input 
                      type="text" 
                      readOnly 
                      value={`Basic ${selectedPartner.basicAuthKey || ''}`}
                      className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-l-lg font-mono text-xs text-gray-900 select-all"
                    />
                    <button onClick={() => copyToClipboard(`Basic ${selectedPartner.basicAuthKey || ''}`)} className="px-3 bg-emerald-50 border border-l-0 border-emerald-200 rounded-r-lg hover:bg-emerald-100 text-emerald-700 font-semibold text-xs flex items-center gap-1">
                      <Copy size={12}/> Copy Header
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct API Keys Card */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Direct API Keys</h3>
                
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
