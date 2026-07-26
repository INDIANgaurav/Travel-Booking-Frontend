import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CheckCircle2, ChevronRight, UploadCloud } from 'lucide-react';
import TopNavbar from '../../../components/layout/TopNavbar';
import api from '../../../services/api';
import toast from 'react-hot-toast';

export default function PartnerConnect() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    state: '',
    address: '',
    description: '',
    pricePerNight: '',
    amenities: [] as string[],
    images: [] as File[]
  });
  
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, images: Array.from(e.target.files) });
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists ? prev.amenities.filter(a => a !== amenity) : [...prev.amenities, amenity]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData for multipart/form-data upload
      const data = new FormData();
      data.append('name', formData.name);
      data.append('city', formData.city);
      data.append('state', formData.state);
      data.append('address', formData.address);
      data.append('description', formData.description);
      data.append('pricePerNight', formData.pricePerNight);
      data.append('amenities', JSON.stringify(formData.amenities));
      
      formData.images.forEach(image => {
        data.append('images', image);
      });

      // API call to backend (assumes user is logged in and token is in localStorage)
      const response = await api.post('/api/hotels/register', data);

      if (response.data) {
        toast.success('Property registered successfully!');
        navigate('/');
      } else {
        toast.error('Registration failed');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Failed to register property.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNavbar forceWhite={true} />
      
      <div className="flex flex-1 pt-16">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex flex-col justify-between w-[45%] bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800 text-white p-12 relative overflow-hidden">
          {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:20px_20px]"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12 cursor-pointer" onClick={() => navigate('/')}>
            <Building2 size={32} className="text-orange-500" />
            <span className="text-3xl font-black tracking-tight text-white">
              Travel<span className="text-orange-500">Connect</span>
            </span>
          </div>

          <h1 className="text-5xl font-black leading-tight mb-6">
            List your Property <br/>
            <span className="text-orange-400">for free & grow</span> <br/>
            your business
          </h1>
          <p className="text-lg text-blue-100 max-w-md mb-8">
            Partner with India's leading travel platform and reach millions of global travelers every day.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-green-400" />
              <span className="font-medium text-blue-50">Zero registration fee</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-green-400" />
              <span className="font-medium text-blue-50">24/7 Partner Support</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-green-400" />
              <span className="font-medium text-blue-50">Global Reach</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-auto pt-12 border-t border-white/20">
          <p className="text-sm text-blue-200">Join a community of 15,00,000+ listings</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          
          <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900">Register New Property</h2>
            <p className="text-gray-500 text-sm mt-1">Step {step} of 2 - {step === 1 ? 'Basic Details' : 'Pricing & Images'}</p>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full mt-4 overflow-hidden">
              <div className={`h-full bg-blue-600 transition-all duration-500 ${step === 1 ? 'w-1/2' : 'w-full'}`}></div>
            </div>
          </div>

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit}>
            
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Property Name *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="e.g. Grand Taj Hotel" />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">City *</label>
                    <input type="text" name="city" required value={formData.city} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Delhi" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">State *</label>
                    <input type="text" name="state" required value={formData.state} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Delhi" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Full Address *</label>
                    <input type="text" name="address" required value={formData.address} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="123 Main St" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <textarea name="description" rows={3} value={formData.description} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Describe your property..."></textarea>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 mt-6">
                  Continue to next step <ChevronRight size={18} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Price Per Night (₹) *</label>
                  <input type="number" name="pricePerNight" required value={formData.pricePerNight} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 2500" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Amenities</label>
                  <div className="flex flex-wrap gap-2">
                    {['Free WiFi', 'AC', 'Swimming Pool', 'Spa', 'Parking', 'Breakfast', 'Gym'].map(amenity => (
                      <div 
                        key={amenity}
                        onClick={() => handleAmenityToggle(amenity)}
                        className={`px-3 py-1.5 rounded-full border text-sm cursor-pointer transition ${formData.amenities.includes(amenity) ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                      >
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Upload Images (Max 5)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer relative">
                    <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <UploadCloud size={40} className="text-gray-400 mb-3" />
                    <span className="text-sm font-medium text-gray-700">Click or drag images here</span>
                    <span className="text-xs text-gray-500 mt-1">{formData.images.length > 0 ? `${formData.images.length} files selected` : 'JPG, PNG, WEBP allowed'}</span>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button type="button" onClick={() => setStep(1)} className="w-1/3 bg-gray-100 text-gray-700 font-bold py-3.5 rounded-lg hover:bg-gray-200 transition">
                    Back
                  </button>
                  <button type="submit" disabled={loading} className="w-2/3 bg-orange-500 text-white font-bold py-3.5 rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-70">
                    {loading ? 'Registering...' : 'List Property Now'}
                  </button>
                </div>
              </div>
            )}

          </form>
        </div>
      </div>
      </div>
    </div>
  );
}
