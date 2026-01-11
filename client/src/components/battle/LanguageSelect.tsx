import { useState } from 'react';
import { ChevronDown, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSelectProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    locked?: boolean;
    className?: string;
}

const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'cpp', label: 'C++' },
    { value: 'java', label: 'Java' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
];

/**
 * LanguageSelect - Simple language dropdown for battle
 * 
 * Features:
 * - Lock icon when battle has started (locked prop)
 * - Confirm modal before changing (when locked)
 * - No animations, pure functionality
 */
export function LanguageSelect({
    value,
    onChange,
    disabled = false,
    locked = false,
    className,
}: LanguageSelectProps) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingValue, setPendingValue] = useState<string | null>(null);

    const handleChange = (newValue: string) => {
        // Always allow language change freely
        onChange(newValue);
    };

    const confirmChange = () => {
        if (pendingValue) {
            onChange(pendingValue);
        }
        setShowConfirm(false);
        setPendingValue(null);
    };

    const cancelChange = () => {
        setShowConfirm(false);
        setPendingValue(null);
    };



    return (
        <div className={cn('relative', className)}>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    disabled={disabled}
                    className={cn(
                        'appearance-none rounded-md border border-border',
                        'bg-[#0b0f1a] [color-scheme:dark]',
                        'px-3 py-1.5 pr-8 text-xs font-medium',
                        'text-foreground cursor-pointer',
                        'focus:outline-none focus:ring-1 focus:ring-primary/50',
                        disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    style={{ colorScheme: 'dark' }}
                >
                    {languages.map((lang) => (
                        <option
                            key={lang.value}
                            value={lang.value}
                            className="bg-[#0b0f1a] text-foreground"
                        >
                            {lang.label}
                        </option>
                    ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1">
                    {locked && <Lock className="h-2.5 w-2.5 text-muted-foreground" />}
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </div>
            </div>

            {/* Confirm Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-lg p-6 max-w-sm mx-4 shadow-xl">
                        <h3 className="text-base font-semibold text-foreground mb-2">
                            Change Language?
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Changing the language will reset your code. This action cannot be undone.
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={cancelChange}
                                className="px-3 py-1.5 text-sm rounded-md border border-border hover:bg-secondary transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmChange}
                                className="px-3 py-1.5 text-sm rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                            >
                                Change Anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
