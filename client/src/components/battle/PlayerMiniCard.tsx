import { cn } from '@/lib/utils';
import { User as UserIcon } from 'lucide-react';
import type { User } from '@/types/user';

interface PlayerMiniCardProps {
    player: User;
    isCurrentUser?: boolean;
    className?: string;
}

/**
 * PlayerMiniCard - Compact player display for the 56px battle top bar
 * No animations, purely static display for performance
 */
export function PlayerMiniCard({
    player,
    isCurrentUser = false,
    className,
}: PlayerMiniCardProps) {
    return (
        <div
            className={cn(
                'flex items-center gap-2 rounded-md px-2 py-1.5',
                isCurrentUser && 'bg-primary/5 border border-primary/20',
                !isCurrentUser && 'bg-card border border-border',
                className
            )}
        >
            {/* Avatar */}
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary flex-shrink-0">
                {player.avatar ? (
                    <img
                        src={player.avatar}
                        alt={player.username}
                        className="h-full w-full rounded-md object-cover"
                    />
                ) : (
                    <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                )}
            </div>

            {/* Info */}
            <div className="text-left min-w-0">
                <p className="text-xs font-medium text-foreground truncate max-w-[80px]">
                    {player.username}
                    {isCurrentUser && (
                        <span className="ml-1 text-[10px] text-muted-foreground">(you)</span>
                    )}
                </p>
                <p className="text-[10px] text-muted-foreground tabular-nums">
                    {player.elo} ELO
                </p>
            </div>
        </div>
    );
}
