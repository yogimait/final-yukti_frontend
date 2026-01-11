import { useState, useEffect, useRef } from 'react';
import { PenTool, MessageCircle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomActionBarProps {
    onWhiteboardClick: () => void;
    onChatClick?: () => void;
    onHintsClick?: () => void;
    unreadCount?: number;
    className?: string;
}

/**
 * BottomActionBar - Floating action bar for battle tools
 * 
 * Features:
 * - Auto-fades to 60% opacity after 5-7s of inactivity
 * - Reappears on mouse move
 * - Button hover: scale 1.03
 * - No glow loops
 * - Unread indicator on chat button
 */
export function BottomActionBar({
    onWhiteboardClick,
    onChatClick,
    onHintsClick,
    unreadCount = 0,
    className,
}: BottomActionBarProps) {
    const [isFaded, setIsFaded] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const barRef = useRef<HTMLDivElement>(null);

    // Auto-fade after 6 seconds of inactivity
    const resetFadeTimer = () => {
        setIsFaded(false);
        setIsActive(true);

        if (fadeTimeoutRef.current) {
            clearTimeout(fadeTimeoutRef.current);
        }

        fadeTimeoutRef.current = setTimeout(() => {
            setIsFaded(true);
            setIsActive(false);
        }, 6000); // 6 seconds
    };

    useEffect(() => {
        // Start the fade timer on mount
        resetFadeTimer();

        // Listen for mouse movement in the viewport
        const handleMouseMove = () => {
            resetFadeTimer();
        };

        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            if (fadeTimeoutRef.current) {
                clearTimeout(fadeTimeoutRef.current);
            }
        };
    }, []);

    const handleBarInteraction = () => {
        resetFadeTimer();
    };

    return (
        <div
            ref={barRef}
            className={cn(
                'action-bar fixed bottom-6 left-1/2 -translate-x-1/2 z-40',
                'flex items-center gap-2 rounded-full border border-border bg-card/95 backdrop-blur-sm',
                'px-4 py-2 shadow-lg',
                isFaded && 'faded',
                isActive && 'active',
                className
            )}
            onMouseEnter={handleBarInteraction}
            onFocus={handleBarInteraction}
        >
            {/* Whiteboard Button */}
            <button
                onClick={() => {
                    resetFadeTimer();
                    onWhiteboardClick();
                }}
                className="action-btn flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                aria-label="Open Whiteboard"
            >
                <PenTool className="h-4 w-4" />
                <span className="hidden sm:inline">Whiteboard</span>
            </button>

            <div className="h-4 w-px bg-border" />

            {/* Chat Button */}
            <button
                onClick={() => {
                    resetFadeTimer();
                    onChatClick?.();
                }}
                className="action-btn relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                aria-label="Open Chat"
            >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Chat</span>
                {/* Unread indicator */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <div className="h-4 w-px bg-border" />

            {/* Hints Button (Future) */}
            <button
                onClick={() => {
                    resetFadeTimer();
                    onHintsClick?.();
                }}
                className="action-btn flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors cursor-not-allowed opacity-50"
                aria-label="Hints (Coming Soon)"
                disabled
            >
                <Lightbulb className="h-4 w-4" />
                <span className="hidden sm:inline">Hints</span>
            </button>
        </div>
    );
}
