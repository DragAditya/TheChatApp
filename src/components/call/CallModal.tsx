'use client';

import { useEffect } from 'react';
import { useCallStore, useAuthStore } from '@/store';
import { useWebRTC } from '@/hooks/useRealtime';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';

export function CallModal() {
  const {
    activeCall,
    incomingCall,
    isCallModalOpen,
    isMuted,
    isVideoEnabled,
    setActiveCall,
    setIncomingCall,
    setCallModalOpen,
    toggleMute,
    toggleVideo,
  } = useCallStore();
  
  const { user } = useAuthStore();
  const { localVideoRef, remoteVideoRef, startCall, answerCall, endCall } = useWebRTC();
  const supabase = createClient();

  // Auto-open modal when there's an incoming call
  useEffect(() => {
    if (incomingCall) {
      setCallModalOpen(true);
    }
  }, [incomingCall, setCallModalOpen]);

  const handleAnswerCall = async () => {
    if (!incomingCall || !user) return;

    try {
      // Answer the call via WebRTC
      await answerCall({} as RTCSessionDescriptionInit, incomingCall.type === 'video');
      
      // Update call session status
      await supabase
        .from('call_sessions')
        .update({
          status: 'active',
          started_at: new Date().toISOString(),
        })
        .eq('id', incomingCall.id);

      setActiveCall(incomingCall);
      setIncomingCall(null);
    } catch (error) {
      console.error('Error answering call:', error);
      toast.error('Failed to answer call');
    }
  };

  const handleDeclineCall = async () => {
    if (!incomingCall) return;

    try {
      // Update call session status
      await supabase
        .from('call_sessions')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString(),
        })
        .eq('id', incomingCall.id);

      setIncomingCall(null);
      setCallModalOpen(false);
    } catch (error) {
      console.error('Error declining call:', error);
    }
  };

  const handleEndCall = async () => {
    if (!activeCall) return;

    try {
      endCall();
      
      // Update call session status
      await supabase
        .from('call_sessions')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString(),
        })
        .eq('id', activeCall.id);

      setActiveCall(null);
      setCallModalOpen(false);
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  if (!isCallModalOpen && !incomingCall && !activeCall) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        {/* Incoming Call */}
        {incomingCall && !activeCall && (
          <>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
                  {incomingCall.initiator_id.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Incoming {incomingCall.type} call
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                From {incomingCall.initiator_id}
              </p>
            </div>

            <div className="flex justify-center space-x-8">
              <button
                onClick={handleDeclineCall}
                className="call-button call-button-decline"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
              <button
                onClick={handleAnswerCall}
                className="call-button call-button-answer"
              >
                <Phone className="w-6 h-6" />
              </button>
            </div>
          </>
        )}

        {/* Active Call */}
        {activeCall && (
          <>
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {activeCall.type === 'video' ? 'Video Call' : 'Voice Call'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Connected
              </p>
            </div>

            {/* Video Area */}
            {activeCall.type === 'video' && (
              <div className="mb-6 space-y-4">
                <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 right-4 w-20 h-16 bg-gray-800 rounded-lg overflow-hidden">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Call Controls */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={toggleMute}
                className={`call-button ${isMuted ? 'call-button-decline' : 'call-button-mute'}`}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              {activeCall.type === 'video' && (
                <button
                  onClick={toggleVideo}
                  className={`call-button ${!isVideoEnabled ? 'call-button-decline' : 'call-button-video'}`}
                >
                  {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </button>
              )}

              <button
                onClick={handleEndCall}
                className="call-button call-button-decline"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}