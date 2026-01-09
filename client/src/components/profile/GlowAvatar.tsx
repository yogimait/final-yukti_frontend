import { memo } from 'react';
import { cn } from '@/lib/utils';

type Status = 'online' | 'inMatch' | 'offline';
type Rank = 'gold' | 'silver' | 'bronze' | 'unranked';

interface GlowAvatarProps {
    initial: string;
    name: string;
    rank?: Rank;
    status?: Status;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const rankColors: Record<Rank, { glow: string; ring: string }> = {
    gold: {
        glow: 'shadow-[0_0_30px_rgba(255,215,0,0.25)]',
        ring: 'from-yellow-400 via-amber-500 to-yellow-600',
    },
    silver: {
        glow: 'shadow-[0_0_30px_rgba(192,192,192,0.25)]',
        ring: 'from-gray-300 via-slate-400 to-gray-500',
    },
    bronze: {
        glow: 'shadow-[0_0_30px_rgba(205,127,50,0.25)]',
        ring: 'from-orange-400 via-amber-600 to-orange-700',
    },
    unranked: {
        glow: 'shadow-[0_0_20px_rgba(139,92,246,0.2)]',
        ring: 'from-purple-500 via-violet-600 to-purple-700',
    },
};

const statusStyles: Record<Status, string> = {
    online: 'ring-green-500 animate-status-pulse',
    inMatch: 'ring-purple-500 animate-status-rotate',
    offline: 'ring-transparent',
};

const sizeStyles = {
    sm: 'h-16 w-16 text-xl',
    md: 'h-24 w-24 text-3xl',
    lg: 'h-32 w-32 text-4xl',
};

// Use CSS animations instead of Framer Motion for better performance
const GlowAvatarComponent = ({
    initial,
    name,
    rank = 'unranked',
    status = 'offline',
    size = 'lg',
    className,
}: GlowAvatarProps) => {
    const rankStyle = rankColors[rank];
    const statusStyle = statusStyles[status];

    return (
        <div className={cn('relative', className)}>
            {/* Status ring (outer) - CSS animation only */}
            <div
                className={cn(
                    'absolute -inset-1.5 rounded-full ring-2 will-change-[opacity,transform]',
                    statusStyle,
                    status === 'inMatch' && 'border-dashed'
                )}
            />

            {/* Rank glow ring (inner) - CSS animation only */}
            <div
                className={cn(
                    'relative flex items-center justify-center rounded-full border-4 border-background bg-gradient-to-br font-bold text-white will-change-[box-shadow] animate-avatar-glow',
                    sizeStyles[size],
                    rankStyle.ring,
                    rankStyle.glow
                )}
                title={name}
            >
                {initial.charAt(0).toUpperCase()}
            </div>
        </div>
    );
};

// Memoize to prevent unnecessary re-renders
export const GlowAvatar = memo(GlowAvatarComponent);
