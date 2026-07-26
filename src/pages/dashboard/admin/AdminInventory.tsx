import React, { useEffect, useState } from 'react';
import { Building2, CheckCircle, XCircle, Search, Trash2, X, AlertTriangle } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

interface Property {
  _id: string;
  name: string;
  city: string;
  state: string;
  pricePerNight: number;
  status: string;
  ownerId?: { name: string; email: string };
  createdAt: string;
}

export default function AdminInventory() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<{type: 'APPROVE' | 'REJECT' | 'DELETE', id: string, name: string} | null>(null);

  const fetchProperties = async () => {
    try {
      const { data } = await api.get('/api/hotels/admin');
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const executeAction = async () => {
    if (!modalAction) return;
    try {
      if (modalAction.type === 'APPROVE') {
        await api.patch(`/api/hotels/admin/${modalAction.id}/status`, { status: 'APPROVED' });
        setProperties(properties.map(p => p._id === modalAction.id ? { ...p, status: 'APPROVED' } : p));
      } else if (modalAction.type === 'REJECT') {
        await api.patch(`/api/hotels/admin/${modalAction.id}/status`, { status: 'REJECTED' });
        setProperties(properties.map(p => p._id === modalAction.id ? { ...p, status: 'REJECTED' } : p));
      } else if (modalAction.type === 'DELETE') {
        await api.delete(`/api/hotels/admin/${modalAction.id}`);
        setProperties(properties.filter(p => p._id !== modalAction.id));
      }
      setModalOpen(false);
      setModalAction(null);
    } catch (error) {
      console.error(`Error executing ${modalAction.type}:`, error);
      toast.error(`Failed to execute action`);
    }
  };

  const openModal = (type: 'APPROVE' | 'REJECT' | 'DELETE', id: string, name: string) => {
    setModalAction({ type, id, name });
    setModalOpen(true);
  };

  const filteredProperties = properties.filter(p => {
    const matchesFilter = filter === 'ALL' || p.status === filter;
    const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.city || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Inventory & Approvals</h1>
          <p className="text-sm text-gray-500 mt-1">Review and manage property listings submitted by users.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-2">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search properties..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Property Details</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Date Added</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading properties...</td>
                </tr>
              ) : filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No properties found matching your criteria.</td>
                </tr>
              ) : (
                filteredProperties.map(property => (
                  <tr key={property._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{property.name}</div>
                          <div className="text-xs text-gray-500">₹{property.pricePerNight}/night</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{property.city}</div>
                      <div className="text-xs text-gray-500">{property.state}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{property.ownerId?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{property.ownerId?.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {property.createdAt ? new Date(property.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        }) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        property.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        property.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {property.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {property.status === 'PENDING' && (
                          <>
                            <button 
                              onClick={() => openModal('APPROVE', property._id, property.name)}
                              className="flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                            >
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button 
                              onClick={() => openModal('REJECT', property._id, property.name)}
                              className="flex items-center gap-1 bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => openModal('DELETE', property._id, property.name)}
                          className="flex items-center gap-1 bg-gray-50 text-gray-700 hover:bg-red-50 hover:text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-gray-200"
                        >
                          <Trash2 size={14} /> Delete
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
      
      {modalOpen && modalAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className={`p-6 border-b flex justify-between items-center ${
              modalAction.type === 'DELETE' || modalAction.type === 'REJECT' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'
            }`}>
              <div className="flex items-center gap-2">
                <AlertTriangle size={20} className={modalAction.type === 'DELETE' || modalAction.type === 'REJECT' ? 'text-red-600' : 'text-green-600'} />
                <h2 className="text-lg font-bold text-gray-900">
                  Confirm {modalAction.type === 'APPROVE' ? 'Approval' : modalAction.type === 'REJECT' ? 'Rejection' : 'Deletion'}
                </h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition p-1">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to <strong>{modalAction.type.toLowerCase()}</strong> the property <strong>"{modalAction.name}"</strong>?
              </p>
              {modalAction.type === 'DELETE' && (
                <p className="text-red-600 text-sm font-medium">This action is permanent and cannot be undone.</p>
              )}
            </div>
            <div className="p-4 bg-gray-50 flex gap-3 justify-end border-t border-gray-100">
              <button 
                onClick={() => setModalOpen(false)} 
                className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={executeAction}
                className={`px-5 py-2.5 text-sm font-bold text-white rounded-lg transition ${
                  modalAction.type === 'DELETE' || modalAction.type === 'REJECT' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                Confirm {modalAction.type === 'APPROVE' ? 'Approval' : modalAction.type === 'REJECT' ? 'Rejection' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
