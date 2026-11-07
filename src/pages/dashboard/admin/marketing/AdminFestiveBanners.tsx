import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  ToggleLeft, 
  ToggleRight, 
  Calendar, 
  Tag, 
  Heart, 
  Gift, 
  Check, 
  X, 
  ArrowRight, 
  ExternalLink,
  Flame,
  Clock,
  Layers,
  Copy
} from 'lucide-react';
import api from '../../../../services/api';

export interface FestiveBannerItem {
  _id: string;
  title: string;
  subtitle: string;
  bannerType: 'GREETING' | 'PROMOTIONAL';
  festival: 'DIWALI' | 'HOLI' | 'NEW_YEAR' | 'CHRISTMAS' | 'EID' | 'INDEPENDENCE_DAY' | 'REPUBLIC_DAY' | 'CUSTOM';
  badgeText?: string;
  promoCode?: string;
  discountText?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
  bgTheme: 'DIWALI_GOLD' | 'HOLI_COLORS' | 'NEW_YEAR_MIDNIGHT' | 'CHRISTMAS_RED' | 'EID_EMERALD' | 'TRICOLOR_INDIA' | 'ROYAL_PURPLE' | 'SUNSET_ORANGE' | 'CUSTOM';
  customBgGradient?: string;
  isActive: boolean;
  showTopStrip: boolean;
  startDate?: string;
  endDate?: string;
  priority: number;
  createdAt: string;
}

const FESTIVAL_PRESETS = [
  {
    id: 'DIWALI',
    name: 'Diwali 🪔',
    badge: '🪔 Shubh Deepawali',
    bgTheme: 'DIWALI_GOLD' as const,
    greeting: {
      title: 'Happy Diwali! Wishing You Light & Prosperity 🪔✨',
      subtitle: 'May your journeys be as luminous and joyful as the festival of lights. Celebrate together with loved ones wherever they are.',
      ctaText: 'Explore Festive Flights',
      ctaLink: '/'
    },
    promo: {
      title: 'Diwali Dhamaka Travel Sale! 🪔✈️',
      subtitle: 'Celebrate the festival of lights at home! Get special discounts on domestic & international flight bookings.',
      promoCode: 'DIWALI2026',
      discountText: 'FLAT 15% OFF',
      badgeText: '🔥 Diwali Special',
      ctaText: 'Book Festive Flights',
      ctaLink: '/'
    }
  },
  {
    id: 'HOLI',
    name: 'Holi 🎨',
    badge: '🎨 Rang Barse',
    bgTheme: 'HOLI_COLORS' as const,
    greeting: {
      title: 'Happy Holi! Splash Colors Across the Sky 🎨🌈',
      subtitle: 'Wishing you a joyful festival of colors, laughter, and heartwarming journeys back home to your family.',
      ctaText: 'Fly Home This Holi',
      ctaLink: '/'
    },
    promo: {
      title: 'Rang Barse Holiday Sale! 🎨✈️',
      subtitle: 'Special fares to major holiday destinations. Fly with cheer and save big on your festival tickets!',
      promoCode: 'HOLIFUN',
      discountText: 'UP TO ₹2,000 OFF',
      badgeText: '🌈 Holi Carnival',
      ctaText: 'Grab Holi Deal',
      ctaLink: '/'
    }
  },
  {
    id: 'NEW_YEAR',
    name: 'New Year 🎆',
    badge: '🎆 Welcome 2026',
    bgTheme: 'NEW_YEAR_MIDNIGHT' as const,
    greeting: {
      title: 'Happy New Year! New Horizons Await 🎆✨',
      subtitle: 'Here is to exciting adventures, breathtaking destinations, and unforgettable memories in the coming year.',
      ctaText: 'Plan New Year Trips',
      ctaLink: '/'
    },
    promo: {
      title: 'New Year Mega Travel Sale! 🎆✈️',
      subtitle: 'Start your year with incredible travels. Unbeatable deals on prime global and domestic holiday sectors.',
      promoCode: 'NEWYEAR26',
      discountText: 'SAVE UP TO 20%',
      badgeText: '✨ New Year Gala',
      ctaText: 'Explore New Year Deals',
      ctaLink: '/'
    }
  },
  {
    id: 'CHRISTMAS',
    name: 'Christmas 🎄',
    badge: '🎄 Merry Christmas',
    bgTheme: 'CHRISTMAS_RED' as const,
    greeting: {
      title: 'Merry Christmas & Joyful Holidays! 🎄🎅',
      subtitle: 'May peace, warmth, and the spirit of holiday travel fill your heart and home this Christmas season.',
      ctaText: 'Holiday Travel',
      ctaLink: '/'
    },
    promo: {
      title: 'Christmas Winter Wonderland Sale! 🎄❄️',
      subtitle: 'Experience snowy mountains or sunny beaches. Unwrap special festive discounts on all flight bookings.',
      promoCode: 'XMAS2026',
      discountText: 'FLAT ₹1,500 OFF',
      badgeText: '🎁 Santa Deal',
      ctaText: 'Claim Christmas Offer',
      ctaLink: '/'
    }
  },
  {
    id: 'EID',
    name: 'Eid Mubarak 🌙',
    badge: '🌙 Eid Mubarak',
    bgTheme: 'EID_EMERALD' as const,
    greeting: {
      title: 'Eid Mubarak! Wishing You Peace & Harmony 🌙✨',
      subtitle: 'May the blessings of Eid illuminate your life with happiness, prosperity, and joyous family reunions.',
      ctaText: 'Visit Loved Ones',
      ctaLink: '/'
    },
    promo: {
      title: 'Eid Festive Reunion Fares! 🌙✈️',
      subtitle: 'Exclusive holiday fares for you and your family. Book tickets with zero hassle and maximum comfort.',
      promoCode: 'EIDMUBARAK',
      discountText: 'EXTRA 10% OFF',
      badgeText: '🌙 Eid Special',
      ctaText: 'Book Eid Flights',
      ctaLink: '/'
    }
  },
  {
    id: 'INDEPENDENCE_DAY',
    name: 'Freedom / Azaadi 🇮🇳',
    badge: '🇮🇳 Jai Hind',
    bgTheme: 'TRICOLOR_INDIA' as const,
    greeting: {
      title: 'Happy Independence Day! Incredible India 🇮🇳✈️',
      subtitle: 'Proudly soaring across the skies of our beautiful nation. Discover heritage, wonder, and diversity.',
      ctaText: 'Explore India',
      ctaLink: '/'
    },
    promo: {
      title: 'Azaadi Flight Freedom Sale! 🇮🇳✈️',
      subtitle: 'Zero convenience fees and special discounted airfares across 50+ Indian cities and destinations.',
      promoCode: 'AZAADI26',
      discountText: 'ZERO CONVENIENCE FEE',
      badgeText: '🇮🇳 Freedom Offer',
      ctaText: 'Book Now',
      ctaLink: '/'
    }
  }
];

const THEME_GRADIENTS: Record<string, string> = {
  DIWALI_GOLD: 'from-[#6b1408] via-[#a14008] to-[#d97706]',
  HOLI_COLORS: 'from-[#b5179e] via-[#7209b7] to-[#4361ee]',
  NEW_YEAR_MIDNIGHT: 'from-[#0b0f19] via-[#1a1442] to-[#312e81]',
  CHRISTMAS_RED: 'from-[#881337] via-[#991b1b] to-[#14532d]',
  EID_EMERALD: 'from-[#064e3b] via-[#047857] to-[#b45309]',
  TRICOLOR_INDIA: 'from-[#c2410c] via-[#1e293b] to-[#15803d]',
  ROYAL_PURPLE: 'from-[#3b0764] via-[#581c87] to-[#9333ea]',
  SUNSET_ORANGE: 'from-[#c2410c] via-[#db2777] to-[#e11d48]',
  CUSTOM: 'from-blue-900 to-indigo-900'
};

const THEME_LABELS: Record<string, string> = {
  DIWALI_GOLD: '🪔 Diwali Golden Glow',
  HOLI_COLORS: '🎨 Holi Color Burst',
  NEW_YEAR_MIDNIGHT: '🎆 New Year Midnight Sky',
  CHRISTMAS_RED: '🎄 Christmas Holly Red',
  EID_EMERALD: '🌙 Eid Emerald Crescent',
  TRICOLOR_INDIA: '🇮🇳 Tricolor Spirit',
  ROYAL_PURPLE: '👑 Royal Purple Velvet',
  SUNSET_ORANGE: '🌅 Sunset Coral Splash',
  CUSTOM: '🎨 Custom Gradient'
};

export default function AdminFestiveBanners() {
  const [banners, setBanners] = useState<FestiveBannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'ACTIVE' | 'GREETING' | 'PROMOTIONAL'>('ALL');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const initialFormState = {
    title: 'Happy Diwali! Wishing You Light & Prosperity 🪔✨',
    subtitle: 'May your journeys be as luminous and joyful as the festival of lights. Celebrate together with loved ones wherever they are.',
    bannerType: 'GREETING' as 'GREETING' | 'PROMOTIONAL',
    festival: 'DIWALI' as FestiveBannerItem['festival'],
    badgeText: '🪔 Shubh Deepawali',
    promoCode: '',
    discountText: '',
    ctaText: 'Explore Flights',
    ctaLink: '/',
    imageUrl: '',
    bgTheme: 'DIWALI_GOLD' as FestiveBannerItem['bgTheme'],
    customBgGradient: '',
    isActive: true,
    showTopStrip: true,
    startDate: '',
    endDate: '',
    priority: 1
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fetch Banners
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/festive-banners');
      setBanners(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load festive banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Quick Preset Apply
  const applyPreset = (presetId: string, mode: 'GREETING' | 'PROMOTIONAL') => {
    const preset = FESTIVAL_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    if (mode === 'GREETING') {
      setFormData(prev => ({
        ...prev,
        festival: preset.id as any,
        bgTheme: preset.bgTheme,
        bannerType: 'GREETING',
        badgeText: preset.badge,
        title: preset.greeting.title,
        subtitle: preset.greeting.subtitle,
        ctaText: preset.greeting.ctaText,
        ctaLink: preset.greeting.ctaLink,
        promoCode: '',
        discountText: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        festival: preset.id as any,
        bgTheme: preset.bgTheme,
        bannerType: 'PROMOTIONAL',
        badgeText: preset.promo.badgeText,
        title: preset.promo.title,
        subtitle: preset.promo.subtitle,
        promoCode: preset.promo.promoCode,
        discountText: preset.promo.discountText,
        ctaText: preset.promo.ctaText,
        ctaLink: preset.promo.ctaLink
      }));
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingBannerId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (banner: FestiveBannerItem) => {
    setEditingBannerId(banner._id);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      bannerType: banner.bannerType || 'GREETING',
      festival: banner.festival || 'DIWALI',
      badgeText: banner.badgeText || '',
      promoCode: banner.promoCode || '',
      discountText: banner.discountText || '',
      ctaText: banner.ctaText || 'Explore Flights',
      ctaLink: banner.ctaLink || '/',
      imageUrl: banner.imageUrl || '',
      bgTheme: banner.bgTheme || 'DIWALI_GOLD',
      customBgGradient: banner.customBgGradient || '',
      isActive: banner.isActive,
      showTopStrip: banner.showTopStrip,
      startDate: banner.startDate ? banner.startDate.substring(0, 10) : '',
      endDate: banner.endDate ? banner.endDate.substring(0, 10) : '',
      priority: banner.priority || 1
    });
    setIsModalOpen(true);
  };

  // Toggle Active
  const handleToggleStatus = async (bannerId: string) => {
    try {
      const res = await api.patch(`/api/festive-banners/${bannerId}/toggle`);
      setBanners(prev => prev.map(b => (b._id === bannerId ? res.data : b)));
      toast.success(res.data.isActive ? 'Banner is now LIVE on website!' : 'Banner deactivated');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to toggle banner status');
    }
  };

  // Save Banner (Create or Update)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subtitle.trim()) {
      toast.error('Title and Greeting/Subtitle text are required');
      return;
    }

    try {
      if (editingBannerId) {
        const res = await api.put(`/api/festive-banners/${editingBannerId}`, formData);
        setBanners(prev => prev.map(b => (b._id === editingBannerId ? res.data : b)));
        toast.success('Festive banner updated successfully!');
      } else {
        const res = await api.post('/api/festive-banners', formData);
        setBanners(prev => [res.data, ...prev]);
        toast.success('Festive banner created & live!');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save festive banner');
    }
  };

  // Delete Banner
  const handleDeleteBanner = async (bannerId: string) => {
    try {
      await api.delete(`/api/festive-banners/${bannerId}`);
      setBanners(prev => prev.filter(b => b._id !== bannerId));
      setDeleteConfirmId(null);
      toast.success('Festive banner removed');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete festive banner');
    }
  };

  // Filtered list
  const filteredBanners = banners.filter(b => {
    if (filterType === 'ACTIVE') return b.isActive;
    if (filterType === 'GREETING') return b.bannerType === 'GREETING';
    if (filterType === 'PROMOTIONAL') return b.bannerType === 'PROMOTIONAL';
    return true;
  });

  const activeCount = banners.filter(b => b.isActive).length;
  const greetingCount = banners.filter(b => b.bannerType === 'GREETING').length;
  const promoCount = banners.filter(b => b.bannerType === 'PROMOTIONAL').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-rose-500/10 p-6 rounded-2xl border border-amber-200/60 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles size={16} className="text-amber-500 animate-pulse" />
            <span>Seasonal & Festive Marketing Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
            Festive Banners & Wishes 🪔✨
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Publish warm holiday greetings (e.g. Diwali wishes) or promotional travel offers on the homepage with 1-click active controls and top ribbons.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 shrink-0"
        >
          <Plus size={18} />
          Create Festive Banner
        </button>
      </div>

      {/* Stats & Quick Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => setFilterType('ALL')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterType === 'ALL' 
              ? 'bg-amber-50/80 border-amber-300 shadow-sm' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="text-xs font-bold text-gray-500 uppercase">Total Banners</span>
          <div className="text-2xl font-black text-gray-900 mt-1">{banners.length}</div>
        </div>

        <div 
          onClick={() => setFilterType('ACTIVE')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterType === 'ACTIVE' 
              ? 'bg-emerald-50/80 border-emerald-300 shadow-sm' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase">Live on Site</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{activeCount}</div>
        </div>

        <div 
          onClick={() => setFilterType('GREETING')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterType === 'GREETING' 
              ? 'bg-rose-50/80 border-rose-300 shadow-sm' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="text-xs font-bold text-rose-700 uppercase">Warm Wishes 💖</span>
          <div className="text-2xl font-black text-rose-700 mt-1">{greetingCount}</div>
        </div>

        <div 
          onClick={() => setFilterType('PROMOTIONAL')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterType === 'PROMOTIONAL' 
              ? 'bg-blue-50/80 border-blue-300 shadow-sm' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="text-xs font-bold text-blue-700 uppercase">Sale Offers 🏷️</span>
          <div className="text-2xl font-black text-blue-700 mt-1">{promoCount}</div>
        </div>
      </div>

      {/* Banner Cards Grid */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 shadow-xs">
          <Sparkles className="animate-spin text-amber-500 mx-auto mb-3" size={32} />
          <p className="text-gray-500 font-medium">Loading festive banners...</p>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Festive Banners Found</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-5">
            Create a Diwali greeting, Holi celebration, or a new year travel promotion to brighten your users' booking experience.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-xs"
          >
            <Plus size={16} /> Create Your First Festive Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBanners.map((banner) => {
            const gradient = THEME_GRADIENTS[banner.bgTheme] || THEME_GRADIENTS.DIWALI_GOLD;
            return (
              <div 
                key={banner._id} 
                className={`rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md ${
                  banner.isActive ? 'border-amber-300 bg-white ring-2 ring-amber-400/20' : 'border-gray-200 bg-gray-50/50 opacity-80'
                }`}
              >
                {/* Visual Banner Preview Card */}
                <div className={`p-6 bg-gradient-to-r ${gradient} text-white relative overflow-hidden`}>
                  {/* Background Accents */}
                  <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                  <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-amber-400/20 rounded-full blur-xl pointer-events-none"></div>

                  {/* Badges Bar */}
                  <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/30">
                        {banner.badgeText || banner.festival}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        banner.bannerType === 'GREETING' ? 'bg-rose-500/80 text-white' : 'bg-emerald-500/80 text-white'
                      }`}>
                        {banner.bannerType === 'GREETING' ? '💖 Wishes / Greetings' : '🏷️ Sale Offer'}
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                      banner.isActive ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30' : 'bg-gray-800/40 text-gray-300'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${banner.isActive ? 'bg-emerald-300 animate-pulse' : 'bg-gray-400'}`}></span>
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="relative z-10">
                    <h3 className="text-xl font-black text-white leading-tight mb-2 drop-shadow-xs">
                      {banner.title}
                    </h3>
                    <p className="text-xs text-white/90 line-clamp-2 leading-relaxed">
                      {banner.subtitle}
                    </p>
                  </div>

                  {/* Promotional Offer Callout if Promo */}
                  {banner.bannerType === 'PROMOTIONAL' && (banner.promoCode || banner.discountText) && (
                    <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between gap-2 relative z-10">
                      {banner.discountText && (
                        <span className="text-xs font-black tracking-wider text-amber-200 bg-amber-900/40 px-2 py-0.5 rounded">
                          {banner.discountText}
                        </span>
                      )}
                      {banner.promoCode && (
                        <span className="font-mono text-xs font-black px-2.5 py-1 rounded bg-white text-gray-900 shadow-xs flex items-center gap-1">
                          CODE: {banner.promoCode}
                        </span>
                      )}
                    </div>
                  )}

                  {/* CTA & Strip info */}
                  <div className="mt-4 flex items-center justify-between text-xs text-white/80 relative z-10">
                    <span className="font-bold underline underline-offset-2 flex items-center gap-1">
                      {banner.ctaText || 'Explore'} <ArrowRight size={12} />
                    </span>
                    {banner.showTopStrip && (
                      <span className="text-[11px] bg-black/30 px-2 py-0.5 rounded-full">
                        ✨ Top Ribbon Enabled
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Controls & Details */}
                <div className="p-4 bg-white flex items-center justify-between gap-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(banner._id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        banner.isActive 
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {banner.isActive ? <ToggleRight size={18} className="text-emerald-600" /> : <ToggleLeft size={18} />}
                      {banner.isActive ? 'Active on Site' : 'Disabled'}
                    </button>
                    <span className="text-[11px] text-gray-400 font-medium">
                      Theme: {THEME_LABELS[banner.bgTheme]?.split(' ')[1] || banner.bgTheme}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(banner)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Banner"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(banner._id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Banner"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-20">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">
                    {editingBannerId ? 'Edit Festive Banner' : 'Create Festive Banner'}
                  </h2>
                  <p className="text-xs text-gray-500">Configure festive greetings, sales copy, themes & top ribbons</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
              {/* Step 1: 1-Click Festive Presets */}
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-600" />
                    Quick Festive Presets (1-Click Auto-Fill)
                  </span>
                  <span className="text-[11px] text-amber-700 font-medium">Click any festival to auto-load</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {FESTIVAL_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset.id, formData.bannerType)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                        formData.festival === preset.id
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-gray-700 border-amber-200 hover:bg-amber-100/60'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Banner Type (Greeting vs Promotional) */}
              <div>
                <label className="block text-xs font-black uppercase text-gray-600 mb-2">
                  Choose Banner Purpose
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => {
                      setFormData(prev => ({ ...prev, bannerType: 'GREETING' }));
                      applyPreset(formData.festival, 'GREETING');
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      formData.bannerType === 'GREETING'
                        ? 'border-rose-500 bg-rose-50/50 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${formData.bannerType === 'GREETING' ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Heart size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-gray-900">Festive Wishes & Greetings (शुभकामनाएं)</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Heartfelt wishes for Diwali, Holi, New Year, etc. Pure festive greeting without requiring promo codes.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setFormData(prev => ({ ...prev, bannerType: 'PROMOTIONAL' }));
                      applyPreset(formData.festival, 'PROMOTIONAL');
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      formData.bannerType === 'PROMOTIONAL'
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${formData.bannerType === 'PROMOTIONAL' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Gift size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-gray-900">Festive Sale & Offer (ऑफर व सेल)</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Promote holiday flight sales with coupon codes, discount badges, and instant copy buttons.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Title & Subtitle */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Banner Title / Headline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Happy Diwali! Wishing You Light & Prosperity 🪔✨"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Greeting Message / Subtitle <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. May your journeys be as luminous and joyful as the festival of lights..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Step 4: Promotional Details (Shown only if PROMOTIONAL) */}
              {formData.bannerType === 'PROMOTIONAL' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-200">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Promo Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.promoCode}
                      onChange={(e) => setFormData({ ...formData, promoCode: e.target.value.toUpperCase() })}
                      placeholder="e.g. DIWALI2026"
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 text-sm font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Discount Callout (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.discountText}
                      onChange={(e) => setFormData({ ...formData, discountText: e.target.value })}
                      placeholder="e.g. FLAT 15% OFF or UP TO ₹2,000"
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Badge, CTA & Theme */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    value={formData.badgeText}
                    onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                    placeholder="e.g. 🪔 Shubh Deepawali"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Call To Action Text
                  </label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    placeholder="e.g. Explore Flights"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    CTA Link
                  </label>
                  <input
                    type="text"
                    value={formData.ctaLink}
                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                    placeholder="e.g. / or /dashboard/search"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Step 6: Color Theme */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Background Color Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {Object.entries(THEME_LABELS).filter(([k]) => k !== 'CUSTOM').map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({ ...formData, bgTheme: key as any })}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        formData.bgTheme === key 
                          ? 'border-amber-500 ring-2 ring-amber-400/30 bg-amber-50/40' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full shrink-0 bg-gradient-to-r ${THEME_GRADIENTS[key]}`}></div>
                      <span className="text-xs font-bold text-gray-800 truncate">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 7: Live Real-Time Preview */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase text-gray-500 flex items-center gap-1.5">
                    <Eye size={14} /> Live Real-Time Preview
                  </span>
                  <span className="text-[11px] text-gray-400">Exact appearance on homepage</span>
                </div>

                {/* Top strip preview */}
                {formData.showTopStrip && (
                  <div className={`mb-3 py-2 px-4 rounded-xl bg-gradient-to-r ${THEME_GRADIENTS[formData.bgTheme]} text-white text-xs font-medium flex items-center justify-between shadow-xs`}>
                    <div className="flex items-center gap-2 truncate">
                      <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {formData.badgeText || 'Festive'}
                      </span>
                      <span className="font-bold truncate">{formData.title}</span>
                    </div>
                    <span className="underline shrink-0 text-[11px] font-bold">
                      {formData.ctaText} →
                    </span>
                  </div>
                )}

                {/* Hero Showcase Card Preview */}
                <div className={`p-6 rounded-2xl bg-gradient-to-r ${THEME_GRADIENTS[formData.bgTheme]} text-white shadow-lg relative overflow-hidden`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-3 py-0.5 rounded-full text-xs font-black bg-white/20 backdrop-blur-md border border-white/30">
                      {formData.badgeText || 'Festive'}
                    </span>
                    {formData.bannerType === 'PROMOTIONAL' && formData.promoCode && (
                      <span className="bg-white text-gray-900 font-mono text-xs font-black px-2.5 py-1 rounded shadow-xs flex items-center gap-1">
                        <Tag size={12} /> {formData.promoCode}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-black mb-1 drop-shadow-xs">{formData.title}</h3>
                  <p className="text-xs text-white/90 leading-relaxed mb-4">{formData.subtitle}</p>

                  <div className="flex items-center justify-between">
                    {formData.discountText ? (
                      <span className="text-xs font-black bg-amber-400 text-gray-900 px-2 py-0.5 rounded font-mono">
                        {formData.discountText}
                      </span>
                    ) : <span></span>}

                    <div className="px-4 py-1.5 rounded-full bg-white text-gray-900 font-black text-xs shadow-md">
                      {formData.ctaText} →
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 8: Status & Options */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                  />
                  <span className="text-sm font-bold text-gray-800">Publish & Make Active Now</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.showTopStrip}
                    onChange={(e) => setFormData({ ...formData, showTopStrip: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                  />
                  <span className="text-sm font-bold text-gray-800">Show Top Announcement Ribbon</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm shadow-md transition-all"
                >
                  {editingBannerId ? 'Update Banner' : 'Create & Publish Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-gray-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">Delete Festive Banner?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to remove this festive banner? It will no longer appear on the website.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteBanner(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
