-- Allow authenticated users to insert notifications (e.g. sending a message to another user)
CREATE POLICY "Authenticated users can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
