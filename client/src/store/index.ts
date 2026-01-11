export { store, type RootState, type AppDispatch } from './store';
export { useAppDispatch, useAppSelector } from './hooks';

// Auth slice exports
export {
    login,
    signup,
    getCurrentUser,
    logout,
    clearError,
    setUser,
} from './auth.slice';

// Match slice exports
export {
    createRoom,
    joinRoom,
    getMatch,
    setCurrentRoom,
    setCurrentMatch,
    updateMatch,
    leaveRoom,
    clearMatchError,
} from './match.slice';

// UI slice exports
export {
    toggleTheme,
    setTheme,
    toggleSidebar,
    setSidebarOpen,
    openModal,
    closeModal,
    addToast,
    removeToast,
    clearToasts,
    setSocketConnected,
} from './ui.slice';

// Lobby slice exports
export {
    setRooms,
    addRoom,
    updateRoom,
    removeRoom,
    addActivityEvent,
    clearActivityEvents,
    setLoadingRooms,
    type LobbyRoom,
    type ActivityEvent,
} from './lobby.slice';

// Battle slice exports
export {
    setRoomId,
    setOpponent,
    setOpponentConnected,
    setOpponentStatus,
    setOpponentProgress,
    setBattleStatus,
    setBattleResult,
    addChatMessage,
    clearUnreadCount,
    resetBattle,
    type OpponentStatus,
    type BattleStatus,
    type BattleResult,
    type OpponentInfo,
    type OpponentProgress,
    type ChatMessage,
} from './battle.slice';

// Room slice exports
export {
    setRoomInfo,
    setPlayers as setRoomPlayers,
    addPlayer,
    removePlayer,
    updatePlayerReady,
    addRoomChatMessage,
    clearRoomChat,
    setRoomLoading,
    resetRoom,
    type RoomPlayer,
    type RoomChatMessage,
    type RoomInfo,
} from './room.slice';

