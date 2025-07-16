'use client';

import { useUIStore, useChatStore } from '@/store';
import { generateAvatarColor } from '@/utils';

export function TypingIndicator() {
  const { typingUsers } = useUIStore();
  const { activeChat } = useChatStore();

  const activeTypingUsers = typingUsers.filter(user => user.chat_id === activeChat);

  if (activeTypingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    const names = activeTypingUsers.map(user => user.user_name);
    
    if (names.length === 1) {
      return `${names[0]} is typing...`;
    } else if (names.length === 2) {
      return `${names[0]} and ${names[1]} are typing...`;
    } else {
      return `${names[0]} and ${names.length - 1} others are typing...`;
    }
  };

  return (
    <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2">
        {/* Avatars */}
        <div className="flex -space-x-1">
          {activeTypingUsers.slice(0, 3).map((user) => (
            <div
              key={user.user_id}
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white dark:border-gray-800"
              style={{ backgroundColor: generateAvatarColor(user.user_id) }}
            >
              {user.user_name.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>

        {/* Typing text and animation */}
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {getTypingText()}
          </span>
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full typing-dot"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full typing-dot"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full typing-dot"></div>
          </div>
        </div>
      </div>
    </div>
  );
}