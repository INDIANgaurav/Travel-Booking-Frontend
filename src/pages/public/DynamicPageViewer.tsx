import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { settingsApi } from '../../api/settingsApi';
import DOMPurify from 'dompurify';
import { Loader2 } from 'lucide-react';
import TopNavbar from '../../components/layout/TopNavbar';

export default function DynamicPageViewer() {
  const { pageName } = useParams();
  const [headline, setHeadline] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (pageName) fetchPageContent();
  }, [pageName]);

  const fetchPageContent = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await settingsApi.getPageByName(pageName!);
      if (res.data) {
        setHeadline(res.data.headline);
        setContent(res.data.content);
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-20">
      <TopNavbar forceWhite={true} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12">

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h1>
            <p className="text-slate-500">The content you are looking for is currently unavailable or has not been published yet.</p>
          </div>
        ) : (
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200">
            <h1 
              className="text-3xl md:text-4xl font-black text-slate-900 mb-8 pb-6 border-b border-slate-100 flex items-center flex-wrap"
              dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(headline.replace(/TrippeChalo/gi, '<span class="text-blue-600 font-black mx-1">TrippeChalo</span>')) 
              }}
            />
            <div 
              className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-a:text-blue-600 text-slate-700 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(content.replace(/TrippeChalo/gi, '<span class="text-blue-600 font-bold mx-1">TrippeChalo</span>')) 
              }}
            />
          </div>
        )}
      </main>
      
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} TrippeChalo India Pvt Ltd. All rights reserved.</p>
      </footer>
    </div>
  );
}
