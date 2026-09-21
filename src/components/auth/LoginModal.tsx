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


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative z-10 w-[95%] max-w-[950px] max-h-[95vh] md:max-h-[650px] bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-200">
        
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
          <div className="hidden md:block w-[45%] relative">
            <img 
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop" 
              alt="Promo" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80"></div>
            
            <div className="relative z-10 p-10 h-full flex flex-col text-white">
              <h2 className="text-3xl font-black mb-8 tracking-tight">Unlock Premium Travel</h2>
            
            <div className="space-y-6 mt-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shrink-0">
                  <Plane size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Instant Booking & PNR</h4>
                  <p className="text-[11px] text-white/70 mt-0.5">Real-time ticketing across 100+ airlines</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shrink-0">
                  <Building size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">B2B & Supplier Inventory</h4>
                  <p className="text-[11px] text-white/70 mt-0.5">Access exclusive rates and vast networks</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shrink-0">
                  <Train size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Automated Agent Wallet</h4>
                  <p className="text-[11px] text-white/70 mt-0.5">Seamless transactions and instant credit</p>
                </div>
              </div>
            </div>
            
            <div className="mt-auto pt-6 border-t border-white/20">
              <p className="text-xs text-center text-white/80">Trust Us to Digitise Your Business Travel</p>
            </div>
          </div>
        </div>

        {/* Right Side - Forms */}
        <div className="w-full md:w-[55%] bg-white p-6 md:p-10 relative flex flex-col justify-center min-h-[500px] overflow-y-auto custom-scrollbar">
          
          <div className={`w-full max-w-md mx-auto ${!isLogin ? 'mt-4' : ''}`}>
            {isLogin ? (
              <LoginForm 
                onSuccess={onClose} 
                onToggleMode={() => setIsLogin(false)} 
              />
            ) : (
              <RegisterForm 
                onToggleMode={() => setIsLogin(true)} 
              />
            )}
          </div>

          <div className="mt-8 text-center text-[10px] text-gray-400">
            By proceeding, you agree to TrippeChalo's Privacy Policy, User Agreement and T&Cs
          </div>
        </div>
        </div>

      </div>
    </div>
  );
}
