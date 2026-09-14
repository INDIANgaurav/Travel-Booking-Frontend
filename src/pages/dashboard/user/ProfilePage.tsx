import React, { useEffect, useState, useRef } from 'react';
import { User, Users, Smartphone, LogOut, KeyRound, ChevronDown, Building2, Camera, Pencil } from 'lucide-react';
import api from '../../../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, logout, selectCurrentUser } from '../../../store/authSlice';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import TopNavbar from '../../../components/layout/TopNavbar';
import Loader from '../../../components/common/Loader';
import Dropdown from '../../../components/ui/Dropdown';
import DOBCalendar from '../../../components/ui/DOBCalendar';
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
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target as Node)) {
        setIsAvatarMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const fetchMyProperties = async () => {
    try {
      setLoadingProperties(true);
      const token = localStorage.getItem('token');
      const { data } = await api.get('/api/hotels/my-properties', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyProperties(data);
    } catch (error) {
      console.error('Failed to fetch properties', error);
    } finally {
      setLoadingProperties(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'properties') {
      fetchMyProperties();
    }
  }, [activeTab]);

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setIsUploadingAvatar(true);
      const { data } = await api.put('/api/users/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setProfile(prev => prev ? { ...prev, avatar: data.avatar } : null);
      const token = localStorage.getItem('token');
      if (token) dispatch(setCredentials({ user: data, token }));
      
      toast.success('Profile picture updated! 📸');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload picture');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAvatar = async () => {
    if (!currentUser?.avatar) return;
    
    try {
      setIsUploadingAvatar(true);
      setIsAvatarMenuOpen(false);
      const { data } = await api.delete('/api/users/profile-picture');
      
      setProfile(prev => prev ? { ...prev, avatar: '' } : null);
      const token = localStorage.getItem('token');
      if (token) dispatch(setCredentials({ user: data, token }));
      
      toast.success('Profile picture deleted! 🗑️');
    } catch (error: any) {
      toast.error('Failed to delete picture');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleLogout = () => {
    navigate('/');
    setTimeout(() => {
      dispatch(logout());
    }, 0);
  };

  if (isLoading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen font-sans pb-20 relative overflow-hidden bg-[#e0e7ff]">
      {/* Fullscreen Image Viewer */}
      {isImageViewerOpen && currentUser?.avatar && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center backdrop-blur-sm" onClick={() => setIsImageViewerOpen(false)}>
          <button 
            className="absolute top-6 right-6 text-white hover:text-gray-300 bg-black/50 p-2 rounded-full transition-colors"
            onClick={() => setIsImageViewerOpen(false)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          <img 
            src={currentUser.avatar} 
            alt="Profile" 
            className="max-w-[90%] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Full Page Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-200"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 mix-blend-overlay"></div>
        
        {/* Animated Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400/40 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-[40%] right-[-10%] w-[700px] h-[700px] bg-purple-400/30 rounded-full blur-[140px]" style={{ animation: 'pulse 8s infinite alternate' }}></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[800px] h-[800px] bg-pink-300/30 rounded-full blur-[150px]" style={{ animation: 'pulse 12s infinite alternate' }}></div>
      </div>

      {/* Header Image Overlay (Top only) */}
      <div className="absolute top-0 left-0 w-full h-[350px] bg-[url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center z-0 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-indigo-900/60 to-purple-900/80 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#e0e7ff] via-transparent to-transparent"></div>
      </div>
      
      {/* Scrollable Content Wrapper */}
      <div className="relative z-10 w-full pt-[140px]">
        
        {/* User Info Overlay - Scrolls with page */}
        <div className="max-w-[1200px] mx-auto px-6 flex items-end pb-4">
          <div className="flex items-end gap-6">
            <div 
              className="relative group transition-transform duration-300"
              ref={avatarMenuRef}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarUpload} 
              />
              <div 
                className="w-[120px] h-[120px] rounded-full bg-[#11C19F] text-white flex flex-col items-center justify-center shadow-md border-4 border-[#F2F2F2] overflow-hidden relative z-10 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
              >
                {isUploadingAvatar ? (
                  <div className="flex flex-col items-center justify-center w-full h-full bg-black/50">
                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                ) : currentUser?.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt="Avatar" 
                    className="w-full h-full object-cover group-hover:brightness-90 transition" 
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'User')}&background=0D8ABC&color=fff&size=200`;
                    }}
                  />
                ) : (
                  <>
                    <Camera size={28} className="mb-1" />
                    <span className="text-[10px] font-bold tracking-wide">Add Photo</span>
                  </>
                )}
              </div>
              <div 
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-[#F2F2F2] shadow-sm hover:bg-blue-700 transition z-20 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Pencil size={14} />
              </div>

              {/* Dropdown Menu */}
              {isAvatarMenuOpen && (
                <div className="absolute top-[130px] left-0 bg-white shadow-xl rounded-xl border border-gray-100 py-2 w-40 z-50 animate-in fade-in zoom-in-95 duration-200">
                  {currentUser?.avatar && (
                    <button 
                      onClick={() => {
                        setIsImageViewerOpen(true);
                        setIsAvatarMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      View Image
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      fileInputRef.current?.click();
                      setIsAvatarMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    Change Image
                  </button>
                  {currentUser?.avatar && (
                    <button 
                      onClick={handleDeleteAvatar}
                      className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      Delete Image
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="text-white mb-2 filter drop-shadow-md">
              <h1 className="text-3xl font-black flex items-center gap-3 drop-shadow-lg">
                {profile?.name || 'User'}
                {currentUser?.roles?.includes('B2B_AGENT') && (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                    currentUser.agentStatus === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-200' :
                    currentUser.agentStatus === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' :
                    'bg-yellow-100 text-yellow-700 border-yellow-200'
                  }`}>
                    {currentUser.agentStatus === 'INCOMPLETE' ? 'PENDING' : (currentUser.agentStatus || 'PENDING')} AGENT
                  </span>
                )}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm font-bold text-white/90 drop-shadow">
                <span className="flex items-center gap-1.5"><Smartphone size={14}/> {profile?.phone || 'Add Phone'}</span>
                <span className="flex items-center gap-1.5"><User size={14}/> {profile?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="max-w-[1200px] mx-auto px-6 mt-12 relative pb-20">
          <div className="bg-gradient-to-br from-slate-50/90 to-blue-50/80 backdrop-blur-3xl border border-white/60 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.06)] flex min-h-[600px] items-start overflow-hidden relative">
            {/* Subtle inner glow */}
            <div className="absolute top-0 left-1/4 w-1/2 h-full bg-blue-100/30 blur-3xl rounded-full pointer-events-none"></div>
          
            {/* Left Sidebar Menu - Sticky */}
            <div className="w-[280px] border-r border-gray-100 bg-gray-50/30 py-8 flex flex-col sticky top-[80px] h-[calc(100vh-100px)] overflow-y-auto hidden-scrollbar">
              <div className="px-8 mb-6">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">MY ACCOUNT</p>
              </div>
              
              <nav className="flex flex-col gap-2 px-4">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'profile' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 translate-x-1' : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-blue-600'}`}
                >
                  <User size={18} className={activeTab === 'profile' ? 'text-blue-200' : ''} /> My Profile
                </button>
                <button 
                  onClick={() => setActiveTab('travellers')}
                  className={`flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'travellers' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 translate-x-1' : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-blue-600'}`}
                >
                  <Users size={18} className={activeTab === 'travellers' ? 'text-blue-200' : ''} /> Co-Travellers
                </button>
                <button 
                  onClick={() => setActiveTab('devices')}
                  className={`flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'devices' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 translate-x-1' : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-blue-600'}`}
                >
                  <Smartphone size={18} className={activeTab === 'devices' ? 'text-blue-200' : ''} /> Logged In Devices
                </button>
                <button 
                  onClick={() => setActiveTab('properties')}
                  className={`flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'properties' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 translate-x-1' : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-blue-600'}`}
                >
                  <Building2 size={18} className={activeTab === 'properties' ? 'text-blue-200' : ''} /> My Properties
                </button>
              </nav>

              <div className="mt-auto px-4 pb-4 space-y-1">
                <div className="border-t border-gray-200 my-6 mx-4"></div>
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
            <div className="flex-1 p-10 relative z-10">
            
            {activeTab === 'profile' && (
              <>
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200/60">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">My Profile</h2>
                  <button 
                    onClick={() => handleUpdate()}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 px-8 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
                  >
                    SAVE CHANGES
                  </button>
                </div>

            {/* General Information */}
            <div className="mb-10">
              <h3 className="font-bold text-lg text-gray-900 mb-5 flex items-center gap-2"><User size={20} className="text-blue-600"/> General Information</h3>
              <div className="grid grid-cols-2 gap-5">
                <div className="bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white border border-gray-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all rounded-xl p-3.5">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">First & Middle Name</label>
                  <input 
                    type="text" 
                    name="firstName"
                    value={formState.firstName}
                    onChange={handleChange}
                    className="w-full bg-transparent font-bold text-gray-900 focus:outline-none text-base"
                  />
                </div>
                <div className="bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white border border-gray-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all rounded-xl p-3.5">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Last Name</label>
                  <input 
                    type="text" 
                    name="lastName"
                    value={formState.lastName}
                    onChange={handleChange}
                    className="w-full bg-transparent font-bold text-gray-900 focus:outline-none text-base"
                  />
                </div>
                
                <div className="bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white border border-gray-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all rounded-xl p-3.5">
                  <div className="w-full">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Gender</label>
                    <Dropdown 
                      value={formState.gender} 
                      onChange={(val) => setFormState(prev => ({ ...prev, gender: val }))} 
                      options={[
                        { value: 'Male', label: 'Male' },
                        { value: 'Female', label: 'Female' },
                        { value: 'Other', label: 'Other' },
                      ]}
                      placeholder="Select Gender"
                    />
                  </div>
                </div>
                
                <div className="bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white border border-gray-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all rounded-xl p-3.5 flex justify-between items-center">
                  <div className="w-full">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Nationality</label>
                    <input 
                      type="text"
                      name="nationality"
                      value={formState.nationality}
                      onChange={handleChange}
                      placeholder="e.g. Indian"
                      className="w-full bg-transparent font-bold text-gray-900 focus:outline-none text-base placeholder:font-normal placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="mb-10">
              <h3 className="font-bold text-lg text-gray-900 mb-1 flex items-center gap-2"><Smartphone size={20} className="text-blue-600"/> Contact Details</h3>
              <p className="text-sm text-gray-500 mb-5 ml-7">Add contact information to receive booking details & other alerts</p>
              
              <div className="grid grid-cols-2 gap-5">
                <div className="bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white border border-gray-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all rounded-xl p-3.5 flex justify-between items-center group">
                  <div className="w-full pr-4">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Mobile Number</label>
                    <input 
                      type="text" 
                      name="phone"
                      value={formState.phone}
                      onChange={handleChange}
                      className="w-full bg-transparent font-bold text-gray-900 focus:outline-none text-base"
                    />
                  </div>
                  <button className="text-blue-600 font-bold text-xs bg-blue-50 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
                </div>
                <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-3.5 flex justify-between items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 text-green-500"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></div>
                  <div className="w-full pr-4 relative z-10">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Email ID</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formState.email}
                      disabled
                      className="w-full bg-transparent font-bold text-gray-700 focus:outline-none text-base"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Details */}
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-1 flex items-center gap-2"><KeyRound size={20} className="text-blue-600"/> Documents Details</h3>
              <p className="text-sm text-gray-500 mb-5 ml-7">Add your documents for seamless international and domestic travel.</p>
              
              <div className="grid grid-cols-2 gap-5 mb-5">
                <div className="bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white border border-gray-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all rounded-xl p-3.5">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Passport Number</label>
                  <input 
                    type="text" 
                    name="passportNumber"
                    value={formState.passportNumber}
                    onChange={handleChange}
                    className="w-full bg-transparent font-bold text-gray-900 focus:outline-none text-base"
                  />
                </div>
                <div className="bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white border border-gray-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all rounded-xl p-3.5">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Issuing Country</label>
                  <input 
                    type="text" 
                    name="issuingCountry"
                    value={formState.issuingCountry}
                    onChange={handleChange}
                    className="w-full bg-transparent font-bold text-gray-900 focus:outline-none text-base"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white border border-gray-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all rounded-xl p-3.5">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Passport Expiry Date</label>
                  <DOBCalendar 
                    value={formState.passportExpiry}
                    onChange={(val) => setFormState(prev => ({ ...prev, passportExpiry: val }))}
                    placeholder="dd-mm-yyyy"
                    dropdownPosition="top"
                  />
                </div>
                <div className="bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white border border-gray-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all rounded-xl p-3.5">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">PAN Card Number</label>
                  <input 
                    type="text" 
                    name="panNumber"
                    value={formState.panNumber}
                    onChange={handleChange}
                    className="w-full bg-transparent font-bold text-gray-900 focus:outline-none uppercase text-base"
                  />
                </div>
                </div>
              </div>
            </>
          )}

            {activeTab === 'travellers' && (
              <div className="flex flex-col items-center justify-center h-full py-24 text-center">
                <Users size={80} className="text-gray-200 mb-6" />
                <h2 className="text-3xl font-black text-gray-900 mb-3">Co-Travellers</h2>
                <p className="text-gray-500 font-medium max-w-md mx-auto mb-8">This feature is currently under development. Soon you'll be able to manage your frequent co-travellers here.</p>
                <span className="bg-blue-100 text-blue-700 text-sm font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-sm">Coming Soon</span>
              </div>
            )}

            {activeTab === 'devices' && (
              <div className="flex flex-col items-center justify-center h-full py-24 text-center">
                <Smartphone size={80} className="text-gray-200 mb-6" />
                <h2 className="text-3xl font-black text-gray-900 mb-3">Logged In Devices</h2>
                <p className="text-gray-500 font-medium max-w-md mx-auto mb-8">This feature is currently under development. Soon you'll be able to manage your logged-in sessions and devices securely.</p>
                <span className="bg-blue-100 text-blue-700 text-sm font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-sm">Coming Soon</span>
              </div>
            )}

            {activeTab === 'properties' && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-gray-900">My Registered Properties</h2>
                  <button onClick={() => navigate('/partner/connect')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold text-sm transition">
                    + Add New Property
                  </button>
                </div>

                {loadingProperties ? (
                  <p className="text-gray-500 font-medium">Loading properties...</p>
                ) : myProperties.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                    <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">No properties listed yet</h3>
                    <p className="text-gray-500 text-sm mt-1">Start growing your business by listing a property.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myProperties.map((hotel) => (
                      <div key={hotel._id} className="border border-gray-200 rounded-xl p-4 flex gap-4 hover:shadow-md transition bg-white">
                        <img src={hotel.images[0] || 'https://via.placeholder.com/150'} alt={hotel.name} className="w-32 h-32 object-cover rounded-lg" />
                        <div className="flex-1 flex flex-col">
                          <div className="flex justify-between">
                            <h3 className="text-lg font-black text-gray-900">{hotel.name}</h3>
                            <span className="font-bold text-gray-900">₹{hotel.pricePerNight} <span className="text-xs text-gray-500 font-normal">/ night</span></span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{hotel.city}, {hotel.address}</p>
                          <div className="mt-auto flex gap-2">
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Active</span>
                            <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded">{hotel.amenities.length} Amenities</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
