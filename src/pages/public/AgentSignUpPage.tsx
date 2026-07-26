import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, ArrowRight, Upload, CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '../../services/api';
import Dropdown from '../../components/ui/Dropdown';
import toast from 'react-hot-toast';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh'
];

const stateOptions = INDIAN_STATES.map(s => ({ value: s, label: s }));

const idProofOptions = [
  { value: 'Aadhaar Card', label: 'Aadhaar Card' },
  { value: 'Passport', label: 'Passport' },
  { value: 'Voter ID', label: 'Voter ID' },
  { value: 'Driving License', label: 'Driving License' }
];

const AgentSignUpPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    officeAddress: '',
    state: '',
    city: '',
    pincode: '',
    panNumber: '',
    panCardImage: '',
    idProofType: 'Aadhaar Card',
    idProofImage: '',
    gstn: '',
    gstImage: '',
    remarks: '',
  });

  const [fileNameMap, setFileNameMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be under 2MB');
        return;
      }
      setFileNameMap(prev => ({ ...prev, [fieldName]: file.name }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [fieldName]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.companyName || !formData.firstName || !formData.phone || !formData.email || !formData.state || !formData.city || !formData.panNumber) {
      setError('Please fill in all mandatory fields marked with *');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/auth/register-agent', formData);
      if (response.status === 201) {
        setSuccessModal(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Agent registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-800 flex flex-col">
      {/* Header Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
              TC
            </div>
            <div>
              <span className="text-xl font-black text-[#0c1a40] tracking-tight">TRIPPE<span className="text-blue-600">CHALO</span></span>
              <span className="block text-[9px] text-gray-400 font-semibold tracking-widest uppercase -mt-1">B2B Portal</span>
            </div>
          </Link>
          
          <nav className="hidden md:flex gap-6 text-sm font-semibold text-gray-600">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <a href="#" className="hover:text-blue-600 transition-colors">About Us</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Contact Us</a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-bold text-amber-800">
            <Phone size={14} className="text-amber-600" />
            <span>Call Us: +91 9555934205</span>
          </div>

          <Link to="/b2b/login" className="bg-[#0b1338] text-white px-5 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 hover:bg-blue-900 transition-all shadow-sm">
            <span>Register / Login</span>
            <ArrowRight size={14} />
          </Link>

          <Link to="/supplier/login" className="border border-gray-300 text-gray-700 px-4 py-1.5 rounded-full font-bold text-xs hover:border-blue-600 hover:text-blue-600 transition-all">
            Supplier Login ↗
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-[#0c1a40] tracking-tight uppercase">Agent Sign Up</h1>
            <p className="text-xs text-gray-500 mt-1">Register your travel agency to get access to B2B published & series fares</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center gap-3 text-red-700 text-sm">
              <ShieldAlert size={20} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Company, First Name, Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Company Name *</label>
                <input 
                  type="text" 
                  name="companyName" 
                  value={formData.companyName} 
                  onChange={handleInputChange} 
                  required
                  placeholder="Your Agency Name" 
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">First Name *</label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleInputChange} 
                  required
                  placeholder="First Name" 
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Last Name *</label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleInputChange} 
                  required
                  placeholder="Last Name" 
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Row 2: Mobile, Email, Office Address */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number *</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  required
                  placeholder="10-digit phone number" 
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Id *</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  required
                  placeholder="official@agency.com" 
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Password *</label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleInputChange} 
                  required
                  placeholder="Account Password" 
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Row 3: Office Address, State, City, Pincode */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">Office Address *</label>
                <input 
                  type="text" 
                  name="officeAddress" 
                  value={formData.officeAddress} 
                  onChange={handleInputChange} 
                  required
                  placeholder="Full Office Address" 
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">State *</label>
                <Dropdown 
                  value={formData.state}
                  onChange={(val) => setFormData(prev => ({ ...prev, state: val }))}
                  options={stateOptions}
                  placeholder="-- Select State --"
                  className="w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">City *</label>
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleInputChange} 
                  required
                  placeholder="City" 
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Row 4: Pincode, PAN Number, PAN Copy */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Pincode *</label>
                <input 
                  type="text" 
                  name="pincode" 
                  value={formData.pincode} 
                  onChange={handleInputChange} 
                  required
                  placeholder="Pincode" 
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">PAN Card Number *</label>
                <input 
                  type="text" 
                  name="panNumber" 
                  value={formData.panNumber} 
                  onChange={handleInputChange} 
                  required
                  placeholder="10-character PAN" 
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">PAN Card Image *</label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                  <label className="bg-blue-50 text-blue-700 px-4 py-2.5 text-xs font-bold cursor-pointer hover:bg-blue-100 shrink-0 border-r border-gray-200 flex items-center gap-1.5">
                    <Upload size={14} />
                    Choose File
                    <input type="file" accept="image/*,.pdf" onChange={e => handleFileUpload(e, 'panCardImage')} className="hidden" />
                  </label>
                  <span className="text-xs text-gray-500 px-3 truncate">{fileNameMap['panCardImage'] || 'No file chosen'}</span>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">Max 2 MB - JPG / PNG / PDF</span>
              </div>
            </div>

            {/* Row 5: ID Proof Type, ID Copy, GST Number */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Address / Identity Proof *</label>
                <Dropdown 
                  value={formData.idProofType}
                  onChange={(val) => setFormData(prev => ({ ...prev, idProofType: val }))}
                  options={idProofOptions}
                  placeholder="Select ID Proof Type"
                  className="w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Address / Identity Proof Copy *</label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                  <label className="bg-blue-50 text-blue-700 px-4 py-2.5 text-xs font-bold cursor-pointer hover:bg-blue-100 shrink-0 border-r border-gray-200 flex items-center gap-1.5">
                    <Upload size={14} />
                    Choose File
                    <input type="file" accept="image/*,.pdf" onChange={e => handleFileUpload(e, 'idProofImage')} className="hidden" />
                  </label>
                  <span className="text-xs text-gray-500 px-3 truncate">{fileNameMap['idProofImage'] || 'No file chosen'}</span>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">Max 2 MB - JPG / PNG / PDF</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">GST Number (Optional)</label>
                <input 
                  type="text" 
                  name="gstn" 
                  value={formData.gstn} 
                  onChange={handleInputChange} 
                  placeholder="GSTIN" 
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                />
              </div>
            </div>

            {/* Row 6: GST Copy, Remarks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">GST Copy Image (Optional)</label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                  <label className="bg-blue-50 text-blue-700 px-4 py-2.5 text-xs font-bold cursor-pointer hover:bg-blue-100 shrink-0 border-r border-gray-200 flex items-center gap-1.5">
                    <Upload size={14} />
                    Choose File
                    <input type="file" accept="image/*,.pdf" onChange={e => handleFileUpload(e, 'gstImage')} className="hidden" />
                  </label>
                  <span className="text-xs text-gray-500 px-3 truncate">{fileNameMap['gstImage'] || 'No file chosen'}</span>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">Max 2 MB - JPG / PNG / PDF</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Remarks</label>
                <input 
                  type="text" 
                  name="remarks" 
                  value={formData.remarks} 
                  onChange={handleInputChange} 
                  placeholder="Any additional notes" 
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-center items-center gap-4 pt-6 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => navigate('/')} 
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold text-sm px-10 py-2.5 rounded-full transition-all shadow-sm"
              >
                BACK
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="bg-[#0b1338] hover:bg-blue-900 text-white font-bold text-sm px-12 py-2.5 rounded-full transition-all shadow-md flex items-center gap-2"
              >
                {loading ? 'SUBMITTING...' : 'SIGN UP'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Approval Pending Success Modal */}
      {successModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-gray-100">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-black text-[#0c1a40] mb-2">Registration Submitted!</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-6">
              Your agent application has been received and is currently <span className="font-bold text-amber-600">Pending Approval</span> from the Super Admin. You will receive an email once your account is verified and activated.
            </p>
            <button 
              onClick={() => navigate('/b2b/login')} 
              className="w-full bg-[#0b1338] hover:bg-blue-900 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md"
            >
              Back to Agent Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentSignUpPage;
