import { memo, useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Milestone {
    id: string;
    icon: string;
    label: string;
    value: string;
    isCurrent?: boolean;
}

interface TimelineProps {
    milestones: Milestone[];
    className?: string;
}

const TimelineComponent = ({ milestones, className }: TimelineProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
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

        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className={cn('relative w-full overflow-x-auto py-8', className)}>
            <div className="flex items-center justify-between min-w-max px-4 gap-4">
                {milestones.map((milestone, index) => (
                    <div key={milestone.id} className="flex items-center">
                        <MilestoneCard
                            milestone={milestone}
                            index={index}
                            isInView={isInView}
                        />
                        {index < milestones.length - 1 && (
                            <AnimatedLine isInView={isInView} delay={index * 150} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

interface MilestoneCardProps {
    milestone: Milestone;
    index: number;
    isInView: boolean;
}

const MilestoneCardComponent = ({ milestone, index, isInView }: MilestoneCardProps) => {
    return (
        <div
            className={cn(
                'relative flex flex-col items-center gap-2 rounded-xl border bg-card/50 backdrop-blur-sm p-4 transition-all duration-500',
                milestone.isCurrent
                    ? 'border-purple-500/50 shadow-[0_0_20px_rgba(139,92,246,0.2)] scale-110'
                    : 'border-border hover:border-muted-foreground/30',
                isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            )}
            style={{ transitionDelay: `${100 + index * 150}ms` }}
        >
            {/* "Now" badge for current milestone */}
            {milestone.isCurrent && (
                <span
                    className={cn(
                        'absolute -top-2 -right-2 rounded-full bg-purple-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white transition-all duration-300',
                        isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                    )}
                    style={{ transitionDelay: `${500 + index * 150}ms` }}
                >
                    Now
                </span>
            )}

            <span className="text-2xl">{milestone.icon}</span>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {milestone.label}
            </span>
            <span className={cn(
                'font-bold',
                milestone.isCurrent ? 'text-lg text-purple-400' : 'text-sm text-foreground'
            )}>
                {milestone.value}
            </span>
        </div>
    );
};

interface AnimatedLineProps {
    isInView: boolean;
    delay: number;
}

const AnimatedLineComponent = ({ isInView, delay }: AnimatedLineProps) => {
    return (
        <div className="relative mx-2 h-0.5 w-16 overflow-hidden bg-border/30">
            <div
                className={cn(
                    'absolute inset-0 origin-left bg-gradient-to-r from-purple-500 to-blue-500 transition-transform duration-800 ease-out',
                    isInView ? 'scale-x-100' : 'scale-x-0'
                )}
                style={{ transitionDelay: `${300 + delay}ms` }}
            />
        </div>
    );
};

export const Timeline = memo(TimelineComponent);
export const MilestoneCard = memo(MilestoneCardComponent);
export const AnimatedLine = memo(AnimatedLineComponent);
