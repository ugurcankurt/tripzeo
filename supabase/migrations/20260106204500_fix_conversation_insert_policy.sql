-- Fix: Allow participants to CREATE (INSERT) a new conversation
-- Previously we only allowed SELECT.

DROP POLICY IF EXISTS "Conversations can be created by participants" ON public.conversations;
CREATE POLICY "Conversations can be created by participants"
ON public.conversations FOR INSERT
WITH CHECK (
    exists (
        select 1 from public.bookings b
        where b.id = booking_id
        and (b.user_id = auth.uid() OR b.host_id = auth.uid())
    )
);
