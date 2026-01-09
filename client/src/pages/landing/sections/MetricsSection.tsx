"use client";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Clock, Swords, TrendingUp } from "lucide-react";

const metrics = [
    {
        icon: Clock,
        value: 28,
        suffix: " min",
        label: "Avg Match Time",
    },
    {
        icon: Swords,
        value: 92,
        suffix: "%",
        label: "Decided by Optimization",
    },
    {
        icon: TrendingUp,
        value: 100,
        suffix: "%",
        label: "Real-time ELO",
        isRealtime: true,
    },
];

function AnimatedCounter({
    value,
    suffix,
    isRealtime,
    delay = 0
}: {
    value: number;
    suffix: string;
    isRealtime?: boolean;
    delay?: number;
}) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });
    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        if (!isInView) return;
        if (prefersReducedMotion) {
            setCount(value);
            return;
        }

        const timeout = setTimeout(() => {
            const duration = 1500;
            const steps = 60;
            const increment = value / steps;
            let current = 0;

            const interval = setInterval(() => {
                current += increment;
                if (current >= value) {
                    setCount(value);
                    clearInterval(interval);
                } else {
                    setCount(Math.floor(current));
                }
            }, duration / steps);

            return () => clearInterval(interval);
        }, delay);

        return () => clearTimeout(timeout);
    }, [isInView, value, delay, prefersReducedMotion]);

    return (
        <span ref={ref} className="tabular-nums">
            {isRealtime ? "Real-time" : `${count}${suffix}`}
        </span>
    );
}

export function MetricsSection() {
    const prefersReducedMotion = useReducedMotion();

    return (
        <section className="border-t border-border px-4 py-24 relative overflow-hidden">
            {/* Simple gradient background instead of BackgroundBeams */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />

            <div className="container mx-auto max-w-5xl relative z-10">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center text-3xl font-space font-bold text-foreground mb-4"
                >
                    Why This Is Different
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-center text-muted-foreground mb-16 max-w-md mx-auto"
                >
                    Numbers that speak for themselves
                </motion.p>

                <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                    {metrics.map((metric, index) => (
                        <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: prefersReducedMotion ? 0 : 0.5,
                                delay: prefersReducedMotion ? 0 : index * 0.15,
                            }}
                            whileHover={{
                                boxShadow: "0 0 30px rgba(59, 130, 246, 0.15)",
                            }}
                            className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-8 text-center transition-colors hover:border-primary/30"
                        >
                            <metric.icon className="w-8 h-8 text-primary mx-auto mb-4" />
                            <p className="text-4xl md:text-5xl font-bold text-foreground mb-2 font-space">
                                <AnimatedCounter
                                    value={metric.value}
                                    suffix={metric.suffix}
                                    isRealtime={metric.isRealtime}
                                    delay={index * 150}
                                />
                            </p>
                            <p className="text-muted-foreground text-sm">
                                {metric.label}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
