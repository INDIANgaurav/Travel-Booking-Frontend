import React from 'react';
import { Link } from 'react-router-dom';
import TopNavbar from '../../components/layout/TopNavbar';
import { CheckCircle2, Clock, AlertCircle, ArrowLeft } from 'lucide-react';

const PendingApprovalPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNavbar />
      
      <div className="flex-1 flex items-center justify-center p-4 pt-24">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Clock size={120} />
            </div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Clock size={40} className="text-orange-500" />
              </div>
              <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Application Under Review</h1>
              <p className="text-orange-100 font-medium max-w-md mx-auto">
                Thank you for applying to join TrippeChalo's exclusive agent network.
              </p>
            </div>
          </div>
          
          <div className="p-8 md:p-12">
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="mt-1">
                  <CheckCircle2 className="text-green-500" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Application Received</h3>
                  <p className="text-gray-600">We have successfully received your agent registration details and company profile.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="mt-1">
                  <Clock className="text-orange-500 animate-pulse" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Verification in Progress</h3>
                  <p className="text-gray-600">Our team is currently verifying your business details. This standard process usually takes 24-48 business hours.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mt-1">
                  <AlertCircle className="text-blue-500" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">What happens next?</h3>
                  <p className="text-gray-600">Once your account is approved, you will receive a confirmation email. You can then log in to access the agent dashboard, special B2B fares, and start managing bookings.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-10 pt-8 border-t border-gray-100 text-center">
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

export default PendingApprovalPage;
