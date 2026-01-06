-- Add bank details for US/International payouts
ALTER TABLE profiles
ADD COLUMN routing_number text,
ADD COLUMN account_number text,
ADD COLUMN bank_code text, -- BIC/SWIFT
ADD COLUMN bank_country text DEFAULT 'TR'; -- To toggle UI

-- Update RLS (Implicitly covered by existing update policy but good to note)
