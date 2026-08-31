import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Plus, Tag, Calendar, Users, Trash2, Edit, RefreshCw, Eye, Plane } from 'lucide-react';
import api from '../../../../services/api';
import DOBCalendar from '../../../../components/ui/DOBCalendar';
import Dropdown from '../../../../components/ui/Dropdown';
const AdminPromoCodes = () => {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewFlightPromo, setViewFlightPromo] = useState<any | null>(null);
  const [flightModalLoading, setFlightModalLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'FLAT',
    discountAmount: '',
    maxUses: 0,
    usageLimitPerUser: 1,
    validFrom: '',
    validTo: '',
    applicableModules: ['FLIGHT'],
    pnr: '',
  });

  const fetchPromos = async () => {
    setIsRefreshing(true);
    try {
      const response = await api.get('/api/promos');
      setPromos(response.data);
    } catch (error) {
      toast.error('Failed to load promo codes');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const openFlightModal = async (promo: any) => {
    setViewFlightPromo(promo); // open modal immediately with what we have
    setFlightModalLoading(true);
    try {
      const res = await api.get(`/api/promos/${promo._id}/flight-details`);
      setViewFlightPromo(res.data);
    } catch (e) {
      // fallback to pre-fetched data already set above
    } finally {
      setFlightModalLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase(),
        discountAmount: Number(formData.discountAmount),
        maxUses: Number(formData.maxUses),
        usageLimitPerUser: Number(formData.usageLimitPerUser),
        conditions: formData.pnr ? { pnr: formData.pnr.toUpperCase() } : {}
      };

      if (editingId) {
        await api.put(`/api/promos/${editingId}`, payload);
        toast.success('Promo Code Updated Successfully');
      } else {
        await api.post('/api/promos', payload);
        toast.success('Promo Code Created Successfully');
      }
      setIsModalOpen(false);
      setEditingId(null);
      fetchPromos();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save promo code');
    }
  };

  const handleEdit = (promo: any) => {
    setFormData({
      code: promo.code,
      description: promo.description || '',
      discountType: promo.discountType,
      discountAmount: promo.discountAmount.toString(),
      maxUses: promo.maxUses,
      usageLimitPerUser: promo.usageLimitPerUser || 1,
      validFrom: new Date(promo.validFrom).toISOString().split('T')[0],
      validTo: new Date(promo.validTo).toISOString().split('T')[0],
      applicableModules: promo.applicableModules || ['FLIGHT'],
      pnr: promo.conditions?.pnr || '',
    });
    setEditingId(promo._id);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.delete(`/api/promos/${deleteConfirmId}`);
      toast.success('Promo code deleted');
      setDeleteConfirmId(null);
      fetchPromos();
    } catch (error) {
      toast.error('Failed to delete promo code');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="h-6 w-6 text-primary" />
            Promo Code Engine
          </h1>
          <p className="text-gray-500 mt-1">Manage marketing discounts and flash sales</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchPromos()}
            disabled={isRefreshing}
            className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh"
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          <button
            onClick={() => {
              setFormData({
                code: '', description: '', discountType: 'FLAT', discountAmount: '',
                maxUses: 0, usageLimitPerUser: 1, validFrom: '', validTo: '',
                applicableModules: ['FLIGHT'], pnr: ''
              });
              setEditingId(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create Promo
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">Usage</th>
                  <th className="px-6 py-4">Validity</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No promo codes found. Create one to get started!
                    </td>
                  </tr>
                ) : (
                  promos.map((promo: any) => (
                    <tr key={promo._id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded tracking-wider">
                              {promo.code}
                            </div>
                            {promo.conditions?.pnr && (
                              <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200 shadow-sm">
                                FD: {promo.conditions.pnr}
                              </span>
                            )}
                          </div>
                          {promo.conditions?.supplierId ? (
                            <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                              Owner: {promo.conditions.supplierId.companyName || promo.conditions.supplierId.name || 'Supplier'}
                            </div>
                          ) : (
                            <div className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                              Owner: Admin (Global)
                            </div>
                          )}
                          <div className="text-xs text-gray-500 line-clamp-1" title={promo.description}>{promo.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-green-600">
                          {promo.discountType === 'FLAT' ? '₹' : ''}{promo.discountAmount}{promo.discountType === 'PERCENTAGE' ? '%' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-gray-600 text-xs">
                          <Users className="h-3 w-3" />
                          <span>{promo.usedCount} / {promo.maxUses === 0 ? 'Unlimited' : promo.maxUses}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-gray-600 text-xs">
                          <Calendar className="h-3 w-3" />
                          {new Date(promo.validFrom).toLocaleDateString()} - {new Date(promo.validTo).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${promo.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {promo.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {promo.conditions?.pnr && (
                            <button onClick={() => openFlightModal(promo)} className="text-purple-500 hover:text-purple-700 p-1.5 rounded-md hover:bg-purple-50 transition-colors cursor-pointer" title="View Flight Details">
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          <button onClick={() => handleEdit(promo)} className="text-blue-500 hover:text-blue-700 p-1.5 rounded-md hover:bg-blue-50 transition-colors cursor-pointer">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteConfirmId(promo._id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors cursor-pointer">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h2 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Promo Code' : 'Create New Promo Code'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code Name <span className="text-red-500">*</span></label>
                  <input required type="text" name="code" value={formData.code} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase" placeholder="e.g. DIWALI500" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type <span className="text-red-500">*</span></label>
                  <div className="h-[42px]">
                    <Dropdown 
                      value={formData.discountType} 
                      onChange={(val) => setFormData({ ...formData, discountType: val })}
                      options={[
                        { value: 'FLAT', label: 'Flat Amount (₹)' },
                        { value: 'PERCENTAGE', label: 'Percentage (%)' }
                      ]}
                    />
                  </div>
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount <span className="text-red-500">*</span></label>
                  <input required type="number" name="discountAmount" value={formData.discountAmount} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="500" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Global Max Uses (0 = unlimited)</label>
                  <input type="number" name="maxUses" value={formData.maxUses} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid From <span className="text-red-500">*</span></label>
                  <DOBCalendar 
                    value={formData.validFrom} 
                    onChange={(val) => setFormData({ ...formData, validFrom: val })} 
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid To <span className="text-red-500">*</span></label>
                  <DOBCalendar 
                    value={formData.validTo} 
                    onChange={(val) => setFormData({ ...formData, validTo: val })} 
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usage per Agent (0 = unlimited)</label>
                  <input type="number" name="usageLimitPerUser" value={formData.usageLimitPerUser} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  <p className="text-xs text-gray-500 mt-1">Industry standard is 1 time per user for welcome promos, or unlimited (0) for flash sales.</p>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Applicable PNR (Optional)</label>
                  <input type="text" name="pnr" value={formData.pnr} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase" placeholder="e.g. A3BC24 or leave blank" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description / Memo</label>
                  <input type="text" name="description" value={formData.description} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Clearance sale for DEL-GOA sectors" />
                </div>
              </div>

                <div className="col-span-2 pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md cursor-pointer">
                    {editingId ? 'Save Changes' : 'Create Promo Code'}
                  </button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden scale-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">Delete Promo Code?</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to permanently remove this promo code? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-md cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flight Details Modal */}
      {viewFlightPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden scale-in duration-200">
            <div className="bg-purple-600 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">
                <Plane size={18} /> Flight Details for {viewFlightPromo.code}
              </h3>
              <button onClick={() => setViewFlightPromo(null)} className="text-white/70 hover:text-white transition-colors cursor-pointer">✕</button>
            </div>
            <div className="p-6">
              {/* PNR Badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-purple-700 uppercase">Linked FD PNR</span>
                <span className="text-sm font-black text-purple-600 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">{viewFlightPromo.conditions?.pnr || 'N/A'}</span>
              </div>

              {flightModalLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                </div>
              ) : viewFlightPromo.flightDetails ? (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 p-4">
                    <div className="flex justify-between items-center border-b border-purple-100 pb-3 mb-3">
                      <div className="text-center">
                        <p className="text-lg font-black text-[#0c1a40]">{viewFlightPromo.flightDetails.origin}</p>
                        <p className="text-[11px] text-gray-500 font-semibold">
                          {viewFlightPromo.flightDetails.departureTime
                            ? isNaN(new Date(viewFlightPromo.flightDetails.departureTime).getTime())
                              ? viewFlightPromo.flightDetails.departureTime
                              : new Date(viewFlightPromo.flightDetails.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                            : '—'}
                        </p>
                      </div>
                      <div className="flex-1 flex flex-col items-center px-4">
                        <Plane size={18} className="text-purple-500 mb-1" />
                        <div className="w-full h-0.5 bg-purple-200 relative">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-50 px-2 text-[10px] text-purple-600 font-bold whitespace-nowrap">
                            {viewFlightPromo.flightDetails.travelDate
                              ? new Date(viewFlightPromo.flightDetails.travelDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                              : '—'}
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-black text-[#0c1a40]">{viewFlightPromo.flightDetails.destination}</p>
                        <p className="text-[11px] text-gray-500 font-semibold">
                          {viewFlightPromo.flightDetails.arrivalTime
                            ? isNaN(new Date(viewFlightPromo.flightDetails.arrivalTime).getTime())
                              ? viewFlightPromo.flightDetails.arrivalTime
                              : new Date(viewFlightPromo.flightDetails.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                            : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-lg p-2.5 text-center border border-purple-100">
                        <p className="text-[9px] text-gray-400 uppercase font-bold">Airline</p>
                        <p className="text-xs font-bold text-gray-800 mt-0.5">{viewFlightPromo.flightDetails.airline || '—'}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2.5 text-center border border-purple-100">
                        <p className="text-[9px] text-gray-400 uppercase font-bold">Flight No</p>
                        <p className="text-xs font-bold text-gray-800 mt-0.5">{viewFlightPromo.flightDetails.flightNo || '—'}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2.5 text-center border border-purple-100">
                        <p className="text-[9px] text-gray-400 uppercase font-bold">Promo Used</p>
                        <p className="text-xs font-bold text-emerald-600 mt-0.5">{viewFlightPromo.usedCount || 0} / {viewFlightPromo.maxUses === 0 ? '∞' : viewFlightPromo.maxUses}</p>
                      </div>
                    </div>
                  </div>
                  {viewFlightPromo.linkedBookings?.length > 0 && (
                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Bookings Using This Promo</p>
                      {viewFlightPromo.linkedBookings.map((b: any) => (
                        <div key={b._id} className="flex justify-between items-center text-xs py-1.5 border-b border-gray-100 last:border-0">
                          <span className="font-bold text-blue-600">{b.bookingId}</span>
                          <span className="text-gray-600">{b.user?.name || 'Unknown'}</span>
                          <span className="font-semibold text-emerald-600">-₹{b.discountAmount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 text-center">
                  <p className="text-sm text-yellow-700 font-semibold">Flight details not found in system.</p>
                  <p className="text-xs text-yellow-600 mt-1">The FD flight with PNR <strong>{viewFlightPromo.conditions?.pnr}</strong> may have been removed or archived.</p>
                </div>
              )}

              <div className="flex justify-end">
                <button onClick={() => setViewFlightPromo(null)} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-lg cursor-pointer">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromoCodes;
