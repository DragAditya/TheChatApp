'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { CallModal } from '@/components/call/CallModal';
import { GameModal } from '@/components/game/GameModal';

export function Providers({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useUIStore();

  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('ui-storage');
    if (savedTheme) {
      try {
        const { state } = JSON.parse(savedTheme);
        if (state?.theme) {
          setTheme(state.theme);
        }
      } catch (error) {
        console.error('Error parsing saved theme:', error);
      }
    }

    // Apply theme class
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, [theme, setTheme]);

  return (
    <AuthProvider>
      {children}
      <PWAInstallPrompt />
      <CallModal />
      <GameModal />
    </AuthProvider>
  );
}