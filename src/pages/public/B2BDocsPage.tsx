import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Book,
  Code,
  Globe,
  Server,
  CheckCircle,
  Shield,
  Download,
  Copy,
  ExternalLink,
  AlertTriangle,
  Zap,
  Clock,
  Layers,
  FileText,
  Lock,
  ChevronRight,
  Database,
  ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function B2BDocsPage() {
  const [searchParams] = useSearchParams();
  const partner = searchParams.get('partner') || 'Partner';
  const apiKey = searchParams.get('key') || 'tc_test_live_sample_key_99';
  const env = searchParams.get('env') || 'test'; // 'test' or 'live'
  const isLive = env === 'live';

  const [activeTab, setActiveTab] = useState('intro');
  const [copiedKey, setCopiedKey] = useState(false);

  const baseUrl = isLive ? 'https://api.trippechalo.com' : 'https://sandbox-api.trippechalo.com';

  const copyToClipboard = (text: string, msg: string = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    toast.success(msg);
  };

  const downloadOpenApiJson = () => {
    window.open(`${baseUrl}/api/v1/b2b/docs/openapi.json`, '_blank');
  };

  const downloadPostmanJson = () => {
    window.open(`${baseUrl}/api/v1/b2b/docs/postman.json?env=${env}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-white border-r border-slate-200 h-screen sticky top-0 overflow-y-auto custom-scrollbar flex-shrink-0 flex flex-col">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight">
              Trippe<span className="text-blue-400">Chalo</span>{' '}
              <span className="text-orange-400">India</span>
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
              B2B Flight API v1.2
            </span>
            <span
              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                isLive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
              }`}
            >
              {isLive ? 'Live Production' : 'Sandbox Test'}
            </span>
          </div>
        </div>

        {/* Quick Downloads Bar */}
        <div className="p-3 border-b border-slate-100 bg-slate-50 flex gap-2">
          <button
            onClick={downloadOpenApiJson}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded text-xs font-bold text-slate-700 transition shadow-sm"
            title="Download OpenAPI 3.1 JSON Contract"
          >
            <Download size={13} className="text-blue-600" /> OpenAPI 3.1
          </button>
          <button
            onClick={downloadPostmanJson}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded text-xs font-bold text-slate-700 transition shadow-sm"
            title="Download Postman Collection v2.1"
          >
            <Download size={13} className="text-amber-600" /> Postman
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-6 flex-1 text-sm">
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Architecture & Setup
            </p>
            <div className="space-y-0.5">
              <button
                onClick={() => setActiveTab('intro')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition ${
                  activeTab === 'intro' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                1. Overview & Authentication
              </button>
              <button
                onClick={() => setActiveTab('contracts')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition ${
                  activeTab === 'contracts' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                2. Envelopes & Error Codes
              </button>
              <button
                onClick={() => setActiveTab('concurrency')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition ${
                  activeTab === 'concurrency' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                3. Idempotency & Atomic CAS
              </button>
              <button
                onClick={() => setActiveTab('pricing-rules')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition ${
                  activeTab === 'pricing-rules' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                4. Pricing, Taxes & Fare Rules
              </button>
            </div>
          </div>

          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              API Endpoints
            </p>
            <div className="space-y-0.5 font-mono text-xs">
              <button
                onClick={() => setActiveTab('auth-endpoint')}
                className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                  activeTab === 'auth-endpoint' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="font-bold text-amber-600 bg-amber-50 px-1 py-0.5 rounded text-[10px]">POST</span>
                /oauth2/tokens
              </button>
              <button
                onClick={() => setActiveTab('sectors-endpoint')}
                className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                  activeTab === 'sectors-endpoint' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded text-[10px]">GET</span>
                /flights/sectors
              </button>
              <button
                onClick={() => setActiveTab('search-endpoint')}
                className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                  activeTab === 'search-endpoint' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="font-bold text-blue-600 bg-blue-50 px-1 py-0.5 rounded text-[10px]">POST</span>
                /flights/search
              </button>
              <button
                onClick={() => setActiveTab('book-endpoint')}
                className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                  activeTab === 'book-endpoint' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="font-bold text-amber-600 bg-amber-50 px-1 py-0.5 rounded text-[10px]">POST</span>
                /flights/book
              </button>
              <button
                onClick={() => setActiveTab('retrieve-endpoint')}
                className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                  activeTab === 'retrieve-endpoint' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded text-[10px]">GET</span>
                /flights/booking/:id
              </button>
              <button
                onClick={() => setActiveTab('policy-endpoint')}
                className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                  activeTab === 'policy-endpoint' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded text-[10px]">GET</span>
                /flights/cancellation-policy
              </button>
            </div>
          </div>

          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Sandbox & Compliance
            </p>
            <div className="space-y-0.5">
              <button
                onClick={() => setActiveTab('uat-catalogue')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition ${
                  activeTab === 'uat-catalogue' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Fixed Sandbox Test Catalogue
              </button>
              <button
                onClick={() => setActiveTab('compliance')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition ${
                  activeTab === 'compliance' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                DPDP 2023 & Security
              </button>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto custom-scrollbar p-6 md:p-10 lg:p-12 max-w-5xl">
        {/* Top Partner Context Banner */}
        <div className="mb-8 p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Authenticated Partner Profile</p>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">{partner}</h2>
            <p className="text-xs text-slate-600 font-mono mt-0.5">
              Base URL: <span className="text-blue-600 font-bold">{baseUrl}/api/v1/b2b</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(apiKey, 'API Key copied!')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold transition"
            >
              <Copy size={13} /> {apiKey.slice(0, 14)}...
            </button>
            <button
              onClick={downloadOpenApiJson}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
            >
              <Download size={13} /> OpenAPI 3.1 Contract
            </button>
          </div>
        </div>

        {/* 1. OVERVIEW & AUTHENTICATION */}
        {activeTab === 'intro' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">TrippeChalo India B2B Flight API</h1>
              <p className="text-slate-600 text-base mt-2 leading-relaxed">
                Welcome to TrippeChalo India's official B2B Flight Series (Fixed Departure) inventory integration engine. 
                This API provides high-frequency access to exclusive Series Fares with guaranteed seat availability and wholesale pricing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                <div className="flex items-center gap-2 text-blue-700 font-bold mb-1">
                  <Zap size={18} /> Atomic CAS Concurrency
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real-time Compare-And-Swap at the database engine guarantees 0 double-bookings even when multiple agents hit the same seat.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50">
                <div className="flex items-center gap-2 text-amber-700 font-bold mb-1">
                  <Shield size={18} /> Idempotent Retries
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pass an <code className="bg-amber-100 px-1 rounded text-amber-800">Idempotency-Key</code> header on booking requests to safely retry without duplicate charging.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
                <div className="flex items-center gap-2 text-emerald-700 font-bold mb-1">
                  <Clock size={18} /> 15-Minute Price Lock
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Search results include <code className="bg-emerald-100 px-1 rounded text-emerald-800">fareValidUntil</code> giving partner 15 minutes to complete booking.
                </p>
              </div>
            </div>

            {/* Authentication Flow */}
            <div className="border border-slate-200 bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Lock size={18} className="text-blue-600" /> Authentication Specification
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                We support two standard authentication mechanisms:
              </p>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1">Method 1 (Recommended): OAuth2 Bearer Token</span>
                  <p className="text-xs text-slate-600 mb-2">
                    Call <code className="bg-slate-200 px-1 rounded font-mono">POST /api/v1/b2b/oauth2/tokens</code> with username/password or API key to obtain a signed JWT valid for 24 hours. Include in headers:
                  </p>
                  <pre className="bg-slate-900 text-slate-100 p-3 rounded text-xs font-mono">Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</pre>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Method 2: Direct API Key Header</span>
                  <p className="text-xs text-slate-600 mb-2">Pass your unique partner key in request headers:</p>
                  <pre className="bg-slate-900 text-slate-100 p-3 rounded text-xs font-mono">x-api-key: {apiKey}</pre>
                </div>
              </div>
            </div>

            {/* Rate Limiting */}
            <div className="border border-slate-200 bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Rate Limiting & Timezone Rules</h3>
              <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
                <li><strong>Rate Limit:</strong> 60 requests per minute per partner. Response headers <code className="bg-slate-100 px-1 rounded font-mono">X-RateLimit-Limit</code>, <code className="bg-slate-100 px-1 rounded font-mono">X-RateLimit-Remaining</code>, and <code className="bg-slate-100 px-1 rounded font-mono">X-RateLimit-Reset</code> are included on every call.</li>
                <li><strong>Rate Limit Violation:</strong> Responds with HTTP 429 and <code className="bg-slate-100 px-1 rounded font-mono">Retry-After: 60</code> header.</li>
                <li><strong>Operational Timezone:</strong> All flight departures and arrivals are explicitly quoted in <strong>Indian Standard Time (IST / UTC+05:30)</strong>. Dates are strictly <code className="bg-slate-100 px-1 rounded font-mono">YYYY-MM-DD</code>.</li>
              </ul>
            </div>
          </div>
        )}

        {/* 2. ENVELOPES & ERROR CODES */}
        {activeTab === 'contracts' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Response Envelope & Error Matrix</h1>
              <p className="text-slate-600 text-base mt-2">
                All TrippeChalo India B2B API endpoints adhere to a uniform, machine-readable JSON envelope.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Success Envelope */}
              <div className="border border-slate-200 bg-white rounded-xl p-5 shadow-sm">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <CheckCircle size={15} /> Standard Success Envelope
                </span>
                <pre className="bg-slate-900 text-emerald-400 p-4 rounded-lg text-xs font-mono overflow-x-auto">
{`{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-26T15:20:00.000Z",
    "timezone": "Asia/Kolkata (IST)",
    "currency": "INR",
    "environment": "${isLive ? 'PRODUCTION' : 'SANDBOX'}"
  }
}`}
                </pre>
              </div>

              {/* Error Envelope */}
              <div className="border border-slate-200 bg-white rounded-xl p-5 shadow-sm">
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <AlertTriangle size={15} /> Standard Error Envelope
                </span>
                <pre className="bg-slate-900 text-rose-400 p-4 rounded-lg text-xs font-mono overflow-x-auto">
{`{
  "success": false,
  "statusCode": 409,
  "error": {
    "code": "SEATS_NOT_AVAILABLE",
    "message": "Only 1 seat remaining, but 3 requested.",
    "details": [{ "requested": 3, "available": 1 }]
  },
  "meta": {
    "timestamp": "2026-10-26T15:20:00.000Z",
    "timezone": "Asia/Kolkata (IST)"
  }
}`}
                </pre>
              </div>
            </div>

            {/* Error Code Matrix Table */}
            <div className="border border-slate-200 bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-bold text-slate-800 text-sm">Standard Error Code Reference</h3>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">HTTP Status</th>
                    <th className="p-3">Error Code</th>
                    <th className="p-3">Trigger Condition</th>
                    <th className="p-3">Partner Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                  <tr>
                    <td className="p-3 font-bold text-rose-600">400 Bad Request</td>
                    <td className="p-3 font-bold">VALIDATION_ERROR</td>
                    <td className="p-3 font-sans">Missing required fields or invalid IATA airport codes</td>
                    <td className="p-3 font-sans">Verify request payload formatting</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-amber-600">401 Unauthorized</td>
                    <td className="p-3 font-bold">UNAUTHORIZED / INVALID_TOKEN</td>
                    <td className="p-3 font-sans">Expired JWT or invalid API key</td>
                    <td className="p-3 font-sans">Re-authenticate via <code className="text-blue-600">/oauth2/tokens</code></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-amber-600">402 Payment Required</td>
                    <td className="p-3 font-bold">INSUFFICIENT_FUNDS</td>
                    <td className="p-3 font-sans">Live API wallet balance is lower than total booking fare</td>
                    <td className="p-3 font-sans">Top-up B2B wallet via agency ledger</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-rose-600">404 Not Found</td>
                    <td className="p-3 font-bold">FLIGHT_NOT_FOUND</td>
                    <td className="p-3 font-sans">Specified sfId has departed or is archived</td>
                    <td className="p-3 font-sans">Trigger fresh search to fetch current inventory</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-purple-600">409 Conflict</td>
                    <td className="p-3 font-bold">SEATS_NOT_AVAILABLE</td>
                    <td className="p-3 font-sans">Concurrent partner booked remaining seats (CAS trigger)</td>
                    <td className="p-3 font-sans">Display out-of-stock message or re-search alternate flight</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-amber-600">422 Unprocessable</td>
                    <td className="p-3 font-bold">INFANT_COUNT_EXCEEDED</td>
                    <td className="p-3 font-sans">Infants count is greater than adults count</td>
                    <td className="p-3 font-sans">Enforce 1 infant per adult on lap rule</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-amber-600">429 Too Many Req</td>
                    <td className="p-3 font-bold">RATE_LIMIT_EXCEEDED</td>
                    <td className="p-3 font-sans">Exceeded 60 req/min quota</td>
                    <td className="p-3 font-sans">Read <code className="text-blue-600">Retry-After</code> header and throttle</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. IDEMPOTENCY & ATOMIC CAS */}
        {activeTab === 'concurrency' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Idempotency & Concurrency Architecture</h1>
              <p className="text-slate-600 text-base mt-2">
                How TrippeChalo India prevents duplicate debiting and handles high-volume booking race conditions.
              </p>
            </div>

            <div className="border border-slate-200 bg-white rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Shield size={20} className="text-blue-600" /> Idempotent Booking Flow (<code className="text-sm font-mono text-blue-600">Idempotency-Key</code>)
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Network drops and timeouts frequently occur between client servers and payment/inventory APIs.
                If your booking request times out, you can safely retry the request using the same <code className="bg-slate-100 font-mono text-pink-600 px-1 rounded">Idempotency-Key: &lt;UUID&gt;</code> header.
              </p>
              <div className="p-4 rounded-lg bg-slate-900 text-slate-200 text-xs font-mono space-y-2">
                <p className="text-emerald-400 font-bold">// 1. First Request: Processes booking and reserves seat</p>
                <p>POST /api/v1/b2b/flights/book</p>
                <p>Idempotency-Key: 9f821-4b18-4b72-9b22-421710ec9471</p>
                <p className="text-slate-400 mt-2">// Status: 201 Created (Booking Confirmed)</p>
                <p className="text-amber-400 font-bold mt-4">// 2. Retried Request (After socket timeout or network retry):</p>
                <p>POST /api/v1/b2b/flights/book</p>
                <p>Idempotency-Key: 9f821-4b18-4b72-9b22-421710ec9471</p>
                <p className="text-emerald-400">// Status: 200 OK (Returns original booking without re-charging wallet or seats!)</p>
              </div>
            </div>

            <div className="border border-slate-200 bg-white rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Zap size={20} className="text-amber-600" /> Database Compare-And-Swap (Atomic CAS)
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                When 2 or more partners attempt to book the last available seat on a flight at the exact same millisecond:
              </p>
              <ol className="text-sm text-slate-600 space-y-2 list-decimal pl-5">
                <li>MongoDB executes an atomic <code className="bg-slate-100 font-mono px-1 rounded">findOneAndUpdate(&#123; availableSeats: &#123; $gte: seatsRequired &#125; &#125;)</code>.</li>
                <li>Request A successfully decrements the seat from 1 to 0.</li>
                <li>Request B's atomic query evaluates to <code className="font-mono text-rose-600">null</code>, instantly rejecting the transaction.</li>
                <li>If in Live mode, Request B's wallet debit is rolled back immediately, and the API returns HTTP 409 <code className="font-mono text-purple-600">SEATS_NOT_AVAILABLE</code>.</li>
              </ol>
            </div>
          </div>
        )}

        {/* 4. PRICING & FARE RULES */}
        {activeTab === 'pricing-rules' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pricing, Taxes & Fare Rules</h1>
              <p className="text-slate-600 text-base mt-2">
                Breakdown of flight pricing, passenger type fare application, and non-refundable Series Fare rules.
              </p>
            </div>

            <div className="border border-slate-200 bg-white rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Passenger Classification & Pricing Rules</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-bold text-blue-800 block text-base">ADULT (ADT)</span>
                  <p className="text-xs text-slate-500 mt-1">Age &gt;= 12 years as on travel date</p>
                  <p className="text-xs text-slate-700 mt-2 font-medium">Billed at standard adult fare. Consumes 1 seat.</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-bold text-purple-800 block text-base">CHILD (CHD)</span>
                  <p className="text-xs text-slate-500 mt-1">Age 2 to 11 years as on travel date</p>
                  <p className="text-xs text-slate-700 mt-2 font-medium">Billed at child fare (same as adult on series). Consumes 1 seat.</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-bold text-amber-800 block text-base">INFANT (INF)</span>
                  <p className="text-xs text-slate-500 mt-1">Age &lt; 2 years as on travel date</p>
                  <p className="text-xs text-slate-700 mt-2 font-medium">Flat nominal fee (₹1,500 domestic, ₹2,500 intl). <strong>Does NOT consume seat</strong> (travels on adult lap).</p>
                </div>
              </div>
            </div>

            <div className="border border-rose-200 bg-rose-50/50 rounded-xl p-6 shadow-sm space-y-3">
              <h3 className="text-lg font-bold text-rose-900 flex items-center gap-2">
                <AlertTriangle size={18} className="text-rose-600" /> Series Fare Cancellation & Refund Policy
              </h3>
              <ul className="text-sm text-rose-800 space-y-1.5 list-disc pl-5">
                <li>Fixed Departure Series Fares are bulk-contracted charter blocks and are <strong>100% NON-REFUNDABLE</strong> upon confirmation.</li>
                <li>Date changes are strictly prohibited on series fare tickets.</li>
                <li>Minor name corrections (up to 3 characters) can be processed up to 24 hours prior to departure via the offline helpdesk desk.</li>
                <li>If an airline cancels the flight entirely, 100% of the booking amount is refunded directly back to your B2B wallet.</li>
              </ul>
            </div>
          </div>
        )}

        {/* 5. ENDPOINT: AUTHENTICATION */}
        {activeTab === 'auth-endpoint' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-800 font-mono font-bold text-xs px-2.5 py-1 rounded">POST</span>
              <h2 className="text-2xl font-black text-slate-900 font-mono">/oauth2/tokens</h2>
            </div>
            <p className="text-slate-600 text-sm">Obtain a 24-hour JWT session token for authenticated flight search and booking requests.</p>

            <div className="bg-slate-900 rounded-xl p-5 text-slate-200 font-mono text-xs overflow-x-auto">
              <p className="text-slate-400 mb-2">// Request Payload</p>
{`{
  "username": "${partner.toLowerCase().replace(/[^a-z0-9]/g, '_')}_b2b",
  "password": "YourPassword123!",
  "apiKey": "${apiKey}",
  "auth_channel": "cugtest.trippechalo.com"
}`}
            </div>

            <div className="bg-slate-900 rounded-xl p-5 text-emerald-400 font-mono text-xs overflow-x-auto">
              <p className="text-slate-400 mb-2">// Success Response (200 OK)</p>
{`{
  "success": true,
  "statusCode": 200,
  "tokenId": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "tokenId": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "environment": "${isLive ? 'PRODUCTION' : 'SANDBOX'}",
    "client": {
      "companyName": "${partner}",
      "status": "${isLive ? 'Live' : 'Testing'}",
      "apiWalletBalance": ${isLive ? 250000 : 500000}
    }
  }
}`}
            </div>
          </div>
        )}

        {/* 6. ENDPOINT: SECTORS */}
        {activeTab === 'sectors-endpoint' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 font-mono font-bold text-xs px-2.5 py-1 rounded">GET</span>
              <h2 className="text-2xl font-black text-slate-900 font-mono">/flights/sectors</h2>
            </div>
            <p className="text-slate-600 text-sm">Query active flight sectors, starting fares, and available calendar travel dates.</p>

            <div className="bg-slate-900 rounded-xl p-5 text-emerald-400 font-mono text-xs overflow-x-auto">
              <p className="text-slate-400 mb-2">// Success Response (200 OK)</p>
{`{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "origin": "DEL",
      "destination": "BOM",
      "airline": "Air India",
      "currency": "INR",
      "minFare": 4200,
      "totalFlights": 4,
      "availableDates": ["2026-12-15", "2026-12-16", "2026-12-17"]
    },
    {
      "origin": "DEL",
      "destination": "DXB",
      "airline": "IndiGo",
      "currency": "INR",
      "minFare": 15000,
      "totalFlights": 2,
      "availableDates": ["2026-12-20", "2026-12-22"]
    }
  ],
  "meta": {
    "count": 2,
    "environment": "${isLive ? 'PRODUCTION' : 'SANDBOX'}"
  }
}`}
            </div>
          </div>
        )}

        {/* 7. ENDPOINT: SEARCH FLIGHTS */}
        {activeTab === 'search-endpoint' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 font-mono font-bold text-xs px-2.5 py-1 rounded">POST</span>
              <h2 className="text-2xl font-black text-slate-900 font-mono">/flights/search</h2>
            </div>
            <p className="text-slate-600 text-sm">Search live inventory for specified sector and date. Returns detailed per-passenger fare breakdown.</p>

            <div className="bg-slate-900 rounded-xl p-5 text-slate-200 font-mono text-xs overflow-x-auto">
              <p className="text-slate-400 mb-2">// Request Payload</p>
{`{
  "origin": "DEL",
  "destination": "BOM",
  "date": "2026-12-15",
  "adults": 1,
  "children": 0,
  "infants": 0
}`}
            </div>

            <div className="bg-slate-900 rounded-xl p-5 text-emerald-400 font-mono text-xs overflow-x-auto">
              <p className="text-slate-400 mb-2">// Success Response (200 OK)</p>
{`{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "sfId": "TC-TEST-SEAT1",
      "airline": "Air India",
      "flightNo": "AI-101",
      "origin": "DEL",
      "destination": "BOM",
      "travelDate": "2026-12-15",
      "departureTime": "07:00 (IST)",
      "arrivalTime": "09:15 (IST)",
      "availableSeats": 1,
      "isRefundable": false,
      "pricing": {
        "currency": "INR",
        "baseFare": 3500,
        "taxAndCharges": 700,
        "totalFare": 4200,
        "breakdown": {
          "adultFare": 4200,
          "childFare": 4200,
          "infantFare": 1500
        },
        "fareValidUntil": "2026-10-26T15:35:00.000Z"
      },
      "baggage": {
        "cabin": "7 Kg",
        "checkin": "15 Kg"
      }
    }
  ],
  "meta": {
    "count": 1,
    "currency": "INR",
    "timezone": "Asia/Kolkata (IST)",
    "fareValidUntil": "2026-10-26T15:35:00.000Z"
  }
}`}
            </div>
          </div>
        )}

        {/* 8. ENDPOINT: BOOK FLIGHT */}
        {activeTab === 'book-endpoint' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-800 font-mono font-bold text-xs px-2.5 py-1 rounded">POST</span>
              <h2 className="text-2xl font-black text-slate-900 font-mono">/flights/book</h2>
            </div>
            <p className="text-slate-600 text-sm">
              Confirm flight booking using Atomic CAS seat decrement. Include header <code className="bg-slate-200 px-1 rounded font-mono">Idempotency-Key</code> to protect against duplicate charging upon network timeout retries.
            </p>

            <div className="bg-slate-900 rounded-xl p-5 text-slate-200 font-mono text-xs overflow-x-auto">
              <p className="text-slate-400 mb-2">// Headers & Request Payload</p>
              <p className="text-blue-400 mb-3">
                Authorization: Bearer &lt;token&gt;<br />
                Idempotency-Key: 7d6e4b21-4f18-4b72-9b22-421710ec9471<br />
                Content-Type: application/json
              </p>
{`{
  "sfId": "TC-TEST-SEAT1",
  "clientBookingRef": "MMT-BK-2026-9921",
  "contactDetails": {
    "email": "operations@partner.com",
    "phone": "+919876543210"
  },
  "passengers": [
    {
      "title": "Mr",
      "firstName": "Rahul",
      "lastName": "Sharma",
      "type": "ADULT",
      "gender": "Male",
      "dob": "1990-08-14"
    }
  ]
}`}
            </div>

            <div className="bg-slate-900 rounded-xl p-5 text-emerald-400 font-mono text-xs overflow-x-auto">
              <p className="text-slate-400 mb-2">// Success Response (201 Created)</p>
{`{
  "success": true,
  "statusCode": 201,
  "data": {
    "bookingId": "BK-B2B-821942",
    "pnr": "${isLive ? 'TC8291' : 'TESTDOM821942'}",
    "status": "CONFIRMED",
    "idempotencyReplay": false,
    "clientBookingRef": "MMT-BK-2026-9921",
    "totalAmount": 4200,
    "currency": "INR",
    "seatsAllocated": 1,
    "flight": {
      "sfId": "TC-TEST-SEAT1",
      "airline": "Air India",
      "flightNo": "AI-101",
      "origin": "DEL",
      "destination": "BOM",
      "travelDate": "2026-12-15",
      "departureTime": "07:00 (IST)",
      "arrivalTime": "09:15 (IST)"
    },
    "passengers": [
      {
        "title": "Mr",
        "firstName": "RAHUL",
        "lastName": "SHARMA",
        "type": "ADULT",
        "gender": "Male"
      }
    ]
  }
}`}
            </div>
          </div>
        )}

        {/* 9. ENDPOINT: RETRIEVE BOOKING */}
        {activeTab === 'retrieve-endpoint' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 font-mono font-bold text-xs px-2.5 py-1 rounded">GET</span>
              <h2 className="text-2xl font-black text-slate-900 font-mono">/flights/booking/:bookingId</h2>
            </div>
            <p className="text-slate-600 text-sm">Retrieve booking status, airline PNR, and ticketing details using your internal bookingId, airline PNR, or clientBookingRef.</p>

            <div className="bg-slate-900 rounded-xl p-5 text-emerald-400 font-mono text-xs overflow-x-auto">
              <p className="text-slate-400 mb-2">// Success Response (200 OK)</p>
{`{
  "success": true,
  "statusCode": 200,
  "data": {
    "bookingId": "BK-B2B-821942",
    "pnr": "${isLive ? 'TC8291' : 'TESTDOM821942'}",
    "status": "CONFIRMED",
    "clientBookingRef": "MMT-BK-2026-9921",
    "totalAmount": 4200,
    "currency": "INR",
    "bookingDate": "2026-10-26",
    "flight": {
      "airline": "Air India",
      "flightNo": "AI-101",
      "origin": "DEL",
      "destination": "BOM"
    },
    "passengers": [
      { "name": "MR RAHUL SHARMA", "type": "ADULT", "status": "CONFIRMED" }
    ]
  }
}`}
            </div>
          </div>
        )}

        {/* 10. ENDPOINT: CANCELLATION POLICY */}
        {activeTab === 'policy-endpoint' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 font-mono font-bold text-xs px-2.5 py-1 rounded">GET</span>
              <h2 className="text-2xl font-black text-slate-900 font-mono">/flights/cancellation-policy</h2>
            </div>
            <p className="text-slate-600 text-sm">Query legal fare rules and non-refundable Series Fare terms.</p>

            <div className="bg-slate-900 rounded-xl p-5 text-emerald-400 font-mono text-xs overflow-x-auto">
              <p className="text-slate-400 mb-2">// Success Response (200 OK)</p>
{`{
  "success": true,
  "statusCode": 200,
  "data": {
    "fareType": "SERIES_FARE_FIXED_DEPARTURE",
    "isRefundable": false,
    "cancellationAllowed": false,
    "penaltyPercentage": 100,
    "terms": [
      "Fixed Departure (Series Fare) tickets are wholesale charter blocks and are 100% NON-REFUNDABLE once booked.",
      "Date change is strictly not permitted on fixed departure inventory.",
      "Name correction (up to 3 characters) is permitted up to 24 hours prior to departure via the offline helpdesk.",
      "In case of full airline charter cancellation, full refund is credited back to the B2B partner wallet."
    ]
  }
}`}
            </div>
          </div>
        )}

        {/* 11. FIXED UAT TEST CATALOGUE */}
        {activeTab === 'uat-catalogue' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Guaranteed Sandbox UAT Test Catalogue</h1>
              <p className="text-slate-600 text-base mt-2">
                Use these fixed sandbox mock flights to verify edge-cases, international passport rules, and race conditions deterministically.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-rose-200 bg-white shadow-sm space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                  Test Case TC-04: Race Condition & Out-of-Stock
                </span>
                <h4 className="font-bold text-slate-900 text-sm font-mono">sfId: TC-TEST-SEAT1</h4>
                <p className="text-xs text-slate-600">DEL → BOM (Air India AI-101) | Available Seats: <strong>1</strong></p>
                <p className="text-xs text-slate-500">
                  Attempt to book 2 seats simultaneously or concurrently from 2 threads. 1 thread will succeed (201 Created), the other will receive 409 <code className="text-rose-600">SEATS_NOT_AVAILABLE</code>.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-blue-200 bg-white shadow-sm space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  Test Case TC-03: International & Passport Validation
                </span>
                <h4 className="font-bold text-slate-900 text-sm font-mono">sfId: TC-TEST-INTL</h4>
                <p className="text-xs text-slate-600">DEL → DXB (IndiGo 6E-1401) | Available Seats: <strong>15</strong></p>
                <p className="text-xs text-slate-500">
                  Requires <code className="font-mono text-blue-600">passportNumber</code> and <code className="font-mono text-blue-600">passportExpiry</code>. Response masks PII as <code className="font-mono">Z1****67</code>.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-emerald-200 bg-white shadow-sm space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Standard Domestic Flight
                </span>
                <h4 className="font-bold text-slate-900 text-sm font-mono">sfId: TC-TEST-NORMAL</h4>
                <p className="text-xs text-slate-600">DEL → BLR (IndiGo 6E-205) | Available Seats: <strong>45</strong></p>
                <p className="text-xs text-slate-500">Standard domestic booking flow with multi-passenger support.</p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                  Sold Out Inventory
                </span>
                <h4 className="font-bold text-slate-900 text-sm font-mono">sfId: TC-TEST-SOLDOUT</h4>
                <p className="text-xs text-slate-600">DEL → GOI (Vistara UK-810) | Available Seats: <strong>0</strong></p>
                <p className="text-xs text-slate-500">Always returns 409 SEATS_NOT_AVAILABLE for instant rejection verification.</p>
              </div>
            </div>
          </div>
        )}

        {/* 12. COMPLIANCE & SECURITY */}
        {activeTab === 'compliance' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Data Protection (DPDP 2023) & Security</h1>
              <p className="text-slate-600 text-base mt-2">
                Guidelines for handling passenger data and API credentials in compliance with Indian regulatory requirements.
              </p>
            </div>

            <div className="border border-slate-200 bg-white rounded-xl p-6 shadow-sm space-y-4 text-sm text-slate-700">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shield size={18} className="text-emerald-600" /> Digital Personal Data Protection (DPDP) Act, 2023
              </h3>
              <ul className="space-y-2 list-disc pl-5">
                <li><strong>PII Masking:</strong> Sensitive identifiers such as passport numbers are permanently masked in all API responses (e.g. <code className="bg-slate-100 font-mono px-1 rounded">Z1****67</code>).</li>
                <li><strong>Data Retention:</strong> Passenger personal information is archived and purged after 180 days post-travel date in accordance with DPDP data minimization mandates.</li>
                <li><strong>Credential Storage:</strong> Never store your live API key in client-side applications (React, iOS, Android). All calls must originate from your secure backend servers.</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
