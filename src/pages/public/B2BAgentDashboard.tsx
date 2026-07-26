import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Plane, Building2, ShieldCheck, CreditCard, Compass, MoreHorizontal, LogOut, Home, Calendar, Receipt, CreditCard as CreditCardIcon, FileText, FileSpreadsheet, Phone, BadgePercent, Pencil } from 'lucide-react';
import type { RootState } from '../../store/store';
import { logout } from '../../store/authSlice';

const B2BAgentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Example dummy data from store or state
  const loggedInUser = useSelector((state: RootState) => state.auth.user);
  const agentName = loggedInUser?.companyName || (loggedInUser?.firstName ? `${loggedInUser.firstName} ${loggedInUser.lastName || ''}`.trim() : loggedInUser?.name) || '';
  const agentCode = loggedInUser?.agencyCode || loggedInUser?.agencyId || (loggedInUser?._id ? `UPTF${loggedInUser._id.slice(-6).toUpperCase()}` : '');
  const dashboardCards = [
    {
      title: 'Bank Details',
      description: 'Account info and current balance amount',
      icon: <Home size={20} />,
      bgColor: 'bg-emerald-50',
      iconBg: 'bg-emerald-500',
      path: '/b2b/bank-details'
    },
    {
      title: 'Pax Calendar',
      description: 'Flight PAX Calendar & Trip Timeline',
      icon: <Calendar size={20} />,
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-500',
      path: '/b2b/pax-calendar'
    },
    {
      title: 'Invoice',
      description: 'Travel Fare & Booking Invoice',
      icon: <Receipt size={20} />,
      bgColor: 'bg-amber-50',
      iconBg: 'bg-amber-500',
      path: '/b2b/invoice'
    },
    {
      title: 'Credit Notes',
      description: 'Customer Account Credit and Reconciliation',
      icon: <CreditCardIcon size={20} />,
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-500',
      path: '/b2b/credit-note'
    },
    {
      title: 'Debit Note',
      description: 'Charge Revision and Account Adjustment Record',
      icon: <FileText size={20} />,
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-500',
      path: '/b2b/debit-note'
    },
    {
      title: 'GST Invoice',
      description: 'GST Compliant Bill for Business Transactions',
      icon: <FileSpreadsheet size={20} />,
      bgColor: 'bg-pink-50',
      iconBg: 'bg-pink-500',
      path: '/b2b/gst-invoice'
    },
    {
      title: 'Offline Booking',
      description: 'Traditional Booking Without Online Access',
      icon: <Phone size={20} />,
      bgColor: 'bg-indigo-50',
      iconBg: 'bg-indigo-500',
      path: '/b2b/offline-booking'
    },
    {
      title: 'AgentMarkup',
      description: 'Agency Profit Margin on Client Bookings',
      icon: <BadgePercent size={20} />,
      bgColor: 'bg-lime-50',
      iconBg: 'bg-lime-500',
      path: '/b2b/markup'
    }
  ];

  return (
    <main className="flex-1 w-full px-4 md:px-8 lg:px-12 xl:px-16 py-10">
      
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-[32px] font-black text-[#0c1a40] mb-1">Welcome back, {agentName}</h1>
        <p className="text-[13px] text-gray-500 font-semibold">Quick access to your B2B tools - {agentCode}.</p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {dashboardCards.map((card, index) => (
          <div 
            key={index} 
            onClick={() => card.path !== '#' && navigate(card.path)}
            className={`${card.bgColor} rounded-[20px] p-5 relative overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer group`}
          >
            <div className="flex items-center gap-4 mb-2">
              <div className={`w-[50px] h-[50px] rounded-full ${card.iconBg} text-white flex items-center justify-center shadow-sm shrink-0`}>
                {card.icon}
              </div>
              <div>
                <h3 className="text-[#0c1a40] font-black text-[15px]">{card.title}</h3>
                <p className="text-gray-500 text-[11px] font-semibold mt-0.5 max-w-[180px] leading-tight">{card.description}</p>
              </div>
            </div>

            {/* Edit/Action Pencil Icon */}
            <div className="absolute top-4 right-4 w-7 h-7 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm opacity-80 group-hover:opacity-100 transition">
              <Pencil size={12} />
            </div>
          </div>
        ))}
      </div>

    </main>
  );
};

export default B2BAgentDashboard;


