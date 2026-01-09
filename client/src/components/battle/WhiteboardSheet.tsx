import { useRef, useEffect, useState, useCallback } from 'react';
import { X, Eraser, Pen, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhiteboardSheetProps {
    isOpen: boolean;
    onClose: () => void;
    problemSummary?: string;
    className?: string;
}

interface Point {
    x: number;
    y: number;
}

/**
 * WhiteboardSheet - Bottom sheet whiteboard with SVG drawing
 * 
 * Layout:
 * ┌─────────────────────────────────────┐
 * │ Whiteboard Canvas (left ~65%)       │
 * │                                     │
 * ├─────────────────────┬───────────────┤
 * │ Problem Summary     │ Notes / Steps │
 * │ (condensed)         │               │
 * └─────────────────────┴───────────────┘
 * 
 * Features:
 * - SVG-based for performance
 * - Throttled pointer events
 * - Slide up/down animation (CSS transform)
 */
export function WhiteboardSheet({
    isOpen,
    onClose,
    problemSummary = 'Two Sum: Find indices that add to target',
    className,
}: WhiteboardSheetProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [paths, setPaths] = useState<{ d: string; color: string; width: number }[]>([]);
    const [currentPath, setCurrentPath] = useState<Point[]>([]);
    const [color, setColor] = useState('#ffffff');
    const [strokeWidth, setStrokeWidth] = useState(3);
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
    const [notes, setNotes] = useState('');
    const lastPointRef = useRef<Point | null>(null);
    const throttleRef = useRef<number>(0);

    const colors = ['#ffffff', '#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7'];

    // Throttle function for pointer events
    const throttle = useCallback((callback: () => void) => {
        const now = Date.now();
        if (now - throttleRef.current >= 16) { // ~60fps
            throttleRef.current = now;
            callback();
        }
    }, []);

    const getCoordinates = useCallback((e: React.PointerEvent<SVGSVGElement>): Point => {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const rect = svg.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }, []);

    const startDrawing = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
        setIsDrawing(true);
        const point = getCoordinates(e);
        lastPointRef.current = point;
        setCurrentPath([point]);
    }, [getCoordinates]);

    const draw = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
        if (!isDrawing) return;

        throttle(() => {
            const point = getCoordinates(e);
            setCurrentPath(prev => [...prev, point]);
            lastPointRef.current = point;
        });
    }, [isDrawing, getCoordinates, throttle]);

    const stopDrawing = useCallback(() => {
        if (isDrawing && currentPath.length > 1) {
            const pathD = currentPath.reduce((acc, point, index) => {
                if (index === 0) return `M ${point.x} ${point.y}`;
                return `${acc} L ${point.x} ${point.y}`;
            }, '');

            setPaths(prev => [...prev, {
                d: pathD,
                color: tool === 'eraser' ? '#0b0f1a' : color,
                width: tool === 'eraser' ? strokeWidth * 4 : strokeWidth,
            }]);
        }
        setIsDrawing(false);
        setCurrentPath([]);
        lastPointRef.current = null;
    }, [isDrawing, currentPath, color, strokeWidth, tool]);

    const clearCanvas = () => {
        setPaths([]);
    };

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Current path as SVG path string
    const currentPathD = currentPath.reduce((acc, point, index) => {
        if (index === 0) return `M ${point.x} ${point.y}`;
        return `${acc} L ${point.x} ${point.y}`;
    }, '');

    return (
        <div
            className={cn(
                'bottom-sheet border-t border-border',
                'h-[80vh] flex flex-col',
                // Solid background with backdrop blur for visual separation
                'bg-[#0b0f1a]/95 backdrop-blur-md',
                isOpen && 'open',
                className
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Whiteboard"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
                <h2 className="text-sm font-semibold text-foreground">Whiteboard</h2>

                {/* Toolbar */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setTool('pen')}
                        className={cn(
                            'p-2 rounded-md transition-colors',
                            tool === 'pen' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                        )}
                        aria-label="Pen tool"
                    >
                        <Pen className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setTool('eraser')}
                        className={cn(
                            'p-2 rounded-md transition-colors',
                            tool === 'eraser' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                        )}
                        aria-label="Eraser tool"
                    >
                        <Eraser className="h-4 w-4" />
                    </button>

                    <div className="h-6 w-px bg-border mx-1" />

                    {/* Colors */}
                    {colors.map((c) => (
                        <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={cn(
                                'h-5 w-5 rounded-full border-2 transition-transform hover:scale-110',
                                color === c ? 'border-primary' : 'border-transparent'
                            )}
                            style={{ backgroundColor: c }}
                            aria-label={`Color ${c}`}
                        />
                    ))}

                    <div className="h-6 w-px bg-border mx-1" />

                    {/* Stroke width */}
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={strokeWidth}
                        onChange={(e) => setStrokeWidth(Number(e.target.value))}
                        className="w-16"
                        aria-label="Stroke width"
                    />

                    <button
                        onClick={clearCanvas}
                        className="p-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label="Clear canvas"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="p-2 rounded-md hover:bg-secondary transition-colors"
                    aria-label="Close whiteboard"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Canvas Area - 65% */}
                <div className="w-[65%] border-r border-border bg-[#0b0f1a] flex-shrink-0">
                    <svg
                        ref={svgRef}
                        className="w-full h-full cursor-crosshair touch-none"
                        onPointerDown={startDrawing}
                        onPointerMove={draw}
                        onPointerUp={stopDrawing}
                        onPointerLeave={stopDrawing}
                    >
                        {/* Existing paths */}
                        {paths.map((path, index) => (
                            <path
                                key={index}
                                d={path.d}
                                stroke={path.color}
                                strokeWidth={path.width}
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        ))}
                        {/* Current drawing path */}
                        {currentPath.length > 0 && (
                            <path
                                d={currentPathD}
                                stroke={tool === 'eraser' ? '#0b0f1a' : color}
                                strokeWidth={tool === 'eraser' ? strokeWidth * 4 : strokeWidth}
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}
                    </svg>
                </div>

                {/* Right Side - 35% */}
                <div className="flex-1 flex flex-col">
                    {/* Problem Summary */}
                    <div className="p-4 border-b border-border">
                        <h3 className="text-xs font-medium text-muted-foreground mb-1">
                            Problem Summary
                        </h3>
                        <p className="text-sm text-foreground">{problemSummary}</p>
                    </div>

                    {/* Notes */}
                    <div className="flex-1 p-4 flex flex-col">
                        <h3 className="text-xs font-medium text-muted-foreground mb-2">
                            Notes / Steps
                        </h3>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Write your approach, steps, or notes here..."
                            className="flex-1 w-full resize-none bg-background border border-border rounded-md p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
