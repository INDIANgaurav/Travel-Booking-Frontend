import React, { useEffect, useState } from 'react';
import { User, Users, Smartphone, LogOut, KeyRound, ChevronDown, Building2, Camera, Pencil } from 'lucide-react';
import api from '../../../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, logout, selectCurrentUser } from '../../../store/authSlice';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import TopNavbar from '../../../components/layout/TopNavbar';
import Loader from '../../../components/common/Loader';
import Dropdown from '../../../components/ui/Dropdown';

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
    <div className="min-h-screen font-sans pb-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f6f8fd 0%, #f1f5f9 100%)' }}>

      {/* Decorative Floating Orbs */}
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] bg-purple-400/15 rounded-full blur-[140px]" style={{ animation: 'pulse 8s infinite alternate' }}></div>
        <div className="absolute bottom-[10%] left-[20%] w-[700px] h-[700px] bg-teal-300/15 rounded-full blur-[150px]" style={{ animation: 'pulse 12s infinite alternate' }}></div>
      </div>

      {/* Background Header */}
      <div className="absolute top-0 left-0 w-full h-[280px] bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 to-indigo-900/40 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#f1f5f9] via-[#f6f8fd]/80 to-transparent"></div>
      </div>
      
      {/* Scrollable Content Wrapper */}
      <div className="relative z-10 w-full pt-[140px]">
        
        {/* User Info Overlay - Scrolls with page */}
        <div className="max-w-[1200px] mx-auto px-6 flex items-end pb-4">
          <div className="flex items-end gap-6">
            <div className="relative cursor-pointer group hover:scale-105 transition-transform duration-300">
              <div className="w-[120px] h-[120px] rounded-full bg-[#11C19F] text-white flex flex-col items-center justify-center shadow-md border-4 border-[#F2F2F2] overflow-hidden relative z-10">
                {currentUser?.avatar ? (
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
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-[#F2F2F2] shadow-sm hover:bg-blue-700 transition z-20">
                <Pencil size={14} />
              </div>
            </div>
            <div className="text-[#0c1a40] mb-2">
              <h1 className="text-3xl font-black flex items-center gap-3">
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
              <div className="flex items-center gap-4 mt-2 text-sm font-bold text-gray-600">
                <span className="flex items-center gap-1.5"><Smartphone size={14}/> {profile?.phone || 'Add Phone'}</span>
                <span className="flex items-center gap-1.5"><User size={14}/> {profile?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="max-w-[1200px] mx-auto px-6 mt-12 relative pb-20">
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] flex min-h-[600px] items-start overflow-hidden">
          
            {/* Left Sidebar Menu - Sticky */}
            <div className="w-[280px] border-r border-gray-200/50 bg-white/40 py-6 flex flex-col sticky top-[80px] h-[calc(100vh-100px)] overflow-y-auto hidden-scrollbar">
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
                <button 
                  onClick={() => setActiveTab('properties')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition ${activeTab === 'properties' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Building2 size={18} /> My Properties
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
            
            {activeTab === 'profile' && (
              <>
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
                
                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                  <div className="w-full">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Gender</label>
                    <Dropdown 
                      value={formState.gender} 
                      onChange={(val) => setFormState(prev => ({ ...prev, gender: val }))} 
                      options={[
                        { value: 'Male', label: 'Male' },
                        { value: 'Female', label: 'Female' },
                        { value: 'Other', label: 'Other' },
                      ]}
                      placeholder="Select"
                    />
                  </div>
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
