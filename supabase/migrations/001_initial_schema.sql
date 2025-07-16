-- Create custom types
CREATE TYPE user_status AS ENUM ('online', 'offline', 'away');
CREATE TYPE chat_type AS ENUM ('direct', 'group');
CREATE TYPE participant_role AS ENUM ('admin', 'member');
CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'video', 'audio', 'game_invite', 'call_invite');
CREATE TYPE message_status AS ENUM ('sending', 'sent', 'delivered', 'read');
CREATE TYPE call_type AS ENUM ('voice', 'video');
CREATE TYPE call_status AS ENUM ('ringing', 'active', 'ended');
CREATE TYPE game_type AS ENUM ('tic_tac_toe', 'rock_paper_scissors', 'quiz');
CREATE TYPE game_status AS ENUM ('waiting', 'active', 'finished');

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    status user_status DEFAULT 'offline',
    last_seen TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chats table
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    type chat_type NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat participants table
CREATE TABLE chat_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role participant_role DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(chat_id, user_id)
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    type message_type DEFAULT 'text',
    metadata JSONB,
    reply_to UUID REFERENCES messages(id),
    status message_status DEFAULT 'sending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    edited_at TIMESTAMPTZ
);

-- Typing indicators table
CREATE TABLE typing_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(chat_id, user_id)
);

-- Call sessions table
CREATE TABLE call_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    initiator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type call_type NOT NULL,
    status call_status DEFAULT 'ringing',
    participants UUID[] NOT NULL,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game sessions table
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    type game_type NOT NULL,
    players UUID[] NOT NULL,
    status game_status DEFAULT 'waiting',
    current_turn UUID,
    game_state JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_chat_participants_chat_id ON chat_participants(chat_id);
CREATE INDEX idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX idx_typing_indicators_chat_id ON typing_indicators(chat_id);
CREATE INDEX idx_call_sessions_chat_id ON call_sessions(chat_id);
CREATE INDEX idx_game_sessions_chat_id ON game_sessions(chat_id);
CREATE INDEX idx_users_status ON users(status);

-- Create functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_sessions_updated_at BEFORE UPDATE ON game_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically clean up old typing indicators
CREATE OR REPLACE FUNCTION cleanup_typing_indicators()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM typing_indicators 
    WHERE created_at < NOW() - INTERVAL '5 seconds';
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger to clean up typing indicators
CREATE TRIGGER cleanup_typing_indicators_trigger
    AFTER INSERT ON typing_indicators
    FOR EACH STATEMENT EXECUTE FUNCTION cleanup_typing_indicators();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for chats
CREATE POLICY "Users can view chats they participate in" ON chats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_participants 
            WHERE chat_participants.chat_id = chats.id 
            AND chat_participants.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create chats" ON chats
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Chat admins can update chats" ON chats
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM chat_participants 
            WHERE chat_participants.chat_id = chats.id 
            AND chat_participants.user_id = auth.uid()
            AND chat_participants.role = 'admin'
        )
    );

-- RLS Policies for chat_participants
CREATE POLICY "Users can view participants of chats they're in" ON chat_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_participants cp 
            WHERE cp.chat_id = chat_participants.chat_id 
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join chats" ON chat_participants
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can leave chats" ON chat_participants
    FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage participants" ON chat_participants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM chat_participants cp 
            WHERE cp.chat_id = chat_participants.chat_id 
            AND cp.user_id = auth.uid()
            AND cp.role = 'admin'
        )
    );

-- RLS Policies for messages
CREATE POLICY "Users can view messages in chats they participate in" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_participants 
            WHERE chat_participants.chat_id = messages.chat_id 
            AND chat_participants.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to chats they participate in" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM chat_participants 
            WHERE chat_participants.chat_id = messages.chat_id 
            AND chat_participants.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages" ON messages
    FOR DELETE USING (sender_id = auth.uid());

-- RLS Policies for typing_indicators
CREATE POLICY "Users can view typing indicators in chats they participate in" ON typing_indicators
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_participants 
            WHERE chat_participants.chat_id = typing_indicators.chat_id 
            AND chat_participants.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own typing indicators" ON typing_indicators
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for call_sessions
CREATE POLICY "Users can view calls in chats they participate in" ON call_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_participants 
            WHERE chat_participants.chat_id = call_sessions.chat_id 
            AND chat_participants.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create calls in chats they participate in" ON call_sessions
    FOR INSERT WITH CHECK (
        auth.uid() = initiator_id AND
        EXISTS (
            SELECT 1 FROM chat_participants 
            WHERE chat_participants.chat_id = call_sessions.chat_id 
            AND chat_participants.user_id = auth.uid()
        )
    );

CREATE POLICY "Call participants can update call sessions" ON call_sessions
    FOR UPDATE USING (auth.uid() = ANY(participants) OR auth.uid() = initiator_id);

-- RLS Policies for game_sessions
CREATE POLICY "Users can view games in chats they participate in" ON game_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_participants 
            WHERE chat_participants.chat_id = game_sessions.chat_id 
            AND chat_participants.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create games in chats they participate in" ON game_sessions
    FOR INSERT WITH CHECK (
        auth.uid() = ANY(players) AND
        EXISTS (
            SELECT 1 FROM chat_participants 
            WHERE chat_participants.chat_id = game_sessions.chat_id 
            AND chat_participants.user_id = auth.uid()
        )
    );

CREATE POLICY "Game players can update game sessions" ON game_sessions
    FOR UPDATE USING (auth.uid() = ANY(players));

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', true);

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Attachments are accessible to chat participants" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'attachments' AND
        EXISTS (
            SELECT 1 FROM messages m
            JOIN chat_participants cp ON cp.chat_id = m.chat_id
            WHERE m.metadata->>'file_url' LIKE '%' || name || '%'
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can upload attachments" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'attachments');