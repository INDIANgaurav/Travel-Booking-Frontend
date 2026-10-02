import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Book, Code, Globe, Server, CheckCircle, Shield } from 'lucide-react';

export default function B2BDocsPage() {
  const [searchParams] = useSearchParams();
  const partner = searchParams.get('partner') || 'Partner';
  const apiKey = searchParams.get('key') || '<YOUR_API_KEY>';
  const env = searchParams.get('env') || 'test'; // 'test' or 'live'

  const [activeTab, setActiveTab] = useState('intro');

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 h-screen sticky top-0 overflow-y-auto custom-scrollbar flex-shrink-0">
        <div className="p-6 border-b border-gray-200 bg-white">
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Trippe<span className="text-blue-600">Chalo</span></h1>
          <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">Flight Series API</p>
        </div>
        
        <div className="py-4">
          <div className="px-6 mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Getting Started</p>
          </div>
          <button onClick={() => setActiveTab('intro')} className={`w-full text-left px-6 py-2 text-sm font-medium transition-colors ${activeTab === 'intro' ? 'text-blue-600 bg-blue-50/50 border-r-2 border-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
            Introduction & Auth
          </button>
          
          <div className="px-6 mt-6 mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Endpoints</p>
          </div>
          <button onClick={() => setActiveTab('search')} className={`w-full flex items-center gap-2 px-6 py-2 text-sm font-medium transition-colors ${activeTab === 'search' ? 'text-blue-600 bg-blue-50/50 border-r-2 border-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
            <span className="text-[10px] font-black text-green-500 w-8">GET</span> Search Flights
          </button>
          <button onClick={() => setActiveTab('book')} className={`w-full flex items-center gap-2 px-6 py-2 text-sm font-medium transition-colors ${activeTab === 'book' ? 'text-blue-600 bg-blue-50/50 border-r-2 border-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
            <span className="text-[10px] font-black text-yellow-500 w-8">POST</span> Book Flight
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Single Center Column */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12 lg:px-24 pb-24 max-w-5xl mx-auto w-full">
          {activeTab === 'intro' && (
            <div className="max-w-3xl animate-fade-in">
              <h2 className="text-3xl font-black text-gray-900 mb-6">Flight Series API</h2>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                Welcome to the TrippeChalo B2B API documentation tailored for <strong>{partner}</strong>. 
                Our API allows you to seamlessly integrate our exclusive SeriesFare and Fixed Departure inventory directly into your platform.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Authentication</h3>
              <p className="text-gray-600 mb-4">
                All API requests must be authenticated using the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-pink-600 text-sm">x-api-key</code> header.
                We provide a specific environment key for your integration.
              </p>
              
              <div className="space-y-4 mb-8">
                {env === 'test' ? (
                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-orange-800 flex items-center gap-2"><Shield size={16}/> Test Environment</h4>
                    </div>
                    <p className="text-sm text-orange-700 mb-3">Use this key for development and integration. Bookings made with this key will <strong>not</strong> deduct real wallet balance or actual inventory seats.</p>
                    <code className="block bg-white p-3 rounded border border-orange-100 text-gray-800 text-xs font-mono break-all select-all">
                      {apiKey}
                    </code>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-green-800 flex items-center gap-2"><Server size={16}/> Live Production Environment</h4>
                    </div>
                    <p className="text-sm text-green-700 mb-3">Use this key in your production environment. Bookings <strong>will deduct real wallet balance</strong> and reduce live available seats.</p>
                    <code className="block bg-white p-3 rounded border border-green-100 text-gray-800 text-xs font-mono break-all select-all">
                      {apiKey}
                    </code>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Response Format</h3>
              <p className="text-gray-600 mb-4">Every API response follows a standard JSON format structure.</p>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <pre className="text-sm text-gray-800 font-mono">
{`{
  "success": true,
  "data": { ... } // or Array
}`}
                </pre>
              </div>

              <div className="mt-8 space-y-6">
                <div>
                  <p className="text-gray-400 font-bold mb-2 uppercase text-xs tracking-wider">Base URL</p>
                  <div className="bg-[#1e1e1e] rounded-lg p-4 font-mono text-blue-400 break-all border border-gray-700">
                    https://api.trippechalo.com/api/v1/b2b
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 font-bold mb-2 uppercase text-xs tracking-wider">Example cURL Request</p>
                  <div className="bg-[#1e1e1e] rounded-lg p-4 font-mono text-gray-300 overflow-x-auto code-scrollbar border border-gray-700 text-sm">
<pre>{`curl --location 'https://api.trippechalo.com/api/v1/b2b/flights/search?origin=DEL&destination=GOI&date=2026-10-15' \\
--header 'x-api-key: ${apiKey}'`}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div className="max-w-3xl animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded font-black text-sm uppercase">GET</span>
                <h2 className="text-3xl font-black text-gray-900">Search Flights</h2>
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                Fetch available SeriesFare flights between two sectors on a specific date.
              </p>

              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Query Parameters</h3>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-8">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="p-4 font-medium">Parameter</th>
                      <th className="p-4 font-medium">Type</th>
                      <th className="p-4 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    <tr>
                      <td className="p-4 font-mono font-bold">origin<span className="text-red-500">*</span></td>
                      <td className="p-4">String</td>
                      <td className="p-4">3-letter IATA code (e.g., DEL)</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-mono font-bold">destination<span className="text-red-500">*</span></td>
                      <td className="p-4">String</td>
                      <td className="p-4">3-letter IATA code (e.g., GOI)</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-mono font-bold">date<span className="text-red-500">*</span></td>
                      <td className="p-4">String</td>
                      <td className="p-4">Travel date in YYYY-MM-DD format</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-mono font-bold">adults</td>
                      <td className="p-4">Number</td>
                      <td className="p-4">Number of passengers (Default: 1). Used to check seat availability.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-8 space-y-6">
                <div>
                  <p className="text-gray-400 font-bold mb-2 uppercase text-xs tracking-wider">Example Request</p>
                  <div className="bg-[#1e1e1e] rounded-lg p-4 font-mono text-gray-300 overflow-x-auto code-scrollbar border border-gray-700 text-sm">
<pre>{`GET /api/v1/b2b/flights/search?origin=DEL&destination=GOI&date=2026-10-15
Host: api.trippechalo.com
x-api-key: ${apiKey}`}</pre>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 font-bold mb-2 uppercase text-xs tracking-wider">Success Response</p>
                  <div className="bg-[#1e1e1e] rounded-lg p-4 font-mono text-green-400 overflow-x-auto code-scrollbar border border-gray-700 text-sm">
<pre>{`{
  "success": true,
  "data": [
    {
      "sfId": "651a2b...",
      "airline": "IndiGo",
      "flightNo": "6E-2022",
      "origin": "DEL",
      "destination": "GOI",
      "departureTime": "10:00",
      "arrivalTime": "12:30",
      "fare": 5400,
      "availableSeats": 15,
      "checkinBaggage": "15 KG",
      "cabinBaggage": "7 KG",
      "isRefundable": false
    }
  ]
}`}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'book' && (
            <div className="max-w-3xl animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded font-black text-sm uppercase">POST</span>
                <h2 className="text-3xl font-black text-gray-900">Book Flight</h2>
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                Create a confirmed booking for a previously searched flight. Requires sufficient wallet balance if using the Live API Key.
              </p>

              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Body Parameters (JSON)</h3>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-8">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="p-4 font-medium">Parameter</th>
                      <th className="p-4 font-medium">Type</th>
                      <th className="p-4 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    <tr>
                      <td className="p-4 font-mono font-bold">sfId<span className="text-red-500">*</span></td>
                      <td className="p-4">String</td>
                      <td className="p-4">The unique SeriesFare ID returned from the Search API</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-mono font-bold">passengers<span className="text-red-500">*</span></td>
                      <td className="p-4">Array of Objects</td>
                      <td className="p-4">List of passenger details. See example for structure.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-mono font-bold">contactEmail</td>
                      <td className="p-4">String</td>
                      <td className="p-4">Email ID for sending e-tickets</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-mono font-bold">contactPhone</td>
                      <td className="p-4">String</td>
                      <td className="p-4">Mobile number for SMS updates</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-8 space-y-6">
                <div>
                  <p className="text-gray-400 font-bold mb-2 uppercase text-xs tracking-wider">Example Request</p>
                  <div className="bg-[#1e1e1e] rounded-lg p-4 font-mono text-gray-300 overflow-x-auto code-scrollbar border border-gray-700 text-sm">
<pre>{`POST /api/v1/b2b/flights/book
Host: api.trippechalo.com
x-api-key: ${apiKey}
Content-Type: application/json

{
  "sfId": "651a2b...",
  "passengers": [
    {
      "title": "Mr",
      "firstName": "John",
      "lastName": "Doe",
      "type": "ADT",
      "gender": "M"
    }
  ],
  "contactEmail": "john@example.com",
  "contactPhone": "9876543210"
}`}</pre>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 font-bold mb-2 uppercase text-xs tracking-wider">Success Response</p>
                  <div className="bg-[#1e1e1e] rounded-lg p-4 font-mono text-green-400 overflow-x-auto code-scrollbar border border-gray-700 text-sm">
<pre>{`{
  "success": true,
  "data": {
    "pnr": "${env === 'test' ? 'TEST-' : ''}482910",
    "status": "${env === 'test' ? 'TEST_CONFIRMED' : 'CONFIRMED'}",
    "message": "${env === 'test' ? 'Booking successful in TEST mode.' : 'Booking confirmed successfully.'}",
    "passengers": [...]
  }
}`}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
