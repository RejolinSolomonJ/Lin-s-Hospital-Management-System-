import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { SOCKET_URL } from '../config/api';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastEvent, setLastEvent] = useState(null);

    useEffect(() => {
        const socketInstance = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 15,
            reconnectionDelay: 1000
        });

        socketInstance.on('connect', () => {
            console.log('[REAL-TIME] Connected to Dental Hospital Real-Time Socket:', socketInstance.id);
            setIsConnected(true);
            if (user?.id) {
                socketInstance.emit('join_user_room', user.id);
            }
        });

        socketInstance.on('disconnect', () => {
            console.log('[REAL-TIME] Disconnected from Real-Time Socket');
            setIsConnected(false);
        });

        // Global real-time listeners with audio/toast alerts
        socketInstance.on('new_appointment', (data) => {
            setLastEvent({ type: 'new_appointment', data, timestamp: Date.now() });
            toast.success(data.message || 'New patient appointment scheduled in real-time!', {
                icon: '🦷',
                duration: 5000,
                style: {
                    borderRadius: '12px',
                    background: '#0f172a',
                    color: '#fff',
                    border: '1px solid #38bdf8'
                }
            });
        });

        socketInstance.on('appointment_status_updated', (data) => {
            setLastEvent({ type: 'appointment_status_updated', data, timestamp: Date.now() });
            toast(data.message || 'Appointment status updated!', {
                icon: '⚡',
                duration: 4000,
                style: {
                    borderRadius: '12px',
                    background: '#0f172a',
                    color: '#e2e8f0',
                    border: '1px solid #10b981'
                }
            });
        });

        socketInstance.on('new_mentorship_request', (data) => {
            setLastEvent({ type: 'new_mentorship_request', data, timestamp: Date.now() });
            toast(data.message || 'New faculty mentorship application submitted!', {
                icon: '🎓',
                duration: 5000,
                style: {
                    borderRadius: '12px',
                    background: '#0f172a',
                    color: '#f8fafc',
                    border: '1px solid #818cf8'
                }
            });
        });

        socketInstance.on('mentorship_status_updated', (data) => {
            setLastEvent({ type: 'mentorship_status_updated', data, timestamp: Date.now() });
            toast(data.message || `Mentorship status: ${data.status}`, {
                icon: '📋',
                duration: 4000,
                style: {
                    borderRadius: '12px',
                    background: '#0f172a',
                    color: '#f8fafc',
                    border: '1px solid #06b6d4'
                }
            });
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    // Re-join user room whenever user logs in or switches
    useEffect(() => {
        if (socket && isConnected && user?.id) {
            socket.emit('join_user_room', user.id);
        }
    }, [socket, isConnected, user?.id]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, lastEvent }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};
