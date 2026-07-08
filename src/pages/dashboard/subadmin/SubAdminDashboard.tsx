import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../store/authSlice';

export default function SubAdminDashboard() {
  const user = useSelector(selectCurrentUser);

  return (
    <div className="p-8">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8 animate-in fade-in slide-in-from-bottom-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-500 text-lg">
          Here is what's happening in the <span className="font-semibold text-blue-600">{user?.department}</span> department today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder for dynamic widgets based on department */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center justify-center min-h-[200px]">
          <p className="text-gray-400 text-sm font-medium">Widget 1 coming soon</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center justify-center min-h-[200px]">
          <p className="text-gray-400 text-sm font-medium">Widget 2 coming soon</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center justify-center min-h-[200px]">
          <p className="text-gray-400 text-sm font-medium">Widget 3 coming soon</p>
        </div>
      </div>
    </div>
  );
}
