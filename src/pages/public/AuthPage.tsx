import React, { useState } from 'react';
import { Plane, ShieldCheck, Clock, Tag } from 'lucide-react';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';

type AuthMode = 'login' | 'register';
type UserRole = 'USER' | 'AGENT';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<UserRole>('USER');

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop')" }}
    >
      {/* Dark overlay for better text readability on the background */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col md:flex-row">
        
        {/* Left Side: Features & Highlights */}
        <div className="hidden md:flex md:w-5/12 bg-blue-700 text-white p-10 flex-col justify-between relative overflow-hidden">
          {/* Decorative Background Pattern */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-800 rounded-full blur-3xl opacity-50"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Plane size={28} className="transform -rotate-45" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">TravelGo</h1>
            </div>
            
            <h2 className="text-4xl font-bold leading-tight mb-4">
              Explore the World, Your Way.
            </h2>
            <p className="text-blue-100 text-lg mb-12">
              Book flights, hotels, buses, cars, and tour packages at the best prices.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600/50 p-3 rounded-lg"><Tag size={20} /></div>
                <div>
                  <h3 className="font-semibold text-lg">Best Prices</h3>
                  <p className="text-blue-200 text-sm">Get the best deals and save more on every booking.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-blue-600/50 p-3 rounded-lg"><ShieldCheck size={20} /></div>
                <div>
                  <h3 className="font-semibold text-lg">Secure Booking</h3>
                  <p className="text-blue-200 text-sm">Your data and payments are 100% secure.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-blue-600/50 p-3 rounded-lg"><Clock size={20} /></div>
                <div>
                  <h3 className="font-semibold text-lg">24/7 Support</h3>
                  <p className="text-blue-200 text-sm">We are here to help you anytime, anywhere.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 mt-12 text-sm text-blue-200">
            &copy; {new Date().getFullYear()} TravelGo. All rights reserved.
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="w-full md:w-7/12 flex flex-col bg-gray-50">
          
          {/* Role Tabs (User vs Agent) */}
          <div className="flex border-b border-gray-200 bg-white">
            <button
              onClick={() => setRole('USER')}
              className={`flex-1 py-5 text-sm font-semibold transition-colors ${role === 'USER' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              Traveller  
            </button>
            <button
              onClick={() => setRole('AGENT')}
              className={`flex-1 py-5 text-sm font-semibold transition-colors ${role === 'AGENT' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              Travel Agent  
            </button>
          </div>

          <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-white">
            <div className="max-w-md mx-auto">
              {/* Logo Area for Mobile (hidden on desktop since it's on the left) */}
              <div className="flex md:hidden items-center gap-3 mb-8">
                <div className="bg-blue-600 p-2 rounded-lg text-white">
                  <Plane size={24} className="transform -rotate-45" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">TravelGo</h1>
                  <p className="text-xs text-gray-500 font-medium">Your Journey, Our Priority</p>
                </div>
              </div>

              <div>
                {mode === 'login' ? (
                  <LoginForm role={role} onToggleMode={() => setMode('register')} />
                ) : (
                  <RegisterForm role={role} onToggleMode={() => setMode('login')} />
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
