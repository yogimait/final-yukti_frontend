import { useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Send, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PlayerMiniCard, BattleTimer, LanguageSelect, BottomActionBar, WhiteboardSheet } from '@/components/battle';
import { EditorPanel } from './EditorPanel';
import { ProblemPanel } from './ProblemPanel';
import { OpponentPanel } from './OpponentPanel';
import { MATCH_DURATION } from '@/utils/constants';

// Mock data
const mockUser = {
    id: '1',
    username: 'You',
    email: 'you@example.com',
    elo: 1320,
    wins: 25,
    losses: 12,
    totalMatches: 37,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
};

const mockOpponent = {
    id: '2',
    username: 'CodeMaster',
    email: 'codemaster@example.com',
    elo: 1450,
    wins: 45,
    losses: 20,
    totalMatches: 65,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
};

type OpponentStatus = 'idle' | 'typing' | 'running' | 'submitted';

const defaultCode = `// Write your solution here

function solution(input) {
    // Your code here
    
}`;

/**
 * Battle Page - Redesigned for Performance & Focus
 * 
 * Layout:
 * ┌─────────────────────────────────────────────────┐
 * │ Top Bar (56px)                                  │
 * │ [You] [Timer] [Language][Run][Submit] [Opponent]│
 * ├──────────┬──────────────────────┬───────────────┤
 * │ Problem  │                      │  Opponent     │
 * │ Panel    │     CODE EDITOR      │  Status       │
 * │ 22-25%   │       (THE KING)     │  Minimal      │
 * └──────────┴──────────────────────┴───────────────┘
 * │           [Bottom Action Bar]                   │
 * └─────────────────────────────────────────────────┘
 * 
 * Performance Rules:
 * - No Framer Motion near editor
 * - CSS-only animations
 * - Memoized components
 */
export function Battle() {
    const { matchId } = useParams();
    // matchId will be used for WebSocket connection
    console.debug('Battle matchId:', matchId);

    // State
    const [code, setCode] = useState(defaultCode);
    const [language, setLanguage] = useState('javascript');
    const [battleStarted] = useState(true); // Assume battle has started
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [opponentStatus, setOpponentStatus] = useState<OpponentStatus>('typing');
    const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
    const [output, setOutput] = useState('');

    // Handlers
    const handleTimeUp = useCallback(() => {
        console.log('Time is up! Auto-submitting...');
        setIsSubmitted(true);
    }, []);

    const handleRun = useCallback(async () => {
        setIsRunning(true);
        // Simulate code execution
        setTimeout(() => {
            setOutput('> Running tests...\n✓ Test 1 passed\n✓ Test 2 passed\n✗ Test 3 failed');
            setIsRunning(false);
        }, 1000);
    }, []);

    const handleSubmit = useCallback(() => {
        console.log('Submitting code:', code);
        setIsSubmitted(true);
    }, [code]);

    const handleReset = useCallback(() => {
        setCode(defaultCode);
        setOutput('');
    }, []);

    const handleLanguageChange = useCallback((newLanguage: string) => {
        setLanguage(newLanguage);
        setCode(defaultCode); // Reset code on language change
    }, []);

    const handleWhiteboardToggle = useCallback(() => {
        setIsWhiteboardOpen(prev => !prev);
    }, []);

    // Simulate opponent actions (for demo)
    useMemo(() => {
        const timer = setTimeout(() => {
            setOpponentStatus('running');
            setTimeout(() => {
                setOpponentStatus('submitted');
            }, 3000);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex h-screen flex-col bg-background">
            {/* Top Battle Bar - 56px, Minimal */}
            <header className="battle-top-bar flex items-center justify-between border-b border-border px-3">
                {/* Left: Player */}
                <PlayerMiniCard player={mockUser} isCurrentUser />

                {/* Center: Timer + Actions */}
                <div className="flex items-center gap-3">
                    <BattleTimer
                        initialSeconds={MATCH_DURATION}
                        onComplete={handleTimeUp}
                        autoStart
                    />

                    <div className="h-6 w-px bg-border" />

                    <LanguageSelect
                        value={language}
                        onChange={handleLanguageChange}
                        locked={battleStarted}
                    />

                    <div className="flex gap-1.5">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleReset}
                            disabled={isSubmitted}
                            className="h-8 px-2"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRun}
                            isLoading={isRunning}
                            disabled={isSubmitted}
                            className="h-8"
                        >
                            <Play className="mr-1 h-3.5 w-3.5" />
                            Run
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleSubmit}
                            disabled={isSubmitted}
                            className="h-8"
                        >
                            <Send className="mr-1 h-3.5 w-3.5" />
                            Submit
                        </Button>
                    </div>
                </div>

                {/* Right: Opponent */}
                <PlayerMiniCard player={mockOpponent} />
            </header>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Problem Panel - Left, 22-25% */}
                <div className="hidden md:flex w-[24%] min-w-[260px] max-w-[320px]">
                    <ProblemPanel />
                </div>

                {/* Editor - THE KING 👑 */}
                <div className="flex flex-1 flex-col">
                    <EditorPanel
                        code={code}
                        onChange={setCode}
                        language={language as 'javascript' | 'python' | 'cpp' | 'java' | 'typescript'}
                        isRunning={isRunning}
                        isLocked={isSubmitted}
                        isBlurred={isWhiteboardOpen}
                    />

                    {/* Output Panel */}
                    {output && (
                        <div className="h-28 border-t border-border bg-[#0b0f1a] flex-shrink-0">
                            <div className="border-b border-border/50 px-4 py-1.5 text-xs font-medium text-white/60">
                                Output
                            </div>
                            <pre className="overflow-auto p-3 font-mono text-xs text-white/80">
                                {output}
                            </pre>
                        </div>
                    )}
                </div>

                {/* Opponent Panel - Right, Minimal */}
                <div className="hidden lg:flex w-48 flex-shrink-0">
                    <OpponentPanel
                        opponent={mockOpponent}
                        status={opponentStatus}
                    />
                </div>
            </div>

            {/* Bottom Action Bar */}
            <BottomActionBar
                onWhiteboardClick={handleWhiteboardToggle}
                onChatClick={() => console.log('Chat clicked')}
                onHintsClick={() => console.log('Hints clicked')}
            />

            {/* Whiteboard Bottom Sheet */}
            <WhiteboardSheet
                isOpen={isWhiteboardOpen}
                onClose={() => setIsWhiteboardOpen(false)}
                problemSummary="Two Sum: Find indices that add to target"
            />

            {/* Backdrop when whiteboard is open */}
            {isWhiteboardOpen && (
                <div
                    className="fixed inset-0 bg-background/50 z-40"
                    onClick={() => setIsWhiteboardOpen(false)}
                    aria-hidden="true"
                />
            )}
        </div>
    );
}
