import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { settingsApi } from '../../../../api/settingsApi';
import toast from 'react-hot-toast';
import { Loader2, LayoutTemplate, Save } from 'lucide-react';

const pagesList = ['Footer', 'PrivacyPolicy', 'TermsConditions'];

export default function AdminDynamicPages() {
  const [selectedPage, setSelectedPage] = useState('Footer');
  const [headline, setHeadline] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPageContent();
  }, [selectedPage]);

  const fetchPageContent = async () => {
    setLoading(true);
    try {
      const res = await settingsApi.getPageByName(selectedPage);
      if (res.data) {
        setHeadline(res.data.headline || '');
        setContent(res.data.content || '');
      }
    } catch (err: any) {
      if (err.response?.status !== 404) {
        toast.error('Failed to fetch page content');
      } else {
        setHeadline('');
        setContent('');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!headline || !content) {
      toast.error('Please fill both headline and content');
      return;
    }
    setSaving(true);
    try {
      await settingsApi.savePage({
        pageName: selectedPage,
        headline,
        content
      });
      toast.success('Page updated successfully!');
    } catch (err: any) {
      toast.error('Failed to update page');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-[#1e3a8a] rounded-lg">
            <LayoutTemplate size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dynamic Pages / CMS</h1>
            <p className="text-slate-500 text-sm mt-1">Manage footer links and CMS content pages</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex gap-4 border-b border-slate-200 pb-4 mb-6">
          {pagesList.map(page => (
            <button
              key={page}
              onClick={() => setSelectedPage(page)}
              className={`px-4 py-2 rounded-lg font-bold transition-all text-sm ${
                selectedPage === page
                  ? 'bg-[#1e3a8a] text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {page === 'Footer' ? 'Footer Content' : page === 'PrivacyPolicy' ? 'Privacy Policy' : 'Terms & Conditions'}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Page Headline</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-[#1e3a8a] transition-all font-medium text-slate-800 outline-none"
              placeholder={`Enter headline for ${selectedPage}`}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Page Content</label>
            {loading ? (
              <div className="h-64 flex justify-center items-center border border-slate-200 rounded-xl bg-slate-50">
                <Loader2 className="animate-spin text-[#1e3a8a]" size={32} />
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden pb-12">
                <ReactQuill 
                  theme="snow" 
                  value={content} 
                  onChange={setContent} 
                  className="h-64 border-none"
                />
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-[#1e3a8a] hover:bg-[#172554] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Publish Content'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
