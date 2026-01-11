import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { GlobalNavigation } from '@/components/layout/GlobalNavigation';
import { FilterBar } from '@/components/ui/AnimatedTabs';
import { ArenaGrid, LiveActivityStrip, CreateArenaSheet } from '@/components/lobby';
import type { ArenaRoom, ArenaFormData } from '@/components/lobby';
import { useAuth, useSocket } from '@/hooks';
import { useAppDispatch, useAppSelector, addRoom, updateRoom, addActivityEvent, setRooms } from '@/store';
import { SOCKET_EVENTS } from '@/types/socket';
import type { RoomListPayload, RoomPlayerPayload } from '@/types/socket';

// Mock rooms data with enhanced fields (fallback when socket is not connected)
const mockRooms: ArenaRoom[] = [
    { id: '1', name: 'Quick Battle', host: 'CodeMaster', players: 1, maxPlayers: 2, type: '1v1', status: 'open', difficulty: 'medium' },
    { id: '2', name: 'Algorithm Arena', host: 'AlgoKing', players: 4, maxPlayers: 5, type: 'squad', status: 'almost', difficulty: 'hard' },
    { id: '3', name: 'DSA Practice', host: 'ByteNinja', players: 1, maxPlayers: 2, type: '1v1', status: 'open', difficulty: 'easy' },
    { id: '4', name: 'Midnight Duel', host: 'NullPointer', players: 2, maxPlayers: 2, type: '1v1', status: 'full', difficulty: 'hard' },
    { id: '5', name: 'Beginner Friendly', host: 'NewCoder', players: 2, maxPlayers: 4, type: 'squad', status: 'open', difficulty: 'easy' },
    { id: '6', name: 'Pro League', host: 'EliteHacker', players: 3, maxPlayers: 4, type: 'squad', status: 'almost', difficulty: 'hard' },
];

// Mock user ELO for skill matching (fallback, will use real user ELO from auth)
const DEFAULT_ELO = 1200;
const eloRange = 200;

// Mock ELO values for rooms (would come from API)
const roomELOs: Record<string, number> = {
    '1': 1450,
    '2': 1600,
    '3': 1200,
    '4': 1800,
    '5': 1100,
    '6': 1750,
};

export function Lobby() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAuth();
    const { on, isConnected } = useSocket();
    const userELO = user?.elo || DEFAULT_ELO;

    // Get rooms from Redux (or use mock data as fallback)
    const lobbyRooms = useAppSelector((state) => state.lobby.rooms);
    const activityEvents = useAppSelector((state) => state.lobby.activityEvents);

    // Filter states with defaults: Open + Near My ELO
    const [modeFilter, setModeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('open');
    const [skillFilter, setSkillFilter] = useState(true);

    // UI states
    const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [roomCode, setRoomCode] = useState('');

    // Use Redux rooms if available, otherwise mock data
    const publicRooms: ArenaRoom[] = lobbyRooms.length > 0
        ? lobbyRooms.map(r => ({
            id: r.id,
            name: r.name,
            host: r.host,
            players: r.players,
            maxPlayers: r.maxPlayers,
            type: r.type,
            status: r.status,
            difficulty: r.difficulty,
        }))
        : mockRooms;

    // Socket event listeners - Lobby ONLY listens, dispatches to Redux
    useEffect(() => {
        if (!isConnected) return;

        // Listen for room list updates
        const unsubRoomUpdate = on<RoomListPayload>(SOCKET_EVENTS.ROOM_UPDATE, (data) => {
            dispatch(setRooms(data.rooms.map(r => ({
                ...r,
                difficulty: 'medium' as const, // Default difficulty
            }))));
        });

        // Listen for player joined events
        const unsubPlayerJoined = on<RoomPlayerPayload & { roomId: string; roomName: string }>(
            SOCKET_EVENTS.ROOM_PLAYER_JOINED,
            (data) => {
                dispatch(addActivityEvent({
                    message: `${data.username} joined ${data.roomName}`,
                    type: 'join',
                }));
                // Update room player count
                dispatch(updateRoom({
                    id: data.roomId,
                    players: data.elo, // This should be the updated player count from backend
                }));
            }
        );

        // Listen for room created events
        const unsubRoomCreate = on<{ room: ArenaRoom }>(SOCKET_EVENTS.ROOM_CREATE, (data) => {
            dispatch(addRoom({
                ...data.room,
                difficulty: data.room.difficulty || 'medium',
            }));
            dispatch(addActivityEvent({
                message: `New room created: ${data.room.name}`,
                type: 'create',
            }));
        });

        // Cleanup listeners on unmount
        return () => {
            unsubRoomUpdate();
            unsubPlayerJoined();
            unsubRoomCreate();
        };
    }, [isConnected, on, dispatch]);

    // Filter rooms based on all criteria
    const filteredRooms = useMemo(() => {
        return publicRooms.filter((room) => {
            // Mode filter
            if (modeFilter !== 'all' && room.type !== modeFilter) return false;

            // Status filter
            if (statusFilter !== 'all' && room.status !== statusFilter) return false;

            // Skill filter (Near My ELO)
            if (skillFilter) {
                const roomELO = roomELOs[room.id] || 1500;
                if (Math.abs(roomELO - userELO) > eloRange) return false;
            }

            return true;
        });
    }, [publicRooms, modeFilter, statusFilter, skillFilter, userELO]);

    const handleResetFilters = () => {
        setModeFilter('all');
        setStatusFilter('open');
        setSkillFilter(true);
    };

    const handleJoinRoom = (roomId: string) => {
        navigate(`/room/${roomId}`);
    };

    const handleCreateArena = (data: ArenaFormData) => {
        console.log('Creating arena:', data);
        // Generate random 6-char room code
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let roomCode = '';
        for (let i = 0; i < 6; i++) {
            roomCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        navigate(`/room/${roomCode}`);
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <GlobalNavigation />

            {/* ===== SECTION 1: LOBBY HERO ===== */}
            <section className="relative pt-20 pb-8 overflow-hidden">
                {/* Background Beams - Very slow motion */}
                <BackgroundBeams className="opacity-30" />

                <div className="container mx-auto max-w-6xl px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
                    >
                        {/* Left: Title */}
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">
                                LOBBY
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Choose your arena. Prove your rank.
                            </p>
                        </div>

                        {/* Right: CTAs */}
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsJoinModalOpen(true)}
                                className="border-border hover:border-primary/50 transition-all"
                            >
                                <Lock className="mr-2 h-4 w-4" />
                                Join via Code
                            </Button>
                            <Button
                                onClick={() => setIsCreateSheetOpen(true)}
                                className="relative group overflow-hidden"
                            >
                                {/* Glow effect on hover */}
                                <span className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                                <span className="relative flex items-center">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Arena
                                </span>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <main className="container mx-auto max-w-6xl px-4 pb-12">
                {/* ===== SECTION 4: LIVE ACTIVITY STRIP ===== */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="mb-6"
                >
                    {/* LiveActivityStrip reads from Redux via props */}
                    <LiveActivityStrip
                        events={activityEvents.length > 0 ? activityEvents : undefined}
                    />
                </motion.div>

                {/* ===== SECTION 2: SMART FILTERS BAR ===== */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="mb-8"
                >
                    <FilterBar
                        modeFilter={modeFilter}
                        statusFilter={statusFilter}
                        skillFilter={skillFilter}
                        onModeChange={setModeFilter}
                        onStatusChange={setStatusFilter}
                        onSkillChange={setSkillFilter}
                        onReset={handleResetFilters}
                    />
                </motion.div>

                {/* ===== SECTION 3 & 5: ARENA CARDS / EMPTY STATE ===== */}
                {filteredRooms.length > 0 ? (
                    <ArenaGrid rooms={filteredRooms} onJoin={handleJoinRoom} />
                ) : (
                    <EmptyState onCreateArena={() => setIsCreateSheetOpen(true)} />
                )}
            </main>

            {/* ===== SECTION 6: CREATE ARENA SHEET ===== */}
            <CreateArenaSheet
                isOpen={isCreateSheetOpen}
                onClose={() => setIsCreateSheetOpen(false)}
                onCreate={handleCreateArena}
            />

            {/* Join Private Modal */}
            <Modal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
                title="Join Private Arena"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Arena Code
                        </label>
                        <Input
                            placeholder="Enter 6-digit code"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value)}
                            className="text-center text-lg tracking-widest uppercase"
                            maxLength={6}
                        />
                    </div>
                    <Button className="w-full" onClick={() => navigate(`/room/${roomCode}`)}>
                        Enter Arena
                    </Button>
                </div>
            </Modal>
        </div>
    );
}

// Empty State Component with empowering message
function EmptyState({ onCreateArena }: { onCreateArena: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-20 px-4"
        >
            <div className="relative mb-6">
                <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full animate-soft-glow" />
                <div className="relative bg-card/80 border border-border rounded-full p-6">
                    <Sparkles className="w-10 h-10 text-muted-foreground" />
                </div>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-2 text-center">
                No arenas live right now.
            </h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
                Create one and set the rules.
            </p>

            <Button onClick={onCreateArena} size="lg" className="group">
                <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                Create Arena
            </Button>
        </motion.div>
    );
}
