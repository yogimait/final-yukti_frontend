import { io, type Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/utils/constants';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            autoConnect: false,
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });
    }
    return socket;
};

export const connectSocket = (token: string, userInfo?: { username: string; elo: number }): Socket => {
    const socket = getSocket();

    if (!socket.connected) {
        socket.auth = { token };
        // Pass user info in query for backend identification
        if (userInfo) {
            socket.io.opts.query = {
                username: userInfo.username,
                elo: userInfo.elo.toString(),
            };
        }
        socket.connect();
    }

    return socket;
};

export const disconnectSocket = (): void => {
    if (socket?.connected) {
        socket.disconnect();
    }
};

export const isSocketConnected = (): boolean => {
    return socket?.connected ?? false;
};

export default getSocket;
