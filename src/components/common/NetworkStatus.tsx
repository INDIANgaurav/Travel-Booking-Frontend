import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, PlaneTakeoff, PlaneLanding } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[#0c1a40] text-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden border border-white/10 backdrop-blur-xl`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <PlaneTakeoff className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-white">Back on the radar!</p>
                <p className="mt-1 text-xs text-gray-300">Connection restored. Your flight bookings can continue.</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-white/10">
            <button onClick={() => toast.dismiss(t.id)} className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 focus:outline-none transition-colors">
              Close
            </button>
          </div>
        </div>
      ), { id: 'network-toast', duration: 4000 });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-red-950 text-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden border border-red-500/30 backdrop-blur-xl`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <PlaneLanding className="h-5 w-5 text-red-400" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-white">Mayday! Connection Lost</p>
                <p className="mt-1 text-xs text-red-200">You are offline. Please check your network to resume.</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-red-500/20">
            <button onClick={() => toast.dismiss(t.id)} className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-red-300 hover:text-white hover:bg-red-500/10 focus:outline-none transition-colors">
              Close
            </button>
          </div>
        </div>
      ), { id: 'network-toast', duration: 5000 });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-gray-900/60 backdrop-blur-md transition-all duration-300">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-sm mx-4 transform animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75"></div>
          <WifiOff size={48} className="text-red-500 relative z-10" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">No Internet Connection</h2>
        <p className="text-gray-500 font-medium mb-8">
          It looks like you are offline. Please check your Wi-Fi or mobile data to continue booking.
        </p>
        <button 
          onClick={() => {
            if (navigator.onLine) {
              setIsOnline(true);
            } else {
              toast.error('Still offline. Waiting for connection...', { id: 'offline-check' });
            }
          }} 
          className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-gray-900/20 flex justify-center items-center gap-2"
        >
          <Wifi size={18} /> Check Connection
        </button>
      </div>
    </div>
  );
}
