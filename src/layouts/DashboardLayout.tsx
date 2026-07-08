import React from 'react';
import { Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#F5F8FA] font-sans">
      <Outlet />
    </div>
  );
}
