"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Swords, Users, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CardSpotlight } from "@/components/ui/card-spotlight";

export type RoomStatus = "open" | "almost" | "full";
export type RoomType = "1v1" | "squad";
export type Difficulty = "easy" | "medium" | "hard";

export interface ArenaRoom {
    id: string;
    name: string;
    host: string;
    players: number;
    maxPlayers: number;
    type: RoomType;
    status: RoomStatus;
    difficulty: Difficulty;
}

interface ArenaCardProps {
    room: ArenaRoom;
    index: number;
    onJoin: (id: string) => void;
}

const statusConfig = {
    open: {
        label: "Live",
        dotClass: "bg-green-500",
        glowClass: "shadow-[0_0_8px_rgba(34,197,94,0.4)]"
    },
    almost: {
        label: "Almost Full",
        dotClass: "bg-yellow-500 animate-pulse",
        glowClass: "shadow-[0_0_8px_rgba(234,179,8,0.4)]"
    },
    full: {
        label: "Full",
        dotClass: "bg-red-500",
        glowClass: ""
    }
};

const difficultyConfig = {
    easy: {
        label: "Easy",
        dotClass: "bg-green-500",
        textClass: "text-green-500"
    },
    medium: {
        label: "Medium",
        dotClass: "bg-yellow-500",
        textClass: "text-yellow-500"
    },
    hard: {
        label: "Hard",
        dotClass: "bg-red-500",
        textClass: "text-red-500"
    }
};

export function ArenaCard({ room, index, onJoin }: ArenaCardProps) {
    const status = statusConfig[room.status];
    const difficulty = difficultyConfig[room.difficulty];
    const isFull = room.status === "full";

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
                duration: 0.4,
                delay: index * 0.08,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
            whileHover={{ y: -4 }}
            className="group"
        >
            <CardSpotlight
                radius={300}
                color="#1e3a5f"
                className={cn(
                    "relative h-full p-0 rounded-xl border border-border bg-card/80 transition-all duration-300",
                    "group-hover:border-primary/40",
                    !isFull && status.glowClass
                )}
            >
                <div className="relative z-10 p-5">
                    {/* Header: Type + Status */}
                    <div className="flex items-center justify-between mb-3">
                        <div className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                            room.type === "1v1"
                                ? "bg-blue-500/15 text-blue-400"
                                : "bg-purple-500/15 text-purple-400"
                        )}>
                            {room.type === "1v1"
                                ? <Swords className="w-3 h-3 mr-1.5" />
                                : <Users className="w-3 h-3 mr-1.5" />
                            }
                            {room.type}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "w-2 h-2 rounded-full",
                                status.dotClass
                            )} />
                            <span className="text-xs text-muted-foreground">{status.label}</span>
                        </div>
                    </div>

                    {/* Room Name */}
                    <h3 className="text-lg font-bold tracking-tight text-foreground mb-1">
                        {room.name}
                    </h3>

                    {/* Host */}
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                        <User className="w-3.5 h-3.5 mr-1.5" />
                        {room.host}
                    </div>

                    {/* Players + Difficulty */}
                    <div className="flex items-center justify-between mb-4 text-sm">
                        <div className="text-muted-foreground">
                            <span className="font-medium text-foreground">{room.players}</span>
                            <span className="mx-1 text-muted-foreground/50">/</span>
                            <span>{room.maxPlayers}</span>
                            <span className="ml-1 text-xs">Players</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">Difficulty:</span>
                            <span className={cn("w-2 h-2 rounded-full", difficulty.dotClass)} />
                            <span className={cn("text-xs font-medium", difficulty.textClass)}>
                                {difficulty.label}
                            </span>
                        </div>
                    </div>

                    {/* Join Button */}
                    <Button
                        onClick={() => onJoin(room.id)}
                        disabled={isFull}
                        className={cn(
                            "w-full transition-all duration-200",
                            !isFull && "group-hover:scale-[1.02] group-hover:shadow-lg group-hover:shadow-primary/20"
                        )}
                    >
                        {isFull ? "Arena Full" : "Join Arena"}
                    </Button>
                </div>
            </CardSpotlight>
        </motion.div>
    );
}

// Grid wrapper with staggered animation
interface ArenaGridProps {
    rooms: ArenaRoom[];
    onJoin: (id: string) => void;
}

export function ArenaGrid({ rooms, onJoin }: ArenaGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room, idx) => (
                <ArenaCard
                    key={room.id}
                    room={room}
                    index={idx}
                    onJoin={onJoin}
                />
            ))}
        </div>
    );
}
