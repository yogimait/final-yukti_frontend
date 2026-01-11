import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Room player type
export interface RoomPlayer {
    id: string;
    username: string;
    elo: number;
    isReady: boolean;
}

// Chat message type
export interface RoomChatMessage {
    id: string;
    userId: string;
    username: string;
    message: string;
    timestamp: string;
}

// Room info type
export interface RoomInfo {
    id: string;
    name: string;
    type: '1v1' | 'squad';
    code: string;
    hostId: string;
    maxPlayers: number;
}

interface RoomState {
    // Room info
    roomInfo: RoomInfo | null;

    // Players in the room
    players: RoomPlayer[];

    // Chat messages
    chatMessages: RoomChatMessage[];

    // Loading state
    isLoading: boolean;
}

const initialState: RoomState = {
    roomInfo: null,
    players: [],
    chatMessages: [],
    isLoading: false,
};

const roomSlice = createSlice({
    name: 'room',
    initialState,
    reducers: {
        // Room info
        setRoomInfo: (state, action: PayloadAction<RoomInfo | null>) => {
            state.roomInfo = action.payload;
        },

        // Players
        setPlayers: (state, action: PayloadAction<RoomPlayer[]>) => {
            state.players = action.payload;
        },
        addPlayer: (state, action: PayloadAction<RoomPlayer>) => {
            const exists = state.players.some(p => p.id === action.payload.id);
            if (!exists) {
                state.players.push(action.payload);
            }
        },
        removePlayer: (state, action: PayloadAction<string>) => {
            state.players = state.players.filter(p => p.id !== action.payload);
        },
        updatePlayerReady: (state, action: PayloadAction<{ playerId: string; isReady: boolean }>) => {
            const player = state.players.find(p => p.id === action.payload.playerId);
            if (player) {
                player.isReady = action.payload.isReady;
            }
        },

        // Chat
        addRoomChatMessage: (state, action: PayloadAction<RoomChatMessage>) => {
            state.chatMessages.push(action.payload);
        },
        clearRoomChat: (state) => {
            state.chatMessages = [];
        },

        // Loading
        setRoomLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },

        // Reset room state (on leave)
        resetRoom: () => initialState,
    },
});

export const {
    setRoomInfo,
    setPlayers,
    addPlayer,
    removePlayer,
    updatePlayerReady,
    addRoomChatMessage,
    clearRoomChat,
    setRoomLoading,
    resetRoom,
} = roomSlice.actions;

export default roomSlice.reducer;
