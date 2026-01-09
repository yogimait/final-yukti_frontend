"use client";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function FinalCTASection() {
    const prefersReducedMotion = useReducedMotion();

    return (
        <section className="border-t border-border px-4 py-32 relative overflow-hidden">
            {/* Simple radial gradient instead of SparklesCore */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

            <div className="container mx-auto max-w-2xl text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-4xl font-space font-bold text-foreground mb-2">
                        Stop practicing alone.
                    </h2>
                    <h2 className="text-3xl md:text-4xl font-space font-bold text-muted-foreground mb-8">
                        Start competing.
                    </h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Link to="/signup">
                        <Button
                            size="lg"
                            className={`font-space text-base px-8 ${!prefersReducedMotion ? 'animate-soft-glow' : ''}`}
                            style={{
                                boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)'
                            }}
                        >
                            Enter the Arena
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-6 text-sm text-muted-foreground"
                >
                    Join 10,000+ developers competing daily
                </motion.p>
            </div>
        </section>
    );
}

