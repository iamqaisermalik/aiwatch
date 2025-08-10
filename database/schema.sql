-- AIWatch Database Schema
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- User preferences
    preferences JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{
        "notifications": true,
        "auto_guidance": true,
        "privacy_mode": false,
        "theme": "system"
    }',
    
    -- Subscription info
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    subscription_ends_at TIMESTAMPTZ,
    
    -- Usage tracking
    usage_stats JSONB DEFAULT '{
        "messages_this_month": 0,
        "websites_monitored": 0,
        "last_active": null
    }'
);

-- Browser sessions table
CREATE TABLE public.sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    browser_info JSONB NOT NULL, -- browser type, version, OS
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    
    -- Extension info
    extension_version TEXT,
    extension_id TEXT
);

-- Website contexts table
CREATE TABLE public.contexts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    
    -- Page information
    url TEXT NOT NULL,
    domain TEXT NOT NULL,
    title TEXT,
    meta_description TEXT,
    
    -- Content analysis
    content_summary TEXT,
    page_type TEXT, -- e.g., 'ecommerce', 'article', 'form', 'social'
    key_elements JSONB, -- buttons, forms, links, etc.
    user_intent TEXT, -- inferred user intention
    
    -- Monitoring data
    time_spent INTEGER DEFAULT 0, -- seconds
    scroll_depth FLOAT DEFAULT 0.0, -- percentage
    interactions JSONB DEFAULT '[]', -- clicks, form fills, etc.
    
    -- AI analysis
    ai_insights JSONB DEFAULT '{}',
    guidance_opportunities JSONB DEFAULT '[]',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table
CREATE TABLE public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    context_id UUID REFERENCES public.contexts(id) ON DELETE CASCADE,
    
    -- Conversation metadata
    title TEXT,
    summary TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    message_count INTEGER DEFAULT 0,
    
    -- Context at start of conversation
    initial_context JSONB,
    
    -- Conversation analysis
    topics JSONB DEFAULT '[]',
    sentiment TEXT,
    satisfaction_score FLOAT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Message content
    content TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'suggestion', 'guidance', 'warning')),
    
    -- Context and metadata
    context_snapshot JSONB, -- page state when message was sent
    ai_model TEXT, -- which AI model was used
    processing_time FLOAT, -- response time in seconds
    confidence_score FLOAT, -- AI confidence in response
    
    -- User interaction
    user_feedback TEXT CHECK (user_feedback IN ('helpful', 'not_helpful', 'irrelevant')),
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User insights table (AI-generated user behavior insights)
CREATE TABLE public.insights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Insight details
    insight_type TEXT NOT NULL, -- 'behavior_pattern', 'preference', 'goal', 'challenge'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    confidence FLOAT NOT NULL CHECK (confidence BETWEEN 0 AND 1),
    
    -- Supporting data
    evidence JSONB, -- data points that support this insight
    related_contexts UUID[], -- array of context IDs
    
    -- Lifecycle
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Website patterns table (common patterns across users)
CREATE TABLE public.website_patterns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    domain TEXT NOT NULL,
    pattern_type TEXT NOT NULL, -- 'navigation', 'conversion', 'engagement'
    
    -- Pattern data
    pattern_data JSONB NOT NULL,
    occurrence_count INTEGER DEFAULT 1,
    user_count INTEGER DEFAULT 1,
    
    -- Pattern analysis
    effectiveness_score FLOAT,
    common_issues JSONB DEFAULT '[]',
    optimization_suggestions JSONB DEFAULT '[]',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(domain, pattern_type)
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_active ON public.sessions(is_active, last_active);
CREATE INDEX idx_contexts_user_id ON public.contexts(user_id);
CREATE INDEX idx_contexts_domain ON public.contexts(domain);
CREATE INDEX idx_contexts_created_at ON public.contexts(created_at);
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_insights_user_id ON public.insights(user_id);
CREATE INDEX idx_insights_active ON public.insights(is_active);
CREATE INDEX idx_website_patterns_domain ON public.website_patterns(domain);

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own sessions" ON public.sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own contexts" ON public.contexts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contexts" ON public.contexts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contexts" ON public.contexts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.conversations FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own insights" ON public.insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON public.insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own insights" ON public.insights FOR UPDATE USING (auth.uid() = user_id);

-- Website patterns are readable by all authenticated users
CREATE POLICY "Authenticated users can view website patterns" ON public.website_patterns FOR SELECT USING (auth.role() = 'authenticated');

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contexts_updated_at BEFORE UPDATE ON public.contexts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insights_updated_at BEFORE UPDATE ON public.insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to cleanup old sessions
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void AS $$
BEGIN
    UPDATE public.sessions 
    SET is_active = false 
    WHERE last_active < NOW() - INTERVAL '7 days' AND is_active = true;
END;
$$ language plpgsql;

-- Real-time subscriptions setup
-- Enable real-time for necessary tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contexts;