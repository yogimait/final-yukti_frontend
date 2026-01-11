import { type ReactNode, useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import { connectSocket, disconnectSocket } from '@/socket';
import { useAppDispatch, useAppSelector, setSocketConnected } from '@/store';
import { SOCKET_EVENTS } from '@/types/socket';

interface SocketProviderProps {
    children: ReactNode;
}

/**
 * SocketProvider - OWNS the socket lifecycle
 * 
 * Rules:
 * - This is the ONLY place that calls connectSocket() / disconnectSocket()
 * - Connects when authenticated AND token exists AND socket is not already connected
 * - Disconnects ONLY on logout (isAuthenticated becomes false)
 * - Components use useSocket() for read-only access
 */
export function SocketProvider({ children }: SocketProviderProps) {
    const dispatch = useAppDispatch();
    const { token, isAuthenticated, user } = useAppSelector((state) => state.auth);
    const socketRef = useRef<Socket | null>(null);
    const wasAuthenticatedRef = useRef(false);

    useEffect(() => {
        // Connect: authenticated + token + socket not connected
        if (isAuthenticated && token && !socketRef.current?.connected) {
            console.debug('[SocketProvider] Connecting socket...');
            // Pass user info for backend identification
            const userInfo = user ? { username: user.username, elo: user.elo || 1200 } : undefined;
            socketRef.current = connectSocket(token, userInfo);

            socketRef.current.on(SOCKET_EVENTS.CONNECT, () => {
                console.debug('[SocketProvider] Socket connected');
                dispatch(setSocketConnected(true));
            });

            socketRef.current.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
                console.debug('[SocketProvider] Socket disconnected:', reason);
                dispatch(setSocketConnected(false));
            });

            socketRef.current.on(SOCKET_EVENTS.ERROR, (error) => {
                console.error('[SocketProvider] Socket error:', error);
            });

            wasAuthenticatedRef.current = true;
        }

        // Disconnect: was authenticated but now logged out
        if (!isAuthenticated && wasAuthenticatedRef.current) {
            console.debug('[SocketProvider] Logging out, disconnecting socket...');

            if (socketRef.current) {
                socketRef.current.off(SOCKET_EVENTS.CONNECT);
                socketRef.current.off(SOCKET_EVENTS.DISCONNECT);
                socketRef.current.off(SOCKET_EVENTS.ERROR);
            }

            disconnectSocket();
            socketRef.current = null;
            wasAuthenticatedRef.current = false;
            dispatch(setSocketConnected(false));
        }
    }, [isAuthenticated, token, dispatch]);

    // Cleanup on unmount (app close)
    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.off(SOCKET_EVENTS.CONNECT);
                socketRef.current.off(SOCKET_EVENTS.DISCONNECT);
                socketRef.current.off(SOCKET_EVENTS.ERROR);
                disconnectSocket();
            }
        };
    }, []);

    return <>{children}</>;
}
