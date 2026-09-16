import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/authSlice';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const defaultBaseUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
  ? `${window.location.protocol}//${window.location.hostname}:5000`
  : 'http://localhost:5000';

const SOCKET_URL = import.meta.env.VITE_API_URL || defaultBaseUrl;

export interface ActivityEvent {
  message: string;
  type: 'USER' | 'BOOKING' | 'WALLET';
  timestamp: Date | string;
}

export const useAdminSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const currentUser = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.roles?.includes('SUPER_ADMIN') || currentUser?.roles?.includes('SUB_ADMIN')) {
      api.get('/api/admin/notifications').then(res => {
        setUnreadCount(res.data.unreadCount || 0);
      }).catch(err => console.error(err));
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.roles?.includes('SUPER_ADMIN') && !currentUser?.roles?.includes('SUB_ADMIN')) {
      return;
    }

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('Connected to Admin Socket');
      newSocket.emit('join_admin_room');
    });

    newSocket.on('activity', (data: ActivityEvent) => {
      setActivities((prev) => [data, ...prev].slice(0, 50));
      
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-sm w-full bg-white shadow-xl rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden transition-all cursor-pointer border-l-4 ${
            data.type === 'USER' ? 'border-l-blue-500' : data.type === 'WALLET' ? 'border-l-green-500' : 'border-l-orange-500'
          }`}
          onClick={() => {
            toast.dismiss(t.id);
            if (data.type === 'USER') navigate('/admin/users');
          }}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5 text-2xl">
                {data.type === 'USER' ? '👋' : data.type === 'WALLET' ? '💰' : '✈️'}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-gray-800">
                  {data.message}
                </p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mt-1">
                  Click to view directory
                </p>
              </div>
            </div>
          </div>
        </div>
      ), { duration: 6000, position: 'top-right' });
    });

    newSocket.on('new_admin_notification', (notification: any) => {
      setUnreadCount(prev => prev + 1);
      
      // Dispatch an event so that AdminNotifications page can update its list in real-time
      window.dispatchEvent(new CustomEvent('new_notification_received', { detail: notification }));

      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-sm w-full bg-white shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black/5 overflow-hidden transition-all hover:scale-[1.02] cursor-pointer`}
          onClick={() => {
            toast.dismiss(t.id);
            if (notification.link) navigate(notification.link);
          }}
        >
          <div className="flex-1 w-0 p-3">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <span className="text-lg leading-none">🔔</span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-gray-900 leading-none mb-1">
                  {notification.title}
                </p>
                <p className="text-xs text-gray-500 font-medium line-clamp-2">
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toast.dismiss(t.id);
              }}
              className="w-full border border-transparent rounded-none rounded-r-xl px-3 flex items-center justify-center text-xs font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      ), { duration: 6000, position: 'top-right' });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser, navigate]);

  return { socket, activities, unreadCount, setUnreadCount };
};
