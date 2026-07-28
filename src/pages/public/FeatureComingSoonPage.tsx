import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TopNavbar from '../../components/layout/TopNavbar';
import { Settings, Wrench, Sparkles, ArrowLeft } from 'lucide-react';

const FeatureComingSoonPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNavbar portalMode={true} />
      
      <div className="flex-1 flex items-center justify-center p-4 pt-24">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Settings size={120} className="animate-spin-slow" />
            </div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Wrench size={40} className="text-blue-600" />
              </div>
              <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Feature Under Development</h1>
              <p className="text-blue-100 font-medium max-w-md mx-auto">
                We are working hard to bring this feature to you. Stay tuned!
              </p>
            </div>
          </div>
          
          <div className="p-8 md:p-12">
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="mt-1">
                  <Wrench className="text-blue-500" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Development in Progress</h3>
                  <p className="text-gray-600">Our engineering team is actively building this module to provide you with the best experience.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="mt-1">
                  <Settings className="text-gray-500 animate-spin-slow" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Quality Assurance</h3>
                  <p className="text-gray-600">We will rigorously test this feature before release to ensure it meets our quality standards.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mt-1">
                  <Sparkles className="text-amber-500" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Upcoming Release</h3>
                  <p className="text-gray-600">You will be notified once this feature is live and ready for you to use. Thank you for your patience.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-10 pt-8 border-t border-gray-100 text-center">
              <button 
                onClick={() => navigate(-1)} 
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold transition-colors"
              >
                <ArrowLeft size={18} />
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureComingSoonPage;
