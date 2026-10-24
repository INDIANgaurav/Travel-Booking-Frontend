import React, { useState, useEffect } from 'react';
import { 
  Plus, Server, CheckCircle, XCircle, Activity, Key, Copy, Eye, EyeOff, 
  Download, ExternalLink, Edit, Trash2, Printer, FileText,
  Search, Ticket, Calendar, Plane, User as UserIcon, RefreshCw, CheckCheck, Clock, ShieldCheck, ArrowRight
} from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import Dropdown from '../../../components/ui/Dropdown';

interface B2BClient {
  _id: string;
  companyName: string;
  contactName: string;
  email: string;
  username?: string;
  password?: string;
  basicAuthKey?: string;
  auth_channel?: string;
  testApiKey: string;
  liveApiKey: string;
  status: 'Pending' | 'Testing' | 'Live' | 'Suspended';
  isVerified?: boolean;
  apiWalletBalance: number;
  rateLimitPerMinute: number;
  markupPercentage: number;
  createdAt: string;
  totalBookings?: number;
  testBookings?: number;
  liveBookings?: number;
}

interface PartnerBookingPassenger {
  name: string;
  gender?: string;
  type?: string;
  status?: string;
}

interface PartnerBooking {
  _id: string;
  bookingId: string;
  type: string;
  status: string;
  isTestBooking?: boolean;
  totalAmount: number;
  date: string;
  createdAt: string;
  details?: {
    airline?: string;
    flightNo?: string;
    from?: string;
    to?: string;
    pnr?: string;
    isTestBooking?: boolean;
    travelDate?: string;
    departureTime?: string;
    arrivalTime?: string;
    passengers?: PartnerBookingPassenger[];
    b2bClientId?: string;
    b2bCompanyName?: string;
  };
}

export default function AdminB2BPartners() {
  const [partners, setPartners] = useState<B2BClient[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<B2BClient | null>(null);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<B2BClient | null>(null);
  const [partnerToDelete, setPartnerToDelete] = useState<B2BClient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Partner Bookings verification modal states
  const [isBookingsModalOpen, setIsBookingsModalOpen] = useState(false);
  const [partnerForBookings, setPartnerForBookings] = useState<B2BClient | null>(null);
  const [partnerBookings, setPartnerBookings] = useState<PartnerBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');
  const [bookingFilterTab, setBookingFilterTab] = useState<'ALL' | 'TEST' | 'LIVE'>('ALL');
  const [isPromotingPartner, setIsPromotingPartner] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    username: '',
    password: '',
    status: 'Testing' as 'Pending' | 'Testing' | 'Live' | 'Suspended',
    isVerified: false,
    rateLimitPerMinute: 60,
    markupPercentage: 0,
    apiWalletBalance: 0
  });

  // UI state
  const [showTestKey, setShowTestKey] = useState(false);
  const [showLiveKey, setShowLiveKey] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/b2b-clients');
      if (res.data.success) {
        setPartners(res.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch partners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartnerBookings = async (partnerId: string) => {
    try {
      setBookingsLoading(true);
      const res = await api.get(`/api/admin/b2b-clients/${partnerId}/bookings`);
      if (res.data.success) {
        setPartnerBookings(res.data.data || []);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch partner bookings');
    } finally {
      setBookingsLoading(false);
    }
  };

  const openBookingsModal = (partner: B2BClient) => {
    setPartnerForBookings(partner);
    setBookingSearchQuery('');
    setBookingFilterTab('ALL');
    setIsBookingsModalOpen(true);
    fetchPartnerBookings(partner._id);
  };

  const handlePromoteToLive = async (partner: B2BClient) => {
    try {
      setIsPromotingPartner(true);
      const res = await api.put(`/api/admin/b2b-clients/${partner._id}`, {
        status: 'Live',
        isVerified: true
      });
      if (res.data.success) {
        toast.success(`🎉 Partner "${partner.companyName}" successfully verified & upgraded to LIVE PRODUCTION!`);
        const updated = res.data.data;
        setPartners(prev => prev.map(p => p._id === updated._id ? { ...p, ...updated } : p));
        setPartnerForBookings(prev => prev ? { ...prev, ...updated } : null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to promote partner to live');
    } finally {
      setIsPromotingPartner(false);
    }
  };

  const copyVerificationSnippet = (booking: PartnerBooking) => {
    const isTest = booking.isTestBooking || booking.details?.isTestBooking;
    const pnr = booking.details?.pnr || 'N/A';
    const sector = `${booking.details?.from || 'DEL'} ➔ ${booking.details?.to || 'BOM'}`;
    const flight = `${booking.details?.airline || 'Airline'} ${booking.details?.flightNo || ''}`.trim();
    const paxList = booking.details?.passengers?.map(p => p.name).join(', ') || 'N/A';
    const bookingDate = new Date(booking.createdAt || booking.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const text = `✅ TrippeChalo B2B API Booking Verified:\n• Partner: ${partnerForBookings?.companyName || 'B2B Partner'}\n• Environment: ${isTest ? 'Sandbox / Testing' : 'Live Production'}\n• PNR: ${pnr}\n• Booking ID: ${booking.bookingId}\n• Sector: ${sector}\n• Flight: ${flight}\n• Booking Date: ${bookingDate}\n• Passengers: ${paxList}\n• Status: CONFIRMED in Database`;

    navigator.clipboard.writeText(text);
    toast.success('Verification report copied to clipboard!');
  };

  const formatDateGroupHeading = (dateStr: string) => {
    if (!dateStr) return 'Unknown Date';
    const targetDate = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = targetDate.toDateString() === today.toDateString();
    const isYesterday = targetDate.toDateString() === yesterday.toDateString();

    const formatted = targetDate.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    if (isToday) return `Today • ${formatted}`;
    if (isYesterday) return `Yesterday • ${formatted}`;
    return formatted;
  };

  const handleOpenAddModal = () => {
    setEditingPartner(null);
    setFormData({
      companyName: '',
      contactName: '',
      email: '',
      username: '',
      password: '',
      status: 'Testing',
      isVerified: false,
      rateLimitPerMinute: 60,
      markupPercentage: 0,
      apiWalletBalance: 0
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (partner: B2BClient) => {
    setEditingPartner(partner);
    setFormData({
      companyName: partner.companyName || '',
      contactName: partner.contactName || '',
      email: partner.email || '',
      username: partner.username || '',
      password: partner.password || '',
      status: partner.status || 'Testing',
      isVerified: partner.isVerified ?? (partner.status === 'Live'),
      rateLimitPerMinute: partner.rateLimitPerMinute || 60,
      markupPercentage: partner.markupPercentage || 0,
      apiWalletBalance: partner.apiWalletBalance || 0
    });
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPartner) {
        // UPDATE EXISTING PARTNER
        const res = await api.put(`/api/admin/b2b-clients/${editingPartner._id}`, formData);
        if (res.data.success) {
          const updated = res.data.data;
          toast.success(`Partner "${updated.companyName}" updated successfully!`);
          setPartners(prev => prev.map(p => p._id === updated._id ? updated : p));
          setIsAddModalOpen(false);
          setEditingPartner(null);
          if (selectedPartner?._id === updated._id) {
            setSelectedPartner(updated);
          }
        }
      } else {
        // CREATE NEW PARTNER
        const res = await api.post('/api/admin/b2b-clients', formData);
        if (res.data.success) {
          const created = res.data.data;
          toast.success(`B2B Partner "${created.companyName}" onboarded successfully!`);
          setPartners(prev => [created, ...prev]);
          setIsAddModalOpen(false);
          openDocs(created);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save partner');
    }
  };

  const handleDeletePartner = (partner: B2BClient) => {
    setPartnerToDelete(partner);
  };

  const confirmDeletePartner = async () => {
    if (!partnerToDelete) return;
    try {
      setIsDeleting(true);
      const res = await api.delete(`/api/admin/b2b-clients/${partnerToDelete._id}`);
      if (res.data.success) {
        toast.success(`Partner "${partnerToDelete.companyName}" deleted and all API access revoked.`);
        setPartners(prev => prev.filter(p => p._id !== partnerToDelete._id));
      }
    } catch (error: any) {
      console.error('Failed to delete partner', error);
      toast.error(error.response?.data?.error || 'Failed to delete partner');
    } finally {
      setIsDeleting(false);
      setPartnerToDelete(null);
    }
  };

  const copyToClipboard = (text: string) => {

    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const copyWelcomeKit = (partner: B2BClient) => {
    const text = `=========================================
TrippeChalo B2B Flight API - Access Details
=========================================
Company: ${partner.companyName}
Contact: ${partner.contactName} (${partner.email})

── STEP 1: GET YOUR TOKEN ──
URL:  POST /api/v1/b2b/auth/token

Send this in body (JSON):
{
  "username": "${partner.username || 'N/A'}",
  "password": "${partner.password || 'N/A'}"
}

You will receive a "tokenId" in response.
This token is valid for 24 hours.

── STEP 2: USE TOKEN TO SEARCH & BOOK ──
Add this header in every request:
  Authorization: Bearer <your_tokenId>

Available APIs:
  GET  /api/v1/b2b/search/sectors     → See available routes
  POST /api/v1/b2b/search/flights     → Search flights
  POST /api/v1/b2b/flights/book       → Book a flight

── YOUR CREDENTIALS ──
Username:  ${partner.username || 'N/A'}
Password:  ${partner.password || 'N/A'}
API Key:   ${partner.testApiKey}

Note: Keep these credentials safe. Do not share publicly.
=========================================`;
    navigator.clipboard.writeText(text);
    toast.success('Partner Access Details copied to clipboard!');
  };


  const getServerUrl = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return `${window.location.protocol}//${window.location.hostname}:5000`;
    }
    return import.meta.env.VITE_API_URL || 'https://travel-go-backend-ozbw.onrender.com';
  };

  const generateDocumentHtml = (partner: B2BClient, env: 'test' | 'live' = 'test') => {
    const serverUrl = getServerUrl();
    const isLive = env === 'live';
    const apiKey = isLive ? partner.liveApiKey : partner.testApiKey;
    const envBadge = isLive ? 'PRODUCTION (LIVE)' : 'SANDBOX (TESTING & UAT)';
    const envColor = isLive ? '#10b981' : '#f59e0b';
    const formattedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    return `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>TrippeChalo B2B Flight API Specification - ${partner.companyName}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page WordSection1 {
      size: 595.3pt 841.9pt;
      margin: 36pt 40pt 36pt 40pt;
    }
    div.WordSection1 {
      page: WordSection1;
    }
    @media print {
      body { margin: 0; padding: 15px; }
      .no-print { display: none !important; }
    }
    body {
      font-family: 'Segoe UI', Calibri, Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.55;
      color: #1e293b;
      margin: 15px;
      background-color: #ffffff;
    }
    .header-box {
      background: linear-gradient(135deg, #0a2540 0%, #1e3a8a 100%);
      color: #ffffff;
      padding: 24px 28px;
      border-radius: 8px;
      margin-bottom: 24px;
      border-bottom: 4px solid #3b82f6;
    }
    .header-org {
      font-size: 10pt;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #93c5fd;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .header-title {
      font-size: 21pt;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 6px 0;
      line-height: 1.2;
    }
    .header-subtitle {
      font-size: 11pt;
      color: #cbd5e1;
      margin: 0;
      font-weight: 400;
    }
    .meta-table {
      width: 100%;
      margin-top: 16px;
      border-top: 1px solid #334155;
      padding-top: 12px;
    }
    .meta-table td {
      padding: 3px 0;
      font-size: 9.5pt;
      color: #cbd5e1;
    }
    .alert-box {
      padding: 12px 18px;
      border-radius: 6px;
      margin: 16px 0;
      border-left: 5px solid ${envColor};
      background-color: ${isLive ? '#f0fdf4' : '#fffbeb'};
      color: ${isLive ? '#166534' : '#92400e'};
      font-size: 9.5pt;
      line-height: 1.5;
    }
    h2 {
      color: #0f172a;
      font-size: 13pt;
      font-weight: 800;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 5px;
      margin-top: 28px;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    h3 {
      color: #1e40af;
      font-size: 11pt;
      font-weight: 700;
      margin-top: 20px;
      margin-bottom: 8px;
    }
    .code-box {
      background-color: #0f172a;
      color: #38bdf8;
      padding: 14px 18px;
      border-radius: 6px;
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 9pt;
      white-space: pre-wrap;
      word-break: break-all;
      margin: 8px 0 16px 0;
      line-height: 1.45;
      border: 1px solid #1e293b;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 18px 0;
      font-size: 9.5pt;
    }
    table.data-table th {
      background-color: #f1f5f9;
      color: #0f172a;
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      font-weight: 700;
      text-align: left;
    }
    table.data-table td {
      border: 1px solid #cbd5e1;
      padding: 7px 10px;
      vertical-align: top;
    }
    table.data-table tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    .badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 8.5pt;
      font-weight: 700;
    }
    .badge-post { background-color: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
    .badge-get { background-color: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
    .badge-env { background-color: ${isLive ? '#dcfce7' : '#fef3c7'}; color: ${isLive ? '#15803d' : '#92400e'}; border: 1px solid ${isLive ? '#bbf7d0' : '#fde68a'}; }
    .badge-req { background-color: #fee2e2; color: #b91c1c; font-size: 8pt; padding: 1px 5px; border-radius: 3px; font-weight: bold; }
    .badge-opt { background-color: #f1f5f9; color: #64748b; font-size: 8pt; padding: 1px 5px; border-radius: 3px; }
    .footer-note {
      margin-top: 40px;
      padding-top: 15px;
      border-top: 1px solid #e2e8f0;
      font-size: 8.5pt;
      color: #64748b;
      text-align: center;
      line-height: 1.6;
    }
  </style>
</head>
<body>
<div class="WordSection1">
  <div class="no-print" style="margin-bottom: 20px; padding: 12px 18px; background: #0f172a; color: #ffffff; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
    <div>
      <strong style="color: #60a5fa; font-size: 14px;">📄 TrippeChalo B2B Flight API Specification (${envBadge})</strong>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">In the print preview dialog, select <strong>"Save as PDF"</strong> under Destination to export.</div>
    </div>
    <div style="display: flex; gap: 8px;">
      <button onclick="window.print()" style="background: #2563eb; color: #ffffff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 12px; cursor: pointer;">🖨️ Print / Save as PDF</button>
      <button onclick="window.close()" style="background: #334155; color: #ffffff; border: none; padding: 8px 14px; border-radius: 6px; font-weight: bold; font-size: 12px; cursor: pointer;">Close Preview</button>
    </div>
  </div>

  <!-- Corporate Header -->
  <div class="header-box">
    <div class="header-org">TRIPPECHALO INDIA PRIVATE LIMITED • B2B DISTRIBUTION</div>
    <div class="header-title">B2B FLIGHT DISTRIBUTION API</div>
    <div class="header-subtitle">Enterprise Technical Interface Specification & UAT Certification Guide</div>
    <table class="meta-table">
      <tr>
        <td style="width: 140px; font-weight: bold; color: #94a3b8;">Partner Organization:</td>
        <td style="color: #ffffff; font-weight: bold;">${partner.companyName}</td>
        <td style="width: 130px; font-weight: bold; color: #94a3b8;">Environment:</td>
        <td><span class="badge badge-env">${envBadge}</span></td>
      </tr>
      <tr>
        <td style="font-weight: bold; color: #94a3b8;">Technical Contact:</td>
        <td>${partner.contactName} (${partner.email})</td>
        <td style="font-weight: bold; color: #94a3b8;">Interface Protocol:</td>
        <td>REST API (JSON over HTTPS)</td>
      </tr>
      <tr>
        <td style="font-weight: bold; color: #94a3b8;">Assigned Client ID:</td>
        <td style="color: #60a5fa; font-weight: bold;">${partner.username || 'N/A'}</td>
        <td style="font-weight: bold; color: #94a3b8;">Document Version:</td>
        <td>2.4.0 (Enterprise Release) • ${formattedDate}</td>
      </tr>
    </table>
  </div>

  <h2>1. INTEGRATION CREDENTIALS & HOST CONFIGURATION</h2>
  <p>The following pre-configured credentials have been provisioned for <strong>${partner.companyName}</strong>. All requests must be dispatched over secure TLS 1.3/HTTPS.</p>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 25%;">Parameter</th>
        <th style="width: 35%;">Configured Value</th>
        <th style="width: 40%;">Description & Usage</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Server Base URL</strong></td>
        <td><code style="color: #2563eb; font-weight: bold;">${serverUrl}</code></td>
        <td>Root endpoint for all API transactions</td>
      </tr>
      <tr>
        <td><strong>Username (Client ID)</strong></td>
        <td><code style="font-weight: bold;">${partner.username || 'N/A'}</code></td>
        <td>Used in Step 1 OAuth token generation</td>
      </tr>
      <tr>
        <td><strong>Password (Secret)</strong></td>
        <td><code style="font-weight: bold;">${partner.password || 'N/A'}</code></td>
        <td>Used in Step 1 OAuth token generation</td>
      </tr>
      <tr>
        <td><strong>API Key (${isLive ? 'Production Key' : 'Sandbox Test Key'})</strong></td>
        <td><code style="color: #d97706; font-weight: bold;">${apiKey}</code></td>
        <td>Can be supplied as <code>x-api-key</code> in HTTP headers</td>
      </tr>
      <tr>
        <td><strong>Authentication Channel</strong></td>
        <td><code>${partner.auth_channel || 'cugtest.trippechalo.com'}</code></td>
        <td>Authorized B2B client routing channel</td>
      </tr>
    </tbody>
  </table>

  <div class="alert-box">
    ${isLive ? `
      <strong>⚠️ COMMERCIAL PRODUCTION NOTICE:</strong><br/>
      You are connected to the <strong>LIVE PRODUCTION ENVIRONMENT</strong>. All booking calls submitted here deduct real aircraft inventory from live airline series and decrement actual commercial funds from your TrippeChalo API Wallet. Ensure wallet balance is funded prior to issuing bookings.
    ` : `
      <strong>ℹ️ SANDBOX TESTING & CERTIFICATION NOTICE:</strong><br/>
      You are currently accessing the <strong>SANDBOX SIMULATION ENVIRONMENT</strong>. All flight search and booking transactions simulate inventory confirmation without debiting real funds or blocking physical airline seats. Complete the mandatory UAT test scenarios described below to qualify for production rollout.
    `}
  </div>

  <h2>2. MANDATORY UAT TEST SCENARIOS & CERTIFICATION CRITERIA</h2>
  <p>Before <strong>${partner.companyName}</strong> can be approved and promoted to the Live Production environment, your development team must execute the following <strong>4 mandatory test scenarios</strong> in Sandbox mode and provide the generated PNR records for audit:</p>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 15%;">Scenario ID</th>
        <th style="width: 25%;">Test Description</th>
        <th style="width: 30%;">Required Manifest & Input</th>
        <th style="width: 30%;">Expected Result & Verification</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>TC-01 (Mandatory)</strong></td>
        <td><strong>Solo Adult Oneway Booking (Domestic)</strong></td>
        <td>
          • Adults: 1 (Mr. Rohan Sharma)<br/>
          • Route: DEL ➔ BOM (Domestic Sector)<br/>
          • Note: <em>No passport required for domestic</em>
        </td>
        <td>
          Status returns <code>CONFIRMED</code> with unique PNR (e.g. <code>TEST-XXXXXX</code>). Ticket record verified in database.
        </td>
      </tr>
      <tr>
        <td><strong>TC-02 (Mandatory)</strong></td>
        <td><strong>Multi-Pax Family Booking (2 Adults + 1 Child + 1 Infant - Domestic)</strong></td>
        <td>
          • Adults: 2 (Mr. Rohan Sharma, Mrs. Priya Sharma)<br/>
          • Children: 1 (Mstr. Aarav Sharma, Age 7, DOB provided)<br/>
          • Infants: 1 (Miss Anaya Sharma, Age 1, DOB provided)<br/>
          • Route: DEL ➔ BOM (Domestic - No passport needed)
        </td>
        <td>
          Status returns <code>CONFIRMED</code>. Manifest must verify all 4 passengers ticketed under a single master PNR with correct passenger age categories.
        </td>
      </tr>
      <tr>
        <td><strong>TC-03 (Mandatory)</strong></td>
        <td><strong>Route Discovery & Dynamic Flight Search</strong></td>
        <td>
          • Call <code>GET /search/sectors</code><br/>
          • Call <code>POST /search/flights</code> for sector DEL ➔ BOM
        </td>
        <td>
          Retrieves active sectors list and returns available Series Fare flight items with seat counts and baggage rules.
        </td>
      </tr>
      <tr>
        <td><strong>TC-04 (Mandatory)</strong></td>
        <td><strong>Seat Depletion & Boundary Test</strong></td>
        <td>
          • Request booking with passenger count exceeding remaining flight seats.
        </td>
        <td>
          System gracefully rejects with HTTP 400 Bad Request and message: <code>"Not enough seats available"</code>.
        </td>
      </tr>
    </tbody>
  </table>

  <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px 16px; margin: 14px 0;">
    <strong style="color: #1e3a8a;">📋 How to Submit for Admin Verification & Production Sign-off:</strong><br/>
    <span style="font-size: 9pt; color: #475569;">
      1. Run the test calls from your application or Postman using your sandbox credentials.<br/>
      2. Record the generated <strong>PNR numbers</strong> (e.g. <code>TEST-204554</code>) and <strong>Booking IDs</strong> (e.g. <code>BK-B2B-TEST-204554</code>).<br/>
      3. Email the PNR list to <strong>api-support@trippechalo.com</strong> or inform your TrippeChalo Integration Manager.<br/>
      4. The TrippeChalo Operations Team will verify the bookings in our <strong>Admin Verification Console</strong> and immediately upgrade your partner status to <strong>Live Production</strong>.
    </span>
  </div>

  <h2>3. API ENDPOINTS DETAILED SPECIFICATION</h2>

  <h3>3.1 Step 1: Authentication & Token Generation</h3>
  <table class="data-table">
    <tr>
      <td style="width: 25%; font-weight: bold; background-color: #f1f5f9;">Endpoint URL</td>
      <td><code>${serverUrl}/api/v1/b2b/oauth2/tokens</code> &nbsp;<em>(Alias: <code>${serverUrl}/api/v1/b2b/auth/token</code>)</em></td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #f1f5f9;">HTTP Method</td>
      <td><span class="badge badge-post">POST</span></td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #f1f5f9;">Content-Type</td>
      <td><code>application/json</code></td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #f1f5f9;">Authentication</td>
      <td>None (Public Token Issuer)</td>
    </tr>
  </table>

  <p><strong>Request Body Parameters:</strong></p>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 20%;">Field</th>
        <th style="width: 15%;">Type</th>
        <th style="width: 15%;">Requirement</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>username</code></td>
        <td>String</td>
        <td><span class="badge-req">Mandatory</span></td>
        <td>Assigned Client ID (e.g. <code>${partner.username || 'mmt1122'}</code>)</td>
      </tr>
      <tr>
        <td><code>password</code></td>
        <td>String</td>
        <td><span class="badge-req">Mandatory</span></td>
        <td>Assigned partner password secret</td>
      </tr>
    </tbody>
  </table>

  <p><strong>Sample Request Payload:</strong></p>
  <div class="code-box">{
  "username": "${partner.username || 'YOUR_USERNAME'}",
  "password": "${partner.password || 'YOUR_PASSWORD'}"
}</div>

  <p><strong>Sample Response Payload (HTTP 200 OK):</strong></p>
  <div class="code-box">{
  "success": true,
  "status": "SUCCESS",
  "tokenId": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6IjZhZGEzMDkyMzI5OWY2MGQ4ODNlZTUyNCI...",
  "data": {
    "tokenId": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "environment": "${isLive ? 'PRODUCTION' : 'SANDBOX'}"
  }
}</div>
  <p style="font-size: 9pt; color: #64748b;">
    <strong>Token Usage Rule:</strong> Pass the returned <code>tokenId</code> in all subsequent requests within the HTTP Header as:<br/>
    <code style="color: #0f172a; font-weight: bold;">Authorization: Bearer &lt;tokenId&gt;</code>. Token validity is <strong>24 hours</strong>.
  </p>

  <h3>3.2 Step 2: Route & Sector Discovery Method</h3>
  <table class="data-table">
    <tr>
      <td style="width: 25%; font-weight: bold; background-color: #f1f5f9;">Endpoint URL</td>
      <td><code>${serverUrl}/api/v1/b2b/search/sectors</code></td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #f1f5f9;">HTTP Method</td>
      <td><span class="badge badge-get">GET</span></td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #f1f5f9;">Request Headers</td>
      <td><code>Authorization: Bearer &lt;tokenId&gt;</code> &nbsp;<em>(or <code>x-api-key: ${apiKey}</code>)</em></td>
    </tr>
  </table>

  <p><strong>Sample Response Payload (HTTP 200 OK):</strong></p>
  <div class="code-box">{
  "success": true,
  "status": "SUCCESS",
  "count": 4,
  "data": [
    {
      "origin": "DEL",
      "destination": "BOM",
      "airline": "IndiGo",
      "availableDates": ["2026-12-10", "2026-12-11", "2026-12-12"],
      "minFare": 4200,
      "totalFlights": 12
    },
    {
      "origin": "DEL",
      "destination": "BLR",
      "airline": "Air India",
      "availableDates": ["2026-12-15", "2026-12-16"],
      "minFare": 4800,
      "totalFlights": 8
    }
  ]
}</div>

  <h3>3.3 Step 3: Flight Inventory Search Method</h3>
  <table class="data-table">
    <tr>
      <td style="width: 25%; font-weight: bold; background-color: #f1f5f9;">Endpoint URL</td>
      <td><code>${serverUrl}/api/v1/b2b/search/flights</code></td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #f1f5f9;">HTTP Method</td>
      <td><span class="badge badge-post">POST</span></td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #f1f5f9;">Request Headers</td>
      <td>
        <code>Content-Type: application/json</code><br/>
        <code>Authorization: Bearer &lt;tokenId&gt;</code>
      </td>
    </tr>
  </table>

  <p><strong>Search Request Parameters:</strong></p>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 20%;">Field</th>
        <th style="width: 15%;">Type</th>
        <th style="width: 15%;">Requirement</th>
        <th>Description & Allowed Values</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>origin</code></td>
        <td>String</td>
        <td><span class="badge-req">Mandatory</span></td>
        <td>3-letter IATA Airport origin code (e.g. <code>"DEL"</code>)</td>
      </tr>
      <tr>
        <td><code>destination</code></td>
        <td>String</td>
        <td><span class="badge-req">Mandatory</span></td>
        <td>3-letter IATA Airport destination code (e.g. <code>"BOM"</code>)</td>
      </tr>
      <tr>
        <td><code>travelDate</code></td>
        <td>String</td>
        <td><span class="badge-req">Mandatory</span></td>
        <td>Date of departure in <code>YYYY-MM-DD</code> format</td>
      </tr>
      <tr>
        <td><code>adults</code></td>
        <td>Number</td>
        <td><span class="badge-req">Mandatory</span></td>
        <td>Number of Adult passengers (min: 1)</td>
      </tr>
      <tr>
        <td><code>children</code></td>
        <td>Number</td>
        <td><span class="badge-opt">Optional</span></td>
        <td>Number of Children passengers (ages 2 to 11)</td>
      </tr>
      <tr>
        <td><code>infants</code></td>
        <td>Number</td>
        <td><span class="badge-opt">Optional</span></td>
        <td>Number of Infant passengers (ages under 2)</td>
      </tr>
    </tbody>
  </table>

  <p><strong>Sample Search Request Payload:</strong></p>
  <div class="code-box">{
  "origin": "DEL",
  "destination": "BOM",
  "travelDate": "2026-12-10",
  "adults": 2,
  "children": 1,
  "infants": 1
}</div>

  <p><strong>Sample Search Response Payload (HTTP 200 OK):</strong></p>
  <div class="code-box">{
  "success": true,
  "count": 1,
  "data": [
    {
      "sfId": "SF-TC-C1A-20261210",
      "airline": "IndiGo",
      "flightNo": "6E-2045",
      "origin": "DEL",
      "destination": "BOM",
      "departureTime": "07:00",
      "arrivalTime": "09:15",
      "travelDate": "2026-12-10T00:00:00.000Z",
      "fare": 4200,
      "availableSeats": ${isLive ? '18' : '999'},
      "bookingType": "ONE_WAY",
      "checkinBaggage": "15 KG",
      "cabinBaggage": "7 KG",
      "isRefundable": false
    }
  ]
}</div>

  <h3>3.4 Step 4: Flight Booking & PNR Creation Method</h3>
  <table class="data-table">
    <tr>
      <td style="width: 25%; font-weight: bold; background-color: #f1f5f9;">Endpoint URL</td>
      <td><code>${serverUrl}/api/v1/b2b/flights/book</code></td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #f1f5f9;">HTTP Method</td>
      <td><span class="badge badge-post">POST</span></td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #f1f5f9;">Request Headers</td>
      <td>
        <code>Content-Type: application/json</code><br/>
        <code>Authorization: Bearer &lt;tokenId&gt;</code>
      </td>
    </tr>
  </table>

  <p><strong>Booking Request Parameters:</strong></p>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 20%;">Field</th>
        <th style="width: 15%;">Type</th>
        <th style="width: 15%;">Requirement</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>sfId</code></td>
        <td>String</td>
        <td><span class="badge-req">Mandatory</span></td>
        <td>Unique Series Flight identifier retrieved from Flight Search (Step 3)</td>
      </tr>
      <tr>
        <td><code>passengers</code></td>
        <td>Array</td>
        <td><span class="badge-req">Mandatory</span></td>
        <td>Array of Passenger Objects matching passenger categories (min 1 passenger)</td>
      </tr>
    </tbody>
  </table>

  <h2>4. PASSENGER MANIFEST & SECTOR RULES (DOMESTIC VS INTERNATIONAL)</h2>
  
  <div style="background-color: #eff6ff; border: 1.5px solid #3b82f6; border-radius: 8px; padding: 14px 18px; margin: 16px 0;">
    <strong style="color: #1e3a8a; font-size: 10.5pt;">✈️ SECTOR SPECIFICATION: DOMESTIC VS INTERNATIONAL FLIGHTS</strong><br/>
    <p style="margin: 6px 0 0 0; font-size: 9.5pt; color: #1e293b; line-height: 1.6;">
      • <strong>DOMESTIC FLIGHTS (India Sectors - e.g. DEL-BOM, BOM-BLR, DEL-GOI):</strong><br/>
      Passport details (<code>passportNo</code>, <code>passportExpiry</code>) are <strong>STRICTLY NOT REQUIRED</strong>. Adult Date of Birth (<code>dob</code>) is also optional for Adults. You only need: <code>title</code>, <code>firstName</code>, <code>lastName</code>, <code>type</code>, <code>gender</code>, and <code>dob</code> (only for Child/Infant to verify age).<br/><br/>
      • <strong>INTERNATIONAL FLIGHTS:</strong><br/>
      Passport details (<code>passportNo</code>, <code>passportExpiry</code>) and <code>dob</code> are <strong>MANDATORY</strong> for all passengers as per civil aviation regulations.
    </p>
  </div>

  <h3>4.1 Field-by-Field Manifest Data Dictionary</h3>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 15%;">Field</th>
        <th style="width: 12%;">Type</th>
        <th style="width: 22%;">Domestic Flights</th>
        <th style="width: 22%;">International Flights</th>
        <th>Rules & Validation Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>title</code></td>
        <td>String</td>
        <td><span class="badge-req">Mandatory</span></td>
        <td><span class="badge-req">Mandatory</span></td>
        <td><code>"Mr"</code>, <code>"Mrs"</code>, <code>"Ms"</code>, <code>"Mstr"</code>, <code>"Miss"</code></td>
      </tr>
      <tr>
        <td><code>firstName</code></td>
        <td>String</td>
        <td><span class="badge-req">Mandatory</span></td>
        <td><span class="badge-req">Mandatory</span></td>
        <td>Given name as displayed on Govt photo ID (Aadhaar/Voter ID/Passport)</td>
      </tr>
      <tr>
        <td><code>lastName</code></td>
        <td>String</td>
        <td><span class="badge-req">Mandatory</span></td>
        <td><span class="badge-req">Mandatory</span></td>
        <td>Last name / Surname as displayed on Govt photo ID</td>
      </tr>
      <tr>
        <td><code>type</code></td>
        <td>String</td>
        <td><span class="badge-req">Mandatory</span></td>
        <td><span class="badge-req">Mandatory</span></td>
        <td><code>"ADULT"</code> (12+ yrs), <code>"CHILD"</code> (2-11 yrs), <code>"INFANT"</code> (&lt;2 yrs)</td>
      </tr>
      <tr>
        <td><code>gender</code></td>
        <td>String</td>
        <td><span class="badge-req">Mandatory</span></td>
        <td><span class="badge-req">Mandatory</span></td>
        <td><code>"Male"</code>, <code>"Female"</code></td>
      </tr>
      <tr>
        <td><code>dob</code></td>
        <td>String</td>
        <td><span class="badge-opt">Required ONLY for Child & Infant</span><br/><span style="font-size: 8pt; color: #64748b;">(Not needed for Adults)</span></td>
        <td><span class="badge-req">Mandatory for ALL Pax</span></td>
        <td>Date of birth (<code>YYYY-MM-DD</code>). In domestic flights, strictly required for CHD and INF to confirm fare qualification.</td>
      </tr>
      <tr>
        <td><code>passportNo</code></td>
        <td>String</td>
        <td><span style="background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 8pt;">NOT REQUIRED (Omit)</span></td>
        <td><span class="badge-req">Mandatory</span></td>
        <td>Passport alphanumeric number. Only required when booking international sectors.</td>
      </tr>
      <tr>
        <td><code>passportExpiry</code></td>
        <td>String</td>
        <td><span style="background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 8pt;">NOT REQUIRED (Omit)</span></td>
        <td><span class="badge-req">Mandatory</span></td>
        <td>Passport expiration date (<code>YYYY-MM-DD</code>). Must have 6+ months validity.</td>
      </tr>
    </tbody>
  </table>

  <h3>4.2 Standard Domestic Booking Request (2 Adults + 1 Child + 1 Infant)</h3>
  <p style="font-size: 9pt; color: #475569;">
    Notice that for domestic flights, <strong>no passport fields are sent</strong>, and <code>dob</code> is only provided for Child and Infant:
  </p>
  <div class="code-box">{
  "sfId": "SF-TC-C1A-20261210",
  "passengers": [
    {
      "title": "Mr",
      "firstName": "Rohan",
      "lastName": "Sharma",
      "type": "ADULT",
      "gender": "Male"
    },
    {
      "title": "Mrs",
      "firstName": "Priya",
      "lastName": "Sharma",
      "type": "ADULT",
      "gender": "Female"
    },
    {
      "title": "Mstr",
      "firstName": "Aarav",
      "lastName": "Sharma",
      "type": "CHILD",
      "gender": "Male",
      "dob": "2018-03-10"
    },
    {
      "title": "Miss",
      "firstName": "Anaya",
      "lastName": "Sharma",
      "type": "INFANT",
      "gender": "Female",
      "dob": "2025-06-14"
    }
  ]
}</div>

  <h3>4.3 International Booking Request (When Sector is International)</h3>
  <div class="code-box">{
  "sfId": "SF-TC-INT-20261210",
  "passengers": [
    {
      "title": "Mr",
      "firstName": "Rohan",
      "lastName": "Sharma",
      "type": "ADULT",
      "gender": "Male",
      "dob": "1990-05-15",
      "passportNo": "TC8892101",
      "passportExpiry": "2032-08-31"
    },
    {
      "title": "Mrs",
      "firstName": "Priya",
      "lastName": "Sharma",
      "type": "ADULT",
      "gender": "Female",
      "dob": "1992-08-22",
      "passportNo": "TC8892102",
      "passportExpiry": "2032-08-31"
    }
  ]
}</div>

  <p><strong>Sample Booking Confirmation Response Payload (HTTP 200 OK):</strong></p>
  <div class="code-box">{
  "success": true,
  "data": {
    "pnr": "TC${Math.floor(100000 + Math.random() * 900000)}",
    "bookingId": "BK-B2B-${Math.floor(100000 + Math.random() * 900000)}",
    "status": "CONFIRMED",
    "message": "Flight booked successfully.",
    "flight": {
      "sfId": "SF-TC-C1A-20261210",
      "airline": "IndiGo",
      "flightNo": "6E-2045",
      "origin": "DEL",
      "destination": "BOM",
      "travelDate": "2026-12-10T00:00:00.000Z",
      "departureTime": "07:00",
      "arrivalTime": "09:15",
      "remainingSeats": 14,
      "totalFare": 13500
    },
    "passengers": [
      { "title": "Mr", "firstName": "Rohan", "lastName": "Sharma", "type": "ADULT", "gender": "Male" },
      { "title": "Mrs", "firstName": "Priya", "lastName": "Sharma", "type": "ADULT", "gender": "Female" },
      { "title": "Mstr", "firstName": "Aarav", "lastName": "Sharma", "type": "CHILD", "gender": "Male" },
      { "title": "Miss", "firstName": "Anaya", "lastName": "Sharma", "type": "INFANT", "gender": "Female" }
    ]
  }
}</div>

  <h2>5. STANDARD HTTP STATUS CODES & EXCEPTION DICTIONARY</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 15%;">HTTP Code</th>
        <th style="width: 25%;">Error Code / Reason</th>
        <th>Description & Corrective Action</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>200 OK</code></td>
        <td><code>SUCCESS</code></td>
        <td>Transaction processed and booking confirmed in database.</td>
      </tr>
      <tr>
        <td><code>400 Bad Request</code></td>
        <td><code>INVALID_PAYLOAD</code></td>
        <td>Missing required fields (e.g. <code>sfId</code> or empty <code>passengers</code> array). Verify JSON format.</td>
      </tr>
      <tr>
        <td><code>401 Unauthorized</code></td>
        <td><code>INVALID_CREDENTIALS</code></td>
        <td>Token has expired or invalid API credentials supplied. Re-authenticate via Step 1.</td>
      </tr>
      <tr>
        <td><code>402 Payment Required</code></td>
        <td><code>INSUFFICIENT_WALLET</code></td>
        <td>(Production Mode) Partner API Wallet has insufficient funds. Top up wallet via TrippeChalo Admin.</td>
      </tr>
      <tr>
        <td><code>403 Forbidden</code></td>
        <td><code>ENVIRONMENT_MISMATCH</code></td>
        <td>Attempted to book a Sandbox test flight in Live Production, or partner account is suspended.</td>
      </tr>
      <tr>
        <td><code>404 Not Found</code></td>
        <td><code>FLIGHT_NOT_FOUND</code></td>
        <td>The requested <code>sfId</code> is either inactive, does not exist, or has been sold out.</td>
      </tr>
      <tr>
        <td><code>500 Server Error</code></td>
        <td><code>INTERNAL_ERROR</code></td>
        <td>Unexpected gateway condition. Contact technical operations team immediately with timestamp.</td>
      </tr>
    </tbody>
  </table>

  <h2>6. TECHNICAL SUPPORT & GO-LIVE ASSISTANCE</h2>
  <table class="data-table">
    <tr>
      <td style="width: 30%; font-weight: bold; background-color: #f1f5f9;">API Operations Desk</td>
      <td><code>api-support@trippechalo.com</code></td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #f1f5f9;">Account Technical Manager</td>
      <td>TrippeChalo B2B Technical Integration Cell</td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #f1f5f9;">Escalation SLA</td>
      <td>Sandbox UAT Verification: Within 2 Business Hours</td>
    </tr>
  </table>

  <div class="footer-note">
    <strong>TRIPPECHALO INDIA PRIVATE LIMITED</strong> • AIRLINE DISTRIBUTION & API GATEWAY<br/>
    This technical document is prepared exclusively for <strong>${partner.companyName}</strong>. Distribution or disclosure to unauthorized third parties is strictly prohibited.
  </div>
</div>
</body>
</html>`;
  };

  const downloadCustomizedDoc = (partner: B2BClient, env: 'test' | 'live' = 'test') => {
    const isLive = env === 'live';
    const htmlContent = generateDocumentHtml(partner, env);
    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword;charset=utf-8;'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `TrippeChalo_${isLive ? 'LIVE' : 'SANDBOX'}_API_${partner.companyName.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
    link.click();
    toast.success(`${isLive ? 'Live Production' : 'Sandbox Test'} Word Document (.doc) downloaded for ${partner.companyName}!`);
  };

  const printOrDownloadPdf = (partner: B2BClient, env: 'test' | 'live' = 'test') => {
    const html = generateDocumentHtml(partner, env);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to open the print/PDF preview');
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const downloadCustomizedPostman = (partner: B2BClient, env: 'test' | 'live' = 'test') => {
    const serverUrl = getServerUrl();
    const isLive = env === 'live';
    const apiKey = isLive ? partner.liveApiKey : partner.testApiKey;
    const collection = {
      info: {
        name: `TrippeChalo B2B Flight API (${isLive ? 'LIVE' : 'SANDBOX'}) - ${partner.companyName}`,
        _postman_id: `tc-b2b-${isLive ? 'live' : 'test'}-${partner._id}`,
        description: `Official TrippeChalo B2B API Postman Collection (${isLive ? 'LIVE PRODUCTION' : 'SANDBOX TESTING'}) customized for ${partner.companyName}.`,
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      variable: [
        { key: "baseUrl", value: `${serverUrl}/api/v1/b2b`, type: "string" },
        { key: "username", value: partner.username || "", type: "string" },
        { key: "password", value: partner.password || "", type: "string" },
        { key: "apiKey", value: apiKey || "", type: "string" },
        { key: "environment", value: isLive ? "PRODUCTION" : "SANDBOX", type: "string" },
        { key: "tokenId", value: "", type: "string" }
      ],
      item: [
        {
          name: "1. Authenticate Method (POST /oauth2/tokens)",
          event: [{
            listen: "test",
            script: {
              exec: [
                "var jsonData = pm.response.json();",
                "var token = jsonData.tokenId || (jsonData.data && jsonData.data.tokenId);",
                "if (token) {",
                "    pm.collectionVariables.set('tokenId', token);",
                "    console.log('✅ TokenId saved: ' + token);",
                "}"
              ],
              type: "text/javascript"
            }
          }],
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json", type: "text" }],
            body: { mode: "raw", raw: "{\n  \"username\": \"{{username}}\",\n  \"password\": \"{{password}}\"\n}" },
            url: { raw: "{{baseUrl}}/oauth2/tokens", host: ["{{baseUrl}}"], path: ["oauth2", "tokens"] }
          }
        },
        {
          name: "2. Flight Sector Method (GET /search/sectors)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{tokenId}}", type: "text" }],
            url: { raw: "{{baseUrl}}/search/sectors", host: ["{{baseUrl}}"], path: ["search", "sectors"] }
          }
        },
        {
          name: "3. Flight Search Method (POST /search/flights)",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{tokenId}}", type: "text" },
              { key: "Content-Type", value: "application/json", type: "text" }
            ],
            body: {
              mode: "raw",
              raw: "{\n  \"origin\": \"DEL\",\n  \"destination\": \"BOM\",\n  \"travelDate\": \"2026-12-10\",\n  \"adults\": 2,\n  \"children\": 1,\n  \"infants\": 1\n}"
            },
            url: { raw: "{{baseUrl}}/search/flights", host: ["{{baseUrl}}"], path: ["search", "flights"] }
          }
        },
        {
          name: "4. Flight Booking Method (POST /flights/book)",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{tokenId}}", type: "text" },
              { key: "Content-Type", value: "application/json", type: "text" }
            ],
            body: {
              mode: "raw",
              raw: "{\n  \"sfId\": \"SF-TC-C1A-20261210\",\n  \"passengers\": [\n    {\n      \"title\": \"Mr\",\n      \"firstName\": \"Rohan\",\n      \"lastName\": \"Sharma\",\n      \"type\": \"ADULT\",\n      \"gender\": \"MALE\",\n      \"dob\": \"1992-06-15\",\n      \"passportNo\": \"TC8892101\",\n      \"passportExpiry\": \"2032-08-31\"\n    },\n    {\n      \"title\": \"Mrs\",\n      \"firstName\": \"Priya\",\n      \"lastName\": \"Sharma\",\n      \"type\": \"ADULT\",\n      \"gender\": \"FEMALE\",\n      \"dob\": \"1994-09-24\",\n      \"passportNo\": \"TC8892102\",\n      \"passportExpiry\": \"2032-08-31\"\n    },\n    {\n      \"title\": \"Mstr\",\n      \"firstName\": \"Aarav\",\n      \"lastName\": \"Sharma\",\n      \"type\": \"CHILD\",\n      \"gender\": \"MALE\",\n      \"dob\": \"2017-11-12\",\n      \"passportNo\": \"TC8892103\",\n      \"passportExpiry\": \"2032-08-31\"\n    },\n    {\n      \"title\": \"Miss\",\n      \"firstName\": \"Anaya\",\n      \"lastName\": \"Sharma\",\n      \"type\": \"INFANT\",\n      \"gender\": \"FEMALE\",\n      \"dob\": \"2025-04-18\",\n      \"passportNo\": \"TC8892104\",\n      \"passportExpiry\": \"2032-08-31\"\n    }\n  ]\n}"
            },
            url: { raw: "{{baseUrl}}/flights/book", host: ["{{baseUrl}}"], path: ["flights", "book"] }
          }
        }
      ]
    };

    const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `TrippeChalo_Postman_${isLive ? 'LIVE' : 'SANDBOX'}_${partner.companyName.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    link.click();
    toast.success(`${isLive ? 'Live Production' : 'Sandbox Test'} Postman Collection downloaded for ${partner.companyName}!`);
  };

  const openDocs = (partner: B2BClient) => {
    setSelectedPartner(partner);
    setShowTestKey(false);
    setShowLiveKey(false);
    setShowPassword(false);
    setIsDocsModalOpen(true);
  };

  const openFullDocs = (env: 'test' | 'live') => {
    if (!selectedPartner) return;
    const key = env === 'test' ? selectedPartner.testApiKey : selectedPartner.liveApiKey;
    const url = `/api-docs?partner=${encodeURIComponent(selectedPartner.companyName)}&env=${env}&key=${encodeURIComponent(key)}`;
    window.open(url, '_blank');
  };

  // Filter partner bookings for verification modal
  const filteredBookings = partnerBookings.filter(b => {
    const isTest = b.isTestBooking || b.details?.isTestBooking;
    if (bookingFilterTab === 'TEST' && !isTest) return false;
    if (bookingFilterTab === 'LIVE' && isTest) return false;

    if (!bookingSearchQuery.trim()) return true;
    const query = bookingSearchQuery.toLowerCase().trim();
    const pnr = (b.details?.pnr || '').toLowerCase();
    const id = (b.bookingId || '').toLowerCase();
    const airline = (b.details?.airline || '').toLowerCase();
    const flightNo = (b.details?.flightNo || '').toLowerCase();
    const from = (b.details?.from || '').toLowerCase();
    const to = (b.details?.to || '').toLowerCase();
    const passengersMatch = b.details?.passengers?.some(p => p.name?.toLowerCase().includes(query));

    return pnr.includes(query) || id.includes(query) || airline.includes(query) || flightNo.includes(query) || from.includes(query) || to.includes(query) || Boolean(passengersMatch);
  });

  // Group by Date (Latest Date first)
  const groupedBookings = filteredBookings.reduce((acc, booking) => {
    const rawDate = booking.createdAt || booking.date || new Date().toISOString();
    const dateKey = new Date(rawDate).toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(booking);
    return acc;
  }, {} as Record<string, PartnerBooking[]>);

  // Sort dates descending (latest date on top)
  const sortedDateKeys = Object.keys(groupedBookings).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Server className="text-blue-600" /> B2B API Partners
          </h1>
          <p className="text-gray-500">Manage external companies consuming TrippeChalo APIs</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
        >
          <Plus size={20} />
          Add New Partner
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Activity className="animate-spin text-blue-600" size={32} /></div>
      ) : partners.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <Server className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900">No B2B Partners yet</h3>
          <p className="text-gray-500 mt-2">Add your first partner to generate their API keys.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map(partner => (
            <div key={partner._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col justify-between h-full">
              <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gray-50/50 min-h-[92px]">
                <div className="flex-1 pr-3 min-w-0">
                  <h3 className="font-bold text-lg text-gray-900 truncate" title={partner.companyName}>{partner.companyName}</h3>
                  <p className="text-sm text-gray-500 truncate mt-0.5" title={`${partner.contactName} • ${partner.email}`}>{partner.contactName} • {partner.email}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${
                    partner.status === 'Live' ? 'bg-green-100 text-green-700 border-green-200' :
                    partner.status === 'Testing' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                    partner.status === 'Suspended' ? 'bg-red-100 text-red-700 border-red-200' :
                    'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    {(partner.isVerified || partner.status === 'Live') && (
                      <span title="Verified / Approved Partner" className="inline-flex items-center">
                        <CheckCircle size={11} className="text-emerald-600 shrink-0" />
                      </span>
                    )}
                    {partner.status}
                  </span>
                  <button 
                    onClick={() => handleOpenEditModal(partner)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition"
                    title="Edit Partner & Status"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeletePartner(partner)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                    title="Delete Partner & Revoke Access"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <p className="text-[11px] text-gray-500 font-semibold mb-0.5">API Wallet</p>
                      <p className="font-extrabold text-gray-900 text-sm">₹{partner.apiWalletBalance.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <p className="text-[11px] text-gray-500 font-semibold mb-0.5">Added Markup</p>
                      <p className="font-extrabold text-gray-900 text-sm">{partner.markupPercentage}%</p>
                    </div>
                  </div>

                  {/* Partner Bookings Stat Pill */}
                  <div className="bg-blue-50/70 border border-blue-100/90 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-blue-900 font-semibold">
                      <Ticket size={15} className="text-blue-600" />
                      <span>Partner Bookings</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-extrabold text-blue-950">{(partner.totalBookings ?? 0)} Total</span>
                      {(partner.testBookings ?? 0) > 0 && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200">
                          {partner.testBookings} Test
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 mt-auto space-y-2.5">
                  {/* Primary View Bookings & Verify Button */}
                  <button 
                    onClick={() => openBookingsModal(partner)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 px-3 rounded-xl transition text-xs font-bold shadow-xs hover:shadow-sm cursor-pointer"
                  >
                    <Ticket size={14} /> View Bookings & Verify
                    {(partner.totalBookings ?? 0) > 0 && (
                      <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-white/25 text-white font-black">
                        {partner.totalBookings}
                      </span>
                    )}
                  </button>

                  <button 
                    onClick={() => openDocs(partner)}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-2 px-3 rounded-xl transition text-xs font-medium shadow-xs cursor-pointer"
                  >
                    <Key size={13} /> View Keys & Docs
                  </button>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => downloadCustomizedDoc(partner, partner.status === 'Live' ? 'live' : 'test')}
                      className="flex items-center justify-center gap-1.5 bg-blue-50/80 hover:bg-blue-100 text-blue-700 border border-blue-200/80 py-2 px-2 rounded-xl transition text-xs font-semibold cursor-pointer"
                      title="Download Microsoft Word (.doc) specification"
                    >
                      <FileText size={13} /> Word (.doc)
                    </button>
                    <button 
                      onClick={() => printOrDownloadPdf(partner, partner.status === 'Live' ? 'live' : 'test')}
                      className="flex items-center justify-center gap-1.5 bg-purple-50/80 hover:bg-purple-100 text-purple-700 border border-purple-200/80 py-2 px-2 rounded-xl transition text-xs font-semibold cursor-pointer"
                      title="Open print preview / Save as PDF"
                    >
                      <Printer size={13} /> PDF
                    </button>
                    <button 
                      onClick={() => downloadCustomizedPostman(partner, partner.status === 'Live' ? 'live' : 'test')}
                      className="flex items-center justify-center gap-1.5 bg-amber-50/80 hover:bg-amber-100 text-amber-700 border border-amber-200/80 py-2 px-2 rounded-xl transition text-xs font-semibold cursor-pointer"
                      title="Download pre-configured Postman JSON collection"
                    >
                      <Download size={13} /> Postman
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Partner Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-visible">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <div>
                <h2 className="font-bold text-lg text-gray-900">
                  {editingPartner ? `Edit Partner: ${editingPartner.companyName}` : 'Onboard New B2B Partner'}
                </h2>
                <p className="text-xs text-gray-500">
                  {editingPartner ? 'Update partner credentials, verification status, and environment settings.' : 'Generate live & sandbox credentials for external integration.'}
                </p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-red-500"><XCircle size={20}/></button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Company Name</label>
                  <input placeholder="e.g. Skyline Travels" type="text" className="w-full p-2 border border-gray-300 rounded-lg text-sm" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Name</label>
                  <input placeholder="Full Name" type="text" className="w-full p-2 border border-gray-300 rounded-lg text-sm" value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Email</label>
                  <input placeholder="agent@company.com" type="email" className="w-full p-2 border border-gray-300 rounded-lg text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Partner Status</label>
                  <Dropdown 
                    value={formData.status}
                    onChange={(val) => {
                      const newStatus = val as any;
                      setFormData({
                        ...formData, 
                        status: newStatus,
                        isVerified: newStatus === 'Live' ? true : formData.isVerified
                      });
                    }}
                    direction="bottom"
                    options={[
                      { 
                        value: 'Testing', 
                        label: 'Testing (Sandbox Mode)',
                        icon: <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 inline-block"/>
                      },
                      { 
                        value: 'Live', 
                        label: 'Live (Production Active)',
                        icon: <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 inline-block"/>
                      },
                      { 
                        value: 'Suspended', 
                        label: 'Suspended (Access Blocked)',
                        icon: <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 inline-block"/>
                      }
                    ]}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Partner API Credentials</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Username (Client ID)</label>
                    <input placeholder="Auto-generated if empty" type="text" className="w-full p-2 border border-gray-300 rounded-lg text-sm font-mono" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
                    <input placeholder="Auto-generated if empty" type="text" className="w-full p-2 border border-gray-300 rounded-lg text-sm font-mono" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                </div>
              </div>
              
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Financials & Rate Limits</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Added Markup (%)</label>
                    <input type="number" min="0" className="w-full p-2 border border-gray-300 rounded-lg text-sm" value={formData.markupPercentage} onChange={e => setFormData({...formData, markupPercentage: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Rate Limit (Req / Min)</label>
                    <input type="number" min="1" className="w-full p-2 border border-gray-300 rounded-lg text-sm" value={formData.rateLimitPerMinute} onChange={e => setFormData({...formData, rateLimitPerMinute: Number(e.target.value)})} />
                  </div>
                </div>
              </div>

              {editingPartner && (
                <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">API Wallet Balance (₹)</label>
                    <input 
                      type="number" 
                      min="0" 
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-900" 
                      value={formData.apiWalletBalance} 
                      onChange={e => setFormData({...formData, apiWalletBalance: Number(e.target.value)})} 
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-800 cursor-pointer p-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition">
                      <input 
                        type="checkbox" 
                        checked={formData.isVerified} 
                        onChange={e => setFormData({ ...formData, isVerified: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="flex items-center gap-1.5">
                        <CheckCircle size={14} className="text-emerald-600"/> Verified & Approved
                      </span>
                    </label>
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-3 justify-end border-t border-gray-100">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm">
                  {editingPartner ? 'Update Partner' : 'Generate Keys & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Docs Modal */}
      {isDocsModalOpen && selectedPartner && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="font-bold text-lg flex items-center gap-2 text-gray-900">
                  <Key className="text-blue-600"/> API Credentials: {selectedPartner.companyName}
                </h2>
                <p className="text-xs text-gray-500">{selectedPartner.contactName} ({selectedPartner.email})</p>
              </div>
              <button onClick={() => setIsDocsModalOpen(false)} className="text-gray-500 hover:text-red-500"><XCircle size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-gray-50">
              
              {/* Partner Onboarding Kits Banner */}
              <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-emerald-50/70 border border-blue-200 rounded-xl p-4 space-y-3.5">
                <div className="flex justify-between items-center gap-4">
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-gray-900 flex items-center gap-2">
                      <span>Partner Integration Kits</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">1-Click Downloads</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                      Pre-configured with credentials, endpoints, and standard passenger manifest payloads.
                    </div>
                  </div>
                  <button 
                    onClick={() => copyWelcomeKit(selectedPartner)}
                    className="px-3.5 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition whitespace-nowrap shrink-0"
                  >
                    <Copy size={13}/> Copy Quick Text
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-gray-200/60">
                  {/* Sandbox Kit Card */}
                  <div className="bg-white/90 p-3.5 rounded-lg border border-amber-200 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"/> Sandbox / Testing Kit
                      </span>
                      <span className="text-[9px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-bold">999 Seats</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => downloadCustomizedDoc(selectedPartner, 'test')}
                        className="flex items-center justify-center gap-1 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 py-1.5 px-1.5 rounded-lg text-xs font-bold transition shadow-2xs"
                        title="Download Sandbox Word Doc (.doc)"
                      >
                        <FileText size={12} className="text-amber-600 shrink-0"/> Word (.doc)
                      </button>
                      <button
                        onClick={() => printOrDownloadPdf(selectedPartner, 'test')}
                        className="flex items-center justify-center gap-1 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 py-1.5 px-1.5 rounded-lg text-xs font-bold transition shadow-2xs"
                        title="Print or Save Sandbox Spec as PDF"
                      >
                        <Printer size={12} className="text-amber-600 shrink-0"/> PDF
                      </button>
                      <button
                        onClick={() => downloadCustomizedPostman(selectedPartner, 'test')}
                        className="flex items-center justify-center gap-1 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 py-1.5 px-1.5 rounded-lg text-xs font-bold transition shadow-2xs"
                        title="Download Sandbox Postman Collection"
                      >
                        <Download size={12} className="text-amber-600 shrink-0"/> Postman
                      </button>
                    </div>
                  </div>

                  {/* Live Kit Card */}
                  <div className="bg-white/90 p-3.5 rounded-lg border border-emerald-200 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/> Live / Production Kit
                      </span>
                      <span className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-bold">Real Flights</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => downloadCustomizedDoc(selectedPartner, 'live')}
                        className="flex items-center justify-center gap-1 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 py-1.5 px-1.5 rounded-lg text-xs font-bold transition shadow-2xs"
                        title="Download Live Production Word Doc (.doc)"
                      >
                        <FileText size={12} className="text-emerald-600 shrink-0"/> Word (.doc)
                      </button>
                      <button
                        onClick={() => printOrDownloadPdf(selectedPartner, 'live')}
                        className="flex items-center justify-center gap-1 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 py-1.5 px-1.5 rounded-lg text-xs font-bold transition shadow-2xs"
                        title="Print or Save Live Spec as PDF"
                      >
                        <Printer size={12} className="text-emerald-600 shrink-0"/> PDF
                      </button>
                      <button
                        onClick={() => downloadCustomizedPostman(selectedPartner, 'live')}
                        className="flex items-center justify-center gap-1 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 py-1.5 px-1.5 rounded-lg text-xs font-bold transition shadow-2xs"
                        title="Download Live Production Postman Collection"
                      >
                        <Download size={12} className="text-emerald-600 shrink-0"/> Postman
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* GAPI / Basic Auth Credentials Card */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3.5">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Activity size={16} className="text-emerald-600"/> GAPI / OAuth2 Authentication
                  </h3>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    POST /oauth2/tokens
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-gray-500 font-semibold mb-1">Username / Client ID</label>
                    <div className="flex">
                      <input 
                        type="text" 
                        readOnly 
                        value={selectedPartner.username || 'N/A'}
                        className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-l-lg font-mono text-gray-900 select-all"
                      />
                      <button onClick={() => copyToClipboard(selectedPartner.username || '')} className="px-2.5 bg-gray-100 border border-l-0 border-gray-200 rounded-r-lg hover:bg-gray-200 text-gray-600">
                        <Copy size={12}/>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-500 font-semibold mb-1">Password</label>
                    <div className="flex">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        readOnly 
                        value={selectedPartner.password || 'N/A'}
                        className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-l-lg font-mono text-gray-900 select-all"
                      />
                      <button onClick={() => setShowPassword(!showPassword)} className="px-2 bg-gray-100 border border-l-0 border-gray-200 hover:bg-gray-200 text-gray-600">
                        {showPassword ? <EyeOff size={12}/> : <Eye size={12}/>}
                      </button>
                      <button onClick={() => copyToClipboard(selectedPartner.password || '')} className="px-2.5 bg-gray-100 border border-l-0 border-gray-200 rounded-r-lg hover:bg-gray-200 text-gray-600">
                        <Copy size={12}/>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-500 text-xs font-semibold mb-1">Basic Auth Key (Base64)</label>
                  <div className="flex">
                    <input 
                      type="text" 
                      readOnly 
                      value={`Basic ${selectedPartner.basicAuthKey || ''}`}
                      className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-l-lg font-mono text-xs text-gray-900 select-all"
                    />
                    <button onClick={() => copyToClipboard(`Basic ${selectedPartner.basicAuthKey || ''}`)} className="px-3 bg-emerald-50 border border-l-0 border-emerald-200 rounded-r-lg hover:bg-emerald-100 text-emerald-700 font-semibold text-xs flex items-center gap-1">
                      <Copy size={12}/> Copy Header
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct API Keys Card */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Direct API Keys</h3>
                
                <div>
                  <label className="flex justify-between items-center text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span>Test API Key</span>
                      <span className="text-orange-500 lowercase normal-case text-[10px]">(Doesn't deduct real balance)</span>
                    </div>
                    <button onClick={() => openFullDocs('test')} className="text-blue-600 hover:text-blue-700 flex items-center gap-1 normal-case bg-blue-50 px-2 py-0.5 rounded">
                      View Test Docs <ExternalLink size={12}/>
                    </button>
                  </label>
                  <div className="flex">
                    <input 
                      type={showTestKey ? "text" : "password"} 
                      readOnly 
                      value={selectedPartner.testApiKey}
                      className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-l-lg text-sm font-mono focus:outline-none"
                    />
                    <button onClick={() => setShowTestKey(!showTestKey)} className="px-3 bg-gray-100 border-y border-gray-200 text-gray-600 hover:bg-gray-200 transition">
                      {showTestKey ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                    <button onClick={() => copyToClipboard(selectedPartner.testApiKey)} className="px-4 bg-blue-50 border border-blue-200 border-l-0 rounded-r-lg text-blue-700 hover:bg-blue-100 transition flex items-center gap-1 font-medium text-sm">
                      <Copy size={14}/> Copy
                    </button>
                  </div>
                </div>

                <div>
                  <label className="flex justify-between items-center text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider mt-4">
                    <div className="flex items-center gap-2">
                      <span>Live Production Key</span>
                      <span className="text-green-600 lowercase normal-case text-[10px]">(Deducts real balance)</span>
                    </div>
                    <button onClick={() => openFullDocs('live')} className="text-green-600 hover:text-green-700 flex items-center gap-1 normal-case bg-green-50 px-2 py-0.5 rounded">
                      View Live Docs <ExternalLink size={12}/>
                    </button>
                  </label>
                  <div className="flex">
                    <input 
                      type={showLiveKey ? "text" : "password"} 
                      readOnly 
                      value={selectedPartner.liveApiKey}
                      className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-l-lg text-sm font-mono focus:outline-none"
                    />
                    <button onClick={() => setShowLiveKey(!showLiveKey)} className="px-3 bg-gray-100 border-y border-gray-200 text-gray-600 hover:bg-gray-200 transition">
                      {showLiveKey ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                    <button onClick={() => copyToClipboard(selectedPartner.liveApiKey)} className="px-4 bg-red-50 border border-red-200 border-l-0 rounded-r-lg text-red-700 hover:bg-red-100 transition flex items-center gap-1 font-medium text-sm">
                      <Copy size={14}/> Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* Endpoints Doc */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <h3 className="font-bold text-gray-900">API Documentation Snippet</h3>
                  <span className="text-xs text-gray-500">Use the buttons above to view full docs</span>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs overflow-x-auto text-green-400">
                  <div className="text-gray-400 mb-2">// Base URL</div>
                  <div className="mb-4">https://api.trippechalo.com/api/v1/b2b</div>
                  
                  <div className="text-gray-400 mb-2">// 1. Search Flights</div>
                  <div className="text-blue-400 mb-1">GET /flights/search?origin=DEL&destination=GOI&date=2026-10-15</div>
                  <div className="mb-4 text-gray-300">
                    Headers: <br/>
                    <span className="text-pink-400">x-api-key:</span> {'<YOUR_API_KEY>'}
                  </div>

                  <div className="text-gray-400 mb-2">// 2. Book Flight</div>
                  <div className="text-yellow-400 mb-1">POST /flights/book</div>
                  <div className="mb-1 text-gray-300">
                    Headers: <br/>
                    <span className="text-pink-400">x-api-key:</span> {'<YOUR_API_KEY>'} <br/>
                    <span className="text-pink-400">Content-Type:</span> application/json
                  </div>
                  <div className="text-gray-300 whitespace-pre">
{`Body:
{
  "sfId": "SF-12345",
  "passengers": [
    {
      "title": "Mr",
      "firstName": "John",
      "lastName": "Doe",
      "type": "ADT",
      "gender": "M"
    }
  ],
  "contactEmail": "agent@partner.com",
  "contactPhone": "9876543210"
}`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partner Bookings Verification Modal */}
      {isBookingsModalOpen && partnerForBookings && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Ticket size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-lg text-gray-900">
                      Bookings & UAT Verification
                    </h2>
                    <span className="text-gray-400">•</span>
                    <span className="font-bold text-blue-600">{partnerForBookings.companyName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                      partnerForBookings.status === 'Live' ? 'bg-green-100 text-green-700 border-green-200' :
                      partnerForBookings.status === 'Testing' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                      'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {partnerForBookings.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Verify test and live bookings executed by {partnerForBookings.companyName} ({partnerForBookings.email})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => fetchPartnerBookings(partnerForBookings._id)}
                  title="Refresh Bookings"
                  className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                >
                  <RefreshCw size={17} className={bookingsLoading ? 'animate-spin text-blue-600' : ''} />
                </button>
                <button 
                  onClick={() => setIsBookingsModalOpen(false)} 
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition cursor-pointer"
                >
                  <XCircle size={22} />
                </button>
              </div>
            </div>

            {/* Sub-header Banner: Sandbox Testing & Verification Notice */}
            {partnerForBookings.status === 'Testing' && (
              <div className="bg-amber-50 border-b border-amber-200/80 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div className="text-xs text-amber-900">
                    <strong className="font-bold">Sandbox Testing Verification Mode:</strong> Cross-check the PNRs and passenger manifests that the partner shared with you against the database records below. When verified, upgrade them to Live Production.
                  </div>
                </div>
                <button
                  onClick={() => handlePromoteToLive(partnerForBookings)}
                  disabled={isPromotingPartner}
                  className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <ShieldCheck size={14} />
                  {isPromotingPartner ? 'Upgrading...' : 'Verify & Promote to Live'}
                </button>
              </div>
            )}

            {/* Filter and Search Bar */}
            <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Search input */}
              <div className="relative w-full sm:w-80">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search by PNR, Passenger, Sector..."
                  value={bookingSearchQuery}
                  onChange={(e) => setBookingSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {bookingSearchQuery && (
                  <button 
                    onClick={() => setBookingSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1.5 bg-gray-200/70 p-1 rounded-lg text-xs font-medium w-full sm:w-auto">
                <button
                  onClick={() => setBookingFilterTab('ALL')}
                  className={`px-3 py-1 rounded-md transition cursor-pointer ${bookingFilterTab === 'ALL' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  All ({partnerBookings.length})
                </button>
                <button
                  onClick={() => setBookingFilterTab('TEST')}
                  className={`px-3 py-1 rounded-md transition flex items-center gap-1 cursor-pointer ${bookingFilterTab === 'TEST' ? 'bg-white text-amber-900 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"/>
                  Test ({partnerBookings.filter(b => b.isTestBooking || b.details?.isTestBooking).length})
                </button>
                <button
                  onClick={() => setBookingFilterTab('LIVE')}
                  className={`px-3 py-1 rounded-md transition flex items-center gap-1 cursor-pointer ${bookingFilterTab === 'LIVE' ? 'bg-white text-emerald-900 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"/>
                  Live ({partnerBookings.filter(b => !b.isTestBooking && !b.details?.isTestBooking).length})
                </button>
              </div>
            </div>

            {/* Main Bookings Body: Date-wise grouping (Latest date on top) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50">
              {bookingsLoading ? (
                <div className="py-16 text-center">
                  <Activity className="animate-spin text-blue-600 mx-auto mb-3" size={32} />
                  <p className="text-sm text-gray-600 font-medium">Fetching partner bookings from database...</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-xl border border-dashed border-gray-200 p-8">
                  <Ticket size={40} className="text-gray-300 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-800 text-sm">No Bookings Found</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    {bookingSearchQuery 
                      ? `No bookings match your search term "${bookingSearchQuery}".`
                      : `This partner has not executed any ${bookingFilterTab === 'TEST' ? 'test' : bookingFilterTab === 'LIVE' ? 'live' : ''} flight bookings yet.`}
                  </p>
                </div>
              ) : (
                // DATE WISE LIST (Sorted descending, latest on top!)
                sortedDateKeys.map(dateKey => {
                  const dayBookings = groupedBookings[dateKey];
                  const totalDayAmount = dayBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

                  return (
                    <div key={dateKey} className="space-y-3">
                      {/* Date Group Sticky Header */}
                      <div className="sticky top-0 z-10 bg-slate-100/90 backdrop-blur-xs px-3.5 py-1.5 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs shadow-2xs">
                        <div className="flex items-center gap-2 font-bold text-gray-800">
                          <Calendar size={14} className="text-blue-600" />
                          <span>{formatDateGroupHeading(dateKey)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-500 font-medium text-[11px]">
                          <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700 font-semibold">
                            {dayBookings.length} {dayBookings.length === 1 ? 'Booking' : 'Bookings'}
                          </span>
                          <span className="font-bold text-gray-900">
                            ₹{totalDayAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Day Bookings Cards */}
                      <div className="space-y-3">
                        {dayBookings.map(booking => {
                          const isTest = booking.isTestBooking || booking.details?.isTestBooking;
                          const pnr = booking.details?.pnr || 'N/A';
                          const createdTime = booking.createdAt 
                            ? new Date(booking.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                            : '';
                          const passengers = booking.details?.passengers || [];

                          return (
                            <div 
                              key={booking._id || booking.bookingId}
                              className={`bg-white rounded-xl border transition shadow-xs hover:shadow-md ${
                                isTest ? 'border-amber-200 hover:border-amber-300' : 'border-emerald-200 hover:border-emerald-300'
                              }`}
                            >
                              {/* Booking Top Info Row */}
                              <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2 bg-gray-50/40 rounded-t-xl">
                                <div className="flex items-center gap-2">
                                  {/* PNR with Click to Copy */}
                                  <div className="flex items-center gap-1.5 bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-1 rounded-md font-mono text-xs font-bold">
                                    <span>PNR: {pnr}</span>
                                    <button 
                                      onClick={() => copyToClipboard(pnr)}
                                      className="text-blue-500 hover:text-blue-700 transition cursor-pointer"
                                      title="Copy PNR"
                                    >
                                      <Copy size={11} />
                                    </button>
                                  </div>

                                  {/* Test vs Live Pill */}
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                                    isTest ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  }`}>
                                    {isTest ? '🧪 Sandbox Test' : '🟢 Live Production'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span className="font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                    {booking.bookingId}
                                  </span>
                                  {createdTime && (
                                    <span className="flex items-center gap-1 text-gray-400">
                                      <Clock size={12} /> {createdTime}
                                    </span>
                                  )}
                                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-green-100 text-green-700">
                                    {booking.status || 'CONFIRMED'}
                                  </span>
                                </div>
                              </div>

                              {/* Flight & Passenger Body */}
                              <div className="p-4 space-y-3">
                                {/* Route & Fare Row */}
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                      <Plane size={18} />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2 text-base font-extrabold text-gray-900">
                                        <span>{booking.details?.from || 'DEL'}</span>
                                        <ArrowRight size={14} className="text-gray-400" />
                                        <span>{booking.details?.to || 'BOM'}</span>
                                      </div>
                                      <div className="text-xs text-gray-500 flex items-center gap-2">
                                        <span className="font-semibold text-gray-700">
                                          {booking.details?.airline || 'Airline'} {booking.details?.flightNo || ''}
                                        </span>
                                        {booking.details?.travelDate && (
                                          <>
                                            <span>•</span>
                                            <span>Travel: {new Date(booking.details.travelDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <p className="text-[11px] text-gray-400 font-medium">Total Booking Amount</p>
                                    <p className="text-base font-extrabold text-gray-900">
                                      ₹{(booking.totalAmount || 0).toLocaleString('en-IN')}
                                    </p>
                                  </div>
                                </div>

                                {/* Passenger Manifest List */}
                                <div className="bg-gray-50/80 rounded-lg p-3 border border-gray-100">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <UserIcon size={12} /> Passengers Manifest ({passengers.length})
                                  </p>
                                  {passengers.length === 0 ? (
                                    <p className="text-xs text-gray-500 italic">No passenger details recorded.</p>
                                  ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                      {passengers.map((pax, idx) => (
                                        <div key={idx} className="bg-white p-2 rounded border border-gray-200/80 flex items-center justify-between text-xs">
                                          <div className="font-semibold text-gray-800 truncate" title={pax.name}>
                                            {pax.name}
                                          </div>
                                          <div className="flex items-center gap-1 shrink-0 text-[10px] text-gray-500 font-medium">
                                            <span>{pax.type || 'ADULT'}</span>
                                            {pax.gender && <span>• {pax.gender}</span>}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Action Row */}
                                <div className="pt-2 border-t border-gray-100 flex items-center justify-end">
                                  <button
                                    onClick={() => copyVerificationSnippet(booking)}
                                    className="px-2.5 py-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                                    title="Copy booking details to clipboard"
                                  >
                                    <Copy size={12} /> Copy Details
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span>Showing <strong>{filteredBookings.length}</strong> of {partnerBookings.length} bookings</span>
              </div>
              <button 
                onClick={() => setIsBookingsModalOpen(false)}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg text-xs transition cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!partnerToDelete}
        title={`Delete "${partnerToDelete?.companyName || 'Partner'}"?`}
        message={`Are you sure you want to permanently delete this B2B partner? This action will immediately revoke all API keys, active tokens, and permanently terminate their access to TrippeChalo APIs.`}
        confirmText={isDeleting ? 'Deleting...' : 'Permanently Delete'}
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={confirmDeletePartner}
        onCancel={() => {
          if (!isDeleting) setPartnerToDelete(null);
        }}
      />
    </div>
  );
}
