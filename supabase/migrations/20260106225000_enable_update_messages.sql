-- Allow participants to update messages (e.g. mark as read)
DROP POLICY IF EXISTS "Messages can be updated by participants" ON public.messages;

CREATE POLICY "Messages can be updated by participants"
ON public.messages FOR UPDATE
USING (
    exists (
        select 1 from public.conversations c
        join public.bookings b on b.id = c.booking_id
        where c.id = conversation_id
        and (b.user_id = auth.uid() OR b.host_id = auth.uid())
    )
)
WITH CHECK (
    exists (
        select 1 from public.conversations c
        join public.bookings b on b.id = c.booking_id
        where c.id = conversation_id
        and (b.user_id = auth.uid() OR b.host_id = auth.uid())
    )
);
