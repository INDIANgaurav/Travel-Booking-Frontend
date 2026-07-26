import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface CabinClassPickerProps {
  cabinClass: string;
  onChange: (cabinClass: string) => void;
}

const CABIN_CLASSES = [
  {
    id: 'Economy',
    name: 'Economy/ Premium Economy',
    features: [],
    image: 'https://placehold.co/40x40/e2e8f0/1e293b?text=ECO'
  },
  {
    id: 'Premium Economy',
    name: 'Premium Economy',
    features: ['Extra Legroom', 'Extra Baggage', 'Premium Meals'],
    image: 'https://placehold.co/40x40/e2e8f0/1e293b?text=PRE'
  },
  {
    id: 'Business',
    name: 'Business Class',
    features: ['Luxury Lounges', 'Cabin Comfort', 'Premium Dining'],
    image: 'https://placehold.co/40x40/e2e8f0/1e293b?text=BUS'
  },
  {
    id: 'First',
    name: 'First Class',
    features: ['Private Suites', 'Fine Dining', 'Highly Personalised Service'],
    image: 'https://placehold.co/40x40/e2e8f0/1e293b?text=FIR'
  }
];

export default function CabinClassPicker({ cabinClass, onChange }: CabinClassPickerProps) {
  return (
    <div 
      className="bg-white rounded-xl w-[380px] z-50 p-6 cursor-default"
      onClick={e => e.stopPropagation()}
    >
      <h3 className="text-xs font-black text-gray-800 mb-4">CHOOSE CABIN CLASS</h3>
      
      <div className="flex flex-col gap-3">
        {CABIN_CLASSES.map((cls) => {
          const isSelected = cabinClass === cls.name || cabinClass === cls.id;
          return (
            <div 
              key={cls.id}
              onClick={() => onChange(cls.name)}
              className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex gap-3 items-start flex-1">
                <div className="pt-1">
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-400"></div>
                  )}
                </div>
                <div>
                  <h4 className={`font-bold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>{cls.name}</h4>
                  {cls.features.length > 0 && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                      {cls.features.map(f => (
                        <div key={f} className="flex items-center gap-1 text-[11px] text-blue-600">
                          <CheckCircle2 size={12} />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="w-12 h-12 ml-4 flex-shrink-0 flex items-center justify-center">
                {/* Fallback to emoji if image fails to load in generic environments */}
                {cls.id === 'Economy' && <span className="text-3xl">💺</span>}
                {cls.id === 'Premium Economy' && <span className="text-3xl">🛋️</span>}
                {cls.id === 'Business' && <span className="text-3xl">👑</span>}
                {cls.id === 'First' && <span className="text-3xl">🥂</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
