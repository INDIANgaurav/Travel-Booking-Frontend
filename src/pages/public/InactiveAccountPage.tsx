import React from 'react';
import { Link } from 'react-router-dom';
import TopNavbar from '../../components/layout/TopNavbar';
import { ShieldAlert, Mail, Phone, ArrowLeft } from 'lucide-react';

const InactiveAccountPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNavbar />
      
      <div className="flex-1 flex items-center justify-center p-4 pt-24">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldAlert size={120} />
            </div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <ShieldAlert size={40} className="text-red-500" />
              </div>
              <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Account Suspended</h1>
              <p className="text-red-100 font-medium max-w-md mx-auto">
                Your account is currently inactive and cannot be accessed.
              </p>
            </div>
          </div>
          
          <div className="p-8 md:p-12">
            <div className="space-y-6">
              <p className="text-gray-700 text-center text-lg">
                Your account has been suspended by the administrator. This might be due to policy violations, incomplete documentation, or a manual deactivation.
              </p>
              
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  Contact Support
                </h3>
                <div className="space-y-3">
                  <a href="mailto:support@TrippeChalo.com" className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors">
                    <Mail size={18} />
                    <span>support@TrippeChalo.com</span>
                  </a>
                  <a href="tel:+18001234567" className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors">
                    <Phone size={18} />
                    <span>+1 (800) 123-4567</span>
                  </a>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-100 text-center">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold transition-colors"
              >
                <ArrowLeft size={18} />
                Return to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InactiveAccountPage;
