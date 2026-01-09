import { memo, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
    name: string;
    icon: string;
    description: string;
    requirement?: string;
    unlocked?: boolean;
    index?: number;
    className?: string;
}

const AchievementBadgeComponent = ({
    name,
    icon,
    description,
    requirement,
    unlocked = false,
    index = 0,
    className,
}: AchievementBadgeProps) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);

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
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className={cn(
                'relative flex flex-col items-center gap-3 rounded-xl border p-4 transition-all duration-500',
                unlocked
                    ? 'border-purple-500/30 bg-card/50 backdrop-blur-sm shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                    : 'border-border/50 bg-card/30 grayscale opacity-60',
                isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-90',
                className
            )}
            style={{ transitionDelay: `${index * 100}ms` }}
        >
            {/* Unlocked glow effect - CSS only */}
            {unlocked && (
                <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 animate-soft-glow" />
            )}

            <span className="text-4xl">{icon}</span>
            <span className={cn(
                'text-sm font-medium text-center',
                unlocked ? 'text-foreground' : 'text-muted-foreground'
            )}>
                {name}
            </span>
            <span className="text-xs text-muted-foreground text-center line-clamp-2">
                {description}
            </span>

            {/* Tooltip with requirement - CSS transition */}
            {requirement && (
                <div
                    className={cn(
                        'absolute -bottom-12 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-background/95 px-3 py-1.5 text-xs text-muted-foreground shadow-lg border border-border transition-all duration-200',
                        showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'
                    )}
                >
                    {unlocked ? '✓ Unlocked' : `🔒 ${requirement}`}
                </div>
            )}
        </div>
    );
};

export const AchievementBadge = memo(AchievementBadgeComponent);
