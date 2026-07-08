import React from 'react';
import { Plane } from 'lucide-react';

export default function Loader({ fullScreen = false }: { fullScreen?: boolean }) {
  const content = (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-20 h-20 flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border-4 border-white shadow-[0_0_20px_rgba(37,99,235,0.2)]">
        {/* Clouds */}
        <div className="absolute top-3 w-6 h-2 bg-white rounded-full animate-cloud-1 opacity-0 shadow-sm blur-[1px]"></div>
        <div className="absolute top-10 w-8 h-2.5 bg-white rounded-full animate-cloud-2 opacity-0 shadow-sm blur-[1px]"></div>
        <div className="absolute bottom-4 w-4 h-1.5 bg-white rounded-full animate-cloud-1 opacity-0 shadow-sm blur-[1px]" style={{ animationDelay: '0.8s' }}></div>
        
        {/* Plane */}
        <Plane size={28} className="text-blue-600 animate-cruise fill-blue-600 drop-shadow-md z-10" />
      </div>
      <div className="mt-6 flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0s' }}></span>
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
      </div>
      <p className="mt-3 text-xs font-bold text-gray-500 tracking-[0.2em] uppercase">Processing</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8 w-full h-full min-h-[200px]">
      {content}
    </div>
  );
}
