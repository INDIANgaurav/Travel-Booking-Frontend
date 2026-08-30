import React from 'react';

interface ReportTableProps {
  headers: string[];
  data: any[];
  renderRow: (row: any, index: number) => React.ReactNode;
  emptyMessage?: string;
}

export default function ReportTable({ headers, data, renderRow, emptyMessage = "No records found" }: ReportTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100/60 overflow-hidden mt-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-black">
              {headers.map((header, index) => (
                <th key={index} className="px-6 py-4 whitespace-nowrap">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/60 text-sm font-medium text-slate-700">
            {data.length > 0 ? (
              data.map((row, index) => renderRow(row, index))
            ) : (
              <tr>
                <td colSpan={headers.length} className="px-6 py-16 text-center text-slate-400 font-semibold">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
