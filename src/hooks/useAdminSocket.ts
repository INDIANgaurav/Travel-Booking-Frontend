import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/authSlice';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface ActivityEvent {
  message: string;
  type: 'USER' | 'BOOKING' | 'WALLET';
  timestamp: Date | string;
}

export const useAdminSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const currentUser = useSelector(selectCurrentUser);
  const navigate = useNavigate();

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
      
      toast((t) => React.createElement('div', {
          className: "flex flex-col gap-1 cursor-pointer w-full",
          onClick: () => {
            toast.dismiss(t.id);
            if(data.type === 'USER') navigate('/admin/users');
          }
        }, 
        React.createElement('span', { className: "font-bold text-sm text-gray-800" }, data.message),
        React.createElement('span', { className: "text-[10px] text-gray-500 uppercase tracking-widest font-bold" }, "Click to view directory")
      ), {
        icon: data.type === 'USER' ? '👋' : data.type === 'WALLET' ? '💰' : '✈️',
        duration: 6000,
        style: {
          borderRadius: '12px',
          border: '1px solid #eee',
          padding: '12px 16px',
        }
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser, navigate]);

  return { socket, activities };
};
