import { memo, useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type MatchResult = 'win' | 'loss';
type MatchType = 'ranked' | 'unranked' | 'practice';

interface BattleCardProps {
    opponent: string;
    opponentInitial?: string;
    result: MatchResult;
    eloChange: number;
    timeAgo: string;
    matchType?: MatchType;
    index?: number;
    className?: string;
}

const resultStyles: Record<MatchResult, { glow: string; badge: string; text: string }> = {
    win: {
        glow: 'hover:shadow-[0_0_20px_rgba(34,197,94,0.15)]',
        badge: 'bg-green-500/20 text-green-400 border-green-500/30',
        text: 'text-green-500',
    },
    loss: {
        glow: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]',
        badge: 'bg-red-500/20 text-red-400 border-red-500/30',
        text: 'text-red-500',
    },
};

const matchTypeStyles: Record<MatchType, { bg: string; text: string }> = {
    ranked: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
    unranked: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
    practice: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
};

const BattleCardComponent = ({
    opponent,
    opponentInitial,
    result,
    eloChange,
    timeAgo,
    matchType = 'ranked',
    index = 0,
    className,
}: BattleCardProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);
    const style = resultStyles[result];
    const typeStyle = matchTypeStyles[matchType];

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={cn(
                'group relative flex items-center justify-between rounded-xl border border-border bg-card/50 p-4 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:-translate-y-1',
                style.glow,
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5',
                className
            )}
            style={{ transitionDelay: `${index * 100}ms` }}
        >
            {/* Left: Opponent info */}
            <div className="flex items-center gap-4">
                {/* Opponent avatar */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/50 to-blue-500/50 text-sm font-bold text-white">
                    {opponentInitial || opponent.charAt(0).toUpperCase()}
                </div>

                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">vs {opponent}</span>
                        {/* Match type chip */}
                        <span className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
                            typeStyle.bg,
                            typeStyle.text
                        )}>
                            {matchType}
                        </span>
                    </div>
                    <span className="text-sm text-muted-foreground">{timeAgo}</span>
                </div>
            </div>

            {/* Right: Result */}
            <div className="flex flex-col items-end gap-1">
                <span className={cn('font-bold', style.text)}>
                    {eloChange > 0 ? '+' : ''}{eloChange} ELO
                </span>
                <ResultBadge result={result} />
            </div>
        </div>
    );
};

interface ResultBadgeProps {
    result: MatchResult;
    className?: string;
}

const ResultBadgeComponent = ({ result, className }: ResultBadgeProps) => {
    const style = resultStyles[result];

    return (
        <span className={cn(
            'rounded-full border px-2 py-0.5 text-xs font-medium uppercase tracking-wider',
            style.badge,
            className
        )}>
            {result}
        </span>
    );
};

export const BattleCard = memo(BattleCardComponent);
export const ResultBadge = memo(ResultBadgeComponent);
