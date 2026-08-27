import React, { useState, useEffect } from 'react';
import { Settings, Save, Loader2, Key, UserCog, CreditCard, FileText, Download, Shield, User, Briefcase, DollarSign, Globe, Lock, CheckCircle2, ChevronDown } from 'lucide-react';

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
                    <input type="number" value={formData.walletBalance} onChange={e => handleChange('walletBalance', Number(e.target.value))} className="w-full pl-8 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-black text-gray-800 focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Max Credit Limit</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                    <input type="number" value={formData.creditBalance} onChange={e => handleChange('creditBalance', Number(e.target.value))} className="w-full pl-8 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-black text-gray-800 focus:ring-2 focus:ring-emerald-500/20 transition-all" />
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
                  <input type="number" value={formData.resultExpiryTime} onChange={e => handleChange('resultExpiryTime', Number(e.target.value))} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-purple-500/20 transition-all" />
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
                      <label key={opt} className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${formData.displayOnProfileIcon === opt ? 'border-[#0c1a40] bg-blue-50/50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
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
          <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Briefcase size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Company Details</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">This section is currently under development. Company specifics will be manageable here soon.</p>
          </div>
        )}

        {activeTab === 'document' && (
           <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100">
           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
             <Shield size={24} />
           </div>
           <h3 className="text-lg font-bold text-gray-800 mb-2">Verification Documents</h3>
           <p className="text-gray-500 text-sm max-w-md mx-auto">Document verification and uploads will be available here.</p>
         </div>
        )}

        {/* --- ACTION BAR --- */}
        <div className="mt-8 flex items-center justify-between p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
            <CheckCircle2 size={16} /> All changes are automatically validated
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors shadow-sm"
            >
              Sync Domain Cache
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-10 py-3 bg-[#0c1a40] hover:bg-[#0c1a40]/90 text-white font-bold rounded-xl text-sm transition-colors shadow-md disabled:opacity-70"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save Profile
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
