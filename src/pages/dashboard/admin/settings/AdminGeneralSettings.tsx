import React, { useState, useEffect } from 'react';
import { settingsApi } from '../../../../api/settingsApi';
import { toast } from 'react-hot-toast';
import { Save, Clock } from 'lucide-react';

export default function AdminGeneralSettings() {
  const [timerMinutes, setTimerMinutes] = useState<string | number>(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const res = await settingsApi.getGeneralSettings();
      if (res.success && res.data) {
        setTimerMinutes(res.data.bookingSessionTimerMinutes || 10);
      }
    } catch (error: any) {
      toast.error('Failed to load settings');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalMinutes = parseInt(timerMinutes.toString()) || 10;
    if (finalMinutes < 1) {
      toast.error('Timer must be at least 1 minute');
      return;
    }
    try {
      setIsSaving(true);
      const res = await settingsApi.saveGeneralSettings({ bookingSessionTimerMinutes: finalMinutes });
      if (res.success) {
        toast.success('General settings saved successfully');
        setTimerMinutes(finalMinutes);
      }
    } catch (error: any) {
      toast.error('Failed to save settings');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-[#1e3a8a] rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">General Settings</h1>
            <p className="text-slate-500 text-sm mt-1">Configure global application settings</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {/* Tabs */}
        <div className="flex gap-4 border-b border-slate-200 pb-4 mb-6">
          <button className="px-4 py-2 rounded-lg font-bold transition-all text-sm bg-[#1e3a8a] text-white shadow-md">
            Session Timer
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Booking Session Timer (Minutes)
            </label>
            <p className="text-sm text-slate-500 mb-4">
              The amount of time users and agents have to complete their booking before the session expires.
            </p>
            <input
              type="number"
              min="1"
              max="60"
              required
              className="w-full md:w-1/3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-[#1e3a8a] transition-all font-medium text-slate-800 outline-none"
              value={timerMinutes}
              onChange={(e) => setTimerMinutes(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-start md:justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-[#1e3a8a] hover:bg-[#172554] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? <Clock className="animate-spin" size={18} /> : <Save size={18} />}
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
