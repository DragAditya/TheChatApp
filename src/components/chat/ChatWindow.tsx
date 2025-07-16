'use client';

import { useState, useEffect, useRef } from 'react';
import { useChatStore, useAuthStore } from '@/store';
import { useRealtimeMessages, useRealtimeTyping } from '@/hooks/useRealtime';
import { createClient } from '@/lib/supabase';
import { Phone, Video, Menu, Send, Paperclip, Smile } from 'lucide-react';
import { MessageList } from './MessageList';
import { TypingIndicator } from './TypingIndicator';
import { ChatHeader } from './ChatHeader';

export function ChatWindow() {
  const { activeChat, messages, addMessage } = useChatStore();
  const { user } = useAuthStore();
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const supabase = createClient();
  
  // Initialize real-time hooks
  useRealtimeMessages(activeChat);
  const { sendTypingIndicator, stopTyping } = useRealtimeTyping(activeChat);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeChat || !user) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setLoading(true);

    try {
      // Stop typing indicator
      await stopTyping();

      // Create temporary message for optimistic UI
      const tempMessage = {
        id: `temp-${Date.now()}`,
        chat_id: activeChat,
        sender_id: user.id,
        content: messageContent,
        type: 'text' as const,
        status: 'sending' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sender: user,
      };

      // Add to local state immediately
      addMessage(activeChat, tempMessage);

      // Send to database
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: activeChat,
          sender_id: user.id,
          content: messageContent,
          type: 'text',
        })
        .select(`
          *,
          sender:users(*)
        `)
        .single();

      if (error) throw error;

      // Update message status
      if (data) {
        // The real-time subscription will handle updating the message
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // TODO: Show error state and retry option
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator
    if (e.target.value.length > 0) {
      sendTypingIndicator();
    } else {
      stopTyping();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  useEffect(() => {
    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [newMessage]);

  if (!activeChat) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <ChatHeader />

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList />
      </div>

      {/* Typing Indicator */}
      <TypingIndicator />

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-700 border-0 rounded-full resize-none input-focus max-h-[120px]"
              disabled={loading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!newMessage.trim() || loading}
            className="p-3 bg-chat-primary text-white rounded-full button-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}