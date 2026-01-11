import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Send, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PlayerMiniCard, BattleTimer, LanguageSelect, BottomActionBar, WhiteboardSheet, BattleChat } from '@/components/battle';
import { DEFAULT_CODE } from '@/components/battle/CodeEditor';
import { EditorOutputPanel } from './EditorOutputPanel';
import { ProblemPanel } from './ProblemPanel';
import { OpponentPanel } from './OpponentPanel';
import { MATCH_DURATION } from '@/utils/constants';
import { useAuth, useSocket } from '@/hooks';
import {
    useAppDispatch,
    useAppSelector,
    setRoomId,
    setOpponent,
    setOpponentStatus,
    setOpponentProgress,
    setBattleStatus,
    setBattleResult,
    addChatMessage,
    resetBattle,
} from '@/store';
import { SOCKET_EVENTS } from '@/types/socket';
import type { OpponentProgressPayload, BattleOverPayload, CodeSubmitPayload, ChatMessageResponse } from '@/types/socket';

// Mock data (fallback when user not available)
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

// Default code is now imported from CodeEditor
type SupportedLanguage = 'javascript' | 'python' | 'cpp' | 'java' | 'typescript' | 'go' | 'rust';

/**
 * Battle Page - Full Socket + Redux Integration
 * 
 * Socket Events → Redux Actions → UI
 * 
 * Socket events dispatch to Redux, UI reads from Redux.
 * This is the ONLY component that registers socket listeners for battle events.
 */
export function Battle() {
    const { matchId } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAuth();
    const { emit, on, isConnected } = useSocket();

    // Use auth user or fallback to mock for testing
    const currentUser = user || mockUser;

    // Redux state - opponent and battle info
    const {
        opponent,
        opponentStatus,
        opponentProgress,
        battleStatus,
        battleResult,
        unreadCount,
    } = useAppSelector((state) => state.battle);
    const opponentConnected = opponent?.isConnected ?? false;

    // Opponent display data (from Redux or fallback to mock)
    const opponentDisplay = opponent || mockOpponent;

    // Local UI state (not socket-related)
    const [language, setLanguage] = useState<SupportedLanguage>('javascript');
    const [code, setCode] = useState(DEFAULT_CODE['javascript']);
    const [isRunning, setIsRunning] = useState(false);
    const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [output, setOutput] = useState('');

    // Code buffers per language (preserves code when switching)
    const codeBuffersRef = useRef<Record<SupportedLanguage, string>>({
        javascript: DEFAULT_CODE['javascript'],
        typescript: DEFAULT_CODE['typescript'],
        python: DEFAULT_CODE['python'],
        cpp: DEFAULT_CODE['cpp'],
        java: DEFAULT_CODE['java'],
        go: DEFAULT_CODE['go'],
        rust: DEFAULT_CODE['rust'],
    });

    // Derived state
    const isSubmitted = battleStatus === 'finished';

    // Initialize battle room on mount
    useEffect(() => {
        if (matchId) {
            dispatch(setRoomId(matchId));
            dispatch(setBattleStatus('active'));
        }

        // Cleanup on unmount - reset battle state
        return () => {
            dispatch(resetBattle());
        };
    }, [matchId, dispatch]);

    // Join battle room on mount (socket)
    useEffect(() => {
        if (!isConnected || !matchId) return;

        console.debug('[Battle] Joining battle room:', matchId);
        emit(SOCKET_EVENTS.ROOM_JOIN, { roomId: matchId });

        // Cleanup order (locked):
        // 1. Emit room:leave
        // 2. Remove listeners (handled in separate useEffect)
        // 3. Socket stays connected (handled by SocketProvider)
        return () => {
            console.debug('[Battle] Leaving battle room:', matchId);
            emit(SOCKET_EVENTS.ROOM_LEAVE, { roomId: matchId });
        };
    }, [isConnected, matchId, emit]);

    // Socket event listeners - dispatch to Redux
    useEffect(() => {
        if (!isConnected) return;

        // Opponent joined/connected → dispatch to Redux
        const unsubUserJoined = on<{ playerId: string; username: string; elo?: number }>(
            SOCKET_EVENTS.ROOM_PLAYER_JOINED,
            (data) => {
                console.debug('[Battle] Player joined:', data);
                // If this is the opponent (not me), set their info
                if (data.playerId !== currentUser.id) {
                    dispatch(setOpponent({
                        id: data.playerId,
                        username: data.username,
                        elo: data.elo || 1200,
                        isConnected: true,
                    }));
                }
            }
        );

        // Opponent progress update → dispatch to Redux
        const unsubOpponentProgress = on<OpponentProgressPayload>(
            SOCKET_EVENTS.PLAYER_UPDATE,
            (data) => {
                console.debug('[Battle] Opponent progress:', data);
                if (data.opponentId !== currentUser.id) {
                    dispatch(setOpponentStatus(data.status));
                    dispatch(setOpponentProgress({
                        testsPassed: data.testsPassed,
                        totalTests: data.totalTests,
                    }));
                }
            }
        );

        // Battle over → dispatch to Redux
        const unsubBattleOver = on<BattleOverPayload>(
            SOCKET_EVENTS.MATCH_END,
            (data) => {
                console.debug('[Battle] Battle over:', data);
                const isWinner = data.winnerId === currentUser.id;
                dispatch(setBattleResult(isWinner ? 'won' : 'lost'));
            }
        );

        // Chat message → dispatch to Redux
        const unsubChatMessage = on<ChatMessageResponse>(
            SOCKET_EVENTS.CHAT_MESSAGE,
            (data) => {
                console.debug('[Battle] Chat message:', data);
                dispatch(addChatMessage({
                    id: `${data.userId}-${data.timestamp}`,
                    userId: data.userId,
                    username: data.username,
                    message: data.message,
                    timestamp: data.timestamp,
                    isOwn: data.userId === currentUser.id,
                }));
            }
        );

        // Cleanup listeners on unmount
        return () => {
            unsubUserJoined();
            unsubOpponentProgress();
            unsubBattleOver();
            unsubChatMessage();
        };
    }, [isConnected, on, currentUser.id, dispatch]);

    // Handlers
    const handleTimeUp = useCallback(() => {
        console.log('Time is up! Auto-submitting...');
        dispatch(setBattleStatus('finished'));

        if (isConnected && matchId) {
            emit<CodeSubmitPayload>(SOCKET_EVENTS.CODE_SUBMIT, {
                matchId,
                code,
                language,
            });
        }
    }, [isConnected, matchId, code, language, emit, dispatch]);

    const handleRun = useCallback(async () => {
        setIsRunning(true);
        setOutput('> Running code...\n');

        // Emit running status to opponent
        if (isConnected && matchId) {
            emit(SOCKET_EVENTS.PLAYER_UPDATE, {
                matchId,
                status: 'running',
            });
        }

        // Execute code in browser (for JavaScript only - others need backend)
        setTimeout(() => {
            try {
                if (language === 'javascript' || language === 'typescript') {
                    // Capture console.log output
                    const logs: string[] = [];
                    const originalLog = console.log;
                    console.log = (...args) => {
                        logs.push(args.map(arg =>
                            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                        ).join(' '));
                    };

                    try {
                        // Execute the code
                        // eslint-disable-next-line no-eval
                        eval(code);

                        // Restore console.log
                        console.log = originalLog;

                        if (logs.length > 0) {
                            setOutput('> Running code...\n\n' + logs.join('\n'));
                        } else {
                            setOutput('> Running code...\n\n(No output - add console.log() to see results)');
                        }
                    } catch (execError: unknown) {
                        console.log = originalLog;
                        const errorMessage = execError instanceof Error ? execError.message : String(execError);
                        setOutput(`> Running code...\n\n❌ Error: ${errorMessage}`);
                    }
                } else {
                    // For other languages, show a message (backend execution needed)
                    setOutput(`> Running code...\n\n⚠️ ${language.toUpperCase()} execution requires backend integration.\nCurrently only JavaScript runs in browser.`);
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                setOutput(`> Running code...\n\n❌ Error: ${errorMessage}`);
            }
            setIsRunning(false);
        }, 500);
    }, [isConnected, matchId, emit, code, language]);

    const handleSubmit = useCallback(() => {
        console.log('Submitting code:', code);
        dispatch(setBattleStatus('finished'));

        if (isConnected && matchId) {
            emit<CodeSubmitPayload>(SOCKET_EVENTS.CODE_SUBMIT, {
                matchId,
                code,
                language,
            });
        }
    }, [code, language, isConnected, matchId, emit, dispatch]);

    const handleReset = useCallback(() => {
        setCode(DEFAULT_CODE[language]);
        codeBuffersRef.current[language] = DEFAULT_CODE[language];
        setOutput('');
    }, [language]);

    const handleLanguageChange = useCallback((newLanguage: string) => {
        const newLang = newLanguage as SupportedLanguage;
        // Reset code to default template for new language
        setLanguage(newLang);
        setCode(DEFAULT_CODE[newLang]);
        setOutput('');
    }, []);

    const handleWhiteboardToggle = useCallback(() => {
        setIsWhiteboardOpen(prev => !prev);
    }, []);

    const handleChatToggle = useCallback(() => {
        setIsChatOpen(prev => !prev);
    }, []);

    const handleViewResult = useCallback(() => {
        navigate(`/result/${matchId}`);
    }, [navigate, matchId]);

    return (
        <div className="flex h-screen flex-col bg-background">
            {/* Top Battle Bar - 56px, Minimal */}
            <header className="battle-top-bar flex items-center justify-between border-b border-border px-3">
                {/* Left: Player */}
                <PlayerMiniCard player={currentUser} isCurrentUser />

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
                        locked={battleStatus === 'active'}
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
                <div className="flex items-center gap-2">
                    {opponentConnected && (
                        <span className="w-2 h-2 rounded-full bg-green-500" title="Opponent connected" />
                    )}
                    <PlayerMiniCard player={opponentDisplay} />
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Problem Panel - Left, 22-25% */}
                <div className="hidden md:flex w-[24%] min-w-[260px] max-w-[320px]">
                    <ProblemPanel />
                </div>

                {/* Editor + Output - Resizable Vertical Split */}
                <EditorOutputPanel
                    code={code}
                    onChange={setCode}
                    language={language as 'javascript' | 'python' | 'cpp' | 'java' | 'typescript'}
                    isRunning={isRunning}
                    isLocked={isSubmitted}
                    isBlurred={isWhiteboardOpen}
                    output={output}
                />

                {/* Opponent Panel - Right, Minimal */}
                <div className="hidden lg:flex w-48 flex-shrink-0">
                    <OpponentPanel
                        opponent={mockOpponent}
                        status={opponentStatus}
                        progress={opponentProgress}
                    />
                </div>
            </div>

            {/* Battle Result Overlay */}
            {battleResult && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-card border border-border rounded-lg p-8 text-center">
                        <h2 className={`text-4xl font-bold mb-4 ${battleResult === 'won' ? 'text-green-500' : 'text-red-500'}`}>
                            {battleResult === 'won' ? '🎉 You Won!' : '😔 You Lost'}
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            {battleResult === 'won'
                                ? 'Congratulations! You solved the problem first.'
                                : 'Your opponent solved the problem first.'}
                        </p>
                        <Button onClick={handleViewResult}>View Results</Button>
                    </div>
                </div>
            )}

            {/* Bottom Action Bar */}
            <BottomActionBar
                onWhiteboardClick={handleWhiteboardToggle}
                onChatClick={handleChatToggle}
                onHintsClick={() => console.log('Hints clicked')}
                unreadCount={unreadCount}
            />

            {/* Whiteboard Bottom Sheet */}
            <WhiteboardSheet
                isOpen={isWhiteboardOpen}
                onClose={() => setIsWhiteboardOpen(false)}
                problemSummary="Two Sum: Find indices that add to target"
            />

            {/* Battle Chat */}
            <BattleChat
                roomId={matchId || ''}
                currentUserId={currentUser.id}
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
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
