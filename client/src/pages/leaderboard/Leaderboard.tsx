import { motion } from 'framer-motion';
import { Trophy, Search } from 'lucide-react';
import { useState, useRef } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/Input';
import { GlobalNavigation } from '@/components/layout/GlobalNavigation';
import { Spotlight } from '@/components/ui/spotlight-new';

// Mock leaderboard data - extended for scroll demo
const mockLeaderboard = [
    { rank: 1, username: 'AlgorithmGod', elo: 2450, wins: 156, losses: 23 },
    { rank: 2, username: 'CodeNinja42', elo: 2380, wins: 142, losses: 28 },
    { rank: 3, username: 'ByteWarrior', elo: 2310, wins: 128, losses: 31 },
    { rank: 4, username: 'DSAMaster', elo: 2250, wins: 115, losses: 35 },
    { rank: 5, username: 'RecursionKing', elo: 2180, wins: 108, losses: 40 },
    { rank: 6, username: 'HashMapHero', elo: 2120, wins: 98, losses: 42 },
    { rank: 7, username: 'TreeTraverser', elo: 2050, wins: 92, losses: 45 },
    { rank: 8, username: 'GraphGuru', elo: 1990, wins: 85, losses: 48 },
    { rank: 9, username: 'DynamicDev', elo: 1920, wins: 78, losses: 52 },
    { rank: 10, username: 'StackSurfer', elo: 1850, wins: 72, losses: 55 },
    { rank: 11, username: 'HeapMaster', elo: 1800, wins: 65, losses: 58 },
    { rank: 12, username: 'QueueQueen', elo: 1750, wins: 60, losses: 60 },
];

// Simulate current user
const currentUserId = 'DSAMaster';

export function Leaderboard() {
    const [searchQuery, setSearchQuery] = useState('');
    const listRef = useRef<HTMLDivElement>(null);

    const filteredPlayers = mockLeaderboard.filter((player) =>
        player.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-screen bg-background relative overflow-hidden flex flex-col">
            <GlobalNavigation />

            <main className="container mx-auto max-w-3xl px-4 py-8 flex-1 flex flex-col min-h-0">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 flex flex-col min-h-0"
                >
                    {/* Header */}
                    <div className="mb-6 text-center">
                        <h1 className="mb-1 text-5xl font-space font-bold text-foreground">Leaderboard</h1>
                        <p className="text-sm font-space text-muted-foreground">Global rankings</p>
                    </div>

                    {/* Top 3 Podium with Spotlight */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 pointer-events-none">
                            <Spotlight />
                        </div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                            className="flex items-end justify-center gap-3 relative z-10"
                        >
                            {/* 2nd */}
                            <div className="flex flex-col items-center">
                                <span className="mb-1 text-xs font-space text-muted-foreground">2nd</span>
                                <div className="flex h-16 w-20 flex-col items-center justify-center rounded-t-md bg-secondary border border-border">
                                    <span className="text-xs font-semibold font-space text-foreground truncate w-full text-center px-1">{mockLeaderboard[1].username}</span>
                                    <span className="text-lg font-bold font-space tabular-nums text-foreground">{mockLeaderboard[1].elo}</span>
                                </div>
                            </div>

                            {/* 1st */}
                            <div className="flex flex-col items-center">
                                <Trophy className="mb-1 h-5 w-5 text-primary" />
                                <div className="flex h-20 w-24 flex-col items-center justify-center rounded-t-md border-t-2 border-primary bg-secondary border-x border-b border-border">
                                    <span className="text-xs font-semibold font-space text-foreground truncate w-full text-center px-1">{mockLeaderboard[0].username}</span>
                                    <span className="text-xl font-bold font-space tabular-nums text-foreground">{mockLeaderboard[0].elo}</span>
                                </div>
                            </div>

                            {/* 3rd */}
                            <div className="flex flex-col items-center">
                                <span className="mb-1 text-xs font-space text-muted-foreground">3rd</span>
                                <div className="flex h-14 w-20 flex-col items-center justify-center rounded-t-md bg-secondary border border-border">
                                    <span className="text-xs font-semibold font-space text-foreground truncate w-full text-center px-1">{mockLeaderboard[2].username}</span>
                                    <span className="text-lg font-bold font-space tabular-nums text-foreground">{mockLeaderboard[2].elo}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Search */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        className="relative mb-4"
                    >
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search players..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </motion.div>

                    {/* Scrollable Table - Only this area scrolls */}
                    <motion.div
                        ref={listRef}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                        className="rounded-md border border-border flex-1 overflow-y-auto min-h-0"
                    >
                        <table className="w-full">
                            <thead className="sticky top-0 z-10 bg-background/80 backdrop-blur-md">
                                <tr className="border-b border-border text-left text-xs font-space text-muted-foreground">
                                    <th className="w-16 p-3 font-medium">#</th>
                                    <th className="p-3 font-medium">Player</th>
                                    <th className="p-3 text-right font-medium">ELO</th>
                                    <th className="hidden p-3 text-right font-medium sm:table-cell">W/L</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPlayers.map((player, index) => {
                                    const isCurrentUser = player.username === currentUserId;
                                    const isTop3 = player.rank <= 3;

                                    return (
                                        <motion.tr
                                            key={player.username}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + index * 0.03, duration: 0.2 }}
                                            className={`border-b border-border last:border-0 transition-colors ${isCurrentUser
                                                ? 'bg-primary/5'
                                                : 'hover:bg-secondary/50'
                                                }`}
                                        >
                                            <td className="p-3">
                                                <span
                                                    className={`text-sm font-bold font-space tabular-nums ${isTop3 ? 'text-primary' : 'text-muted-foreground'
                                                        }`}
                                                >
                                                    {player.rank}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span className={`text-sm font-medium font-space ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                                                    {player.username}
                                                    {isCurrentUser && <span className="ml-1 text-xs font-space text-muted-foreground">(you)</span>}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right">
                                                <span className="text-sm font-bold font-space tabular-nums text-foreground">
                                                    {player.elo.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="hidden p-3 text-right text-sm font-space text-muted-foreground sm:table-cell">
                                                {player.wins}/{player.losses}
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </motion.div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
