import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Trophy, TrendingUp } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks';
import { Spotlight } from '@/components/ui/spotlight-new';
import { GlobalNavigation } from '@/components/layout/GlobalNavigation';
import { HoverEffect } from '@/components/ui/card-hover-effect';

// Mock data
const recentMatches = [
    { id: '1', opponent: 'CodeMaster', result: 'win', eloChange: 25, date: '2h ago' },
    { id: '2', opponent: 'AlgoKing', result: 'loss', eloChange: -18, date: '5h ago' },
    { id: '3', opponent: 'ByteNinja', result: 'win', eloChange: 22, date: '1d ago' },
];

const matchStats = [
    { title: "68%", description: "Win Rate", link: "#" },
    { title: "47", description: "Matches Played", link: "#" },
    { title: "+52", description: "Elo Gain (Week)", link: "#" },
];

export function Dashboard() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <GlobalNavigation />

            <div className="absolute inset-0 z-0 pointer-events-none">
                <Spotlight />
            </div>

            <main className="container mx-auto max-w-4xl px-4 py-12 relative z-10">
                {/* Hero - Rank & ELO */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-12 text-center"
                >
                    <p className="mb-2 text-sm font-space text-muted-foreground">Welcome back,</p>
                    <h1 className="mb-8 text-2xl font-medium font-space text-foreground">
                        {user?.username || 'Player'}
                    </h1>

                    {/* ELO - Hero number */}
                    <div className="mb-2">
                        <span className="text-6xl font-bold font-space tracking-tight text-foreground md:text-7xl">
                            1,450
                        </span>
                    </div>
                    <p className="mb-1 text-sm font-space text-muted-foreground">ELO Rating</p>

                    {/* Rank */}
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Trophy className="h-4 w-4" />
                        <span className="text-lg font-semibold font-space text-foreground">#234</span>
                        <span className="text-sm">Global Rank</span>
                    </div>
                </motion.div>

                {/* Play Button - Primary Action */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="mb-12 flex justify-center"
                >
                    <Link to="/lobby">
                        <Button size="xl" className="px-12 font-space">
                            <Play className="mr-2 h-5 w-5" />
                            Find Match
                        </Button>
                    </Link>
                </motion.div>

                {/* Secondary Stats using HoverEffect */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                    className="mb-8"
                >
                    <HoverEffect items={matchStats} className="py-0" />
                </motion.div>

                {/* Recent Matches */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                >
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-medium text-muted-foreground">Recent Matches</h2>
                        <Link to="/profile" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                            View all →
                        </Link>
                    </div>
                    <div className="space-y-1">
                        {recentMatches.map((match) => (
                            <div
                                key={match.id}
                                className="flex items-center justify-between rounded-md px-3 py-2.5 transition-colors hover:bg-secondary"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`h-1.5 w-1.5 rounded-full ${match.result === 'win' ? 'bg-green-500' : 'bg-red-500'
                                            }`}
                                    />
                                    <span className="text-sm text-foreground">vs {match.opponent}</span>
                                    <span className="text-xs text-muted-foreground">{match.date}</span>
                                </div>
                                <span
                                    className={`text-sm font-medium tabular-nums ${match.eloChange > 0 ? 'text-green-500' : 'text-red-500'
                                        }`}
                                >
                                    {match.eloChange > 0 ? '+' : ''}
                                    {match.eloChange}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
