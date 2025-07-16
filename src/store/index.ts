import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User, Chat, Message, TypingIndicator, CallSession, GameSession } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

interface ChatState {
  chats: Chat[];
  activeChat: string | null;
  messages: Record<string, Message[]>;
  unreadCounts: Record<string, number>;
  setChats: (chats: Chat[]) => void;
  setActiveChat: (chatId: string | null) => void;
  addMessage: (chatId: string, message: Message) => void;
  updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  markAsRead: (chatId: string) => void;
  incrementUnread: (chatId: string) => void;
}

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  emojiPickerOpen: boolean;
  attachmentPreview: File | null;
  isTyping: boolean;
  typingUsers: TypingIndicator[];
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setEmojiPickerOpen: (open: boolean) => void;
  setAttachmentPreview: (file: File | null) => void;
  setIsTyping: (typing: boolean) => void;
  setTypingUsers: (users: TypingIndicator[]) => void;
  addTypingUser: (user: TypingIndicator) => void;
  removeTypingUser: (chatId: string, userId: string) => void;
}

interface CallState {
  activeCall: CallSession | null;
  incomingCall: CallSession | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isCallModalOpen: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  setActiveCall: (call: CallSession | null) => void;
  setIncomingCall: (call: CallSession | null) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  setCallModalOpen: (open: boolean) => void;
  toggleMute: () => void;
  toggleVideo: () => void;
}

interface GameState {
  activeGame: GameSession | null;
  gameHistory: GameSession[];
  setActiveGame: (game: GameSession | null) => void;
  addGameToHistory: (game: GameSession) => void;
  updateGameState: (gameId: string, gameState: any) => void;
}

// Create individual stores
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setLoading: (isLoading) => set({ isLoading }),
        logout: () => set({ user: null, isAuthenticated: false }),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      }
    )
  )
);

export const useChatStore = create<ChatState>()(
  devtools((set, get) => ({
    chats: [],
    activeChat: null,
    messages: {},
    unreadCounts: {},
    setChats: (chats) => set({ chats }),
    setActiveChat: (activeChat) => set({ activeChat }),
    addMessage: (chatId, message) => {
      const { messages } = get();
      const chatMessages = messages[chatId] || [];
      set({
        messages: {
          ...messages,
          [chatId]: [...chatMessages, message],
        },
      });
    },
    updateMessage: (chatId, messageId, updates) => {
      const { messages } = get();
      const chatMessages = messages[chatId] || [];
      const updatedMessages = chatMessages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      );
      set({
        messages: {
          ...messages,
          [chatId]: updatedMessages,
        },
      });
    },
    deleteMessage: (chatId, messageId) => {
      const { messages } = get();
      const chatMessages = messages[chatId] || [];
      const filteredMessages = chatMessages.filter((msg) => msg.id !== messageId);
      set({
        messages: {
          ...messages,
          [chatId]: filteredMessages,
        },
      });
    },
    setMessages: (chatId, messages) => {
      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: messages,
        },
      }));
    },
    markAsRead: (chatId) => {
      set((state) => ({
        unreadCounts: {
          ...state.unreadCounts,
          [chatId]: 0,
        },
      }));
    },
    incrementUnread: (chatId) => {
      set((state) => ({
        unreadCounts: {
          ...state.unreadCounts,
          [chatId]: (state.unreadCounts[chatId] || 0) + 1,
        },
      }));
    },
  }))
);

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        theme: 'light',
        sidebarOpen: true,
        emojiPickerOpen: false,
        attachmentPreview: null,
        isTyping: false,
        typingUsers: [],
        setTheme: (theme) => {
          set({ theme });
          if (typeof window !== 'undefined') {
            if (theme === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
        },
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
        setEmojiPickerOpen: (emojiPickerOpen) => set({ emojiPickerOpen }),
        setAttachmentPreview: (attachmentPreview) => set({ attachmentPreview }),
        setIsTyping: (isTyping) => set({ isTyping }),
        setTypingUsers: (typingUsers) => set({ typingUsers }),
        addTypingUser: (user) => {
          const { typingUsers } = get();
          const exists = typingUsers.some(
            (t) => t.chat_id === user.chat_id && t.user_id === user.user_id
          );
          if (!exists) {
            set({ typingUsers: [...typingUsers, user] });
          }
        },
        removeTypingUser: (chatId, userId) => {
          const { typingUsers } = get();
          set({
            typingUsers: typingUsers.filter(
              (t) => !(t.chat_id === chatId && t.user_id === userId)
            ),
          });
        },
      }),
      {
        name: 'ui-storage',
        partialize: (state) => ({ theme: state.theme, sidebarOpen: state.sidebarOpen }),
      }
    )
  )
);

export const useCallStore = create<CallState>()(
  devtools((set) => ({
    activeCall: null,
    incomingCall: null,
    localStream: null,
    remoteStream: null,
    isCallModalOpen: false,
    isMuted: false,
    isVideoEnabled: true,
    setActiveCall: (activeCall) => set({ activeCall }),
    setIncomingCall: (incomingCall) => set({ incomingCall }),
    setLocalStream: (localStream) => set({ localStream }),
    setRemoteStream: (remoteStream) => set({ remoteStream }),
    setCallModalOpen: (isCallModalOpen) => set({ isCallModalOpen }),
    toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
    toggleVideo: () => set((state) => ({ isVideoEnabled: !state.isVideoEnabled })),
  }))
);

export const useGameStore = create<GameState>()(
  devtools((set, get) => ({
    activeGame: null,
    gameHistory: [],
    setActiveGame: (activeGame) => set({ activeGame }),
    addGameToHistory: (game) => {
      const { gameHistory } = get();
      set({ gameHistory: [game, ...gameHistory] });
    },
    updateGameState: (gameId, gameState) => {
      const { activeGame } = get();
      if (activeGame && activeGame.id === gameId) {
        set({
          activeGame: {
            ...activeGame,
            game_state: gameState,
          },
        });
      }
    },
  }))
);