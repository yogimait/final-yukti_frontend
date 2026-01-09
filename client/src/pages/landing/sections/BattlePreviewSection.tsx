"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const codeLines = [
    "def solve(nums: List[int]) -> int:",
    "    seen = set()",
    "    for num in nums:",
    "        if target - num in seen:",
    "            return True",
    "        seen.add(num)",
    "    return False",
];

export function BattlePreviewSection() {
    const prefersReducedMotion = useReducedMotion();
    const [timeLeft, setTimeLeft] = useState(847); // 14:07
    const [yourProgress] = useState(65);
    const [opponentProgress] = useState(52);
    const sectionRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    // Only run animations when section is visible
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { threshold: 0.1 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    // Simulate timer countdown only when visible
    useEffect(() => {
        if (prefersReducedMotion || !isVisible) return;
        const interval = setInterval(() => {
            setTimeLeft((t) => (t > 0 ? t - 1 : 847));
        }, 1000);
        return () => clearInterval(interval);
    }, [prefersReducedMotion, isVisible]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const getTimerColor = () => {
        if (timeLeft > 600) return "text-green-400";
        if (timeLeft > 300) return "text-yellow-400";
        return "text-red-400";
    };

    return (
        <section ref={sectionRef} className="border-t border-border px-4 py-24 relative overflow-hidden">
            {/* Simple gradient instead of Spotlight */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />

            <div className="container mx-auto max-w-6xl relative z-10">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center text-3xl font-space font-bold text-foreground mb-4"
                >
                    Experience the Battle
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-center text-muted-foreground mb-16 max-w-md mx-auto"
                >
                    Real-time competitive coding at its finest
                </motion.p>

                <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                    {/* Left: Code Editor Mock */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden"
                    >
                        {/* Editor header */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card/80">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                            </div>
                            <span className="text-xs text-muted-foreground ml-2 font-mono">
                                solution.py
                            </span>
                        </div>

                        {/* Editor content */}
                        <div className="p-4 font-mono text-sm leading-relaxed min-h-[280px]">
                            <div className="text-muted-foreground/60 text-xs mb-3">
                                # Two Sum Problem
                            </div>
                            <pre className="text-foreground whitespace-pre-wrap">
                                {codeLines.join('\n')}
                            </pre>
                            <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-1" />
                        </div>
                    </motion.div>

                    {/* Right: Battle Status */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="space-y-4"
                    >
                        {/* Timer */}
                        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 text-center">
                            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                                Time Remaining
                            </p>
                            <motion.p
                                className={`text-5xl font-bold font-mono ${getTimerColor()}`}
                                animate={
                                    !prefersReducedMotion && timeLeft < 300
                                        ? { scale: [1, 1.02, 1] }
                                        : {}
                                }
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                {formatTime(timeLeft)}
                            </motion.p>
                        </div>

                        {/* Opponent Card */}
                        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                    AK
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-foreground">AlgoKing_42</p>
                                    <p className="text-xs text-muted-foreground">ELO: 1847</p>
                                </div>
                                <motion.div
                                    animate={!prefersReducedMotion ? { opacity: [0.5, 1, 0.5] } : {}}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs"
                                >
                                    solving...
                                </motion.div>
                            </div>
                        </div>

                        {/* Score Bars */}
                        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 space-y-4">
                            {/* Your progress */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-foreground font-medium">You</span>
                                    <span className="text-muted-foreground">{Math.round(yourProgress)}%</span>
                                </div>
                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${yourProgress}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>

                            {/* Opponent progress */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-foreground font-medium">Opponent</span>
                                    <span className="text-muted-foreground">{Math.round(opponentProgress)}%</span>
                                </div>
                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${opponentProgress}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
