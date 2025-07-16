'use client';

import { useState, useEffect } from 'react';
import { useAuthStore, useChatStore, useUIStore } from '@/store';
import { createClient } from '@/lib/supabase';
import { Search, Plus, Settings, Moon, Sun } from 'lucide-react';
import { formatMessageTime, generateAvatarColor } from '@/utils';
import { Chat } from '@/types';

export function ChatSidebar() {
  const { user, logout } = useAuthStore();
  const { chats, activeChat, setActiveChat, setChats } = useChatStore();
  const { theme, setTheme, toggleSidebar } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    const fetchChats = async () => {
      try {
        const { data, error } = await supabase
          .from('chats')
          .select(`
            *,
            chat_participants!inner(
              user_id,
              role,
              user:users(*)
            ),
            messages(
              id,
              content,
              created_at,
              sender:users(full_name)
            )
          `)
          .eq('chat_participants.user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;

        const formattedChats = data.map((chat: any) => ({
          ...chat,
          participants: chat.chat_participants,
          last_message: chat.messages[0] || null,
          unread_count: 0, // TODO: Calculate actual unread count
        }));

        setChats(formattedChats);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [user, supabase, setChats]);

  const filteredChats = chats.filter(chat => {
    const chatName = chat.name || chat.participants
      .filter(p => p.user_id !== user?.id)
      .map(p => p.user.full_name)
      .join(', ');
    
    return chatName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getChatDisplayName = (chat: Chat) => {
    if (chat.name) return chat.name;
    
    const otherParticipants = chat.participants.filter(p => p.user_id !== user?.id);
    return otherParticipants.map(p => p.user.full_name || 'Unknown').join(', ');
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.avatar_url) return chat.avatar_url;
    
    const otherParticipant = chat.participants.find(p => p.user_id !== user?.id);
    return otherParticipant?.user.avatar_url;
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Chats
          </h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <Plus className="w-5 h-5" />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm placeholder-gray-500 dark:placeholder-gray-400 input-focus"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full skeleton"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded skeleton"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 skeleton"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p>No chats found</p>
          </div>
        ) : (
          <div className="p-2">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={`w-full p-3 rounded-lg mb-1 text-left transition-colors ${
                  activeChat === chat.id
                    ? 'bg-chat-primary/10 border-l-4 border-chat-primary'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    {getChatAvatar(chat) ? (
                      <img
                        src={getChatAvatar(chat)}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: generateAvatarColor(chat.id) }}
                      >
                        {getChatDisplayName(chat).charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Online indicator for direct chats */}
                    {chat.type === 'direct' && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {getChatDisplayName(chat)}
                      </h3>
                      {chat.last_message && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatMessageTime(chat.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {chat.last_message?.content || 'No messages yet'}
                      </p>
                      {chat.unread_count > 0 && (
                        <span className="notification-badge">
                          {chat.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: generateAvatarColor(user?.id || '') }}
            >
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {user?.full_name || 'Unknown User'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}