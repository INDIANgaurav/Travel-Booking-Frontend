import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Info, HelpCircle, ChevronDown, X } from 'lucide-react';

interface PageGuideInfo {
  title: string;
  category: string;
  description: string;
  operationalNote?: string;
}

const PAGE_GUIDES: Record<string, PageGuideInfo> = {
  '/admin/dashboard': {
    title: 'Executive Dashboard',
    category: 'Overview',
    description: 'High-level operational overview displaying real-time booking volume, revenue metrics, active users, and system performance.'
  },
  '/admin/bookings': {
    title: 'Booking Operations',
    category: 'Core Operations',
    description: 'Centralized live ledger for all flight and hotel bookings. Inspect live PNRs, download verified E-Tickets, issue Tax Invoices, and monitor cancellation requests.'
  },
  '/admin/group-bookings': {
    title: 'Group Booking RFQs',
    category: 'Group Operations',
    description: 'Manage bulk airline seat requests for groups of 10 or more passengers. Review requests, secure special airline fares, and dispatch offline quotations.'
  },
  '/admin/cancellations': {
    title: 'Cancellations & Refunds',
    category: 'Post-Booking',
    description: 'Process customer and agent cancellation requests, audit airline penalty calculations, and issue wallet or source refunds.'
  },
  '/admin/offline-topups': {
    title: 'Manual Wallet Credit (Offline Top-Up)',
    category: 'Treasury & Finance',
    description: 'Credit agency wallets manually after verifying direct bank transfers (NEFT / RTGS / IMPS / Cash). Online self-recharges are handled automatically via payment gateway on the agent portal.'
  },
  '/admin/b2b-partners': {
    title: 'B2B API Integrations',
    category: 'API Distribution',
    description: 'Manage API credentials, Client Secrets, IP whitelisting, and markup rules for external travel agencies and software partners integrating with TrippeChalo APIs.'
  },
  '/admin/b2b-requests': {
    title: 'Agent Onboarding Queue',
    category: 'Partner Verification',
    description: 'Review new B2B travel agency registration applications, verify tax credentials (GSTIN / PAN / Trade License), and grant portal access.'
  },
  '/admin/manage-users': {
    title: 'Active B2B Agents',
    category: 'Agency Directory',
    description: 'Manage approved travel agencies, configure individual commission slabs, monitor live wallet balances, and adjust credit limits.'
  },
  '/admin/suppliers': {
    title: 'Supplier Network & APIs',
    category: 'Inventory & APIs',
    description: 'Configure live inventory suppliers (AirIQ, Nexus DMC, GAPI Infotech), toggle API status, and set global markup percentages or fixed fees.'
  },
  '/admin/fd-maker': {
    title: 'Fixed Departure (FD) Inventory Maker',
    category: 'Series Fares',
    description: 'Upload and schedule pre-purchased bulk series seats (Fixed Departures) across major domestic and international flight sectors.'
  },
  '/admin/fd-report': {
    title: 'Fixed Departure Analytics',
    category: 'Inventory P&L',
    description: 'Track seat occupancy, sold vs. unsold inventory, collected revenue, and profit margins for all scheduled fixed departure series.'
  },
  '/admin/fd-archive': {
    title: 'Fixed Departure Archive',
    category: 'Historical Data',
    description: 'Historical repository of past series departure flights for accounting reconciliation, airline audit, and tax reporting.'
  },
  '/admin/fd-slow-moving': {
    title: 'Slow Moving Sectors Alert',
    category: 'Inventory Risk',
    description: 'Identify high-risk flight sectors nearing departure with low seat occupancy to trigger promotional agent flash sales.'
  },
  '/admin/cug-suppliers': {
    title: 'CUG Network Mappings',
    category: 'Access Control',
    description: 'Restrict specialized series fares and supplier inventories exclusively to authenticated Closed User Group (CUG) travel agents.'
  },
  '/admin/inventory': {
    title: 'CMS & Platform Inventory',
    category: 'Content & Packages',
    description: 'Manage holiday tour packages, featured travel destinations, hotel inventory, and seasonal website promotional cards.'
  },
  '/admin/treasury/banks': {
    title: 'Company Deposit Accounts',
    category: 'Banking',
    description: 'Maintain official company current accounts (ICICI, HDFC, SBI) displayed to travel agencies for direct offline top-up transfers.'
  },
  '/admin/treasury/record-payment': {
    title: 'Record Offline Payment',
    category: 'Treasury Entry',
    description: 'Post manual accounting entries for direct corporate settlements, cash deposits, and offline supplier adjustments.'
  },
  '/admin/treasury/queue': {
    title: 'Settlement & Payout Queue',
    category: 'Treasury Operations',
    description: 'Monitor daily Payment Gateway settlements and audit outgoing agency refund disbursements.'
  },
  '/admin/treasury/invoices': {
    title: 'GST Tax Invoice Center',
    category: 'Tax & Compliance',
    description: 'Generate, audit, and bulk-download monthly B2B GST tax invoices, debit notes, and credit notes for filing.'
  },
  '/admin/finance': {
    title: 'Financial Overview',
    category: 'Financial Analytics',
    description: 'Consolidated summary of gross booking turnover, net commission yield, supplier payables, and operating margins.'
  },
  '/admin/ledger': {
    title: 'Global Financial Ledger',
    category: 'Accounting & Audit',
    description: 'Double-entry accounting journal logging all wallet credits, booking debits, payment gateway settlements, and refunds.'
  },
  '/admin/commissions': {
    title: 'Airline Commission & Revenue Rules',
    category: 'Pricing Engine',
    description: 'Configure airline-specific hidden markups, convenience fees, and agent commission tiers applied dynamically to search results.'
  },
  '/admin/withdrawals': {
    title: 'Agent Withdrawal Requests',
    category: 'Treasury Payouts',
    description: 'Review and approve bank payout requests submitted by verified travel agencies withdrawing wallet funds.'
  },
  '/admin/users': {
    title: 'Registered Users Directory',
    category: 'User Management',
    description: 'Manage direct retail customers, profile verification, active account status, and individual booking histories.'
  },
  '/admin/pending-users': {
    title: 'Pending Account Approvals',
    category: 'Verification Queue',
    description: 'Audit unverified retail and agent accounts pending email, mobile OTP, or administrative review.'
  },
  '/admin/sub-admins': {
    title: 'Sub-Admin Roles & Staff Access',
    category: 'Access Control',
    description: 'Create internal staff accounts (Operations, Accounts, Support) and assign granular role-based module permissions.'
  },
  '/admin/helpdesk': {
    title: 'Customer & Agent Helpdesk',
    category: 'Customer Support',
    description: 'Track and resolve support tickets, flight rescheduling requests, passenger queries, and refund escalations.'
  },
  '/admin/marketing/banners': {
    title: 'Promotional & Festival Banners',
    category: 'Marketing',
    description: 'Configure dynamic seasonal deals, holiday discount banners, and promotional announcement headers on public pages.'
  },
  '/admin/marketing/promos': {
    title: 'Promo & Coupon Codes',
    category: 'Discounts',
    description: 'Create promotional coupon codes with custom discount percentages, minimum cart requirements, and expiry dates.'
  },
  '/admin/marketing/announcements': {
    title: 'Agent Dashboard Announcements',
    category: 'Broadcasts',
    description: 'Publish important operational notices, airline weather alerts, and circulars directly to the B2B agent portal header.'
  },
  '/admin/reports/passenger-calendar': {
    title: 'Passenger Travel Calendar',
    category: 'Operational Schedule',
    description: 'Date-wise manifest of upcoming passenger departures to coordinate web check-in support and airport assistance.'
  },
  '/admin/reports/flight-sales': {
    title: 'Flight Sales & Route Analytics',
    category: 'Sales Analytics',
    description: 'Detailed analytics on top-performing airlines, popular domestic/international sectors, and seasonal booking trends.'
  },
  '/admin/reports/cancellations': {
    title: 'Cancellation Audit Reports',
    category: 'Audit Reports',
    description: 'Historical cancellation statistics, reason analysis, and airline penalty trends for policy refinement.'
  },
  '/admin/settings/roles': {
    title: 'Role Master & Permission Matrix',
    category: 'Security Matrix',
    description: 'Define and customize granular permission sets governing module visibility across all user classifications.'
  },
  '/admin/settings/pg-mapping': {
    title: 'Payment Gateway Routing',
    category: 'Payment Infrastructure',
    description: 'Route payment gateway merchant IDs (MIDs) and configure primary and fallback gateways for seamless transactions.'
  },
  '/admin/settings/pages': {
    title: 'Static & Policy Pages CMS',
    category: 'CMS & Legal',
    description: 'Update public legal disclosures, terms of service, privacy policy, cancellation policy, and company contact information.'
  },
  '/admin/settings/general': {
    title: 'Platform General Settings',
    category: 'Platform Configuration',
    description: 'Manage legal entity details (TrippeChalo India Pvt. Ltd.), GSTIN, registered office address, and customer care channels.'
  },
  '/admin/profile': {
    title: 'Super Admin Profile',
    category: 'Account Security',
    description: 'Manage super administrator credentials, contact information, password security, and active login sessions.'
  }
};

export default function AdminPageGuide() {
  const location = useLocation();
  const currentPath = location.pathname;

  // By default CLOSED on all pages as requested
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Reset to closed whenever route changes
  useEffect(() => {
    setIsExpanded(false);
  }, [currentPath]);

  // Find matching guide
  let guide = PAGE_GUIDES[currentPath];
  if (!guide) {
    const matchKey = Object.keys(PAGE_GUIDES).find(key => 
      key !== '/admin/dashboard' && key !== '/admin' && currentPath.startsWith(key)
    );
    if (matchKey) {
      guide = PAGE_GUIDES[matchKey];
    }
  }

  if (!guide) {
    return null;
  }

  return (
    <div className="mb-3">
      {/* Top bar with LEFT-aligned button */}
      <div className="flex items-center justify-start">
        <button
          onClick={() => setIsExpanded(prev => !prev)}
          className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl transition-all duration-200 shadow-2xs group ${
            isExpanded
              ? 'bg-blue-600 text-white shadow-blue-200/50'
              : 'bg-white text-blue-700 hover:text-blue-800 hover:bg-blue-50/80 border border-blue-200/90 hover:border-blue-300'
          }`}
          title="Toggle page information"
        >
          <HelpCircle size={14} className={isExpanded ? 'text-white' : 'text-blue-600 group-hover:scale-110 transition-transform'} />
          <span>About this page</span>
          <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Smooth sliding drawer with high-contrast bold details */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-60 opacity-100 mt-2.5 transform translate-y-0' : 'max-h-0 opacity-0 -translate-y-1'
        }`}
      >
        <div className="bg-gradient-to-r from-blue-50/95 via-sky-50/50 to-white text-slate-800 rounded-xl px-4 py-3 shadow-xs border border-blue-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Left section: Icon + Title + Category + High-contrast bold Description */}
          <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 shadow-2xs">
              <Info size={14} />
            </div>
            
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 min-w-0">
              <span className="font-black text-slate-900 text-[13px] tracking-tight shrink-0">
                {guide.title}
              </span>
              <span className="text-[10px] font-black text-blue-800 bg-blue-100/90 border border-blue-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                {guide.category}
              </span>
              <span className="hidden sm:inline text-slate-300 font-bold">•</span>
              <span className="text-slate-800 font-medium text-[13px] leading-relaxed">
                {guide.description}
              </span>
            </div>
          </div>

          {/* Right section: Close button */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-blue-100/50 transition-colors"
              title="Close page info"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
