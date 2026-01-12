-- Add partner_commission column to bookings
-- 'commission_amount' is already used for platform fees
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS partner_commission numeric DEFAULT 0;
