import { useCallback } from 'react';
import { getSocket } from '@/socket';
import { useAppSelector } from '@/store';

/**
 * useSocket - READ-ONLY access to socket
 * 
 * Rules:
 * - Does NOT connect/disconnect (SocketProvider handles that)
 * - Provides socket instance via getSocket()
 * - Provides connection state from Redux
 * - Provides emit/on/off helpers
 */
export function useSocket() {
    const { isSocketConnected } = useAppSelector((state) => state.ui);

    const emit = useCallback(<T>(event: string, data?: T) => {
        const socket = getSocket();
        if (socket.connected) {
            socket.emit(event, data);
        } else {
            console.warn('[useSocket] Cannot emit, socket not connected');
        }
    }, []);

    const on = useCallback(<T>(event: string, callback: (data: T) => void) => {
        const socket = getSocket();
        socket.on(event, callback);
        // Return cleanup function
        return () => {
            socket.off(event, callback);
        };
    }, []);

    const off = useCallback((event: string, callback?: (...args: unknown[]) => void) => {
        const socket = getSocket();
        if (callback) {
            socket.off(event, callback);
        } else {
            socket.off(event);
        }
    }, []);

    return {
        socket: getSocket(),
        isConnected: isSocketConnected,
        emit,
        on,
        off,
    };
}
