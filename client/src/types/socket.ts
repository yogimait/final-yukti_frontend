import type { User } from './user';
import type { Match, Room, Submission } from './match';

// Socket event names
export const SOCKET_EVENTS = {
    // Connection
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    ERROR: 'error',

    // Room events
    ROOM_CREATE: 'room:create',
    ROOM_CREATED: 'room:created',
    ROOM_JOIN: 'room:join',
    ROOM_JOINED: 'room:joined',
    ROOM_LEAVE: 'room:leave',
    ROOM_UPDATE: 'room:update',
    ROOM_PLAYER_JOINED: 'room:player_joined',
    ROOM_PLAYER_LEFT: 'room:player_left',
    ROOM_READY: 'room:ready',
    ROOM_PLAYERS: 'room:players',
    ROOM_ERROR: 'room:error',

    // Match events
    MATCH_START: 'match:start',
    MATCH_END: 'match:end',
    MATCH_UPDATE: 'match:update',
    MATCH_COUNTDOWN: 'match:countdown',

    // Code events
    CODE_SUBMIT: 'code:submit',
    CODE_RESULT: 'code:result',

    // Player events
    PLAYER_UPDATE: 'player:update',
    PLAYER_SUBMIT: 'player:submit',

    // Chat events
    CHAT_MESSAGE: 'chat:message',

    // Whiteboard events
    WHITEBOARD_DRAW: 'whiteboard:draw',
    WHITEBOARD_CLEAR: 'whiteboard:clear',
} as const;

export type SocketEventName = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];

// Socket event payloads
export interface RoomCreatePayload {
    name: string;
    type: '1v1' | 'squad';
    isPrivate: boolean;
    password?: string;
}

export interface RoomJoinPayload {
    roomId: string;
    password?: string;
}

export interface CodeSubmitPayload {
    matchId: string;
    code: string;
    language: string;
}

export interface ChatMessagePayload {
    roomId: string;
    message: string;
}

export interface WhiteboardDrawPayload {
    roomId: string;
    drawData: DrawData;
}

export interface DrawData {
    type: 'path' | 'line' | 'circle' | 'rect' | 'text' | 'clear';
    points?: { x: number; y: number }[];
    color: string;
    strokeWidth: number;
    text?: string;
}

// Socket event responses
export interface RoomUpdateResponse {
    room: Room;
}

export interface MatchStartResponse {
    match: Match;
}

export interface MatchUpdateResponse {
    match: Match;
}

export interface CodeResultResponse {
    submission: Submission;
}

export interface PlayerUpdateResponse {
    playerId: string;
    score: number;
    hasSubmitted: boolean;
}

export interface ChatMessageResponse {
    userId: string;
    username: string;
    message: string;
    timestamp: string;
}

// Battle-specific events
export interface OpponentProgressPayload {
    opponentId: string;
    testsPassed: number;
    totalTests: number;
    status: 'idle' | 'typing' | 'running' | 'submitted';
}

export interface BattleOverPayload {
    winnerId: string;
    loserId: string;
    winnerScore: number;
    loserScore: number;
    reason: 'all_tests_passed' | 'time_up' | 'forfeit';
}

export interface RoomPlayerPayload {
    playerId: string;
    username: string;
    elo: number;
    isReady: boolean;
}

export interface RoomListPayload {
    rooms: Array<{
        id: string;
        name: string;
        host: string;
        players: number;
        maxPlayers: number;
        type: '1v1' | 'squad';
        status: 'open' | 'almost' | 'full';
    }>;
}

