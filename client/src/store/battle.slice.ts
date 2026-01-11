import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Battle state types
export type OpponentStatus = 'idle' | 'typing' | 'running' | 'submitted';
export type BattleStatus = 'waiting' | 'active' | 'finished';
export type BattleResult = 'won' | 'lost' | null;

export interface OpponentInfo {
    id: string;
    username: string;
    elo: number;
    isConnected: boolean;
}

export interface OpponentProgress {
    testsPassed: number;
    totalTests: number;
}

export interface ChatMessage {
    id: string;
    userId: string;
    username: string;
    message: string;
    timestamp: string;
    isOwn: boolean;
}

interface BattleState {
    // Room info
    roomId: string | null;

    // Opponent state
    opponent: OpponentInfo | null;
    opponentStatus: OpponentStatus;
    opponentProgress: OpponentProgress;

    // Battle state
    battleStatus: BattleStatus;
    battleResult: BattleResult;

    // Chat state
    chatMessages: ChatMessage[];
    unreadCount: number;
}

const initialState: BattleState = {
    roomId: null,
    opponent: null,
    opponentStatus: 'idle',
    opponentProgress: { testsPassed: 0, totalTests: 5 },
    battleStatus: 'waiting',
    battleResult: null,
    chatMessages: [],
    unreadCount: 0,
};

const battleSlice = createSlice({
    name: 'battle',
    initialState,
    reducers: {
        // Room actions
        setRoomId: (state, action: PayloadAction<string | null>) => {
            state.roomId = action.payload;
        },

        // Opponent actions
        setOpponent: (state, action: PayloadAction<OpponentInfo | null>) => {
            state.opponent = action.payload;
        },
        setOpponentConnected: (state, action: PayloadAction<boolean>) => {
            if (state.opponent) {
                state.opponent.isConnected = action.payload;
            }
        },
        setOpponentStatus: (state, action: PayloadAction<OpponentStatus>) => {
            state.opponentStatus = action.payload;
        },
        setOpponentProgress: (state, action: PayloadAction<OpponentProgress>) => {
            state.opponentProgress = action.payload;
        },

        // Battle actions
        setBattleStatus: (state, action: PayloadAction<BattleStatus>) => {
            state.battleStatus = action.payload;
        },
        setBattleResult: (state, action: PayloadAction<BattleResult>) => {
            state.battleResult = action.payload;
            if (action.payload !== null) {
                state.battleStatus = 'finished';
            }
        },

        // Chat actions
        addChatMessage: (state, action: PayloadAction<ChatMessage>) => {
            state.chatMessages.push(action.payload);
            if (!action.payload.isOwn) {
                state.unreadCount += 1;
            }
        },
        clearUnreadCount: (state) => {
            state.unreadCount = 0;
        },

        // Reset battle state (on leave)
        resetBattle: () => initialState,
    },
});

export const {
    setRoomId,
    setOpponent,
    setOpponentConnected,
    setOpponentStatus,
    setOpponentProgress,
    setBattleStatus,
    setBattleResult,
    addChatMessage,
    clearUnreadCount,
    resetBattle,
} = battleSlice.actions;

export default battleSlice.reducer;
