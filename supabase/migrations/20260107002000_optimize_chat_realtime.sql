-- Add receiver_id column
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Backfill receiver_id for existing messages
DO $$
DECLARE
    r RECORD;
    rec_id UUID;
BEGIN
    FOR r IN SELECT m.id, m.sender_id, b.user_id as booking_user, b.host_id as booking_host
             FROM public.messages m
             JOIN public.conversations c ON m.conversation_id = c.id
             JOIN public.bookings b ON c.booking_id = b.id
             WHERE m.receiver_id IS NULL
    LOOP
        IF r.sender_id = r.booking_user THEN
            rec_id := r.booking_host;
        ELSE
            rec_id := r.booking_user;
        END IF;

        UPDATE public.messages
        SET receiver_id = rec_id
        WHERE id = r.id;
    END LOOP;
END $$;

-- Update RLS for Messages to be simpler and index-friendly for Realtime
DROP POLICY IF EXISTS "Messages are viewable by participants" ON public.messages;
CREATE POLICY "Messages are viewable by participants"
ON public.messages FOR SELECT
USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
);

-- Ensure Realtime is enabled for messages
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
