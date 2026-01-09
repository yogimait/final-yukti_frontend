import { memo, useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
    label: string;
    value: number;
    maxValue?: number;
    description?: string;
    color?: 'purple' | 'blue' | 'green' | 'orange';
    className?: string;
}

const colorStyles = {
    purple: 'from-purple-500 to-violet-600',
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-amber-500',
};

const ProgressBarComponent = ({
    label,
    value,
    maxValue = 100,
    description,
    color = 'purple',
    className,
}: ProgressBarProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);
    const percentage = Math.min((value / maxValue) * 100, 100);

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
        <div ref={ref} className={cn('space-y-2', className)}>
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{label}</span>
                <span className="text-sm font-bold text-muted-foreground">{value}%</span>
            </div>

            <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                    className={cn(
                        'absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all duration-1000 ease-out will-change-[width]',
                        colorStyles[color]
                    )}
                    style={{ width: isInView ? `${percentage}%` : '0%' }}
                />
            </div>

            {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
            )}
        </div>
    );
};

export const ProgressBar = memo(ProgressBarComponent);
