import { memo } from 'react';
import { CodeEditor } from '@/components/battle/CodeEditor';
import { cn } from '@/lib/utils';

interface EditorPanelProps {
    code: string;
    onChange: (code: string) => void;
    language?: 'javascript' | 'python' | 'cpp' | 'java' | 'typescript' | 'go' | 'rust';
    isRunning?: boolean;
    isLocked?: boolean;
    isBlurred?: boolean;
    className?: string;
}

/**
 * EditorPanel - The King 👑
 * 
 * Uses CodeMirror 6 for:
 * - Syntax highlighting
 * - Line numbers
 * - Bracket matching
 * - Auto-completion
 * 
 * Rules:
 * - No animated backgrounds
 * - No blur while typing
 * - No glow while typing
 * - Dark neutral background (#0b0f1a)
 * 
 * Micro UX:
 * - On Run → subtle bottom border glow (200ms) via `animate-run-glow` class
 * - On Submit → editor locks + dim overlay via `editor-locked` class
 * 
 * Performance:
 * - Memoized component
 * - No Framer Motion
 */
function EditorPanelComponent({
    code,
    onChange,
    language = 'javascript',
    isRunning = false,
    isLocked = false,
    isBlurred = false,
    className,
}: EditorPanelProps) {
    return (
        <div
            className={cn(
                'flex h-full flex-col relative',
                isRunning && 'animate-run-glow',
                isLocked && 'editor-locked',
                isBlurred && 'editor-blurred',
                className
            )}
        >
            {/* CodeMirror 6 Editor */}
            <div className="flex-1 overflow-hidden bg-[#0b0f1a]">
                <CodeEditor
                    value={code}
                    onChange={onChange}
                    language={language}
                    disabled={isLocked || isBlurred}
                />
            </div>
        </div>
    );
}

/**
 * Memoized EditorPanel to prevent unnecessary re-renders
 * Only re-renders when code, language, isRunning, isLocked, or isBlurred changes
 */
export const EditorPanel = memo(EditorPanelComponent, (prevProps, nextProps) => {
    return (
        prevProps.code === nextProps.code &&
        prevProps.language === nextProps.language &&
        prevProps.isRunning === nextProps.isRunning &&
        prevProps.isLocked === nextProps.isLocked &&
        prevProps.isBlurred === nextProps.isBlurred
    );
});
