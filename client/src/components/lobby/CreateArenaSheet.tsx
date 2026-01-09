"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { X, Swords, Users, Lock, Globe, Zap, Shield, Skull } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface CreateArenaSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: ArenaFormData) => void;
}

export interface ArenaFormData {
    name: string;
    mode: "1v1" | "squad";
    maxPlayers: number;
    privacy: "public" | "private";
    difficulty: "easy" | "medium" | "hard";
}

const modeOptions = [
    { value: "1v1", label: "1v1 Duel", icon: Swords, description: "Head to head battle" },
    { value: "squad", label: "Squad", icon: Users, description: "Team battle up to 5" }
];

const privacyOptions = [
    { value: "public", label: "Public", icon: Globe, description: "Anyone can join" },
    { value: "private", label: "Private", icon: Lock, description: "Invite only" }
];

const difficultyOptions = [
    { value: "easy", label: "Easy", icon: Zap, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30" },
    { value: "medium", label: "Medium", icon: Shield, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
    { value: "hard", label: "Hard", icon: Skull, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" }
];

export function CreateArenaSheet({ isOpen, onClose, onCreate }: CreateArenaSheetProps) {
    const [formData, setFormData] = useState<ArenaFormData>({
        name: "",
        mode: "1v1",
        maxPlayers: 2,
        privacy: "public",
        difficulty: "medium"
    });

    const handleSubmit = () => {
        if (formData.name.trim()) {
            onCreate(formData);
            onClose();
        }
    };

    const maxPlayerOptions = formData.mode === "1v1" ? [2] : [2, 3, 4, 5];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop with blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Sheet panel sliding from right */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{
                            type: "spring",
                            damping: 30,
                            stiffness: 300
                        }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border z-50 overflow-y-auto"
                    >
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">Create Arena</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Set the rules for your battle</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-secondary transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <div className="space-y-6">
                                {/* Arena Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Arena Name</label>
                                    <Input
                                        placeholder="e.g. Quick Battle"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-background"
                                        autoFocus
                                    />
                                </div>

                                {/* Mode Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Battle Mode</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {modeOptions.map((option) => {
                                            const Icon = option.icon;
                                            const isActive = formData.mode === option.value;
                                            return (
                                                <button
                                                    key={option.value}
                                                    onClick={() => setFormData({
                                                        ...formData,
                                                        mode: option.value as "1v1" | "squad",
                                                        maxPlayers: option.value === "1v1" ? 2 : 4
                                                    })}
                                                    className={cn(
                                                        "relative p-4 rounded-lg border transition-all text-left",
                                                        isActive
                                                            ? "border-primary bg-primary/10"
                                                            : "border-border hover:border-primary/50 hover:bg-secondary/50"
                                                    )}
                                                >
                                                    <Icon className={cn("w-5 h-5 mb-2", isActive && "text-primary")} />
                                                    <div className="font-medium">{option.label}</div>
                                                    <div className="text-xs text-muted-foreground">{option.description}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Max Players (only for squad) */}
                                {formData.mode === "squad" && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Max Players</label>
                                        <div className="flex gap-2">
                                            {maxPlayerOptions.map((num) => (
                                                <button
                                                    key={num}
                                                    onClick={() => setFormData({ ...formData, maxPlayers: num })}
                                                    className={cn(
                                                        "flex-1 py-2 rounded-lg border font-medium transition-all",
                                                        formData.maxPlayers === num
                                                            ? "border-primary bg-primary/10 text-primary"
                                                            : "border-border hover:border-primary/50"
                                                    )}
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Privacy */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Privacy</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {privacyOptions.map((option) => {
                                            const Icon = option.icon;
                                            const isActive = formData.privacy === option.value;
                                            return (
                                                <button
                                                    key={option.value}
                                                    onClick={() => setFormData({ ...formData, privacy: option.value as "public" | "private" })}
                                                    className={cn(
                                                        "flex items-center gap-3 p-3 rounded-lg border transition-all",
                                                        isActive
                                                            ? "border-primary bg-primary/10"
                                                            : "border-border hover:border-primary/50"
                                                    )}
                                                >
                                                    <Icon className={cn("w-4 h-4", isActive && "text-primary")} />
                                                    <div className="text-left">
                                                        <div className="font-medium text-sm">{option.label}</div>
                                                        <div className="text-xs text-muted-foreground">{option.description}</div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Difficulty */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Difficulty</label>
                                    <div className="flex gap-2">
                                        {difficultyOptions.map((option) => {
                                            const Icon = option.icon;
                                            const isActive = formData.difficulty === option.value;
                                            return (
                                                <button
                                                    key={option.value}
                                                    onClick={() => setFormData({ ...formData, difficulty: option.value as "easy" | "medium" | "hard" })}
                                                    className={cn(
                                                        "flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
                                                        isActive
                                                            ? `${option.border} ${option.bg}`
                                                            : "border-border hover:border-primary/50"
                                                    )}
                                                >
                                                    <Icon className={cn("w-5 h-5", isActive ? option.color : "text-muted-foreground")} />
                                                    <span className={cn(
                                                        "text-sm font-medium",
                                                        isActive ? option.color : "text-muted-foreground"
                                                    )}>
                                                        {option.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="mt-8 pt-6 border-t border-border">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!formData.name.trim()}
                                    className="w-full"
                                    size="lg"
                                >
                                    Create Arena
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
