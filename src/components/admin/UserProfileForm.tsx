import React, { useState, useEffect } from 'react';
import { Settings, Save, Loader2, Key, UserCog, CreditCard, FileText, Download, Shield, User, Briefcase, DollarSign, Globe, Lock, CheckCircle2, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface UserProfileFormProps {
  initialData: any;
  onSave: (data: any) => Promise<void>;
  isSaving: boolean;
  isAdminViewingSelf?: boolean;
}

export default function UserProfileForm({ initialData, onSave, isSaving, isAdminViewingSelf = false }: UserProfileFormProps) {
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState<any>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountStateOpen, setIsAccountStateOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        firstName: initialData.firstName || initialData.name?.split(' ')[0] || '',
        lastName: initialData.lastName || initialData.name?.split(' ').slice(1).join(' ') || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        role: initialData.role || 'USER',
        companyName: initialData.companyName || '',
        walletBalance: initialData.walletBalance || 0,
        creditBalance: initialData.creditBalance || 0,
        isActive: initialData.isActive ?? true,
        resultExpiryTime: initialData.resultExpiryTime || 0,
        otpTime: initialData.otpTime || '',
        requiredTravelDate: initialData.requiredTravelDate || false,
        extendedDomain: initialData.extendedDomain || '',
        irctcAgentId: initialData.irctcAgentId || '',
        displayOnProfileIcon: initialData.displayOnProfileIcon || 'User Name',
        referredBy: initialData.referredBy || '',
        reportingTo: initialData.reportingTo || '',
        services: initialData.services || '',
        businessType: initialData.businessType || '',
        iataCode: initialData.iataCode || '',
        contactRepresentative: initialData.contactRepresentative || '',
        nameOnPan: initialData.nameOnPan || '',
        commGrp: initialData.commGrp || '',
        marqueesDetail: initialData.marqueesDetail || '',
        negoMarqueesDetail: initialData.negoMarqueesDetail || '',
        salesContactNo: initialData.salesContactNo || '',
        website: initialData.website || '',
        officePhone: initialData.officePhone || '',
        country: initialData.country || '',
        isVerified: initialData.isVerified || false,
        isOwner: initialData.isOwner || false,
        isLoginUser: initialData.isLoginUser || false,
        youtubeUrl: initialData.youtubeUrl || '',
        linkedinUrl: initialData.linkedinUrl || '',
        facebookUrl: initialData.facebookUrl || '',
        instagramUrl: initialData.instagramUrl || '',
        twitterUrl: initialData.twitterUrl || '',
        gstEnabled: initialData.gstEnabled || false,
        gstCompanyName: initialData.gstCompanyName || '',
        gstCompanyAddress: initialData.gstCompanyAddress || '',
        gstEmail: initialData.gstEmail || '',
        gstContactNo: initialData.gstContactNo || '',
        cugPlatformSellingCharge: initialData.cugPlatformSellingCharge || 0,
        cugPlatformBuyingCharge: initialData.cugPlatformBuyingCharge || 0,
        documents: initialData.documents || [],
        isApprovedDocument: initialData.isApprovedDocument || false,
        city: initialData.city || '',
        state: initialData.state || '',
        gstn: initialData.gstn || '',
        officeAddress: initialData.officeAddress || '',
        pincode: initialData.pincode || '',
        panNumber: initialData.panNumber || '',
      });
    }
  }, [initialData]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (submitData.firstName || submitData.lastName) {
      submitData.name = `${submitData.firstName} ${submitData.lastName}`.trim();
    }
    submitData.walletBalance = Number(submitData.walletBalance) || 0;
    submitData.creditBalance = Number(submitData.creditBalance) || 0;
    submitData.resultExpiryTime = Number(submitData.resultExpiryTime) || 0;
    submitData.cugPlatformSellingCharge = Number(submitData.cugPlatformSellingCharge) || 0;
    submitData.cugPlatformBuyingCharge = Number(submitData.cugPlatformBuyingCharge) || 0;
    onSave(submitData);
  };

  const TABS = [
    { id: 'personal', label: 'Overview & Settings' },
    { id: 'company', label: 'Business Profile' },
    { id: 'document', label: 'Verification Docs' },
  ];

  return (
    <div className="bg-gray-50/30 rounded-2xl flex flex-col font-sans">
      {/* Modern Tabs */}
      <div className="flex gap-2 p-2 bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-[#0c1a40] text-white shadow-md' 
                : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === 'personal' && (
          <div className="space-y-6">
            
            {/* --- SECTION: Identity --- */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User size={20} /></div>
                <h3 className="text-lg font-black text-gray-800">Identity Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">First Name</label>
                  <input type="text" value={formData.firstName} onChange={e => handleChange('firstName', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Last Name</label>
                  <input type="text" value={formData.lastName} onChange={e => handleChange('lastName', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input type="email" value={formData.email} disabled className="w-full px-4 py-3 bg-gray-100/50 border-none rounded-xl text-sm font-medium text-gray-400 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contact Number</label>
                  <input type="text" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Access Level</label>
                  <div className="w-full px-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-black uppercase tracking-wide">
                    {formData.role === 'B2B_AGENT' ? 'TRC B2B' : formData.role}
                  </div>
                </div>
              </div>
            </div>

            {/* --- SECTION: Financials --- */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><DollarSign size={20} /></div>
                <h3 className="text-lg font-black text-gray-800">Financial Setup</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Wallet Balance</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                    <input type="text" value={formData.walletBalance} disabled className="w-full pl-8 pr-4 py-3 bg-gray-100/50 border-none rounded-xl text-sm font-black text-gray-500 cursor-not-allowed transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Max Credit Limit</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                    <input type="text" value={formData.creditBalance} disabled className="w-full pl-8 pr-4 py-3 bg-gray-100/50 border-none rounded-xl text-sm font-black text-gray-500 cursor-not-allowed transition-all" />
                  </div>
                </div>
              </div>
            </div>

            {/* --- SECTION: System Config --- */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Settings size={20} /></div>
                <h3 className="text-lg font-black text-gray-800">System Configuration</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Account State</label>
                  <div className="relative">
                    <button 
                      type="button" 
                      onClick={() => setIsAccountStateOpen(!isAccountStateOpen)} 
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-bold text-gray-800 focus:border-purple-200 focus:ring-4 focus:ring-purple-500/10 transition-all flex items-center justify-between shadow-sm"
                    >
                      <span className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full shadow-sm ${formData.isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        {formData.isActive ? 'Active Account' : 'Suspended/Inactive'}
                      </span>
                      <ChevronDown size={16} className={`text-gray-400 transition-transform ${isAccountStateOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isAccountStateOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsAccountStateOpen(false)} />
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                          <button 
                            type="button"
                            onClick={() => { handleChange('isActive', true); setIsAccountStateOpen(false); }}
                            className={`w-full text-left px-4 py-3 text-sm font-bold flex items-center gap-3 transition-colors ${formData.isActive ? 'text-blue-700 bg-blue-50/50' : 'text-gray-700 hover:bg-gray-50'}`}
                          >
                            <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm" /> Active Account
                          </button>
                          <button 
                            type="button"
                            onClick={() => { handleChange('isActive', false); setIsAccountStateOpen(false); }}
                            className={`w-full text-left px-4 py-3 text-sm font-bold flex items-center gap-3 transition-colors ${!formData.isActive ? 'text-blue-700 bg-blue-50/50' : 'text-gray-700 hover:bg-gray-50'}`}
                          >
                            <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm" /> Suspended/Inactive
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Search Timeout (Mins)</label>
                  <input type="text" value={formData.resultExpiryTime} onChange={e => handleChange('resultExpiryTime', e.target.value.replace(/[^0-9.]/g, ''))} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-purple-500/20 transition-all" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">OTP Validity Duration</label>
                  <input type="text" value={formData.otpTime} onChange={e => handleChange('otpTime', e.target.value)} placeholder="e.g. 1440" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-purple-500/20 transition-all" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">IRCTC Auth ID</label>
                  <input type="text" value={formData.irctcAgentId} onChange={e => handleChange('irctcAgentId', e.target.value)} placeholder="Auth ID..." className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-purple-500/20 transition-all" />
                </div>
                
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Shared API Domain</label>
                  <input type="text" value={formData.extendedDomain} onChange={e => handleChange('extendedDomain', e.target.value)} placeholder="Enter extended domain URL..." className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-purple-500/20 transition-all" />
                </div>

                <div className="lg:col-span-3 pt-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Profile Display Preference</label>
                  <div className="flex flex-wrap gap-4">
                    {['Company Name', 'User Name', 'Show Both'].map(opt => (
                      <label key={opt} onClick={() => handleChange('displayOnProfileIcon', opt)} className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${formData.displayOnProfileIcon === opt ? 'border-[#0c1a40] bg-blue-50/50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.displayOnProfileIcon === opt ? 'border-[#0c1a40]' : 'border-gray-300'}`}>
                          {formData.displayOnProfileIcon === opt && <div className="w-2 h-2 rounded-full bg-[#0c1a40]" />}
                        </div>
                        <span className="text-sm font-bold text-gray-700">{opt}</span>
                      </label>
                    ))}
                    
                    <label className="flex items-center gap-3 px-6 py-3 ml-auto rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                      <input type="checkbox" checked={formData.requiredTravelDate} onChange={e => handleChange('requiredTravelDate', e.target.checked)} className="w-4 h-4 text-[#0c1a40] rounded border-gray-300" />
                      <span className="text-sm font-bold text-gray-700">Enforce Required Travel Date</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* --- SECTION: Organization --- */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Briefcase size={20} /></div>
                <h3 className="text-lg font-black text-gray-800">Organization Hierarchy</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Registered Company</label>
                  <div className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-black text-gray-800 uppercase">
                    {formData.companyName || 'Not Set'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Referred By</label>
                  <input type="text" value={formData.referredBy} onChange={e => handleChange('referredBy', e.target.value)} placeholder="Referral Code/Name" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-orange-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Manager / Reports To</label>
                  <input type="text" value={formData.reportingTo} onChange={e => handleChange('reportingTo', e.target.value)} placeholder="Manager ID" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-orange-500/20 transition-all" />
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'company' && (
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Company</label>
                  <input type="text" value={formData.companyName} onChange={e => handleChange('companyName', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Services</label>
                  <input type="text" value={formData.services} onChange={e => handleChange('services', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Business Type</label>
                  <div className="relative custom-dropdown">
                    <select value={formData.businessType} onChange={e => handleChange('businessType', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer">
                      <option value="">--Select Business Type--</option>
                      <option value="B2B">B2B</option>
                      <option value="B2C">B2C</option>
                      <option value="Supplier">Supplier</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">IATA</label>
                  <div className="relative custom-dropdown">
                    <select value={formData.iataCode} onChange={e => handleChange('iataCode', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer">
                      <option value="">--Select IATA--</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contact Representative</label>
                  <input type="text" value={formData.contactRepresentative} onChange={e => handleChange('contactRepresentative', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Name On PAN</label>
                  <input type="text" value={formData.nameOnPan} onChange={e => handleChange('nameOnPan', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">City</label>
                  <input type="text" value={formData.city} onChange={e => handleChange('city', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">State</label>
                  <input type="text" value={formData.state} onChange={e => handleChange('state', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Comm Grp</label>
                  <input type="text" value={formData.commGrp} onChange={e => handleChange('commGrp', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Global Marquee Display</label>
                  <textarea value={formData.marqueesDetail} onChange={e => handleChange('marqueesDetail', e.target.value)} rows={3} placeholder="please write here......" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Youtube Url</label>
                  <input type="text" value={formData.youtubeUrl} onChange={e => handleChange('youtubeUrl', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Linkdin Url</label>
                  <input type="text" value={formData.linkedinUrl} onChange={e => handleChange('linkedinUrl', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Facebook Url</label>
                  <input type="text" value={formData.facebookUrl} onChange={e => handleChange('facebookUrl', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">GST No</label>
                  <input type="text" value={formData.gstn} onChange={e => handleChange('gstn', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Registered GST Address</label>
                  <input type="text" value={formData.gstCompanyAddress} onChange={e => handleChange('gstCompanyAddress', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Registered GST Email</label>
                  <input type="email" value={formData.gstEmail} onChange={e => handleChange('gstEmail', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">B2B Sales Fee</label>
                  <input type="text" value={formData.cugPlatformSellingCharge} onChange={e => handleChange('cugPlatformSellingCharge', e.target.value.replace(/[^0-9.]/g, ''))} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                  <input type="email" value={formData.email} disabled className="w-full px-4 py-3 bg-gray-100/50 border-none rounded-xl text-sm font-medium text-gray-400 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sales Contact No.</label>
                  <input type="text" value={formData.salesContactNo} onChange={e => handleChange('salesContactNo', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Website</label>
                  <input type="text" value={formData.website} onChange={e => handleChange('website', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Office Phone</label>
                  <input type="text" value={formData.officePhone} onChange={e => handleChange('officePhone', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">PAN No</label>
                  <input type="text" value={formData.panNumber} onChange={e => handleChange('panNumber', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Address</label>
                  <input type="text" value={formData.officeAddress} onChange={e => handleChange('officeAddress', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">PIN Code</label>
                  <input type="text" value={formData.pincode} onChange={e => handleChange('pincode', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Country</label>
                  <input type="text" value={formData.country} onChange={e => handleChange('country', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                
                <div className="flex gap-6 py-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isVerified} onChange={e => handleChange('isVerified', e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                    <span className="text-sm font-bold text-gray-700">Verified</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isOwner} onChange={e => handleChange('isOwner', e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                    <span className="text-sm font-bold text-gray-700">Owner</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isLoginUser} onChange={e => handleChange('isLoginUser', e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                    <span className="text-sm font-bold text-gray-700">Login User</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Custom B2B Marquee</label>
                  <textarea value={formData.negoMarqueesDetail} onChange={e => handleChange('negoMarqueesDetail', e.target.value)} rows={3} placeholder="please write here......" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Instagram Url</label>
                  <input type="text" value={formData.instagramUrl} onChange={e => handleChange('instagramUrl', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Twitter Url</label>
                  <input type="text" value={formData.twitterUrl} onChange={e => handleChange('twitterUrl', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                
                <div className="py-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.gstEnabled} onChange={e => handleChange('gstEnabled', e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                    <span className="text-sm font-bold text-gray-700">GST Enable</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Registered GST Entity</label>
                  <input type="text" value={formData.gstCompanyName} onChange={e => handleChange('gstCompanyName', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Registered GST Phone</label>
                  <input type="text" value={formData.gstContactNo} onChange={e => handleChange('gstContactNo', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">B2B Purchasing Fee</label>
                  <input type="number" value={formData.cugPlatformBuyingCharge} onChange={e => handleChange('cugPlatformBuyingCharge', Number(e.target.value))} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>

              </div>
            </div>
          </div>
        )}

        {activeTab === 'document' && (
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <label className="w-1/3 text-xs font-bold text-gray-500 uppercase tracking-wider">GST Certificate</label>
                  <input type="file" className="w-2/3 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 cursor-pointer" />
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-1/3 text-xs font-bold text-gray-500 uppercase tracking-wider">Address Proof</label>
                  <input type="file" required={activeTab === 'document'} className="w-2/3 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 cursor-pointer" />
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <label className="w-1/3 text-xs font-bold text-gray-500 uppercase tracking-wider">PAN Card</label>
                  <input type="file" required={activeTab === 'document'} className="w-2/3 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 cursor-pointer" />
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-1/3 text-xs font-bold text-gray-500 uppercase tracking-wider">Aadhaar Card</label>
                  <input type="file" required={activeTab === 'document'} className="w-2/3 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="flex justify-center items-center gap-6 mb-8">
              <label className="flex items-center gap-2 cursor-pointer px-4 py-2">
                <input type="checkbox" checked={formData.isApprovedDocument} onChange={e => handleChange('isApprovedDocument', e.target.checked)} className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500" />
                <span className="text-sm font-bold text-gray-700 bg-orange-600 text-white px-4 py-2 rounded-lg">Approve</span>
              </label>
              <button type="submit" disabled={isSaving} className="px-10 py-3 bg-[#0c1a40] hover:bg-[#0c1a40]/90 text-white font-bold rounded-xl text-sm transition-colors shadow-md disabled:opacity-70">
                Update
              </button>
            </div>

            {/* Document Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-blue-500 text-white text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 font-semibold border-r border-blue-400">Sr No.</th>
                    <th className="px-4 py-3 font-semibold border-r border-blue-400">Doc Name</th>
                    <th className="px-4 py-3 font-semibold border-r border-blue-400">Doc Type</th>
                    <th className="px-4 py-3 font-semibold border-r border-blue-400">Uploaded On</th>
                    <th className="px-4 py-3 font-semibold text-center">Download</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {formData.documents && formData.documents.length > 0 ? (
                    formData.documents.map((doc: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-100">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-100">{doc.docName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-100">{doc.docType}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-100">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm text-center">
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-semibold underline">Download</a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500 font-medium">No documents uploaded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- ACTION BAR --- */}
        <div className="mt-8 flex items-center justify-between p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
            <CheckCircle2 size={16} /> All changes are automatically validated
          </div>
          <div className="flex flex-col gap-3">
            {activeTab === 'personal' && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    const loadingToast = toast.loading('Syncing cache...');
                    await api.post('/api/users/sync-domain-cache');
                    toast.success('Domain Cache successfully synchronized!', { id: loadingToast });
                  } catch (e: any) {
                    toast.error(e.response?.data?.message || 'Failed to sync domain cache');
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-10 py-3 bg-[#0c1a40] hover:bg-[#0c1a40]/90 text-white font-bold rounded-xl text-sm transition-colors shadow-md"
              >
                Update Domain Cache
              </button>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 px-10 py-3 bg-[#0c1a40] hover:bg-[#0c1a40]/90 text-white font-bold rounded-xl text-sm transition-colors shadow-md disabled:opacity-70"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Update
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
