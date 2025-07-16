'use client';

import { useEffect } from 'react';
import { useUIStore, useChatStore } from '@/store';
import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';
import { EmptyChat } from './EmptyChat';
import { cn } from '@/utils';

export function ChatLayout() {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { activeChat } = useChatStore();

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={cn(
          'chat-sidebar w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700',
          !sidebarOpen && 'closed'
        )}
      >
        <ChatSidebar />
      </div>

      {/* Main Chat Area */}
      <div className="chat-main flex-1 flex flex-col">
        {activeChat ? (
          <ChatWindow />
        ) : (
          <EmptyChat />
        )}
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}