import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle, Info, AlertTriangle, AlertCircle, Clock, Trash2, Filter, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useConfirm } from '../../../context/ConfirmContext';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import Loader from '../../../components/common/Loader';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const navigate = useNavigate();
  const confirm = useConfirm();

  useEffect(() => {
    fetchNotifications();

    const handleNewNotification = (e: any) => {
      setNotifications(prev => [e.detail, ...prev]);
    };

    window.addEventListener('new_notification_received', handleNewNotification);
    
    return () => {
      window.removeEventListener('new_notification_received', handleNewNotification);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/admin/notifications');
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      toast.error('Could not load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id?: string) => {
    try {
      await api.post('/api/admin/notifications/read', { id });
      
      // Optimistically update UI
      if (id) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      } else {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Failed to mark as read', error);
      toast.error('Something went wrong');
    }
  };

  const clearNotifications = async () => {
    const isConfirmed = await confirm({
      title: 'Clear Notifications',
      message: 'Are you sure you want to delete these notifications? This action cannot be undone.',
      confirmText: 'Clear Notifications'
    });
    if (!isConfirmed) return;
    try {
      await api.delete(`/api/admin/notifications/clear?type=${activeFilter}`);
      toast.success('Notifications cleared');
      fetchNotifications();
    } catch (error) {
      console.error('Failed to clear notifications', error);
      toast.error('Failed to clear notifications');
    }
  };

  const deleteSingleNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const isConfirmed = await confirm({
      title: 'Delete Notification',
      message: 'Are you sure you want to delete this notification?',
      confirmText: 'Delete'
    });
    if (!isConfirmed) return;
    try {
      await api.delete(`/api/admin/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    setSelectedNotification(notification);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'AGENT_REGISTRATION':
        return <Info size={20} className="text-blue-500" />;
      case 'BOOKING_CANCELLED':
        return <AlertTriangle size={20} className="text-orange-500" />;
      case 'REFUND_PENDING':
        return <AlertCircle size={20} className="text-red-500" />;
      case 'SYSTEM':
      default:
        return <Bell size={20} className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filters = [
    { id: 'ALL', label: 'All' },
    { id: 'AGENT_REGISTRATION', label: 'Registrations' },
    { id: 'BOOKING_CANCELLED', label: 'Bookings' },
    { id: 'SYSTEM', label: 'System & Others' }
  ];

  const filteredNotifications = notifications.filter(n => 
    activeFilter === 'ALL' ? true : 
    activeFilter === 'SYSTEM' ? !['AGENT_REGISTRATION', 'BOOKING_CANCELLED'].includes(n.type) : 
    n.type === activeFilter
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Bell size={24} className="text-blue-600" /> Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            You have <span className="font-bold text-gray-900">{unreadCount}</span> unread notification{unreadCount !== 1 && 's'}
          </p>
        </div>
        <div className="flex gap-2">
          {filteredNotifications.length > 0 && (
            <button 
              onClick={clearNotifications} 
              className="text-sm font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} /> Clear {activeFilter === 'ALL' ? 'All' : 'Selected'}
            </button>
          )}
          {unreadCount > 0 && (
            <button 
              onClick={() => markAsRead()} 
              className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <CheckCircle size={16} /> Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto hidden-scrollbar pb-2">
        {filters.map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === filter.id 
                ? 'bg-gray-900 text-white shadow-sm' 
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {filter.id === 'ALL' && <Filter size={12} />}
            {filter.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => (
            <div 
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex gap-4 ${
                notification.isRead 
                  ? 'bg-white border-gray-100 hover:border-gray-200 opacity-70' 
                  : 'bg-blue-50/30 border-blue-100 hover:border-blue-300 shadow-sm'
              }`}
            >
              <div className="mt-1">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className={`text-sm ${notification.isRead ? 'font-bold text-gray-700' : 'font-black text-gray-900'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-xs text-gray-400 flex items-center gap-1 font-medium whitespace-nowrap">
                    <Clock size={12} />
                    {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${notification.isRead ? 'text-gray-500' : 'text-gray-700 font-medium'} line-clamp-2`}>
                  {notification.message}
                </p>
              </div>
              <div className="flex flex-col items-center justify-between">
                {!notification.isRead && (
                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full mb-2"></div>
                )}
                <button 
                  onClick={(e) => deleteSingleNotification(e, notification._id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-auto"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">All caught up!</h3>
            <p className="text-gray-500 text-sm mt-1">There are no notifications to show right now.</p>
          </div>
        )}
      </div>

      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white shadow-sm border border-gray-100 rounded-xl">
                  {getIcon(selectedNotification.type)}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 leading-tight">Notification Details</h2>
                  <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Clock size={12} />
                    {new Date(selectedNotification.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedNotification(null)}
                className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-black text-gray-900 mb-3">{selectedNotification.title}</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedNotification.message}</p>
            </div>
            
            <div className="p-6 pt-2 flex justify-end gap-3 bg-gray-50/30">
              <button 
                onClick={() => setSelectedNotification(null)}
                className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Close
              </button>
              {selectedNotification.link && (
                <button 
                  onClick={() => {
                    navigate(selectedNotification.link!);
                    setSelectedNotification(null);
                  }}
                  className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  View Details <ExternalLink size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
