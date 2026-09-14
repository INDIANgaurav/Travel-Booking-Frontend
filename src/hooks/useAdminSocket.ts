import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/authSlice';

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
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser]);

  return { socket, activities };
};
