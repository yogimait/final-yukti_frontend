import { Clock } from 'lucide-react';
import { useCountdown } from '@/hooks';
import { cn } from '@/lib/utils';

interface BattleTimerProps {
    initialSeconds: number;
    onComplete?: () => void;
    autoStart?: boolean;
    className?: string;
}

/**
 * BattleTimer - Performance-focused timer with CSS-only animations
 * 
 * Animation States:
 * - Normal (>60s): Static display
 * - Warning (<60s): Subtle pulse every 5s
 * - Critical (<10s): Color shift yellow → red, aria-live announcement
 */
export function BattleTimer({
    initialSeconds,
    onComplete,
    autoStart = true,
    className,
}: BattleTimerProps) {
    const { formatted, seconds, isComplete } = useCountdown(initialSeconds, {
        onComplete,
        autoStart,
    });

    const isWarning = seconds <= 60 && seconds > 10 && !isComplete;
    const isCritical = seconds <= 10 && !isComplete;

    return (
        <div
            className={cn(
                'flex items-center gap-2 rounded-md border px-3 py-1.5',
                'border-border bg-card',
                isCritical && 'border-red-500/50 bg-red-500/5',
                isWarning && 'border-yellow-500/30',
                className
            )}
            // Accessibility: announce when critical
            role={isCritical ? 'alert' : undefined}
            aria-live={isCritical ? 'polite' : undefined}
            aria-atomic={isCritical ? 'true' : undefined}
        >
            <Clock
                className={cn(
                    'h-3.5 w-3.5',
                    isCritical ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-muted-foreground'
                )}
            />
            <span
                className={cn(
                    'font-mono text-sm font-bold tabular-nums',
                    // CSS-only animations - no Framer Motion
                    isCritical && 'timer-critical',
                    isWarning && !isCritical && 'timer-warning text-yellow-500'
                )}
            >
                {formatted}
            </span>
        </div>
    );
}
