import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TopNavbar from '../../components/layout/TopNavbar';
import { ShieldAlert, Mail, Phone, ArrowLeft, Timer } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

const InactiveAccountPage = () => {
  const [timeLeft, setTimeLeft] = useState(20);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (timeLeft <= 0) {
      dispatch(logout());
      navigate('/');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, navigate, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNavbar forceWhite={true} />
      
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
              <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-center gap-3 text-orange-800 font-semibold justify-center">
                <Timer size={20} className="animate-pulse" />
                <span>Redirecting to homepage in {timeLeft} seconds...</span>
              </div>

              <p className="text-gray-700 text-center text-lg">
                Your account has been suspended by the administrator. This might be due to policy violations, incomplete documentation, or a manual deactivation.
              </p>
              
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  Contact Support
                </h3>
                <div className="space-y-3">
                  <a href="mailto:support@trippechalo.com" className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors">
                    <Mail size={18} />
                    <span>support@trippechalo.com</span>
                  </a>
                  <a href="tel:+919555934205" className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors">
                    <Phone size={18} />
                    <span>+91 9555934205</span>
                  </a>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-100 text-center">
              <button 
                onClick={() => {
                  dispatch(logout());
                  navigate('/');
                }}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold transition-colors cursor-pointer"
              >
                <ArrowLeft size={18} />
                Return to Homepage Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InactiveAccountPage;
