-- Ensure 'commission' exists in transaction_type enum
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'commission';
