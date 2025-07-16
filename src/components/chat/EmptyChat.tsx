'use client';

import { MessageCircle, Users, Phone, Video, Gamepad2 } from 'lucide-react';

export function EmptyChat() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-24 h-24 bg-chat-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageCircle className="w-12 h-12 text-chat-primary" />
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Welcome to NextJS Chat
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Select a chat to start messaging, or create a new conversation to get started.
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <Users className="w-6 h-6 text-chat-primary mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Group Chats</p>
          </div>
          
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <Phone className="w-6 h-6 text-chat-primary mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Voice Calls</p>
          </div>
          
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <Video className="w-6 h-6 text-chat-primary mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Video Calls</p>
          </div>
          
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <Gamepad2 className="w-6 h-6 text-chat-primary mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Games</p>
          </div>
        </div>

        <button className="px-6 py-3 bg-chat-primary text-white rounded-lg button-hover">
          Start New Chat
        </button>
      </div>
    </div>
  );
}