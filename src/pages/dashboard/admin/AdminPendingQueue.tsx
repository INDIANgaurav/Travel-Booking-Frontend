import React, { useState, useEffect } from 'react';
import { Clock, UserPlus, CreditCard, Building2, AlertTriangle, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

export default function AdminPendingQueue() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'agents' | 'topups' | 'withdrawals' | 'offlineBookings'>('agents');

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/pending-queue');
      setData(res.data);
    } catch (error) {
      toast.error('Failed to load pending queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500 font-bold uppercase text-xs tracking-wider">Gathering Pending Requests...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { summary, agents, topups, withdrawals, offlineBookings } = data;

  const tabs = [
    { id: 'agents', label: 'Agent Approvals', count: summary.agents, icon: UserPlus, color: 'text-orange-500' },
    { id: 'topups', label: 'Wallet Top-ups', count: summary.topups, icon: CreditCard, color: 'text-blue-500' },
    { id: 'withdrawals', label: 'Withdrawals', count: summary.withdrawals, icon: Building2, color: 'text-emerald-500' },
    { id: 'offlineBookings', label: 'Offline Bookings', count: summary.offlineBookings, icon: Clock, color: 'text-purple-500' }
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Clock className="text-blue-600" />
          Pending Queue
        </h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
          Review and approve pending requests across the platform
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${activeTab === tab.id ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300 shadow-sm'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 ${tab.color}`}>
                <tab.icon size={20} />
              </div>
              {tab.count > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              )}
            </div>
            <div className="text-2xl font-black text-gray-900">{tab.count}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase mt-1">{tab.label}</div>
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[400px]">
        
        {/* Agents */}
        {activeTab === 'agents' && (
          <div>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-orange-50/30">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <UserPlus size={16} className="text-orange-500" />
                Pending B2B Agents ({agents.length})
              </h2>
            </div>
            <div className="p-0">
              {agents.length === 0 ? (
                <div className="p-8 text-center text-gray-500 font-bold text-sm">No agents pending approval.</div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f8fafc] text-gray-900 font-black border-b border-gray-200">
                    <tr>
                      <th className="p-3">COMPANY / NAME</th>
                      <th className="p-3">EMAIL & PHONE</th>
                      <th className="p-3">REQUEST DATE</th>
                      <th className="p-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {agents.map((agent: any) => (
                      <tr key={agent._id} className="hover:bg-gray-50 border-b border-gray-50">
                        <td className="p-3">
                          <div className="font-bold text-gray-900">{agent.companyName || 'N/A'}</div>
                          <div className="text-gray-500">{agent.name}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{agent.email}</div>
                          <div className="text-gray-500">{agent.phone}</div>
                        </td>
                        <td className="p-3 font-medium">{new Date(agent.createdAt).toLocaleDateString()}</td>
                        <td className="p-3 text-right">
                          <a href="/admin/users" className="text-blue-600 hover:text-blue-800 font-bold text-xs inline-flex items-center gap-1">Review <ArrowRight size={14} /></a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Top-ups */}
        {activeTab === 'topups' && (
          <div>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-blue-50/30">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <CreditCard size={16} className="text-blue-500" />
                Pending Wallet Top-ups ({topups.length})
              </h2>
            </div>
            <div className="p-0">
              {topups.length === 0 ? (
                <div className="p-8 text-center text-gray-500 font-bold text-sm">No wallet top-ups pending.</div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f8fafc] text-gray-900 font-black border-b border-gray-200">
                    <tr>
                      <th className="p-3">AGENT</th>
                      <th className="p-3">AMOUNT</th>
                      <th className="p-3">PAYMENT MODE</th>
                      <th className="p-3">REF NO.</th>
                      <th className="p-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {topups.map((t: any) => (
                      <tr key={t._id} className="hover:bg-gray-50 border-b border-gray-50">
                        <td className="p-3 font-bold text-gray-900">{t.user?.companyName || t.user?.name}</td>
                        <td className="p-3 font-bold text-emerald-600">₹{t.amount}</td>
                        <td className="p-3 font-medium">{t.paymentMode}</td>
                        <td className="p-3 text-gray-600">{t.referenceNumber}</td>
                        <td className="p-3 text-right">
                          <a href="/admin/wallet" className="text-blue-600 hover:text-blue-800 font-bold text-xs inline-flex items-center gap-1">Manage <ArrowRight size={14} /></a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Withdrawals */}
        {activeTab === 'withdrawals' && (
          <div>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50/30">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Building2 size={16} className="text-emerald-500" />
                Pending Withdrawals ({withdrawals.length})
              </h2>
            </div>
            <div className="p-0">
              {withdrawals.length === 0 ? (
                <div className="p-8 text-center text-gray-500 font-bold text-sm">No withdrawals pending.</div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f8fafc] text-gray-900 font-black border-b border-gray-200">
                    <tr>
                      <th className="p-3">AGENT</th>
                      <th className="p-3">AMOUNT</th>
                      <th className="p-3">REQUEST DATE</th>
                      <th className="p-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {withdrawals.map((w: any) => (
                      <tr key={w._id} className="hover:bg-gray-50 border-b border-gray-50">
                        <td className="p-3 font-bold text-gray-900">{w.user?.companyName || w.user?.name}</td>
                        <td className="p-3 font-bold text-emerald-600">₹{w.amount}</td>
                        <td className="p-3 font-medium">{new Date(w.createdAt).toLocaleDateString()}</td>
                        <td className="p-3 text-right">
                          <a href="/admin/wallet" className="text-blue-600 hover:text-blue-800 font-bold text-xs inline-flex items-center gap-1">Manage <ArrowRight size={14} /></a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Offline Bookings */}
        {activeTab === 'offlineBookings' && (
          <div>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-purple-50/30">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Clock size={16} className="text-purple-500" />
                Pending Offline Bookings ({offlineBookings.length})
              </h2>
            </div>
            <div className="p-0">
              {offlineBookings.length === 0 ? (
                <div className="p-8 text-center text-gray-500 font-bold text-sm">No offline bookings pending.</div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f8fafc] text-gray-900 font-black border-b border-gray-200">
                    <tr>
                      <th className="p-3">AGENT</th>
                      <th className="p-3">TYPE</th>
                      <th className="p-3">SECTOR / DETAILS</th>
                      <th className="p-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {offlineBookings.map((b: any) => (
                      <tr key={b._id} className="hover:bg-gray-50 border-b border-gray-50">
                        <td className="p-3 font-bold text-gray-900">{b.user?.companyName || b.user?.name}</td>
                        <td className="p-3 font-medium">{b.bookingType}</td>
                        <td className="p-3 font-medium">{b.sector || 'N/A'}</td>
                        <td className="p-3 text-right">
                          <a href="/admin/manage-bookings" className="text-blue-600 hover:text-blue-800 font-bold text-xs inline-flex items-center gap-1">Manage <ArrowRight size={14} /></a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
