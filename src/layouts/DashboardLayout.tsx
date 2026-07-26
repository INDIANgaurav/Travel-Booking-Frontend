import React from 'react';
import { Outlet } from 'react-router-dom';

import TopNavbar from '../components/layout/TopNavbar';

export default function DashboardLayout() {
  return (
    <>
      <TopNavbar forceWhite={true} />
      <div className="min-h-screen pt-[76px] bg-[#F5F8FA] font-sans">
        <Outlet />
      </div>
    </>
  );
}
