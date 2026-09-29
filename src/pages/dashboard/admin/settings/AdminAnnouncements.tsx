import React, { useState, useEffect } from 'react';
import { settingsApi } from '../../../../api/settingsApi';
import toast from 'react-hot-toast';
import { Loader2, Megaphone, Plus, Edit, Trash2, X, Check, Calendar, ChevronDown } from 'lucide-react';
import CustomCalendar from '../../../../components/common/CustomCalendar';

interface Announcement {
  _id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  isActive: boolean;
  targetAudience: string[];
  validFrom?: string;
  validUntil?: string;
  createdAt: string;
}

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [showValidFromPicker, setShowValidFromPicker] = useState(false);
  const [showValidUntilPicker, setShowValidUntilPicker] = useState(false);
  
  const audienceDropdownRef = React.useRef<HTMLDivElement>(null);
  const fromPickerRef = React.useRef<HTMLDivElement>(null);
  const untilPickerRef = React.useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<Partial<Announcement>>({
    title: '',
    message: '',
    type: 'INFO',
    isActive: true,
    targetAudience: ['ALL'],
    validFrom: '',
    validUntil: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (audienceDropdownRef.current && !audienceDropdownRef.current.contains(event.target as Node)) {
        setShowAudienceDropdown(false);
      }
      if (fromPickerRef.current && !fromPickerRef.current.contains(event.target as Node)) {
        setShowValidFromPicker(false);
      }
      if (untilPickerRef.current && !untilPickerRef.current.contains(event.target as Node)) {
        setShowValidUntilPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await settingsApi.getAnnouncements();
      if (res.data) setAnnouncements(res.data);
    } catch (err) {
      toast.error('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      return toast.error('Title and message are required');
    }
    setSaving(true);
    try {
      if (editingId) {
        await settingsApi.updateAnnouncement(editingId, formData);
        toast.success('Announcement updated');
      } else {
        await settingsApi.createAnnouncement(formData);
        toast.success('Announcement created');
      }
      setShowForm(false);
      fetchAnnouncements();
    } catch (err) {
      toast.error('Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (a: Announcement) => {
    setFormData({
      title: a.title,
      message: a.message,
      type: a.type,
      isActive: a.isActive,
      targetAudience: a.targetAudience,
      validFrom: a.validFrom ? a.validFrom.split('T')[0] : '',
      validUntil: a.validUntil ? a.validUntil.split('T')[0] : ''
    });
    setEditingId(a._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await settingsApi.deleteAnnouncement(id);
      toast.success('Announcement deleted');
      fetchAnnouncements();
    } catch (err) {
      toast.error('Failed to delete announcement');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', message: '', type: 'INFO', isActive: true, targetAudience: ['ALL'], validFrom: '', validUntil: '' });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-blue-900" size={32} /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-[#1e3a8a] rounded-lg">
            <Megaphone size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Broadcasts & Announcements</h1>
            <p className="text-slate-500 text-sm mt-1">Manage notifications sent to agents</p>
          </div>
        </div>
        {!showForm && (
          <button 
            onClick={() => { resetForm(); setShowForm(true); }}
            className="w-full sm:w-auto bg-[#1e3a8a] text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#172554] transition-colors"
          >
            <Plus size={18} /> Add New
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">{editingId ? 'Edit Announcement' : 'Create Announcement'}</h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-[#1e3a8a] outline-none"
                  placeholder="e.g. Server Maintenance"
                  required
                />
              </div>
              <div>
              <div className="relative" ref={audienceDropdownRef}>
                <label className="block text-sm font-medium text-slate-700 mb-2">Target Audience</label>
                <div 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg cursor-pointer bg-white flex justify-between items-center focus:ring-2 focus:ring-blue-500/20 focus:border-[#1e3a8a] outline-none"
                  onClick={() => setShowAudienceDropdown(!showAudienceDropdown)}
                >
                  <span className="text-slate-700 truncate max-w-[200px]">
                    {formData.targetAudience?.includes('ALL') 
                      ? 'Everyone' 
                      : formData.targetAudience?.length 
                        ? formData.targetAudience.join(', ') 
                        : 'Select Audience'}
                  </span>
                  <ChevronDown size={16} className="text-slate-500" />
                </div>
                {showAudienceDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    <div className="p-2 flex flex-col gap-1">
                      {['ALL', 'B2B', 'B2C', 'SUPPLIER', 'SUB_ADMIN'].map(role => (
                        <label key={role} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer rounded">
                          <input 
                            type="checkbox"
                            checked={(formData.targetAudience || []).includes(role)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              let current = formData.targetAudience || [];
                              
                              if (role === 'ALL') {
                                setFormData({ ...formData, targetAudience: checked ? ['ALL'] : [] });
                              } else {
                                if (checked) {
                                  current = current.filter(r => r !== 'ALL');
                                  current.push(role);
                                } else {
                                  current = current.filter(r => r !== role);
                                }
                                setFormData({ ...formData, targetAudience: current.length === 0 ? ['ALL'] : current });
                              }
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700">{role === 'ALL' ? 'Everyone' : role}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message Type</label>
                <select 
                  value={formData.type} 
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-[#1e3a8a] outline-none"
                >
                  <option value="INFO">Info (Blue)</option>
                  <option value="WARNING">Warning (Yellow)</option>
                  <option value="SUCCESS">Success (Green)</option>
                  <option value="ERROR">Error/Alert (Red)</option>
                </select>
              </div>
              <div className="flex items-center mt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Active (Visible to users)</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative" ref={fromPickerRef}>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valid From (Optional)</label>
                <div 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-[#1e3a8a] outline-none cursor-pointer flex justify-between items-center bg-white"
                  onClick={() => setShowValidFromPicker(true)}
                >
                  <span className={formData.validFrom ? 'text-slate-800' : 'text-slate-400'}>
                    {formData.validFrom ? new Date(formData.validFrom).toLocaleDateString() : 'Select date'}
                  </span>
                  <Calendar size={16} className="text-slate-400" />
                </div>
                {showValidFromPicker && (
                  <div className="absolute z-50 mt-1 left-0 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 min-w-[320px]">
                    <CustomCalendar 
                      isOneWay={true}
                      startDate={formData.validFrom ? new Date(formData.validFrom) : null}
                      endDate={null}
                      onChange={(start) => {
                        setFormData({...formData, validFrom: start ? start.toISOString() : ''});
                        setShowValidFromPicker(false);
                      }}
                      onClose={() => setShowValidFromPicker(false)}
                    />
                  </div>
                )}
              </div>
              <div className="relative" ref={untilPickerRef}>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valid Until (Optional)</label>
                <div 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-[#1e3a8a] outline-none cursor-pointer flex justify-between items-center bg-white"
                  onClick={() => setShowValidUntilPicker(true)}
                >
                  <span className={formData.validUntil ? 'text-slate-800' : 'text-slate-400'}>
                    {formData.validUntil ? new Date(formData.validUntil).toLocaleDateString() : 'Select date'}
                  </span>
                  <Calendar size={16} className="text-slate-400" />
                </div>
                {showValidUntilPicker && (
                  <div className="absolute z-50 mt-1 right-0 sm:left-0 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 min-w-[320px]">
                    <CustomCalendar 
                      isOneWay={true}
                      startDate={formData.validUntil ? new Date(formData.validUntil) : null}
                      endDate={null}
                      onChange={(start) => {
                        setFormData({...formData, validUntil: start ? start.toISOString() : ''});
                        setShowValidUntilPicker(false);
                      }}
                      onClose={() => setShowValidUntilPicker(false)}
                    />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Message Content</label>
              <textarea 
                value={formData.message} 
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-[#1e3a8a] outline-none h-24 resize-none"
                placeholder="Enter the announcement details..."
                required
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="bg-[#1e3a8a] text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-[#172554] transition-colors disabled:opacity-70">
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                {saving ? 'Saving...' : 'Save Announcement'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Title</th>
                <th className="px-6 py-4 font-bold">Type</th>
                <th className="px-6 py-4 font-bold">Audience</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {announcements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No announcements found. Click "Add New" to create one.
                  </td>
                </tr>
              ) : announcements.map((a) => (
                <tr key={a._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${a.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {a.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">{a.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      a.type === 'INFO' ? 'bg-blue-100 text-blue-700' : 
                      a.type === 'WARNING' ? 'bg-amber-100 text-amber-700' : 
                      a.type === 'SUCCESS' ? 'bg-green-100 text-green-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {a.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div className="flex flex-wrap gap-1">
                      {(a.targetAudience || []).map((t, i) => (
                        <span key={i} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <div>{new Date(a.createdAt).toLocaleDateString()}</div>
                    {(a.validFrom || a.validUntil) && (
                      <div className="text-[10px] text-slate-400 mt-1 font-medium">
                        {a.validFrom && `From: ${new Date(a.validFrom).toLocaleDateString()}`}<br/>
                        {a.validUntil && `Until: ${new Date(a.validUntil).toLocaleDateString()}`}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(a)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(a._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
