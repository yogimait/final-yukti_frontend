"use client";
import { motion, useReducedMotion } from "framer-motion";
import { Shield, Code, Box, CheckCircle } from "lucide-react";

const trustPoints = [
    { icon: Code, label: "Your Code" },
    { icon: Box, label: "Docker Container" },
    { icon: CheckCircle, label: "Secure Result" },
];

export function TrustSection() {
    const prefersReducedMotion = useReducedMotion();

    return (
        <section className="border-t border-border px-4 py-24 relative">
            <div className="container mx-auto max-w-4xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    {/* Animated Shield */}
                    <motion.div
                        className="inline-block mb-6"
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                            <motion.div
                                initial={{ pathLength: 0 }}
                                whileInView={{ pathLength: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: prefersReducedMotion ? 0 : 1, delay: 0.3 }}
                            >
                                <Shield className="w-10 h-10 text-primary" />
                            </motion.div>
                        </div>
                    </motion.div>

                    <h2 className="text-3xl font-space font-bold text-foreground mb-4">
                        Built for Serious Coders
                    </h2>
                    <p className="text-2xl text-muted-foreground font-space">
                        No cheating. No lag. No luck.
                    </p>
                </motion.div>

                {/* Flow Diagram */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0"
                >
                    {trustPoints.map((point, index) => (
                        <motion.div
                            key={point.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: prefersReducedMotion ? 0 : 0.4,
                                delay: prefersReducedMotion ? 0 : 0.3 + index * 0.15,
                            }}
                            className="flex items-center"
                        >
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-xl bg-card border border-border flex items-center justify-center mb-3">
                                    <point.icon className="w-7 h-7 text-primary" />
                                </div>
                                <span className="text-sm text-muted-foreground text-center">
                                    {point.label}
                                </span>
                            </div>

                            {/* Arrow connector */}
                            {index < trustPoints.length - 1 && (
                                <motion.div
                                    initial={{ opacity: 0, scaleX: 0 }}
                                    whileInView={{ opacity: 1, scaleX: 1 }}
                                    viewport={{ once: true }}
                                    transition={{
                                        duration: prefersReducedMotion ? 0 : 0.3,
                                        delay: prefersReducedMotion ? 0 : 0.5 + index * 0.15,
                                    }}
                                    className="hidden md:block w-16 h-px bg-gradient-to-r from-primary/50 to-primary mx-4 origin-left"
                                />
                            )}
                        </motion.div>
                    ))}
                </motion.div>

                {/* Trust badges */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex flex-wrap justify-center gap-4 mt-12"
                >
                    {["Judge0 Sandbox", "Isolated Containers", "Fair Matchmaking"].map(
                        (badge) => (
                            <span
                                key={badge}
                                className="px-4 py-2 rounded-full border border-border bg-card/50 text-sm text-muted-foreground"
                            >
                                {badge}
                            </span>
                        )
                    )}
                </motion.div>
            </div>
        </section>
    );
}
