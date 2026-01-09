import { memo, useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    className?: string;
}

// Optimized counter using requestAnimationFrame instead of Framer Motion springs
const AnimatedCounterComponent = ({
    value,
    duration = 1.5,
    prefix = '',
    suffix = '',
    className,
}: AnimatedCounterProps) => {
    const [displayValue, setDisplayValue] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (hasAnimated) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                    animateValue(0, value, duration * 1000);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [value, duration, hasAnimated]);

    const animateValue = (start: number, end: number, durationMs: number) => {
        const startTime = performance.now();

        const step = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / durationMs, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * eased);

            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    };

    return (
        <span ref={ref} className={cn('tabular-nums', className)}>
            {prefix}{displayValue}{suffix}
        </span>
    );
};

export const AnimatedCounter = memo(AnimatedCounterComponent);
