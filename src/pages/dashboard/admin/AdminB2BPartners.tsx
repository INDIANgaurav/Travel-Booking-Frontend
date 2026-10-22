import React, { useState, useEffect } from 'react';
import { Plus, Server, CheckCircle, XCircle, Activity, Key, Copy, Eye, EyeOff, Download, ExternalLink, Edit, Trash2, Printer, FileText } from 'lucide-react';
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
    if (window.location.port === '5173') {
      return `${window.location.protocol}//${window.location.hostname}:5000`;
    }
    return window.location.origin;
  };

  const generateDocumentHtml = (partner: B2BClient, env: 'test' | 'live' = 'test') => {
    const serverUrl = getServerUrl();
    const isLive = env === 'live';
    const apiKey = isLive ? partner.liveApiKey : partner.testApiKey;
    const envBadge = isLive ? 'PRODUCTION (LIVE)' : 'SANDBOX (TESTING)';
    const envColor = isLive ? '#10b981' : '#f59e0b';

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
      margin: 40pt 45pt 40pt 45pt;
    }
    div.WordSection1 {
      page: WordSection1;
    }
    @media print {
      body { margin: 0; padding: 20px; }
      .no-print { display: none !important; }
    }
    body {
      font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1e293b;
      margin: 20px;
    }
    .header-box {
      background-color: #0f172a;
      color: #ffffff;
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    .header-title {
      font-size: 22pt;
      font-weight: bold;
      color: #ffffff;
      margin: 0 0 4px 0;
    }
    .header-subtitle {
      font-size: 11pt;
      color: #94a3b8;
      margin: 0;
    }
    .meta-table {
      width: 100%;
      margin-top: 16px;
      border-top: 1px solid #334155;
      padding-top: 10px;
    }
    .meta-table td {
      padding: 4px 0;
      font-size: 10pt;
      color: #cbd5e1;
    }
    .alert-box {
      padding: 12px 18px;
      border-radius: 6px;
      margin: 16px 0;
      border-left: 5px solid ${envColor};
      background-color: ${isLive ? '#f0fdf4' : '#fffbeb'};
      color: ${isLive ? '#166534' : '#92400e'};
      font-size: 10.5pt;
      line-height: 1.5;
    }
    h2 {
      color: #0f172a;
      font-size: 14pt;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 4px;
      margin-top: 26px;
      margin-bottom: 12px;
    }
    h3 {
      color: #1e40af;
      font-size: 12pt;
      margin-top: 16px;
      margin-bottom: 8px;
    }
    .code-box {
      background-color: #0f172a;
      color: #38bdf8;
      padding: 14px;
      border-radius: 6px;
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 9.5pt;
      white-space: pre-wrap;
      word-break: break-all;
      margin: 10px 0 16px 0;
      line-height: 1.45;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
    }
    table.data-table th {
      background-color: #f1f5f9;
      color: #0f172a;
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      font-size: 10pt;
      font-weight: bold;
      text-align: left;
    }
    table.data-table td {
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      font-size: 9.5pt;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 9pt;
      font-weight: bold;
    }
    .badge-post { background-color: #dbeafe; color: #1e40af; }
    .badge-get { background-color: #dcfce7; color: #15803d; }
    .badge-env { background-color: ${isLive ? '#dcfce7' : '#fef3c7'}; color: ${isLive ? '#15803d' : '#92400e'}; }
    .footer-note {
      margin-top: 35px;
      padding-top: 15px;
      border-top: 1px solid #e2e8f0;
      font-size: 9pt;
      color: #64748b;
      text-align: center;
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
  <div class="header-box">
    <div class="header-title">TRIPPECHALO B2B FLIGHT API</div>
    <div class="header-subtitle">Fixed Departure & Series Fare API Specification</div>
    <table class="meta-table">
      <tr>
        <td style="width: 130px; font-weight: bold; color: #94a3b8;">Partner:</td>
        <td style="color: #ffffff; font-weight: bold;">${partner.companyName}</td>
        <td style="width: 130px; font-weight: bold; color: #94a3b8;">Environment:</td>
        <td><span class="badge badge-env">${envBadge}</span></td>
      </tr>
      <tr>
        <td style="font-weight: bold; color: #94a3b8;">Contact:</td>
        <td>${partner.contactName} (${partner.email})</td>
        <td style="font-weight: bold; color: #94a3b8;">Protocol:</td>
        <td>REST API (JSON over HTTPS)</td>
      </tr>
      <tr>
        <td style="font-weight: bold; color: #94a3b8;">Assigned User:</td>
        <td style="color: #60a5fa; font-weight: bold;">${partner.username || 'N/A'}</td>
        <td style="font-weight: bold; color: #94a3b8;">Generated On:</td>
        <td>${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
      </tr>
    </table>
  </div>

  <h2>PREFACE & CREDENTIALS</h2>
  <p>This document contains the complete integration guidelines and pre-configured credentials for <strong>${partner.companyName}</strong> in the <strong>${envBadge}</strong> environment.</p>

  <table class="data-table">
    <thead>
      <tr>
        <th>Credential / Parameter</th>
        <th>Value</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Server Base URL</strong></td>
        <td><code style="color: #2563eb; font-weight: bold;">${serverUrl}</code></td>
        <td>Root host for all API calls</td>
      </tr>
      <tr>
        <td><strong>Username (Client ID)</strong></td>
        <td><code style="font-weight: bold;">${partner.username || 'N/A'}</code></td>
        <td>Used for OAuth2 token generation</td>
      </tr>
      <tr>
        <td><strong>Password</strong></td>
        <td><code style="font-weight: bold;">${partner.password || 'N/A'}</code></td>
        <td>Used for OAuth2 token generation</td>
      </tr>
      <tr>
        <td><strong>API Key (${isLive ? 'Live Production' : 'Sandbox Test'})</strong></td>
        <td><code style="color: #d97706; font-weight: bold;">${apiKey}</code></td>
        <td>Can be passed in headers as <code>x-api-key</code></td>
      </tr>
    </tbody>
  </table>

  <div class="alert-box">
    ${isLive ? `
      <strong>⚠️ COMMERCIAL PRODUCTION NOTICE:</strong><br/>
      You are accessing the <strong>LIVE PRODUCTION</strong> environment. All bookings made in this environment are binding commercial commitments, decrement actual aircraft seats, and deduct real funds from your TrippeChalo API Wallet balance. Ensure your wallet balance is topped up before booking.
    ` : `
      <strong>ℹ️ SANDBOX TESTING NOTICE:</strong><br/>
      This environment is strictly for testing and integration. All search queries return sandbox inventory with 999 seats. Booking calls simulate payload validation without deducting real wallet balance or blocking commercial airline inventory.
    `}
  </div>

  <h2>DETAILED API METHODS</h2>

  <h3>a) Step 1: Authentication & Token Generation</h3>
  <p><strong>Endpoint:</strong> <span class="badge badge-post">POST</span> <code>${serverUrl}/api/v1/b2b/oauth2/tokens</code><br/>
  <em>(Also accessible via: <code>${serverUrl}/api/v1/b2b/auth/token</code>)</em></p>
  <p><strong>Headers:</strong> <code>Content-Type: application/json</code></p>
  <p><strong>Request Body:</strong></p>
  <div class="code-box">{
  "username": "${partner.username || 'YOUR_USERNAME'}",
  "password": "${partner.password || 'YOUR_PASSWORD'}"
}</div>
  <p><strong>Sample Response:</strong></p>
  <div class="code-box">{
  "tokenId": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "status": "SUCCESS"
}</div>
  <p>Pass this <code>tokenId</code> in headers as <code>Authorization: Bearer &lt;tokenId&gt;</code> for all subsequent requests. Validity: <strong>24 hours</strong>.</p>

  <h3>b) Step 2: Sectors Method</h3>
  <p><strong>Endpoint:</strong> <span class="badge badge-get">GET</span> <code>${serverUrl}/api/v1/b2b/search/sectors</code></p>
  <p><strong>Headers:</strong> <code>Authorization: Bearer &lt;tokenId&gt;</code> (or <code>x-api-key: ${apiKey}</code>)</p>
  <p><strong>Sample Response:</strong></p>
  <div class="code-box">[
  { "origin": "DEL", "destination": "BOM", "count": 12 },
  { "origin": "DEL", "destination": "DXB", "count": 8 },
  { "origin": "DEL", "destination": "DPS", "count": 6 },
  { "origin": "DEL", "destination": "BLR", "count": 6 }
]</div>

  <h3>c) Step 3: Flight Search Method</h3>
  <p><strong>Endpoint:</strong> <span class="badge badge-post">POST</span> <code>${serverUrl}/api/v1/b2b/search/flights</code></p>
  <p><strong>Headers:</strong> <code>Content-Type: application/json</code>, <code>Authorization: Bearer &lt;tokenId&gt;</code></p>
  <p><strong>Request Body:</strong></p>
  <div class="code-box">{
  "origin": "DEL",
  "destination": "BOM",
  "travelDate": "2026-12-10",
  "adults": 2,
  "children": 1,
  "infants": 1
}</div>
  <p><strong>Sample Response:</strong></p>
  <div class="code-box">[
  {
    "sfId": "SF-TC-C1A-20261210",
    "airline": "IndiGo",
    "flightNo": "6E-2045",
    "origin": "DEL",
    "destination": "BOM",
    "travelDate": "2026-12-10T00:00:00.000Z",
    "departureTime": "07:00",
    "arrivalTime": "09:15",
    "availableSeats": ${isLive ? '18' : '999'},
    "adtFare": 4200,
    "chdFare": 3900,
    "infFare": 1200,
    "baggage": {
      "cabin": "7 KG",
      "checkin": "15 KG"
    }
  }
]</div>

  <h3>d) Step 4: Flight Booking Method</h3>
  <p><strong>Endpoint:</strong> <span class="badge badge-post">POST</span> <code>${serverUrl}/api/v1/b2b/flights/book</code></p>
  <p><strong>Headers:</strong> <code>Content-Type: application/json</code>, <code>Authorization: Bearer &lt;tokenId&gt;</code></p>
  <p><strong>Request Body (Standard Passenger Manifest):</strong></p>
  <div class="code-box">{
  "sfId": "SF-TC-C1A-20261210",
  "passengers": [
    {
      "title": "Mr",
      "firstName": "Rohan",
      "lastName": "Sharma",
      "type": "ADULT",
      "gender": "MALE",
      "dob": "1992-06-15",
      "passportNo": "TC8892101",
      "passportExpiry": "2032-08-31"
    },
    {
      "title": "Mrs",
      "firstName": "Priya",
      "lastName": "Sharma",
      "type": "ADULT",
      "gender": "FEMALE",
      "dob": "1994-09-24",
      "passportNo": "TC8892102",
      "passportExpiry": "2032-08-31"
    },
    {
      "title": "Mstr",
      "firstName": "Aarav",
      "lastName": "Sharma",
      "type": "CHILD",
      "gender": "MALE",
      "dob": "2017-11-12",
      "passportNo": "TC8892103",
      "passportExpiry": "2032-08-31"
    },
    {
      "title": "Miss",
      "firstName": "Anaya",
      "lastName": "Sharma",
      "type": "INFANT",
      "gender": "FEMALE",
      "dob": "2025-04-18",
      "passportNo": "TC8892104",
      "passportExpiry": "2032-08-31"
    }
  ]
}</div>

  <p><strong>Sample Response:</strong></p>
  <div class="code-box">{
  "status": "SUCCESS",
  "bookingReference": "TC-B2B-20261210-9941",
  "airlinePnr": "${isLive ? 'P6Y7QW' : 'TC-SIMULATED-PNR'}",
  "totalAmount": 13500,
  "message": "Flight booking confirmed successfully"
}</div>

  <h2>QUICKSTART cURL SCRIPT</h2>
  <div class="code-box"># 1. Authenticate (Obtain token)
curl -X POST "${serverUrl}/api/v1/b2b/oauth2/tokens" \\
     -H "Content-Type: application/json" \\
     -d '{
       "username": "${partner.username || 'YOUR_USERNAME'}",
       "password": "${partner.password || 'YOUR_PASSWORD'}"
     }'

# 2. Get Sectors
curl -X GET "${serverUrl}/api/v1/b2b/search/sectors" \\
     -H "Authorization: Bearer &lt;TOKEN_ID&gt;"

# 3. Search Flights
curl -X POST "${serverUrl}/api/v1/b2b/search/flights" \\
     -H "Content-Type: application/json" \\
     -H "Authorization: Bearer &lt;TOKEN_ID&gt;" \\
     -d '{
       "origin": "DEL",
       "destination": "BOM",
       "travelDate": "2026-12-10",
       "adults": 2,
       "children": 1,
       "infants": 1
     }'

# 4. Book Flight
curl -X POST "${serverUrl}/api/v1/b2b/flights/book" \\
     -H "Content-Type: application/json" \\
     -H "Authorization: Bearer &lt;TOKEN_ID&gt;" \\
     -d '{
       "sfId": "SF-TC-C1A-20261210",
       "passengers": [
         {
           "title": "Mr",
           "firstName": "Rohan",
           "lastName": "Sharma",
           "type": "ADULT",
           "gender": "MALE",
           "dob": "1992-06-15"
         }
       ]
     }'</div>

  <div class="footer-note">
    <strong>TrippeChalo India Private Limited</strong> • B2B Flight API Operations<br/>
    Tailored exclusively for <strong>${partner.companyName}</strong>. Confidential.
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium mb-1">API Wallet</p>
                    <p className="font-bold text-gray-900">₹{partner.apiWalletBalance.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium mb-1">Added Markup</p>
                    <p className="font-bold text-gray-900">{partner.markupPercentage}%</p>
                  </div>
                </div>
                
                <div className="pt-2 mt-auto space-y-2">
                  <button 
                    onClick={() => openDocs(partner)}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-lg transition text-sm font-medium shadow-sm"
                  >
                    <Key size={15} /> View Keys & Docs
                  </button>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button 
                      onClick={() => downloadCustomizedDoc(partner, partner.status === 'Live' ? 'live' : 'test')}
                      className="flex items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 py-1.5 px-1 rounded-lg transition text-xs font-semibold"
                      title="Download Microsoft Word (.doc) specification"
                    >
                      <FileText size={12} /> Word (.doc)
                    </button>
                    <button 
                      onClick={() => printOrDownloadPdf(partner, partner.status === 'Live' ? 'live' : 'test')}
                      className="flex items-center justify-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 py-1.5 px-1 rounded-lg transition text-xs font-semibold"
                      title="Open print preview / Save as PDF"
                    >
                      <Printer size={12} /> PDF
                    </button>
                    <button 
                      onClick={() => downloadCustomizedPostman(partner, partner.status === 'Live' ? 'live' : 'test')}
                      className="flex items-center justify-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 py-1.5 px-1 rounded-lg transition text-xs font-semibold"
                      title="Download pre-configured Postman JSON collection"
                    >
                      <Download size={12} /> Postman
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
