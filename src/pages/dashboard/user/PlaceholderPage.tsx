import React from 'react';
import { useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title?: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  const location = useLocation();
  const pathName = location.pathname.split('/').pop();
  const formattedName = title || (pathName ? pathName.charAt(0).toUpperCase() + pathName.slice(1) : 'This Feature');

  return (
    <div className="max-w-4xl mx-auto h-[60vh] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
      <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6 relative">
        <Construction size={40} className="text-orange-500 animate-bounce" />
        <div className="absolute inset-0 border-4 border-orange-100 rounded-full animate-ping opacity-20"></div>
      </div>
      <h2 className="text-3xl font-black text-gray-900 mb-4">{formattedName} is under construction</h2>
      <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed text-lg">
        We are working hard to bring this feature to you. The {formattedName} module will be fully functional and available in the next phase!
      </p>
      <div className="inline-block px-6 py-2 bg-orange-50 text-orange-700 font-bold rounded-xl text-sm border border-orange-200 shadow-sm">
        Coming in Next Phase
      </div>
    </div>
  );
}
