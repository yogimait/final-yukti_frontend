import { useRef, useEffect, useCallback } from 'react';
import { Send, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSocket } from '@/hooks';
import { useAppSelector, useAppDispatch, addChatMessage, clearUnreadCount } from '@/store';
import { SOCKET_EVENTS } from '@/types/socket';
import type { ChatMessageResponse } from '@/types/socket';

interface BattleChatProps {
    roomId: string;
    currentUserId: string;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * BattleChat - In-battle chat component
 * 
 * Reads from Redux: chatMessages, unreadCount
 * Emits via socket: chat:message
 * 
 * Does NOT register socket listeners - Battle.tsx handles that and dispatches to Redux.
 */
export function BattleChat({ roomId, currentUserId, isOpen, onClose }: BattleChatProps) {
    const dispatch = useAppDispatch();
    const { emit, isConnected } = useSocket();

    // Read chat messages from Redux
    const messages = useAppSelector((state) => state.battle.chatMessages);
    const unreadCount = useAppSelector((state) => state.battle.unreadCount);

    const inputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Clear unread count when chat opens
    useEffect(() => {
        if (isOpen && unreadCount > 0) {
            dispatch(clearUnreadCount());
        }
    }, [isOpen, unreadCount, dispatch]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const handleSendMessage = useCallback(() => {
        const input = inputRef.current;
        if (!input || !input.value.trim() || !isConnected) return;

        const message = input.value.trim();

        // Emit to socket - backend will broadcast to ALL including sender
        // Do NOT add locally - wait for socket event to avoid duplicates
        emit(SOCKET_EVENTS.CHAT_MESSAGE, {
            roomId,
            message,
        });

        input.value = '';
    }, [isConnected, emit, roomId]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="fixed bottom-20 right-4 w-80 h-96 bg-card border border-border rounded-lg shadow-2xl flex flex-col z-50"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">Battle Chat</span>
                            {isConnected && (
                                <span className="w-2 h-2 rounded-full bg-green-500" title="Connected" />
                            )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Messages - reads from Redux */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {messages.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-muted-foreground text-sm text-center">
                                No messages yet.<br />Send a message to your opponent!
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'}`}
                                >
                                    <span className="text-xs text-muted-foreground mb-1">
                                        {msg.isOwn ? 'You' : msg.username}
                                    </span>
                                    <div
                                        className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${msg.isOwn
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-foreground'
                                            }`}
                                    >
                                        {msg.message}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-border">
                        <div className="flex gap-2">
                            <Input
                                ref={inputRef}
                                placeholder="Type a message..."
                                onKeyDown={handleKeyDown}
                                className="flex-1 h-9 text-sm"
                                disabled={!isConnected}
                            />
                            <Button
                                size="sm"
                                onClick={handleSendMessage}
                                disabled={!isConnected}
                                className="h-9 px-3"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
