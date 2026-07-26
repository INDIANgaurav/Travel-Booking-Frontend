import React, { useEffect, useState } from 'react';
import { MapPin, Building2, Star, Edit, Trash2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import TopNavbar from '../../../components/layout/TopNavbar';
import EditPropertyModal from './EditPropertyModal';
import api from '../../../services/api';
import toast from 'react-hot-toast';

interface Property {
  _id: string;
  name: string;
  city: string;
  state: string;
  pricePerNight: number;
  images: string[];
  rating: number;
  status: string;
  address: string;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await api.get('/api/hotels/my-properties');
      if (response.data) {
        setProperties(response.data);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) return;
    try {
      const response = await api.delete(`/api/hotels/my-properties/${id}`);
      if (response.data) {
        setProperties(properties.filter(p => p._id !== id));
      } else {
        toast.error('Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 relative font-sans">
        <TopNavbar forceWhite={true} />
        <div className="pt-24 max-w-7xl mx-auto px-4 md:px-8 space-y-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Properties</h1>
          <div className="text-center py-12 text-gray-500">Loading your properties...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative font-sans">
      <TopNavbar forceWhite={true} />
      <div className="pt-24 max-w-7xl mx-auto px-4 md:px-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Properties</h1>
      
      {properties.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Properties Found</h3>
          <p className="text-gray-500">You haven't registered any properties yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              <div className="h-48 bg-gray-200 relative">
                {property.status === 'PENDING' && (
                  <div className="absolute inset-0 bg-black/40 z-10 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                    <Clock size={32} className="mb-2" />
                    <span className="font-bold tracking-wider">APPROVAL PENDING</span>
                  </div>
                )}
                {property.status === 'REJECTED' && (
                  <div className="absolute inset-0 bg-red-900/40 z-10 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                    <XCircle size={32} className="mb-2" />
                    <span className="font-bold tracking-wider">REJECTED</span>
                  </div>
                )}

                {property.images && property.images.length > 0 ? (
                  <img src={property.images[0]} alt={property.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Building2 size={32} />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-sm">
                  <Star size={12} className="text-orange-500 fill-orange-500" />
                  {property.rating || 'New'}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">{property.name}</h3>
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <MapPin size={14} className="mr-1" />
                  <span className="truncate">{property.city}, {property.state}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div>
                    <span className="text-lg font-black text-gray-900">₹{property.pricePerNight}</span>
                    <span className="text-xs text-gray-500"> / night</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingProperty(property)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(property._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
      
      {editingProperty && (
        <EditPropertyModal 
          property={editingProperty} 
          onClose={() => setEditingProperty(null)} 
          onSuccess={() => {
            setEditingProperty(null);
            fetchProperties();
          }} 
        />
      )}
    </div>
  );
}
