"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Marquee } from "@/components/ui/marquee";

interface ActivityEvent {
    id: string;
    message: string;
    type: "join" | "create" | "full";
    timestamp: number;
}

// Sample events for demo
const sampleEvents: ActivityEvent[] = [
    { id: "1", message: "AlgoKing just joined Algorithm Arena", type: "join", timestamp: Date.now() },
    { id: "2", message: "New 1v1 room created: Quick Battle", type: "create", timestamp: Date.now() - 3000 },
    { id: "3", message: "Midnight Duel is now full", type: "full", timestamp: Date.now() - 6000 },
    { id: "4", message: "ByteNinja created DSA Practice arena", type: "create", timestamp: Date.now() - 9000 },
    { id: "5", message: "CodeMaster joined Quick Battle", type: "join", timestamp: Date.now() - 12000 },
];

const typeConfig = {
    join: { icon: "👤", glowColor: "text-green-400" },
    create: { icon: "✨", glowColor: "text-blue-400" },
    full: { icon: "🔒", glowColor: "text-yellow-400" }
};

interface LiveActivityStripProps {
    events?: ActivityEvent[];
    className?: string;
}

export function LiveActivityStrip({ events = sampleEvents, className }: LiveActivityStripProps) {
    const [visibleEvents, setVisibleEvents] = useState<ActivityEvent[]>([]);
    const [isPaused, setIsPaused] = useState(false);
    const eventIndexRef = useRef(0);

    // Add events one at a time, max 1 event per 3-4 seconds
    // Old events auto-disappear after showing 5 events max
    const addNextEvent = useCallback(() => {
        if (isPaused) return;

        setVisibleEvents(prev => {
            const nextEvent = events[eventIndexRef.current % events.length];
            eventIndexRef.current++;

            // Keep max 5 events visible, auto-disappear old ones
            const newEvents = [...prev, { ...nextEvent, id: `${nextEvent.id}-${Date.now()}` }];
            return newEvents.slice(-5);
        });
    }, [events, isPaused]);

    useEffect(() => {
        // Add initial events
        setVisibleEvents(events.slice(0, 3).map((e, i) => ({ ...e, id: `${e.id}-init-${i}` })));
        eventIndexRef.current = 3;

        // Add new event every 3-4 seconds
        const interval = setInterval(() => {
            addNextEvent();
        }, 3500); // 3.5 seconds interval

        return () => clearInterval(interval);
    }, [events, addNextEvent]);

    return (
        <div
            className={cn(
                "relative w-full overflow-hidden rounded-lg bg-card/30 border border-border/50 py-2",
                className
            )}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />

            <Marquee
                pauseOnHover
                className="[--duration:60s]"
            >
                <AnimatePresence mode="popLayout">
                    {visibleEvents.map((event) => {
                        const config = typeConfig[event.type];
                        return (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center gap-2 px-4 py-1"
                            >
                                <span className="text-sm">{config.icon}</span>
                                <span className={cn(
                                    "text-sm font-medium whitespace-nowrap",
                                    config.glowColor,
                                    "drop-shadow-[0_0_4px_currentColor]"
                                )}>
                                    {event.message}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </Marquee>

            {/* Pause indicator */}
            {isPaused && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground z-20"
                >
                    Paused
                </motion.div>
            )}
        </div>
    );
}
