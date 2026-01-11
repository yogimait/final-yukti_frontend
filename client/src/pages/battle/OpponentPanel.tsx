import { memo, useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import type { User } from '@/types/user';
import { cn } from '@/lib/utils';

type OpponentStatus = 'idle' | 'typing' | 'running' | 'submitted';

interface OpponentProgress {
    testsPassed: number;
    totalTests: number;
}

interface OpponentPanelProps {
    opponent: User;
    status?: OpponentStatus;
    progress?: OpponentProgress;
    className?: string;
}

/**
 * OpponentPanel - Minimal awareness panel
 * 
 * Content:
 * - Avatar + Name + ELO
 * - Status: Typing..., Running tests..., Submitted
 * - Progress: X/Y tests passed (optional)
 * 
 * Visual Language:
 * | State     | Effect                     |
 * | --------- | -------------------------- |
 * | Typing    | Static text                |
 * | Running   | Single spinner             |
 * | Submitted | Green check (one-time pop) |
 * 
 * No live progress bars
 * No typing animation for opponent
 */
function OpponentPanelComponent({
    opponent,
    status = 'idle',
    progress,
    className,
}: OpponentPanelProps) {
    const [showCheckPop, setShowCheckPop] = useState(false);

    // One-time pop animation for submitted state
    useEffect(() => {
        if (status === 'submitted') {
            setShowCheckPop(true);
        }
    }, [status]);

    return (
        <div
            className={cn(
                'flex flex-col p-3 bg-card border-l border-border h-full',
                className
            )}
        >
            {/* Opponent Info */}
            <div className="flex items-center gap-3 mb-4">
                {/* Avatar */}
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20 flex-shrink-0">
                    {opponent.avatar ? (
                        <img
                            src={opponent.avatar}
                            alt={opponent.username}
                            className="h-full w-full rounded-lg object-cover"
                        />
                    ) : (
                        <span className="text-base font-bold text-foreground">
                            {opponent.username.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>

                {/* Name & ELO */}
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">
                        {opponent.username}
                    </h3>
                    <p className="text-xs text-muted-foreground tabular-nums">
                        {opponent.elo} ELO
                    </p>
                </div>
            </div>

            {/* Status */}
            <div className="mt-auto">
                <div className="rounded-lg border border-border bg-background p-3">
                    <div className="flex items-center gap-2">
                        {status === 'idle' && (
                            <>
                                <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Idle</span>
                            </>
                        )}

                        {status === 'typing' && (
                            <>
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                <span className="text-xs text-foreground">Typing...</span>
                            </>
                        )}

                        {status === 'running' && (
                            <>
                                <Loader2 className="h-3 w-3 text-yellow-500 animate-simple-spin" />
                                <span className="text-xs text-foreground">Running tests...</span>
                            </>
                        )}

                        {status === 'submitted' && (
                            <>
                                <div
                                    className={cn(
                                        'flex h-4 w-4 items-center justify-center rounded-full bg-green-500',
                                        showCheckPop && 'animate-check-pop'
                                    )}
                                >
                                    <Check className="h-2.5 w-2.5 text-white" />
                                </div>
                                <span className="text-xs text-green-500 font-medium">Submitted</span>
                            </>
                        )}
                    </div>

                    {/* Progress indicator */}
                    {progress && progress.totalTests > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Tests</span>
                                <span className={cn(
                                    'font-medium tabular-nums',
                                    progress.testsPassed === progress.totalTests
                                        ? 'text-green-500'
                                        : 'text-foreground'
                                )}>
                                    {progress.testsPassed}/{progress.totalTests}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Memoized OpponentPanel to prevent unnecessary re-renders
 */
export const OpponentPanel = memo(OpponentPanelComponent, (prevProps, nextProps) => {
    return (
        prevProps.opponent.id === nextProps.opponent.id &&
        prevProps.opponent.elo === nextProps.opponent.elo &&
        prevProps.status === nextProps.status &&
        prevProps.progress?.testsPassed === nextProps.progress?.testsPassed &&
        prevProps.progress?.totalTests === nextProps.progress?.totalTests
    );
});

