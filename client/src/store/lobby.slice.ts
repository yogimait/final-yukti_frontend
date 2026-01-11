import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Types for lobby room list
export interface LobbyRoom {
    id: string;
    name: string;
    host: string;
    players: number;
    maxPlayers: number;
    type: '1v1' | 'squad';
    status: 'open' | 'almost' | 'full';
    difficulty?: 'easy' | 'medium' | 'hard';
    elo?: number;
}

export interface ActivityEvent {
    id: string;
    message: string;
    type: 'join' | 'create' | 'full';
    timestamp: number;
}

interface LobbyState {
    rooms: LobbyRoom[];
    activityEvents: ActivityEvent[];
    isLoadingRooms: boolean;
}

const initialState: LobbyState = {
    rooms: [],
    activityEvents: [],
    isLoadingRooms: false,
};

const lobbySlice = createSlice({
    name: 'lobby',
    initialState,
    reducers: {
        setRooms: (state, action: PayloadAction<LobbyRoom[]>) => {
            state.rooms = action.payload;
        },
        addRoom: (state, action: PayloadAction<LobbyRoom>) => {
            // Add new room, avoid duplicates
            const exists = state.rooms.some(r => r.id === action.payload.id);
            if (!exists) {
                state.rooms.unshift(action.payload);
            }
        },
        updateRoom: (state, action: PayloadAction<Partial<LobbyRoom> & { id: string }>) => {
            const index = state.rooms.findIndex(r => r.id === action.payload.id);
            if (index !== -1) {
                state.rooms[index] = { ...state.rooms[index], ...action.payload };
            }
        },
        removeRoom: (state, action: PayloadAction<string>) => {
            state.rooms = state.rooms.filter(r => r.id !== action.payload);
        },
        addActivityEvent: (state, action: PayloadAction<Omit<ActivityEvent, 'id' | 'timestamp'>>) => {
            const event: ActivityEvent = {
                ...action.payload,
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
            };
            // Keep max 10 events
            state.activityEvents = [event, ...state.activityEvents].slice(0, 10);
        },
        clearActivityEvents: (state) => {
            state.activityEvents = [];
        },
        setLoadingRooms: (state, action: PayloadAction<boolean>) => {
            state.isLoadingRooms = action.payload;
        },
    },
});

export const {
    setRooms,
    addRoom,
    updateRoom,
    removeRoom,
    addActivityEvent,
    clearActivityEvents,
    setLoadingRooms,
} = lobbySlice.actions;

export default lobbySlice.reducer;
