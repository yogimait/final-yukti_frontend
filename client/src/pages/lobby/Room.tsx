import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, Users, Crown, Check, X, MessageSquare, Send } from 'lucide-react';
import { GlobalNavigation } from '@/components/layout/GlobalNavigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth, useSocket } from '@/hooks';
import { CardSpotlight } from '@/components/ui/card-spotlight';
import {
    useAppDispatch,
    useAppSelector,
    setRoomInfo,
    setRoomPlayers,
    addPlayer,
    removePlayer,
    updatePlayerReady,
    addRoomChatMessage,
    resetRoom,
    type RoomPlayer,
} from '@/store';
import { SOCKET_EVENTS } from '@/types/socket';
import type { RoomPlayerPayload, ChatMessageResponse, MatchStartResponse } from '@/types/socket';

// Mock room info (fallback)
const mockRoomInfo = {
    id: 'room-123',
    name: 'Quick Battle',
    type: '1v1' as const,
    code: 'ABC123',
    hostId: '1',
    maxPlayers: 2,
};

// Mock initial players (fallback)
const mockPlayers = [
    { id: '1', username: 'CodeMaster', elo: 1450, isReady: true },
    { id: '2', username: 'You', elo: 1320, isReady: false },
];

/**
 * Room Page - Socket + Redux Integration
 * 
 * Socket events dispatch to Redux, UI reads from Redux.
 * This is the ONLY component that registers socket listeners for room events.
 */
export function Room() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAuth();
    const { emit, on, isConnected } = useSocket();

    // Read from Redux
    const roomInfo = useAppSelector((state) => state.room.roomInfo) || mockRoomInfo;
    const players = useAppSelector((state) => state.room.players);
    const chatMessages = useAppSelector((state) => state.room.chatMessages);

    // Use Redux players or fallback to mock for testing
    const displayPlayers = players.length > 0 ? players : mockPlayers;

    // Local UI state (not socket-related)
    const [isReady, setIsReady] = useState(false);
    const [copied, setCopied] = useState(false);
    const [chatInput, setChatInput] = useState('');

    // Initialize room state on mount
    useEffect(() => {
        if (roomId) {
            dispatch(setRoomInfo({
                ...mockRoomInfo,
                id: roomId,
            }));
        }

        // Cleanup on unmount
        return () => {
            dispatch(resetRoom());
        };
    }, [roomId, dispatch]);

    // Join room on mount (socket)
    useEffect(() => {
        if (!isConnected || !roomId) return;

        console.debug('[Room] Joining room:', roomId);
        emit(SOCKET_EVENTS.ROOM_JOIN, { roomId });

        // Cleanup: leave room on unmount
        return () => {
            console.debug('[Room] Leaving room:', roomId);
            emit(SOCKET_EVENTS.ROOM_LEAVE, { roomId });
        };
    }, [isConnected, roomId, emit]);

    // Socket event listeners - dispatch to Redux
    useEffect(() => {
        if (!isConnected) return;

        // Room joined (get real room info)
        const unsubRoomJoined = on<{
            roomId: string;
            code: string;
            name: string;
            type: '1v1' | 'squad';
            hostId: string;
            maxPlayers: number;
        }>(
            SOCKET_EVENTS.ROOM_JOINED,
            (data) => {
                console.debug('[Room] Room joined:', data);
                dispatch(setRoomInfo({
                    id: data.roomId,
                    name: data.name,
                    type: data.type,
                    code: data.code,
                    hostId: data.hostId,
                    maxPlayers: data.maxPlayers,
                }));
            }
        );

        // Room error
        const unsubRoomError = on<{ message: string }>(
            SOCKET_EVENTS.ROOM_ERROR,
            (data) => {
                console.error('[Room] Error:', data.message);
                alert(data.message);
            }
        );

        // Initial player list when joining
        const unsubPlayers = on<{ players: Array<{ playerId: string; username: string; elo: number; isReady: boolean }> }>(
            SOCKET_EVENTS.ROOM_PLAYERS,
            (data) => {
                console.debug('[Room] Received player list:', data.players);
                dispatch(setRoomPlayers(data.players.map(p => ({
                    id: p.playerId,
                    username: p.username,
                    elo: p.elo,
                    isReady: p.isReady,
                }))));
            }
        );

        // Player joined → dispatch to Redux
        const unsubPlayerJoined = on<RoomPlayerPayload>(
            SOCKET_EVENTS.ROOM_PLAYER_JOINED,
            (data) => {
                console.debug('[Room] Player joined:', data);
                dispatch(addPlayer({
                    id: data.playerId,
                    username: data.username,
                    elo: data.elo,
                    isReady: data.isReady,
                }));
            }
        );

        // Player left → dispatch to Redux
        const unsubPlayerLeft = on<{ playerId: string }>(
            SOCKET_EVENTS.ROOM_PLAYER_LEFT,
            (data) => {
                console.debug('[Room] Player left:', data);
                dispatch(removePlayer(data.playerId));
            }
        );

        // Player ready status changed → dispatch to Redux
        const unsubPlayerReady = on<{ playerId: string; isReady: boolean }>(
            SOCKET_EVENTS.ROOM_READY,
            (data) => {
                console.debug('[Room] Player ready status:', data);
                dispatch(updatePlayerReady({
                    playerId: data.playerId,
                    isReady: data.isReady,
                }));
            }
        );

        // Match started → navigate
        const unsubMatchStart = on<MatchStartResponse>(
            SOCKET_EVENTS.MATCH_START,
            (data) => {
                console.debug('[Room] Match starting:', data);
                navigate(`/battle/${data.match.id}`);
            }
        );

        // Chat message received → dispatch to Redux
        const unsubChatMessage = on<ChatMessageResponse>(
            SOCKET_EVENTS.CHAT_MESSAGE,
            (data) => {
                console.debug('[Room] Chat message:', data);
                dispatch(addRoomChatMessage({
                    id: `${data.userId}-${data.timestamp}`,
                    userId: data.userId,
                    username: data.username,
                    message: data.message,
                    timestamp: data.timestamp,
                }));
            }
        );

        // Cleanup listeners on unmount
        return () => {
            unsubRoomJoined();
            unsubRoomError();
            unsubPlayers();
            unsubPlayerJoined();
            unsubPlayerLeft();
            unsubPlayerReady();
            unsubMatchStart();
            unsubChatMessage();
        };
    }, [isConnected, on, navigate, dispatch]);

    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomInfo.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReady = useCallback(() => {
        const newReadyState = !isReady;
        setIsReady(newReadyState);

        if (isConnected) {
            emit(SOCKET_EVENTS.ROOM_READY, {
                roomId,
                isReady: newReadyState
            });
        }
    }, [isReady, isConnected, emit, roomId]);

    const handleStartGame = useCallback(() => {
        if (isConnected) {
            emit(SOCKET_EVENTS.MATCH_START, { roomId });
        } else {
            // Fallback for testing without socket
            navigate(`/battle/${roomId}`);
        }
    }, [isConnected, emit, roomId, navigate]);

    const handleLeaveRoom = useCallback(() => {
        // Socket leave is handled by useEffect cleanup
        navigate('/lobby');
    }, [navigate]);

    const handleSendChat = useCallback(() => {
        if (!chatInput.trim()) return;

        if (isConnected) {
            emit(SOCKET_EVENTS.CHAT_MESSAGE, {
                roomId,
                message: chatInput.trim(),
            });
        }
        setChatInput('');
    }, [chatInput, isConnected, emit, roomId]);

    const isHost = user?.id === roomInfo.hostId;
    const allReady = displayPlayers.every((p) => p.isReady);

    return (
        <div className="min-h-screen bg-background relative">
            <GlobalNavigation />

            <main className="container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-auto max-w-2xl"
                >
                    {/* Room Header */}
                    <Card className="mb-6">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl">{roomInfo.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {roomInfo.type === '1v1' ? '1v1 Duel' : 'Squad Wars'}
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" onClick={copyRoomCode}>
                                    {copied ? (
                                        <Check className="mr-2 h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="mr-2 h-4 w-4" />
                                    )}
                                    {roomInfo.code}
                                </Button>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Players - reads from Redux */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Players ({displayPlayers.length}/{roomInfo.maxPlayers})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {displayPlayers.map((player) => (
                                <CardSpotlight
                                    key={player.id}
                                    className="flex items-center justify-between !p-4 !bg-card/60"
                                    radius={200}
                                >
                                    <div className="flex items-center gap-3 relative z-20">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold">
                                            {player.username.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-white">{player.username}</span>
                                                {player.id === roomInfo.hostId && (
                                                    <Crown className="h-4 w-4 text-yellow-500" />
                                                )}
                                            </div>
                                            <span className="text-sm text-neutral-400">{player.elo} ELO</span>
                                        </div>
                                    </div>
                                    <div
                                        className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm relative z-20 ${player.isReady
                                            ? 'bg-green-500/10 text-green-500'
                                            : 'bg-yellow-500/10 text-yellow-500'
                                            }`}
                                    >
                                        {player.isReady ? (
                                            <>
                                                <Check className="h-4 w-4" /> Ready
                                            </>
                                        ) : (
                                            'Waiting...'
                                        )}
                                    </div>
                                </CardSpotlight>
                            ))}

                            {/* Empty slots */}
                            {Array.from({ length: roomInfo.maxPlayers - displayPlayers.length }).map((_, i) => (
                                <div
                                    key={`empty-${i}`}
                                    className="flex items-center justify-center rounded-lg border border-dashed p-4 text-muted-foreground"
                                >
                                    Waiting for player...
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Chat - reads from Redux */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Chat
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col h-48 rounded-lg border border-border bg-background/50">
                                {/* Chat messages from Redux */}
                                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                    {chatMessages.length === 0 ? (
                                        <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                                            No messages yet. Say hello!
                                        </div>
                                    ) : (
                                        chatMessages.map((msg) => (
                                            <div key={msg.id} className="text-sm">
                                                <span className="font-medium text-primary">{msg.username}: </span>
                                                <span className="text-foreground">{msg.message}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {/* Chat input */}
                                <div className="flex gap-2 p-2 border-t border-border">
                                    <Input
                                        placeholder="Type a message..."
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                                        className="flex-1"
                                    />
                                    <Button size="sm" onClick={handleSendChat} disabled={!chatInput.trim()}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-4">
                            <Button variant="outline" className="flex-1" onClick={handleLeaveRoom}>
                                <X className="mr-2 h-4 w-4" />
                                Leave Room
                            </Button>
                            {/* Everyone (including host) has Ready button */}
                            <Button
                                variant={isReady ? 'outline' : 'default'}
                                className="flex-1"
                                onClick={handleReady}
                            >
                                {isReady ? 'Cancel Ready' : 'Ready'}
                            </Button>
                        </div>

                        {/* Start Game - only visible to host when ALL players are ready */}
                        {isHost && allReady && displayPlayers.length >= 2 && (
                            <Button
                                className="w-full"
                                onClick={handleStartGame}
                            >
                                🚀 Start Game
                            </Button>
                        )}

                        {/* Dev Bypass Button */}
                        <Button
                            variant="secondary"
                            className="w-full border border-dashed border-yellow-500/50 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                            onClick={() => navigate(`/battle/${roomId || '1'}`)}
                        >
                            ⚡ Force Start Battle (Frontend Testing)
                        </Button>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
