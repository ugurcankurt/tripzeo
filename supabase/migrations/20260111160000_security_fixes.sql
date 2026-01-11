-- Fix Security Advisor Warnings: Set search_path for functions

-- 1. Fix public.handle_updated_at
-- Adding search_path = public to prevent potential hijack
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2. Fix public.update_experience_rating
-- Adding search_path = public to SECURITY DEFINER function
CREATE OR REPLACE FUNCTION public.update_experience_rating()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    target_experience_id uuid;
BEGIN
    -- Determine experience_id
    IF (TG_OP = 'DELETE') THEN
        SELECT experience_id INTO target_experience_id FROM public.bookings WHERE id = OLD.booking_id;
    ELSE
        SELECT experience_id INTO target_experience_id FROM public.bookings WHERE id = NEW.booking_id;
    END IF;

    -- Update the experience rating stats
    UPDATE public.experiences
    SET 
        rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM public.reviews r
            JOIN public.bookings b ON b.id = r.booking_id
            WHERE b.experience_id = target_experience_id
            AND r.type = 'host_review' 
        ),
        review_count = (
            SELECT COUNT(*)
            FROM public.reviews r
            JOIN public.bookings b ON b.id = r.booking_id
            WHERE b.experience_id = target_experience_id
            AND r.type = 'host_review'
        )
    WHERE id = target_experience_id;

    RETURN NULL;
END;
$$;
