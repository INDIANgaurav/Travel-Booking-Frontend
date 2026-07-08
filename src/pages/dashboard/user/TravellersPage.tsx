import React, { useEffect, useState } from 'react';
import { Users, Plus, Calendar as CalendarIcon, Hash } from 'lucide-react';
import api from '../../../services/api';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

interface Traveller {
  _id?: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  passportNumber?: string;
}

export default function TravellersPage() {
  const [travellers, setTravellers] = useState<Traveller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [passportNumber, setPassportNumber] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTravellers = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/api/users/profile');
      setTravellers(data.savedTravellers || []);
    } catch (error) {
      console.error('Failed to fetch travellers', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTravellers();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);
    try {
      const payload = { firstName, lastName, dob, gender, passportNumber };
      const { data } = await api.post('/api/users/travellers', payload);
      setTravellers(data.savedTravellers);
      
      setSuccess('Traveller added successfully!');
      setIsAdding(false);
      // Reset form
      setFirstName('');
      setLastName('');
      setDob('');
      setGender('Male');
      setPassportNumber('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add traveller');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Travellers</h1>
          <p className="text-gray-500 text-sm mt-1">Manage details of your family and friends for quicker booking.</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} icon={<Plus size={18} />}>
            Add Traveller
          </Button>
        )}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>}

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 animate-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-semibold mb-4">Add New Traveller</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
              <Input label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
              <Input label="Date of Birth" type="date" value={dob} onChange={e => setDob(e.target.value)} required icon={<CalendarIcon size={18} />} />
              
              <div className="w-full flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Gender</label>
                <select 
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow h-[42px]"
                  value={gender}
                  onChange={e => setGender(e.target.value as any)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <Input label="Passport Number (Optional)" value={passportNumber} onChange={e => setPassportNumber(e.target.value)} icon={<Hash size={18} />} />
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button type="submit" isLoading={isSaving}>Save Traveller</Button>
              <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-gray-200 rounded-2xl animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded-2xl animate-pulse"></div>
        </div>
      ) : travellers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 border-dashed">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No saved travellers</h3>
          <p className="text-gray-500 text-sm mb-4">Add your family members to book faster.</p>
          {!isAdding && <Button onClick={() => setIsAdding(true)} variant="outline">Add Your First Traveller</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {travellers.map((t, idx) => (
            <div key={t._id || idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                    {t.firstName.charAt(0)}{t.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t.firstName} {t.lastName}</h3>
                    <p className="text-xs text-gray-500">{t.gender} • {new Date(t.dob).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              {t.passportNumber && (
                <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Passport</p>
                  <p className="text-sm font-medium text-gray-900">{t.passportNumber}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
