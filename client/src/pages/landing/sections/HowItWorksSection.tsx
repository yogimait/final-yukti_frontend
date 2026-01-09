"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const steps = [
    {
        number: "01",
        title: "Enter the Arena",
        description: "Create your profile and set your rank",
    },
    {
        number: "02",
        title: "Get Matched Instantly",
        description: "ELO-based matchmaking finds your opponent",
    },
    {
        number: "03",
        title: "Code Under Pressure",
        description: "Solve the same problem, race against time",
    },
    {
        number: "04",
        title: "Win. Rank Up. Repeat.",
        description: "Climb the leaderboard and prove your skills",
    },
];

export function HowItWorksSection() {
    const prefersReducedMotion = useReducedMotion();
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <section className="border-t border-border px-4 py-24 relative">
            <div className="container mx-auto max-w-4xl">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center text-3xl font-space font-bold text-foreground mb-4"
                >
                    How CodeBattle Works
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-center text-muted-foreground mb-16 max-w-md mx-auto"
                >
                    Four simple steps to competitive coding glory
                </motion.p>

                <div ref={containerRef} className="relative">
                    {/* Vertical line connector */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-1/2" />

                    {/* Animated line fill */}
                    <motion.div
                        className="absolute left-8 md:left-1/2 top-0 w-px bg-gradient-to-b from-primary via-primary to-transparent md:-translate-x-1/2"
                        initial={{ height: 0 }}
                        whileInView={{ height: "100%" }}
                        viewport={{ once: true }}
                        transition={{
                            duration: prefersReducedMotion ? 0 : 2,
                            ease: "easeOut"
                        }}
                    />

                    {/* Steps */}
                    <div className="space-y-12 md:space-y-16">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: prefersReducedMotion ? 0 : 0.5,
                                    delay: prefersReducedMotion ? 0 : index * 0.15,
                                }}
                                className={`relative flex items-start gap-6 md:gap-12 ${index % 2 === 0
                                        ? "md:flex-row"
                                        : "md:flex-row-reverse"
                                    }`}
                            >
                                {/* Number badge */}
                                <motion.div
                                    className="relative z-10 flex-shrink-0 w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center"
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: "0 0 20px rgba(59, 130, 246, 0.2)"
                                    }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <span className="text-lg font-bold text-primary font-space">
                                        {step.number}
                                    </span>
                                </motion.div>

                                {/* Content */}
                                <div className={`flex-1 pt-3 ${index % 2 === 0
                                        ? "md:text-left"
                                        : "md:text-right"
                                    }`}>
                                    <h3 className="text-xl font-semibold text-foreground mb-2 font-space">
                                        {step.title}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Spacer for alternating layout */}
                                <div className="hidden md:block flex-1" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
