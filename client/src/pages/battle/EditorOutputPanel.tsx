import { useState, useCallback, useRef, memo } from 'react';
import { EditorPanel } from './EditorPanel';
import { GripHorizontal, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorOutputPanelProps {
    code: string;
    onChange: (code: string) => void;
    language?: 'javascript' | 'python' | 'cpp' | 'java' | 'typescript' | 'go' | 'rust';
    isRunning?: boolean;
    isLocked?: boolean;
    isBlurred?: boolean;
    output: string;
    className?: string;
}

/**
 * EditorOutputPanel - Resizable vertical split for editor and output
 * 
 * Default: 75% editor, 25% output
 * User can drag divider to resize
 * Output panel always visible with placeholder when empty
 */
function EditorOutputPanelComponent({
    code,
    onChange,
    language = 'javascript',
    isRunning = false,
    isLocked = false,
    isBlurred = false,
    output,
    className,
}: EditorOutputPanelProps) {
    // Default split: 75% editor, 25% output (stored as editor percentage)
    const [editorHeight, setEditorHeight] = useState(75);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    // Handle drag start
    const handleDragStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isDragging.current = true;
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';

        const handleDragMove = (moveEvent: MouseEvent) => {
            if (!isDragging.current || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const containerHeight = containerRect.height;
            const relativeY = moveEvent.clientY - containerRect.top;

            // Calculate percentage (clamped between 30% and 90%)
            let percentage = (relativeY / containerHeight) * 100;
            percentage = Math.max(30, Math.min(90, percentage));

            setEditorHeight(percentage);
        };

        const handleDragEnd = () => {
            isDragging.current = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
        };

        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
    }, []);

    return (
        <div
            ref={containerRef}
            className={cn('flex flex-1 flex-col overflow-hidden', className)}
        >
            {/* Editor Section */}
            <div
                className="flex-shrink-0 overflow-hidden"
                style={{ height: `${editorHeight}%` }}
            >
                <EditorPanel
                    code={code}
                    onChange={onChange}
                    language={language}
                    isRunning={isRunning}
                    isLocked={isLocked}
                    isBlurred={isBlurred}
                />
            </div>

            {/* Resizable Divider */}
            <div
                className="relative h-2 flex-shrink-0 bg-[#0b0f1a] border-y border-border/40 cursor-row-resize group hover:bg-border/30 transition-colors"
                onMouseDown={handleDragStart}
            >
                <div className="absolute inset-0 flex items-center justify-center">
                    <GripHorizontal className="h-3 w-3 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                </div>
            </div>

            {/* Output Section */}
            <div
                className="flex-1 flex flex-col overflow-hidden bg-[#0b0f1a]"
                style={{ height: `${100 - editorHeight}%` }}
            >
                {/* Output Header */}
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/30 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">Output</span>
                    </div>
                    {output && (
                        <span className="text-[10px] text-green-500/70 font-medium">• Running</span>
                    )}
                </div>

                {/* Output Content */}
                <div className="flex-1 overflow-auto">
                    {output ? (
                        <pre className="p-3 font-mono text-xs text-white/80 whitespace-pre-wrap">
                            {output}
                        </pre>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground/50 text-xs">
                            Run your code to see output here
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Memoized EditorOutputPanel
 * Re-renders only when necessary props change
 */
export const EditorOutputPanel = memo(EditorOutputPanelComponent, (prevProps, nextProps) => {
    return (
        prevProps.code === nextProps.code &&
        prevProps.language === nextProps.language &&
        prevProps.isRunning === nextProps.isRunning &&
        prevProps.isLocked === nextProps.isLocked &&
        prevProps.isBlurred === nextProps.isBlurred &&
        prevProps.output === nextProps.output
    );
});
