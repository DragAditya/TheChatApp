'use client';

import { useEffect, useRef } from 'react';
import { useChatStore } from '@/store';
import { MessageBubble } from './MessageBubble';

export function MessageList() {
  const { activeChat, messages } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const chatMessages = activeChat ? messages[activeChat] || [] : [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages.length]);

  return (
    <div 
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4"
    >
      {chatMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <>
          {chatMessages.map((message, index) => {
            const prevMessage = index > 0 ? chatMessages[index - 1] : null;
            const showAvatar = !prevMessage || prevMessage.sender_id !== message.sender_id;
            const showTimestamp = !prevMessage || 
              new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 5 * 60 * 1000;

            return (
              <MessageBubble
                key={message.id}
                message={message}
                showAvatar={showAvatar}
                showTimestamp={showTimestamp}
              />
            );
          })}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}