-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(booking_id)
);

-- Enable RLS on conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Conversations
DROP POLICY IF EXISTS "Conversations are viewable by participants" ON public.conversations;
CREATE POLICY "Conversations are viewable by participants"
ON public.conversations FOR SELECT
USING (
    exists (
        select 1 from public.bookings b
        where b.id = booking_id
        and (b.user_id = auth.uid() OR b.host_id = auth.uid())
    )
);

-- RLS Policies for Messages
DROP POLICY IF EXISTS "Messages are viewable by participants" ON public.messages;
CREATE POLICY "Messages are viewable by participants"
ON public.messages FOR SELECT
USING (
    exists (
        select 1 from public.conversations c
        join public.bookings b on b.id = c.booking_id
        where c.id = conversation_id
        and (b.user_id = auth.uid() OR b.host_id = auth.uid())
    )
);

-- Insert allow if user is participant
DROP POLICY IF EXISTS "Messages can be inserted by participants" ON public.messages;
CREATE POLICY "Messages can be inserted by participants"
ON public.messages FOR INSERT
WITH CHECK (
    exists (
        select 1 from public.conversations c
        join public.bookings b on b.id = c.booking_id
        where c.id = conversation_id
        and (b.user_id = auth.uid() OR b.host_id = auth.uid())
    )
    AND
    auth.uid() = sender_id
);

-- Enable Realtime
-- Check if publication exists, otherwise creating it (supabase_realtime is default in Supabase)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    END IF;
END
$$;
