import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface TripTypePickerProps {
  value: string;
  onChange: (type: string) => void;
  onClose: () => void;
}

const TRIP_TYPES = [
  { id: 'One Way', desc: 'Book a one-way flight' },
  { id: 'Round Trip', desc: 'Book a round-trip flight' },
  { id: 'Multi City', desc: 'Book multi-city flights' }
];

export default function TripTypePicker({ value, onChange, onClose }: TripTypePickerProps) {
  return (
    <div 
      className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 w-[240px] flex flex-col overflow-hidden cursor-default"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex flex-col">
        {TRIP_TYPES.map(type => {
          const isSelected = value === type.id;
          return (
            <div 
              key={type.id}
              className={`flex flex-col px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-0 ${isSelected ? 'bg-blue-50/30' : ''}`}
              onClick={() => { onChange(type.id); onClose(); }}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>{type.id}</span>
                {isSelected && <CheckCircle2 size={16} className="text-blue-500" />}
              </div>
              <span className="text-xs text-gray-500 mt-1">{type.desc}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
