import React, { useEffect, useState } from 'react';
import { User, Users, Smartphone, LogOut, KeyRound, ChevronDown } from 'lucide-react';
import api from '../../../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, logout, selectCurrentUser } from '../../../store/authSlice';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import TopNavbar from '../../../components/layout/TopNavbar';
import Loader from '../../../components/common/Loader';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  nationality?: string;
  dob?: string;
  passportNumber?: string;
  passportExpiry?: string;
  issuingCountry?: string;
  panNumber?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);

  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    gender: '',
    nationality: '',
    dob: '',
    passportNumber: '',
    passportExpiry: '',
    issuingCountry: '',
    panNumber: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/api/users/profile');
      setProfile(data);
      
      const name = data.name || '';
      const nameParts = name.split(' ');
      
      setFormState({
        firstName: data.firstName || nameParts[0] || '',
        lastName: data.lastName || nameParts.slice(1).join(' ') || '',
        phone: data.phone || '',
        email: data.email || '',
        gender: data.gender || '',
        nationality: data.nationality || '',
        dob: data.dob ? data.dob.split('T')[0] : '', // format for input type="date"
        passportNumber: data.passportNumber || '',
        passportExpiry: data.passportExpiry ? data.passportExpiry.split('T')[0] : '',
        issuingCountry: data.issuingCountry || '',
        panNumber: data.panNumber || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const fullName = `${formState.firstName} ${formState.lastName}`.trim();
    
    const payload = {
      ...formState,
      name: fullName
    };

    const updatePromise = api.put('/api/users/profile', payload)
      .then(({ data }) => {
        setProfile(data);
        const token = localStorage.getItem('token');
        if (token) dispatch(setCredentials({ user: data, token }));
        return data;
      });

    toast.promise(updatePromise, {
      loading: 'Saving changes...',
      success: 'Profile updated successfully! 🎉',
      error: 'Failed to save changes'
    });
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  if (isLoading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2] font-sans pb-20 relative">
      <TopNavbar forceWhite={false} />

      {/* Fixed Background Header */}
      <div className="fixed top-0 left-0 w-full h-[320px] bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 z-0">
        {/* Subtle pattern or overlay could go here */}
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay"></div>
      </div>
      
      {/* Scrollable Content Wrapper */}
      <div className="relative z-10 w-full pt-28">
        
        {/* User Info Overlay - Scrolls with page */}
        <div className="max-w-[1200px] mx-auto px-6 flex items-center">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#11C19F] to-emerald-600 text-white flex flex-col items-center justify-center shadow-lg border-4 border-white/20">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <>
                  <User size={32} />
                  <span className="text-[10px] font-bold mt-1">Add Photo</span>
                </>
              )}
            </div>
            <div className="text-white">
              <h1 className="text-3xl font-black drop-shadow-md">{profile?.name || 'User'}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm font-medium opacity-90 drop-shadow-md">
                <span className="flex items-center gap-1">📞 {profile?.phone || 'Add Phone'}</span>
                <span className="flex items-center gap-1">✉️ {profile?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card - Has a gap (mt-12) from the profile info */}
        <div className="max-w-[1200px] mx-auto px-6 mt-12 relative pb-20">
          <div className="bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex min-h-[600px] items-start">
          
            {/* Left Sidebar Menu - Sticky */}
            <div className="w-[280px] border-r border-gray-200 bg-white py-6 flex flex-col sticky top-[80px] h-[calc(100vh-100px)] rounded-tl-xl rounded-bl-xl overflow-y-auto hidden-scrollbar">
              <div className="px-6 mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">MY ACCOUNT</p>
              </div>
              
              <nav className="flex flex-col gap-1 px-4">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <User size={18} /> My Profile
                </button>
                <button 
                  onClick={() => setActiveTab('travellers')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition ${activeTab === 'travellers' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Users size={18} /> Co-Travellers
                </button>
                <button 
                  onClick={() => setActiveTab('devices')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition ${activeTab === 'devices' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Smartphone size={18} /> Logged In Devices
                </button>
              </nav>

              <div className="mt-auto px-4 pb-4 space-y-1">
                <div className="border-t border-gray-100 my-4 mx-2"></div>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-gray-600 hover:bg-red-50 hover:text-red-600 transition"
                >
                  <LogOut size={18} /> Logout
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
                  <KeyRound size={18} /> Reset Password
                </button>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-gray-900">My Profile</h2>
              <button 
                onClick={() => handleUpdate()}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-2 rounded font-bold text-sm transition"
              >
                SAVE
              </button>
            </div>

            {/* Promo Banner */}
            <div className="bg-[#FFF8E7] border border-[#FDECB2] rounded-lg p-4 flex justify-between items-center mb-8">
              <div className="flex gap-4 items-center">
                <div className="text-2xl">🎁</div>
                <div>
                  <p className="font-bold text-sm text-gray-900">Planning a Birthday trip?</p>
                  <p className="text-xs text-gray-600">Please add your Date of Birth and enjoy a little surprise from us!</p>
                </div>
              </div>
              <button className="text-blue-600 font-bold text-sm">Add Date of Birth</button>
            </div>

            {/* General Information */}
            <div className="mb-10">
              <h3 className="font-bold text-lg text-gray-900 mb-4">General Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">First & Middle Name</label>
                  <input 
                    type="text" 
                    name="firstName"
                    value={formState.firstName}
                    onChange={handleChange}
                    className="w-full bg-transparent font-bold text-gray-900 focus:outline-none"
                  />
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Last Name</label>
                  <input 
                    type="text" 
                    name="lastName"
                    value={formState.lastName}
                    onChange={handleChange}
                    className="w-full bg-transparent font-bold text-gray-900 focus:outline-none"
                  />
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded p-3 flex justify-between items-center">
                  <div className="w-full">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Gender</label>
                    <select name="gender" value={formState.gender} onChange={handleChange} className="w-full bg-transparent font-bold text-gray-900 focus:outline-none appearance-none">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <ChevronDown size={16} className="text-gray-400 pointer-events-none" />
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded p-3 flex justify-between items-center">
                  <div className="w-full">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Nationality</label>
                    <input 
                      type="text"
                      name="nationality"
                      value={formState.nationality}
                      onChange={handleChange}
                      placeholder="e.g. Indian"
                      className="w-full bg-transparent font-bold text-gray-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="mb-10">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Contact Details</h3>
              <p className="text-xs text-gray-500 mb-4">Add contact information to receive booking details & other alerts</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded p-3 flex justify-between items-center">
                  <div className="w-full pr-4">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Mobile Number</label>
                    <input 
                      type="text" 
                      name="phone"
                      value={formState.phone}
                      onChange={handleChange}
                      className="w-full bg-transparent font-bold text-gray-900 focus:outline-none"
                    />
                  </div>
                  <button className="text-blue-600 font-bold text-sm">Edit</button>
                </div>
                <div className="border border-gray-200 rounded p-3 flex justify-between items-center">
                  <div className="w-full pr-4">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Email ID</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formState.email}
                      disabled
                      className="w-full bg-transparent font-bold text-gray-900 focus:outline-none opacity-80"
                    />
                  </div>
                  <button className="text-blue-600 font-bold text-sm">Edit</button>
                </div>
              </div>
            </div>

            {/* Documents Details */}
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Documents Details</h3>
              <p className="text-xs text-gray-500 mb-4">Add your documents for seamless international and domestic travel.</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Passport Number</label>
                  <input 
                    type="text" 
                    name="passportNumber"
                    value={formState.passportNumber}
                    onChange={handleChange}
                    className="w-full bg-transparent font-bold text-gray-900 focus:outline-none"
                  />
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Issuing Country</label>
                  <input 
                    type="text" 
                    name="issuingCountry"
                    value={formState.issuingCountry}
                    onChange={handleChange}
                    className="w-full bg-transparent font-bold text-gray-900 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Passport Expiry Date</label>
                  <input 
                    type="date" 
                    name="passportExpiry"
                    value={formState.passportExpiry}
                    onChange={handleChange}
                    className="w-full bg-transparent font-bold text-gray-900 focus:outline-none"
                  />
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">PAN Card Number</label>
                  <input 
                    type="text" 
                    name="panNumber"
                    value={formState.panNumber}
                    onChange={handleChange}
                    className="w-full bg-transparent font-bold text-gray-900 focus:outline-none uppercase"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Close Scrollable Content Wrapper */}
      </div>
    </div>
  );
}
