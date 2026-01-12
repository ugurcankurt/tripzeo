-- Add 'partner' role to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'partner';

-- Add referral_code to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);

-- Add partner fields to bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS partner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS commission_amount numeric DEFAULT 0;

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_unique_referral_code()
RETURNS text AS $$
DECLARE
    new_code text;
    done bool;
BEGIN
    done := false;
    WHILE NOT done LOOP
        -- Generate a random code: TRIP- + 6 random alphanumeric chars
        -- Using MD5 of random number and taking substring
        new_code := 'TRIP-' || upper(substring(md5(random()::text) from 1 for 6));
        
        -- Check if it exists
        perform 1 from profiles where referral_code = new_code;
        IF NOT FOUND THEN
            done := true;
        END IF;
    END LOOP;
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to assign referral code to NEW partners
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS trigger AS $$
BEGIN
    -- Only assign if role is partner and code is null
    IF new.role = 'partner' AND new.referral_code IS NULL THEN
        new.referral_code := generate_unique_referral_code();
    END IF;
    RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Trigger Drop/Create
DROP TRIGGER IF EXISTS on_partner_created ON profiles;

CREATE TRIGGER on_partner_created
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW
WHEN (NEW.role::text = 'partner' AND NEW.referral_code IS NULL)
EXECUTE PROCEDURE set_referral_code();

-- RLS Update: Partners should be able to view their own referred bookings
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'bookings' 
        AND policyname = 'Partners can view referred bookings'
    ) THEN
        CREATE POLICY "Partners can view referred bookings" 
        ON bookings FOR SELECT 
        USING (auth.uid() = partner_id);
    END IF;
END $$;
