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
  HeartHandshake, 
  Gift, 
  Check, 
  CheckCircle2,
  X, 
  ArrowRight, 
  Flame,
  Palette,
  PartyPopper,
  Moon,
  Flag,
  Percent,
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
    name: 'Diwali',
    icon: Flame,
    badge: 'Festival of Lights',
    bgTheme: 'DIWALI_GOLD' as const,
    greeting: {
      title: 'Happy Diwali — Wishing You Light, Warmth & Prosperity',
      subtitle: 'May your journeys be as luminous and joyful as the festival of lights. Celebrate together with loved ones wherever they are.',
      ctaText: 'Explore Festive Flights',
      ctaLink: '/'
    },
    promo: {
      title: 'Diwali Festive Airfare Special',
      subtitle: 'Celebrate the festival of lights back home. Enjoy special holiday savings on premium domestic and international routes.',
      promoCode: 'DIWALI2026',
      discountText: 'FLAT 15% OFF',
      badgeText: 'Diwali Special',
      ctaText: 'Book Festive Flights',
      ctaLink: '/'
    }
  },
  {
    id: 'HOLI',
    name: 'Holi',
    icon: Palette,
    badge: 'Spring Festival',
    bgTheme: 'HOLI_COLORS' as const,
    greeting: {
      title: 'Happy Holi — Welcoming Colors, Joy & Togetherness',
      subtitle: 'Wishing you a spirited festival filled with laughter, vibrant colors, and memorable journeys home to your loved ones.',
      ctaText: 'Fly Home This Spring',
      ctaLink: '/'
    },
    promo: {
      title: 'Spring Colors Holiday Airfare Sale',
      subtitle: 'Exclusive seasonal airfares to popular holiday getaways and home sectors. Fly in comfort for less.',
      promoCode: 'SPRINGFEST',
      discountText: 'UP TO ₹2,000 OFF',
      badgeText: 'Spring Special',
      ctaText: 'View Holiday Fares',
      ctaLink: '/'
    }
  },
  {
    id: 'NEW_YEAR',
    name: 'New Year',
    icon: PartyPopper,
    badge: 'Welcome 2026',
    bgTheme: 'NEW_YEAR_MIDNIGHT' as const,
    greeting: {
      title: 'Happy New Year — Fresh Horizons & Grand Adventures',
      subtitle: 'Here is to remarkable destinations, peaceful travels, and unforgettable memories across the skies in 2026.',
      ctaText: 'Plan 2026 Travel',
      ctaLink: '/'
    },
    promo: {
      title: 'New Year Global Travel Sale',
      subtitle: 'Kickstart the year with extraordinary journeys. Unbeatable promotional fares across premier worldwide routes.',
      promoCode: 'NEWYEAR26',
      discountText: 'SAVE UP TO 20%',
      badgeText: 'New Year Deal',
      ctaText: 'Explore New Year Deals',
      ctaLink: '/'
    }
  },
  {
    id: 'CHRISTMAS',
    name: 'Christmas',
    icon: Gift,
    badge: 'Merry Christmas',
    bgTheme: 'CHRISTMAS_RED' as const,
    greeting: {
      title: 'Merry Christmas & Joyful Winter Holidays',
      subtitle: 'May peace, warmth, and the spirit of holiday reunions fill your heart and home this Christmas season.',
      ctaText: 'Holiday Travel',
      ctaLink: '/'
    },
    promo: {
      title: 'Winter Wonderland Holiday Fares',
      subtitle: 'Experience snow-capped peaks or warm coastal retreats. Unwrap limited-edition seasonal fares on all flight bookings.',
      promoCode: 'WINTER26',
      discountText: 'FLAT ₹1,500 OFF',
      badgeText: 'Holiday Deal',
      ctaText: 'Claim Holiday Offer',
      ctaLink: '/'
    }
  },
  {
    id: 'EID',
    name: 'Eid Mubarak',
    icon: Moon,
    badge: 'Eid Mubarak',
    bgTheme: 'EID_EMERALD' as const,
    greeting: {
      title: 'Eid Mubarak — Wishing You Peace, Blessings & Harmony',
      subtitle: 'May this blessed occasion bring boundless happiness, health, and joyous family reunions to you and your loved ones.',
      ctaText: 'Visit Loved Ones',
      ctaLink: '/'
    },
    promo: {
      title: 'Eid Celebration Travel Specials',
      subtitle: 'Special family reunion fares on select domestic and international routes. Reserve your flights with flexibility and ease.',
      promoCode: 'EID2026',
      discountText: 'EXTRA 10% OFF',
      badgeText: 'Eid Offer',
      ctaText: 'Book Family Flights',
      ctaLink: '/'
    }
  },
  {
    id: 'INDEPENDENCE_DAY',
    name: 'National Holiday',
    icon: Flag,
    badge: 'National Day Special',
    bgTheme: 'TRICOLOR_INDIA' as const,
    greeting: {
      title: 'Celebrating the Spirit of Freedom & Exploration',
      subtitle: 'Proudly soaring across the skies of incredible destinations. Discover heritage, wonder, and diversity.',
      ctaText: 'Explore Destinations',
      ctaLink: '/'
    },
    promo: {
      title: 'Freedom Travel Celebration Sale',
      subtitle: 'Zero convenience fees and special discounted airfares across 50+ key airports and holiday sectors.',
      promoCode: 'FREEDOM26',
      discountText: 'ZERO CONVENIENCE FEE',
      badgeText: 'Special Airfare',
      ctaText: 'Book Now',
      ctaLink: '/'
    }
  }
];

const THEME_GRADIENTS: Record<string, string> = {
  DIWALI_GOLD: 'from-[#420b05] via-[#7c2d03] to-[#b45309]',
  HOLI_COLORS: 'from-[#831843] via-[#581c87] to-[#1e40af]',
  NEW_YEAR_MIDNIGHT: 'from-[#030712] via-[#0f172a] to-[#312e81]',
  CHRISTMAS_RED: 'from-[#7f1d1d] via-[#881337] to-[#14532d]',
  EID_EMERALD: 'from-[#064e3b] via-[#047857] to-[#854d0e]',
  TRICOLOR_INDIA: 'from-[#9a3412] via-[#0f172a] to-[#15803d]',
  ROYAL_PURPLE: 'from-[#3b0764] via-[#581c87] to-[#701a75]',
  SUNSET_ORANGE: 'from-[#9a3412] via-[#be123c] to-[#831843]',
  CUSTOM: 'from-[#0f172a] to-[#1e293b]'
};

const THEME_LABELS: Record<string, string> = {
  DIWALI_GOLD: 'Imperial Amber & Gold',
  HOLI_COLORS: 'Vibrant Magenta & Violet',
  NEW_YEAR_MIDNIGHT: 'Midnight Sapphire & Navy',
  CHRISTMAS_RED: 'Heritage Crimson & Forest',
  EID_EMERALD: 'Emerald & Warm Gold',
  TRICOLOR_INDIA: 'National Saffron & Slate',
  ROYAL_PURPLE: 'Royal Velvet Plum',
  SUNSET_ORANGE: 'Sunset Coral & Berry',
  CUSTOM: 'Executive Neutral Slate'
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
    title: 'Happy Diwali — Wishing You Light, Warmth & Prosperity',
    subtitle: 'May your journeys be as luminous and joyful as the festival of lights. Celebrate together with loved ones wherever they are.',
    bannerType: 'GREETING' as 'GREETING' | 'PROMOTIONAL',
    festival: 'DIWALI' as FestiveBannerItem['festival'],
    badgeText: 'Festival of Lights',
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
      toast.success(res.data.isActive ? 'Banner published to live website' : 'Banner deactivated');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to toggle banner status');
    }
  };

  // Save Banner (Create or Update)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subtitle.trim()) {
      toast.error('Title and message text are required');
      return;
    }

    try {
      if (editingBannerId) {
        const res = await api.put(`/api/festive-banners/${editingBannerId}`, formData);
        setBanners(prev => prev.map(b => (b._id === editingBannerId ? res.data : b)));
        toast.success('Festive banner updated successfully');
      } else {
        const res = await api.post('/api/festive-banners', formData);
        setBanners(prev => [res.data, ...prev]);
        toast.success('Festive banner created and live');
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs tracking-wider uppercase mb-1.5">
            <Sparkles size={14} className="text-amber-500" />
            <span>Seasonal & Festive Campaign Manager</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Festive Banners & Campaigns
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Manage holiday wishes, celebratory brand greetings, and promotional flight sales across the website with instant live toggle controls.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Plus size={16} />
          Create Festive Banner
        </button>
      </div>

      {/* Stats & Filter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => setFilterType('ALL')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterType === 'ALL' 
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className={`text-[11px] font-bold uppercase tracking-wider ${filterType === 'ALL' ? 'text-slate-300' : 'text-slate-400'}`}>
            Total Banners
          </span>
          <div className="text-2xl font-black mt-1">{banners.length}</div>
        </div>

        <div 
          onClick={() => setFilterType('ACTIVE')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterType === 'ACTIVE' 
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${filterType === 'ACTIVE' ? 'text-emerald-100' : 'text-emerald-700'}`}>
              Live on Site
            </span>
            <span className={`w-2 h-2 rounded-full ${filterType === 'ACTIVE' ? 'bg-white animate-pulse' : 'bg-emerald-500 animate-ping'}`}></span>
          </div>
          <div className="text-2xl font-black mt-1">{activeCount}</div>
        </div>

        <div 
          onClick={() => setFilterType('GREETING')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterType === 'GREETING' 
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className={`text-[11px] font-bold uppercase tracking-wider ${filterType === 'GREETING' ? 'text-indigo-100' : 'text-slate-500'}`}>
            Celebratory Greetings
          </span>
          <div className="text-2xl font-black mt-1">{greetingCount}</div>
        </div>

        <div 
          onClick={() => setFilterType('PROMOTIONAL')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterType === 'PROMOTIONAL' 
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className={`text-[11px] font-bold uppercase tracking-wider ${filterType === 'PROMOTIONAL' ? 'text-amber-100' : 'text-slate-500'}`}>
            Promotional Sales
          </span>
          <div className="text-2xl font-black mt-1">{promoCount}</div>
        </div>
      </div>

      {/* Grid of Banners */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <Sparkles className="animate-spin text-slate-400 mx-auto mb-3" size={28} />
          <p className="text-slate-500 text-sm font-medium">Loading festive campaigns...</p>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-200">
            <Sparkles size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No Seasonal Banners Configured</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
            Create an inspiring holiday greeting or a promotional flight sale banner to celebrate seasonal occasions with travellers.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs"
          >
            <Plus size={14} /> Create New Campaign
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
                  banner.isActive ? 'border-slate-300 bg-white ring-1 ring-slate-900/5' : 'border-slate-200 bg-slate-50/60 opacity-80'
                }`}
              >
                {/* Visual Banner Preview Card */}
                <div className={`p-6 sm:p-7 bg-gradient-to-r ${gradient} text-white relative overflow-hidden`}>
                  {/* Subtle Background Glow */}
                  <div className="absolute -top-12 -right-12 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                  <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

                  {/* Badges Bar */}
                  <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-white/15 backdrop-blur-md text-white border border-white/20">
                        {banner.badgeText || banner.festival}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-black/30 backdrop-blur-md text-white/90">
                        {banner.bannerType === 'GREETING' ? 'Greetings' : 'Promotion'}
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 ${
                      banner.isActive ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30' : 'bg-slate-800/40 text-slate-300'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${banner.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
                      {banner.isActive ? 'Active' : 'Draft'}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="relative z-10">
                    <h3 className="text-lg sm:text-xl font-bold text-white leading-snug mb-2">
                      {banner.title}
                    </h3>
                    <p className="text-xs text-white/80 line-clamp-2 leading-relaxed font-normal">
                      {banner.subtitle}
                    </p>
                  </div>

                  {/* Promotional Offer Callout if Promo */}
                  {banner.bannerType === 'PROMOTIONAL' && (banner.promoCode || banner.discountText) && (
                    <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between gap-2 relative z-10">
                      {banner.discountText && (
                        <span className="text-[11px] font-bold tracking-wider text-amber-200 bg-black/30 px-2 py-0.5 rounded">
                          {banner.discountText}
                        </span>
                      )}
                      {banner.promoCode && (
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-white text-slate-900 shadow-xs flex items-center gap-1">
                          CODE: {banner.promoCode}
                        </span>
                      )}
                    </div>
                  )}

                  {/* CTA info */}
                  <div className="mt-4 flex items-center justify-between text-xs text-white/80 relative z-10">
                    <span className="font-semibold underline underline-offset-4 flex items-center gap-1 text-[11px]">
                      {banner.ctaText || 'Explore'} <ArrowRight size={11} />
                    </span>
                  </div>
                </div>

                {/* Card Controls & Details */}
                <div className="p-4 bg-white flex items-center justify-between gap-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(banner._id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        banner.isActive 
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {banner.isActive ? <ToggleRight size={18} className="text-emerald-600" /> : <ToggleLeft size={18} />}
                      {banner.isActive ? 'Live' : 'Deactivated'}
                    </button>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {THEME_LABELS[banner.bgTheme] || banner.bgTheme}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(banner)}
                      className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit Banner"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(banner._id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Banner"
                    >
                      <Trash2 size={15} />
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div 
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-20">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingBannerId ? 'Edit Festive Banner' : 'Create Festive Banner'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure holiday wishes, promotional campaigns, theme palettes, and announcement ribbons.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
              
              {/* Presets Row */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Quick Festival Templates
                  </span>
                  <span className="text-[11px] text-slate-400">Click any preset to auto-fill</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {FESTIVAL_PRESETS.map((preset) => {
                    const IconComponent = preset.icon;
                    const isSelected = formData.festival === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyPreset(preset.id, formData.bannerType)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50/80 text-slate-700 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <IconComponent size={13} className={isSelected ? 'text-amber-300' : 'text-slate-400'} />
                        <span>{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Banner Purpose Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Campaign Purpose
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => {
                      setFormData(prev => ({ ...prev, bannerType: 'GREETING' }));
                      applyPreset(formData.festival, 'GREETING');
                    }}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      formData.bannerType === 'GREETING'
                        ? 'border-slate-900 bg-slate-50/80 shadow-xs ring-1 ring-slate-900/10'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg shrink-0 ${formData.bannerType === 'GREETING' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <HeartHandshake size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-slate-900">Celebratory Greetings & Wishes</h4>
                        {formData.bannerType === 'GREETING' && (
                          <CheckCircle2 size={14} className="text-emerald-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Publish heartfelt holiday greetings and goodwill messages to travellers without mandatory discount codes.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setFormData(prev => ({ ...prev, bannerType: 'PROMOTIONAL' }));
                      applyPreset(formData.festival, 'PROMOTIONAL');
                    }}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      formData.bannerType === 'PROMOTIONAL'
                        ? 'border-slate-900 bg-slate-50/80 shadow-xs ring-1 ring-slate-900/10'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg shrink-0 ${formData.bannerType === 'PROMOTIONAL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Percent size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-slate-900">Promotional Campaign & Deals</h4>
                        {formData.bannerType === 'PROMOTIONAL' && (
                          <CheckCircle2 size={14} className="text-emerald-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Launch festive airfare sales with coupon vouchers, discount tags, and instant-copy codes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Banner Headline <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Happy Diwali — Wishing You Light, Warmth & Prosperity"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Greeting Message & Details <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. May your journeys be as luminous and joyful as the festival of lights..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all leading-relaxed"
                  />
                </div>
              </div>

              {/* Promotional Details (If PROMOTIONAL) */}
              {formData.bannerType === 'PROMOTIONAL' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Promo Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.promoCode}
                      onChange={(e) => setFormData({ ...formData, promoCode: e.target.value.toUpperCase() })}
                      placeholder="e.g. DIWALI2026"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono text-xs uppercase focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Discount Callout (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.discountText}
                      onChange={(e) => setFormData({ ...formData, discountText: e.target.value })}
                      placeholder="e.g. FLAT 15% OFF or UP TO ₹2,000"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Badges & Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    value={formData.badgeText}
                    onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                    placeholder="e.g. Festival of Lights"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-xs focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Call To Action Label
                  </label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    placeholder="e.g. Explore Flights"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-xs focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    CTA Target Link
                  </label>
                  <input
                    type="text"
                    value={formData.ctaLink}
                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                    placeholder="e.g. / or /flights/search"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-xs focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Theme Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Color Palette & Gradient Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(THEME_LABELS).filter(([k]) => k !== 'CUSTOM').map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({ ...formData, bgTheme: key as any })}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        formData.bgTheme === key 
                          ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900/10' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full shrink-0 bg-gradient-to-r ${THEME_GRADIENTS[key]}`}></div>
                      <span className="text-xs font-semibold text-slate-800 truncate">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Real-Time Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye size={13} /> Live Preview on Homepage
                  </span>
                  <span className="text-[11px] text-slate-400">Reflects real-time changes</span>
                </div>

                {/* Hero Showcase Card Preview */}
                <div className={`p-6 rounded-2xl bg-gradient-to-r ${THEME_GRADIENTS[formData.bgTheme]} text-white shadow-md relative overflow-hidden`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-white/20 backdrop-blur-md uppercase tracking-wider">
                      {formData.badgeText || 'Special'}
                    </span>
                    {formData.bannerType === 'PROMOTIONAL' && formData.promoCode && (
                      <span className="bg-white text-slate-900 font-mono text-xs font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                        <Tag size={11} /> {formData.promoCode}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold mb-1.5">{formData.title}</h3>
                  <p className="text-xs text-white/80 leading-relaxed mb-4 line-clamp-2">{formData.subtitle}</p>

                  <div className="flex items-center justify-between">
                    {formData.discountText ? (
                      <span className="text-xs font-bold text-amber-200 bg-black/30 px-2 py-0.5 rounded">
                        {formData.discountText}
                      </span>
                    ) : <span></span>}

                    <div className="px-3.5 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-xs">
                      {formData.ctaText} →
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-800">Publish to live site immediately</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
                >
                  {editingBannerId ? 'Save Changes' : 'Publish Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-slate-200">
            <div className="w-11 h-11 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Remove Festive Banner?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                This festive campaign will be permanently removed and will no longer appear on the website.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteBanner(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
              >
                Delete Banner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
