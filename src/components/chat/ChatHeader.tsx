'use client';

import { useChatStore, useAuthStore, useUIStore } from '@/store';
import { Phone, Video, Menu, MoreVertical } from 'lucide-react';
import { generateAvatarColor } from '@/utils';

export function ChatHeader() {
  const { chats, activeChat } = useChatStore();
  const { user } = useAuthStore();
  const { toggleSidebar } = useUIStore();

  const chat = chats.find(c => c.id === activeChat);
  
  if (!chat) return null;

  const getChatDisplayName = () => {
    if (chat.name) return chat.name;
    
    const otherParticipants = chat.participants.filter(p => p.user_id !== user?.id);
    return otherParticipants.map(p => p.user.full_name || 'Unknown').join(', ');
  };

  const getChatAvatar = () => {
    if (chat.avatar_url) return chat.avatar_url;
    
    const otherParticipant = chat.participants.find(p => p.user_id !== user?.id);
    return otherParticipant?.user.avatar_url;
  };

  const getOnlineStatus = () => {
    if (chat.type === 'group') return `${chat.participants.length} members`;
    
    const otherParticipant = chat.participants.find(p => p.user_id !== user?.id);
    if (otherParticipant?.user.status === 'online') {
      return 'Online';
    } else if (otherParticipant?.user.last_seen) {
      return `Last seen ${new Date(otherParticipant.user.last_seen).toLocaleTimeString()}`;
    }
    return 'Offline';
  };

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Mobile menu button */}
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Chat Avatar */}
          <div className="relative">
            {getChatAvatar() ? (
              <img
                src={getChatAvatar()}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: generateAvatarColor(chat.id) }}
              >
                {getChatDisplayName().charAt(0).toUpperCase()}
              </div>
            )}
            {/* Online indicator for direct chats */}
            {chat.type === 'direct' && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
            )}
          </div>

          {/* Chat Info */}
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {getChatDisplayName()}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getOnlineStatus()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}