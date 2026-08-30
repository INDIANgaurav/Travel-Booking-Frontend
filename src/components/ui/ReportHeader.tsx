import React from 'react';
import { Download } from 'lucide-react';

interface ReportHeaderProps {
  title: string;
  description?: string;
  onDownload?: () => void;
  metrics?: { label: string; value: string | number }[];
}

export default function ReportHeader({ title, description, onDownload, metrics }: ReportHeaderProps) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h1>
        {description && <p className="text-slate-500 text-sm mt-1">{description}</p>}
        
        {metrics && metrics.length > 0 && (
          <div className="flex items-center gap-6 mt-4">
            {metrics.map((m, idx) => (
              <div key={idx} className="flex items-baseline gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{m.label}:</span>
                <span className="text-sm font-black text-indigo-700">{m.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {onDownload && (
        <button 
          onClick={onDownload}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 w-full xl:w-auto"
        >
          <Download size={16} />
          Export Report
        </button>
      )}
    </div>
  );
}
