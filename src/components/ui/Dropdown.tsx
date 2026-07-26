import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
}

export default function Dropdown({ value, onChange, options, placeholder = 'Select...', className = '' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-xs font-bold text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all gap-2 h-full min-h-[36px]"
      >
        <span className="flex items-center gap-2 truncate flex-1 text-left">
          {selectedOption?.icon}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top">
          <div className="py-1 max-h-60 overflow-y-auto custom-scrollbar">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                    isSelected 
                      ? 'bg-blue-50/50 text-blue-700 font-bold' 
                      : 'text-gray-700 font-medium hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {option.icon && (
                      <span className={isSelected ? 'text-blue-500' : 'text-gray-400 shrink-0'}>
                        {option.icon}
                      </span>
                    )}
                    <span className="truncate">{option.label}</span>
                  </span>
                  {isSelected && <Check size={14} className="text-blue-600 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
