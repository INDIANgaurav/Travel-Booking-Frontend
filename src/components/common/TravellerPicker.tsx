import React, { useState } from 'react';

interface TravellerPickerProps {
  adults: number;
  children: number;
  infants: number;
  cabinClass: string;
  onChange: (adults: number, children: number, infants: number, cabinClass: string) => void;
  onClose: () => void;
}

export default function TravellerPicker({ adults, children, infants, cabinClass, onChange, onClose }: TravellerPickerProps) {
  const [localAdults, setLocalAdults] = useState(adults);
  const [localChildren, setLocalChildren] = useState(children);
  const [localInfants, setLocalInfants] = useState(infants);
  const [localCabinClass, setLocalCabinClass] = useState(cabinClass);

  const handleApply = () => {
    onChange(localAdults, localChildren, localInfants, localCabinClass);
    onClose();
  };

  const renderSelector = (title: string, subtitle: string, count: number, setCount: (val: number) => void, options: (number | string)[]) => (
    <div className="mb-6">
      <div className="flex flex-col mb-3">
        <span className="text-sm font-bold text-gray-800">{title}</span>
        <span className="text-[11px] text-gray-500">{subtitle}</span>
      </div>
      <div className="flex gap-0 border border-gray-200 rounded-md overflow-hidden inline-flex shadow-sm">
        {options.map((opt, idx) => {
          const isSelected = count === (typeof opt === 'number' ? opt : parseInt(opt.toString().replace('>', '')) + 1);
          // For '>9' or '>6', we can just use the last option value logic
          const val = typeof opt === 'number' ? opt : parseInt(opt.toString().replace('>', '')) + 1;
          
          return (
            <button
              key={idx}
              onClick={() => setCount(val)}
              className={`px-3 py-2 text-sm font-bold border-r border-gray-200 last:border-r-0 transition-colors ${
                isSelected 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-blue-50'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div 
      className="bg-white rounded-xl w-[640px] z-50 p-6 cursor-default"
      onClick={e => e.stopPropagation()}
    >
      {/* Adults Row */}
      {renderSelector(
        "ADULTS (12y +)",
        "on the day of travel",
        localAdults,
        setLocalAdults,
        [1, 2, 3, 4, 5, 6, 7, 8, 9, '>9']
      )}

      {/* Children and Infants Row */}
      <div className="flex gap-6">
        {renderSelector(
          "CHILDREN (2y - 12y)",
          "on the day of travel",
          localChildren,
          setLocalChildren,
          [0, 1, 2, 3, 4, 5, 6, '>6']
        )}
        
        {renderSelector(
          "INFANTS (below 2y)",
          "on the day of travel",
          localInfants,
          setLocalInfants,
          [0, 1, 2, 3, 4, 5, 6, '>6']
        )}
      </div>

      <div className="flex justify-end mt-4">
        <button 
          onClick={handleApply}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-2.5 rounded-full shadow-md transition-colors text-sm"
        >
          APPLY
        </button>
      </div>
    </div>
  );
}
