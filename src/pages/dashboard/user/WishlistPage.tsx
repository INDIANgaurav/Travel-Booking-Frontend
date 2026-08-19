import React from 'react';
import TopNavbar from '../../../components/layout/TopNavbar';
import { Heart, Share2, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WishlistPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7eefe] to-[#f4f7fa] font-sans pb-20 relative overflow-hidden">
      {/* Dashed Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(#c2cce2 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30" preserveAspectRatio="none">
        <path d="M -100 200 Q 300 0 600 200 T 1300 100" fill="transparent" stroke="#8b9dc3" strokeWidth="2" strokeDasharray="10 15" />
        <path d="M 800 400 Q 1100 100 1400 300 T 1900 200" fill="transparent" stroke="#8b9dc3" strokeWidth="2" strokeDasharray="10 15" />
      </svg>

      <div className="max-w-[1200px] mx-auto px-6 pt-24 relative z-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-12">
          <button onClick={() => navigate('/')} className="hover:text-blue-600">Home</button>
          <span className="text-blue-600">›</span>
          <button onClick={() => navigate('/dashboard/profile')} className="hover:text-blue-600">My Account</button>
          <span className="text-blue-600">›</span>
          <span>Wishlist</span>
        </div>

        {/* Center Content */}
        <div className="flex flex-col items-center justify-center mt-12">
          
          {/* Polaroid Images Wrapper */}
          <div className="relative w-full max-w-[600px] h-[350px] flex items-center justify-center mb-8">
            
            {/* Left Polaroid */}
            <div className="absolute left-[10%] transform -rotate-6 hover:rotate-0 hover:z-20 transition-all duration-300">
              <div className="bg-white p-2 pb-6 rounded-lg shadow-xl border border-gray-100 relative">
                <img src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=250&q=80" alt="London" className="w-[160px] h-[160px] object-cover rounded" />
                
                {/* Share Tooltip */}
                <div className="absolute -bottom-6 -left-8">
                  <div className="bg-white rounded-full p-2 shadow-lg w-12 h-12 flex items-center justify-center relative z-10">
                    <Share2 size={20} className="text-blue-500" />
                  </div>
                  <div className="bg-[#9c6bb1] text-white text-xs font-bold px-3 py-1.5 rounded-lg absolute top-14 -left-4 whitespace-nowrap shadow-md">
                    Share with loved ones
                  </div>
                  {/* Fake arrow pointer */}
                  <div className="w-6 h-6 border-l-2 border-t-2 border-[#9c6bb1] absolute top-10 left-3 transform rotate-45 pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Center Polaroid */}
            <div className="absolute z-10 transform scale-110 shadow-2xl hover:scale-[1.15] transition-all duration-300">
              <div className="bg-white p-2 pb-6 rounded-lg border border-gray-100 relative">
                <img src="https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Resort" className="w-[200px] h-[200px] object-cover rounded" />
                
                {/* Wishlist Tooltip */}
                <div className="absolute -top-6 -right-6">
                  <div className="bg-white rounded-full p-3 shadow-lg w-14 h-14 flex items-center justify-center relative z-10">
                    <Heart size={24} className="text-[#ff4f4f] fill-[#ff4f4f]" />
                  </div>
                  <div className="bg-[#ff685b] text-white text-xs font-bold px-3 py-1.5 rounded-lg absolute top-12 -right-4 whitespace-nowrap shadow-md">
                    Wishlist
                  </div>
                   {/* Fake pointer */}
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="absolute top-10 left-2 pointer-events-none text-[#ff685b]">
                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Right Polaroid */}
            <div className="absolute right-[10%] transform rotate-6 hover:rotate-0 hover:z-20 transition-all duration-300">
              <div className="bg-white p-2 pb-6 rounded-lg shadow-xl border border-gray-100 relative">
                <img src="https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=250&q=80" alt="Desert" className="w-[160px] h-[160px] object-cover rounded" />
                
                {/* Vote Tooltip */}
                <div className="absolute -bottom-6 -right-8">
                  <div className="bg-white rounded-full p-2 shadow-lg w-12 h-12 flex items-center justify-center relative z-10">
                    <ThumbsUp size={20} className="text-blue-600 fill-blue-600" />
                  </div>
                  <div className="bg-[#46c491] text-white text-xs font-bold px-3 py-1.5 rounded-lg absolute top-14 -right-2 whitespace-nowrap shadow-md">
                    Vote & decide
                  </div>
                  {/* Fake arrow pointer */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="absolute top-10 right-4 pointer-events-none text-[#46c491]">
                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

          </div>

          {/* Text Content */}
          <div className="text-center mt-6 z-10">
            <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
              Create Your <span className="text-[#008cff]">Dream Trip</span> Together!
            </h1>
            <p className="text-gray-600 font-medium mb-8 max-w-md mx-auto">
              Save stays to your wishlist. Share, vote, and plan your next getaway as a team.
            </p>
            
            <button disabled className="bg-gradient-to-r from-blue-400 to-blue-500 text-white font-black text-sm px-8 py-3.5 rounded-md shadow-md cursor-not-allowed opacity-80">
              CREATE NEW WISHLIST (COMING SOON)
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
