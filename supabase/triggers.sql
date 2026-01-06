-- Trigger to automatically create a profile entry when a new user signs up via Supabase Auth

-- 1. Create the function for new user handling
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    'user' -- Default role
  );
  return new;
end;
$$;

-- 2. Create the trigger for new user handling
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Fix existing users (Optional: Run this if you already have users without profiles)
insert into public.profiles (id, email, full_name)
select 
    id, 
    email, 
    raw_user_meta_data ->> 'full_name'
from auth.users
where id not in (select id from public.profiles);


-- Trigger to update experience rating when a review is added/changed

-- 4. Create/Replace function for experience rating updates
-- (Includes fix for Review Type logic and Security Definer permissions)
CREATE OR REPLACE FUNCTION update_experience_rating()
RETURNS TRIGGER AS $$
DECLARE
    target_experience_id uuid;
BEGIN
    -- Determine experience_id
    IF (TG_OP = 'DELETE') THEN
        SELECT experience_id INTO target_experience_id FROM bookings WHERE id = OLD.booking_id;
    ELSE
        SELECT experience_id INTO target_experience_id FROM bookings WHERE id = NEW.booking_id;
    END IF;

    -- Update the experience rating stats
    -- Using 'host_review' as per the latest business logic correction
    UPDATE experiences
    SET 
        rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews r
            JOIN bookings b ON b.id = r.booking_id
            WHERE b.experience_id = target_experience_id
            AND r.type = 'host_review' 
        ),
        review_count = (
            SELECT COUNT(*)
            FROM reviews r
            JOIN bookings b ON b.id = r.booking_id
            WHERE b.experience_id = target_experience_id
            AND r.type = 'host_review'
        )
    WHERE id = target_experience_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create the trigger for experience rating updates
DROP TRIGGER IF EXISTS on_review_change ON reviews;

CREATE TRIGGER on_review_change
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_experience_rating();

-- 6. Backfill existing experience ratings
DO $$
DECLARE
    exp_record RECORD;
BEGIN
    FOR exp_record IN SELECT id FROM experiences LOOP
        UPDATE experiences
        SET 
            rating = (
                SELECT COALESCE(AVG(rating), 0)
                FROM reviews r
                JOIN bookings b ON b.id = r.booking_id
                WHERE b.experience_id = exp_record.id
                AND r.type = 'host_review'
            ),
            review_count = (
                SELECT COUNT(*)
                FROM reviews r
                JOIN bookings b ON b.id = r.booking_id
                WHERE b.experience_id = exp_record.id
                AND r.type = 'host_review'
            )
        WHERE id = exp_record.id;
    END LOOP;
END $$;
