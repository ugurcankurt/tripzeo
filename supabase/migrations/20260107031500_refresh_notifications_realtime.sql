-- Force refresh realtime publication for notifications
DO $$
BEGIN
    -- Drop if exists
    IF EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime DROP TABLE public.notifications;
    END IF;

    -- Add it back
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
END
$$;
