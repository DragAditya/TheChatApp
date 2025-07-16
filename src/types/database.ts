export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          status: 'online' | 'offline' | 'away'
          last_seen: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          status?: 'online' | 'offline' | 'away'
          last_seen?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          status?: 'online' | 'offline' | 'away'
          last_seen?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chats: {
        Row: {
          id: string
          name: string | null
          type: 'direct' | 'group'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          type: 'direct' | 'group'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          type?: 'direct' | 'group'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_participants: {
        Row: {
          id: string
          chat_id: string
          user_id: string
          role: 'admin' | 'member'
          joined_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          user_id: string
          role?: 'admin' | 'member'
          joined_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          user_id?: string
          role?: 'admin' | 'member'
          joined_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          sender_id: string
          content: string | null
          type: 'text' | 'image' | 'file' | 'video' | 'audio' | 'game_invite' | 'call_invite'
          metadata: Json | null
          reply_to: string | null
          status: 'sending' | 'sent' | 'delivered' | 'read'
          created_at: string
          updated_at: string
          edited_at: string | null
        }
        Insert: {
          id?: string
          chat_id: string
          sender_id: string
          content?: string | null
          type?: 'text' | 'image' | 'file' | 'video' | 'audio' | 'game_invite' | 'call_invite'
          metadata?: Json | null
          reply_to?: string | null
          status?: 'sending' | 'sent' | 'delivered' | 'read'
          created_at?: string
          updated_at?: string
          edited_at?: string | null
        }
        Update: {
          id?: string
          chat_id?: string
          sender_id?: string
          content?: string | null
          type?: 'text' | 'image' | 'file' | 'video' | 'audio' | 'game_invite' | 'call_invite'
          metadata?: Json | null
          reply_to?: string | null
          status?: 'sending' | 'sent' | 'delivered' | 'read'
          created_at?: string
          updated_at?: string
          edited_at?: string | null
        }
      }
      typing_indicators: {
        Row: {
          id: string
          chat_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          user_id?: string
          created_at?: string
        }
      }
      call_sessions: {
        Row: {
          id: string
          chat_id: string
          initiator_id: string
          type: 'voice' | 'video'
          status: 'ringing' | 'active' | 'ended'
          participants: string[]
          started_at: string | null
          ended_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          initiator_id: string
          type: 'voice' | 'video'
          status?: 'ringing' | 'active' | 'ended'
          participants: string[]
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          initiator_id?: string
          type?: 'voice' | 'video'
          status?: 'ringing' | 'active' | 'ended'
          participants?: string[]
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
        }
      }
      game_sessions: {
        Row: {
          id: string
          chat_id: string
          type: 'tic_tac_toe' | 'rock_paper_scissors' | 'quiz'
          players: string[]
          status: 'waiting' | 'active' | 'finished'
          current_turn: string | null
          game_state: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          type: 'tic_tac_toe' | 'rock_paper_scissors' | 'quiz'
          players: string[]
          status?: 'waiting' | 'active' | 'finished'
          current_turn?: string | null
          game_state: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          type?: 'tic_tac_toe' | 'rock_paper_scissors' | 'quiz'
          players?: string[]
          status?: 'waiting' | 'active' | 'finished'
          current_turn?: string | null
          game_state?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}