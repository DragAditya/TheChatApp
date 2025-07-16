export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  status: 'online' | 'offline' | 'away';
  last_seen?: string;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  name?: string;
  type: 'direct' | 'group';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  last_message?: Message;
  unread_count: number;
  participants: ChatParticipant[];
}

export interface ChatParticipant {
  id: string;
  chat_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  user: User;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content?: string;
  type: 'text' | 'image' | 'file' | 'video' | 'audio' | 'game_invite' | 'call_invite';
  metadata?: {
    file_name?: string;
    file_size?: number;
    file_type?: string;
    file_url?: string;
    game_type?: string;
    call_type?: 'voice' | 'video';
    duration?: number;
  };
  reply_to?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  created_at: string;
  updated_at: string;
  sender: User;
  edited_at?: string;
}

export interface TypingIndicator {
  chat_id: string;
  user_id: string;
  user_name: string;
  timestamp: string;
}

export interface CallSession {
  id: string;
  chat_id: string;
  initiator_id: string;
  type: 'voice' | 'video';
  status: 'ringing' | 'active' | 'ended';
  participants: string[];
  started_at?: string;
  ended_at?: string;
}

export interface GameSession {
  id: string;
  chat_id: string;
  type: 'tic_tac_toe' | 'rock_paper_scissors' | 'quiz';
  players: string[];
  status: 'waiting' | 'active' | 'finished';
  current_turn?: string;
  game_state: any;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'uploading' | 'uploaded' | 'error';
}

export interface EmojiData {
  id: string;
  name: string;
  native: string;
  unified: string;
  keywords: string[];
  shortcodes: string;
}

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}