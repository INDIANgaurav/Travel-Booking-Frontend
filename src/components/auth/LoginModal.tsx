import React, { useState } from 'react';
import { X, Plane, Building, Train, ChevronLeft } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [accountType, setAccountType] = useState<'USER' | 'TRAVEL_AGENT'>('USER');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative z-10 w-[850px] h-[500px] bg-white rounded-2xl shadow-2xl flex animate-in zoom-in-95 duration-200">
        
        {/* Close Button - Absolutely positioned outside the modal visually */}
        <button 
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-900 hover:bg-gray-100 z-50 transition border border-gray-100"
        >
          <X size={18} className="font-bold" />
        </button>

        {/* Inner wrapper for overflow hidden */}
        <div className="w-full h-full flex overflow-hidden rounded-2xl">
          {/* Left Side - Promo Image */}
          <div className="w-[45%] relative">
            <img 
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop" 
              alt="Promo" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80"></div>
            
            <div className="relative z-10 p-10 h-full flex flex-col text-white">
              <h2 className="text-2xl font-bold mb-8">Sign up/Login now to</h2>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Plane size={24} className="text-white" />
                <p className="font-bold text-sm leading-tight">Lock Flight Prices & Pay Later</p>
              </div>
              <div className="flex items-center gap-4">
                <Building size={24} className="text-white" />
                <p className="font-bold text-sm leading-tight">Book Hotels @ ₹0</p>
              </div>
              <div className="flex items-center gap-4">
                <Train size={24} className="text-white" />
                <p className="font-bold text-sm leading-tight">Get 3X refund, if your waitlisted train doesn't get confirmed</p>
              </div>
            </div>
            
            <div className="mt-auto pt-6 border-t border-white/20">
              <p className="text-xs text-center text-white/80">Trust Us to Digitise Your Business Travel, Just Like 59K+ Organisations Have!</p>
            </div>
          </div>
        </div>

        {/* Right Side - Forms */}
        <div className="w-[55%] bg-white p-8 relative flex flex-col">
          
          {/* Top Tabs */}
          <div className="flex rounded-full border border-gray-200 p-1 mb-8 shadow-sm">
            <button 
              onClick={() => setAccountType('USER')}
              className={`flex-1 py-2 text-sm font-bold rounded-full transition-all ${accountType === 'USER' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
            >
              TRAVELLER
            </button>
            <button 
              onClick={() => setAccountType('TRAVEL_AGENT')}
              className={`flex-1 py-2 text-sm font-bold rounded-full transition-all ${accountType === 'TRAVEL_AGENT' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
            >
              TRAVEL AGENT
            </button>
          </div>

          {!isLogin && (
            <button 
              onClick={() => setIsLogin(true)}
              className="absolute top-28 left-8 text-blue-600 flex items-center text-sm font-semibold hover:underline"
            >
              <ChevronLeft size={16} /> Back to Login
            </button>
          )}

          <div className={`flex-1 overflow-y-auto custom-scrollbar px-1 ${!isLogin ? 'mt-6' : ''}`}>
            {isLogin ? (
              <LoginForm role={accountType} onToggleMode={() => setIsLogin(false)} />
            ) : (
              <RegisterForm role={accountType} onToggleMode={() => setIsLogin(true)} />
            )}
          </div>

          <div className="mt-4 text-center text-[10px] text-gray-400">
            By proceeding, you agree to TrippeChalo's Privacy Policy, User Agreement and T&Cs
          </div>
        </div>
        </div>

      </div>
    </div>
  );
}
