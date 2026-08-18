import React from 'react';

export default function AdminSettings() {
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Configure pricing margins, API keys, and general site settings.</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-gray-500">Settings UI coming soon...</p>
      </div>
    </div>
  );
}

