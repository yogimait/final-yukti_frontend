import { memo, useState } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'elo' | 'rank' | 'winrate';

interface RankBadgeProps {
    label: string;
    value: string | number;
    variant: BadgeVariant;
    className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; tooltip: string }> = {
    elo: {
        bg: 'bg-gradient-to-r from-purple-600/20 to-violet-600/20 border-purple-500/30',
        text: 'text-purple-400',
        tooltip: 'Calculated after every ranked match',
    },
    rank: {
        bg: 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-blue-500/30',
        text: 'text-blue-400',
        tooltip: 'Global leaderboard position',
    },
    winrate: {
        bg: 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30',
        text: 'text-green-400',
        tooltip: 'Last 50 matches',
    },
};

const RankBadgeComponent = ({ label, value, variant, className }: RankBadgeProps) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const style = variantStyles[variant];

    return (
        <div
            className={cn('relative', className)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <div
                className={cn(
                    'flex flex-col items-center gap-1 rounded-xl border px-4 py-2 backdrop-blur-sm transition-transform hover:scale-105',
                    style.bg
                )}
            >
                <span className={cn('text-2xl font-bold', style.text)}>{value}</span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
            </div>

            {/* Tooltip - CSS only */}
            <div
                className={cn(
                    'absolute -bottom-10 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-background/95 px-3 py-1.5 text-xs text-muted-foreground shadow-lg border border-border transition-all duration-200',
                    showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'
                )}
            >
                {style.tooltip}
            </div>
        </div>
    );
};

export const RankBadge = memo(RankBadgeComponent);
