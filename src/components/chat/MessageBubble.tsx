'use client';

import { useAuthStore } from '@/store';
import { Message } from '@/types';
import { formatMessageTime, generateAvatarColor } from '@/utils';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  showAvatar: boolean;
  showTimestamp: boolean;
}

export function MessageBubble({ message, showAvatar, showTimestamp }: MessageBubbleProps) {
  const { user } = useAuthStore();
  const isOwnMessage = message.sender_id === user?.id;

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-500" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} message-enter`}>
      <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[80%]`}>
        {/* Avatar */}
        {!isOwnMessage && (
          <div className="flex-shrink-0">
            {showAvatar ? (
              message.sender.avatar_url ? (
                <img
                  src={message.sender.avatar_url}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                  style={{ backgroundColor: generateAvatarColor(message.sender_id) }}
                >
                  {message.sender.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )
            ) : (
              <div className="w-8 h-8" />
            )}
          </div>
        )}

        {/* Message Content */}
        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          {/* Sender name for group chats */}
          {!isOwnMessage && showAvatar && (
            <span className="text-xs text-gray-600 dark:text-gray-400 mb-1 px-3">
              {message.sender.full_name || 'Unknown'}
            </span>
          )}

          {/* Message bubble */}
          <div
            className={`message-bubble ${
              isOwnMessage 
                ? 'sent bg-chat-primary text-white' 
                : 'received bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
            } shadow-sm`}
          >
            {/* Message content */}
            <div className="break-words">
              {message.content}
            </div>

            {/* Message info */}
            <div className={`flex items-center justify-end space-x-1 mt-1 ${
              isOwnMessage ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
            }`}>
              <span className="text-xs">
                {formatMessageTime(message.created_at)}
              </span>
              {isOwnMessage && (
                <div className="flex items-center">
                  {getStatusIcon()}
                </div>
              )}
            </div>
          </div>

          {/* Timestamp */}
          {showTimestamp && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {new Date(message.created_at).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}