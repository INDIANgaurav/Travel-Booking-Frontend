import React from 'react';
import { RefreshCw } from 'lucide-react';

interface Props {
  onClick: () => void;
  loading?: boolean;
  count?: number;
}

export default function RefreshButton({ onClick, loading = false, count }: Props) {
  return (
    <div className="flex items-center gap-3 text-xs text-gray-500 font-semibold">
      {count !== undefined && <span>{count} Records Found</span>}
      <button 
        onClick={onClick}
        className={`p-1.5 hover:bg-gray-100 rounded-md text-gray-600 transition-all cursor-pointer border border-transparent hover:border-gray-200 ${loading ? 'animate-spin text-blue-600' : ''}`}
        title="Refresh"
      >
        <RefreshCw size={14} />
      </button>
    </div>
  );
}
