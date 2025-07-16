import { useEffect, useRef, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase';
import { useAuthStore, useChatStore, useUIStore, useCallStore } from '@/store';
import { Message, TypingIndicator, CallSession, User } from '@/types';
import { showNotification, playMessageSound } from '@/utils';

export function useRealtimeMessages(chatId: string | null) {
  const supabase = createClient();
  const { user } = useAuthStore();
  const { addMessage, updateMessage } = useChatStore();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!chatId || !user) return;

    // Subscribe to message changes for the specific chat
    const channel = supabase
      .channel(`messages:chat_id=eq.${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // Don't add our own messages (they're already optimistically added)
          if (newMessage.sender_id !== user.id) {
            addMessage(chatId, newMessage);
            playMessageSound();
            
            // Show notification if the app is not in focus
            if (document.hidden) {
              showNotification(`New message from ${newMessage.sender.full_name || 'Someone'}`, {
                body: newMessage.content || 'Sent an attachment',
                tag: `message-${newMessage.id}`,
              });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          updateMessage(chatId, updatedMessage.id, updatedMessage);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [chatId, user, supabase, addMessage, updateMessage]);

  return channelRef.current;
}

export function useRealtimeTyping(chatId: string | null) {
  const supabase = createClient();
  const { user } = useAuthStore();
  const { addTypingUser, removeTypingUser, setTypingUsers } = useUIStore();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sendTypingIndicator = useCallback(async () => {
    if (!chatId || !user) return;

    try {
      // Upsert typing indicator
      await supabase
        .from('typing_indicators')
        .upsert({
          chat_id: chatId,
          user_id: user.id,
        });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Remove typing indicator after 3 seconds
      typingTimeoutRef.current = setTimeout(async () => {
        await supabase
          .from('typing_indicators')
          .delete()
          .eq('chat_id', chatId)
          .eq('user_id', user.id);
      }, 3000);
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }, [chatId, user, supabase]);

  const stopTyping = useCallback(async () => {
    if (!chatId || !user) return;

    try {
      await supabase
        .from('typing_indicators')
        .delete()
        .eq('chat_id', chatId)
        .eq('user_id', user.id);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    } catch (error) {
      console.error('Error stopping typing indicator:', error);
    }
  }, [chatId, user, supabase]);

  useEffect(() => {
    if (!chatId || !user) return;

    // Subscribe to typing indicators for the specific chat
    const channel = supabase
      .channel(`typing:chat_id=eq.${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'typing_indicators',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const typingIndicator = payload.new as TypingIndicator;
          
          // Don't show our own typing indicator
          if (typingIndicator.user_id !== user.id) {
            addTypingUser(typingIndicator);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'typing_indicators',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const typingIndicator = payload.old as TypingIndicator;
          removeTypingUser(chatId, typingIndicator.user_id);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      stopTyping();
    };
  }, [chatId, user, supabase, addTypingUser, removeTypingUser, stopTyping]);

  return { sendTypingIndicator, stopTyping };
}

export function useRealtimePresence() {
  const supabase = createClient();
  const { user } = useAuthStore();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!user) return;

    // Update user status to online when component mounts
    const updateStatus = async (status: 'online' | 'offline' | 'away') => {
      try {
        await supabase
          .from('users')
          .update({
            status,
            last_seen: status === 'offline' ? new Date().toISOString() : null,
          })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error updating user status:', error);
      }
    };

    // Set user as online
    updateStatus('online');

    // Subscribe to presence
    const channel = supabase
      .channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        // Handle presence sync
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // Handle user joining
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // Handle user leaving
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateStatus('away');
      } else {
        updateStatus('online');
      }
    };

    // Handle beforeunload
    const handleBeforeUnload = () => {
      updateStatus('offline');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      channel.unsubscribe();
      updateStatus('offline');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, supabase]);

  return channelRef.current;
}

export function useRealtimeCalls() {
  const supabase = createClient();
  const { user } = useAuthStore();
  const { setIncomingCall, setActiveCall } = useCallStore();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!user) return;

    // Subscribe to call sessions
    const channel = supabase
      .channel('call-sessions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_sessions',
        },
        (payload) => {
          const callSession = payload.new as CallSession;
          
          // Check if we're a participant in this call
          if (callSession.participants.includes(user.id) && callSession.initiator_id !== user.id) {
            setIncomingCall(callSession);
            
            // Show notification
            showNotification(`Incoming ${callSession.type} call`, {
              body: `From ${callSession.initiator_id}`,
              tag: `call-${callSession.id}`,
              requireInteraction: true,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'call_sessions',
        },
        (payload) => {
          const callSession = payload.new as CallSession;
          
          if (callSession.participants.includes(user.id)) {
            if (callSession.status === 'active') {
              setActiveCall(callSession);
              setIncomingCall(null);
            } else if (callSession.status === 'ended') {
              setActiveCall(null);
              setIncomingCall(null);
            }
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [user, supabase, setIncomingCall, setActiveCall]);

  return channelRef.current;
}

export function useWebRTC() {
  const { localStream, remoteStream, setLocalStream, setRemoteStream } = useCallStore();
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const initializePeerConnection = useCallback(() => {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Add TURN servers here if needed
      ],
    };

    const peerConnection = new RTCPeerConnection(configuration);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to the other peer via signaling server
        // This would typically be done through Supabase real-time
      }
    };

    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStream(remoteStream);
      
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  }, [setRemoteStream]);

  const startCall = useCallback(async (isVideo: boolean = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true,
      });

      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const peerConnection = initializePeerConnection();
      
      // Add local stream tracks to peer connection
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // Send offer to the other peer via signaling server
      return offer;
    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  }, [setLocalStream, initializePeerConnection]);

  const answerCall = useCallback(async (offer: RTCSessionDescriptionInit, isVideo: boolean = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true,
      });

      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const peerConnection = initializePeerConnection();
      
      // Add local stream tracks to peer connection
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      // Set remote description (the offer)
      await peerConnection.setRemoteDescription(offer);

      // Create answer
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      // Send answer to the other peer via signaling server
      return answer;
    } catch (error) {
      console.error('Error answering call:', error);
      throw error;
    }
  }, [setLocalStream, initializePeerConnection]);

  const endCall = useCallback(() => {
    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, [localStream, remoteStream, setLocalStream, setRemoteStream]);

  return {
    localVideoRef,
    remoteVideoRef,
    startCall,
    answerCall,
    endCall,
    peerConnection: peerConnectionRef.current,
  };
}