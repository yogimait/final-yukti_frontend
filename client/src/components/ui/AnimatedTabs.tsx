"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";

interface FilterOption {
    value: string;
    label: string;
    icon?: React.ReactNode;
}

interface AnimatedTabsProps {
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function AnimatedTabs({ options, value, onChange, className }: AnimatedTabsProps) {
    return (
        <div className={cn("relative flex items-center gap-1 p-1 rounded-lg bg-card/50 border border-border", className)}>
            {options.map((option) => {
                const isActive = value === option.value;
                return (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            "relative z-10 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200",
                            isActive
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="active-pill"
                                className="absolute inset-0 bg-primary/15 rounded-md"
                                initial={false}
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30
                                }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                            {option.icon}
                            {option.label}
                        </span>
                        {isActive && (
                            <motion.div
                                layoutId="active-underline"
                                className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-primary rounded-full"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 25
                                }}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
}

interface FilterBarProps {
    modeFilter: string;
    statusFilter: string;
    skillFilter: boolean;
    onModeChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onSkillChange: (value: boolean) => void;
    onReset: () => void;
}

export function FilterBar({
    modeFilter,
    statusFilter,
    skillFilter,
    onModeChange,
    onStatusChange,
    onSkillChange,
    onReset
}: FilterBarProps) {
    const modeOptions: FilterOption[] = [
        { value: "all", label: "All" },
        { value: "1v1", label: "1v1" },
        { value: "squad", label: "Squad" }
    ];

    const statusOptions: FilterOption[] = [
        { value: "all", label: "All" },
        { value: "open", label: "Open" },
        { value: "almost", label: "Almost Full" },
        { value: "full", label: "Full" }
    ];

    const isDefaultState = modeFilter === "all" && statusFilter === "open" && skillFilter === true;

    return (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3">
                {/* Mode Filter */}
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Mode</span>
                    <AnimatedTabs
                        options={modeOptions}
                        value={modeFilter}
                        onChange={onModeChange}
                    />
                </div>

                {/* Status Filter */}
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Status</span>
                    <AnimatedTabs
                        options={statusOptions}
                        value={statusFilter}
                        onChange={onStatusChange}
                    />
                </div>

                {/* Skill Filter - Near My ELO */}
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Skill</span>
                    <button
                        onClick={() => onSkillChange(!skillFilter)}
                        className={cn(
                            "relative px-3 py-1.5 text-sm font-medium rounded-lg border transition-all duration-200",
                            skillFilter
                                ? "bg-primary/15 border-primary/50 text-foreground"
                                : "bg-card/50 border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                        )}
                    >
                        <span className="flex items-center gap-1.5">
                            <span className={cn(
                                "text-xs transition-transform duration-200",
                                skillFilter && "animate-pulse"
                            )}>🔥</span>
                            Near My ELO
                        </span>
                        {skillFilter && (
                            <motion.div
                                layoutId="skill-glow"
                                className="absolute inset-0 rounded-lg opacity-20"
                                style={{
                                    boxShadow: "0 0 12px hsl(var(--primary))"
                                }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.2 }}
                            />
                        )}
                    </button>
                </div>
            </div>

            {/* Reset Filters */}
            {!isDefaultState && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={onReset}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    <RotateCcw className="w-3 h-3" />
                    Reset filters
                </motion.button>
            )}
        </div>
    );
}
