-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create Enums
create type user_role as enum ('user', 'host', 'admin');
create type booking_status as enum ('pending_payment', 'confirmed', 'completed', 'cancelled_by_user', 'cancelled_by_host', 'paid_out', 'pending_host_approval');
create type review_type as enum ('host_review', 'user_review');
create type transaction_type as enum ('payment_in', 'payout', 'refund', 'commission');
create type transaction_status as enum ('pending', 'completed', 'failed');
create type verification_status as enum ('unverified', 'pending', 'verified', 'rejected');

-- Profiles Table (Extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  bio text,
  role user_role default 'user',
  is_verified boolean default false,
  verification_status verification_status default 'unverified',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  iban text,
  bank_name text,
  account_holder text,
  phone text,
  address text,
  city text,
  country text,
  zip_code text,
  state text,
  wise_recipient_id text,
  category_id UUID -- References categories(id) added later
);

-- Categories Table
CREATE TABLE categories (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Experiences (Products) Table
create table experiences (
  id uuid default uuid_generate_v4() primary key,
  host_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  price numeric not null,
  currency text default 'USD',
  duration_minutes integer,
  capacity integer not null,
  location_city text not null,
  location_country text default 'Turkey',
  location_state text,
  location_address text, -- Hidden until booked
  images text[] not null default '{}',
  category text, -- Deprecated/Legacy? Kept for safety.
  is_cancellable boolean default true,
  is_active boolean DEFAULT true,
  rating numeric(3, 2) default 0,
  review_count integer default 0,
  start_time TIME(0),
  end_time TIME(0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bookings Table
create table bookings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  experience_id uuid references experiences(id) on delete cascade not null,
  host_id uuid references profiles(id) on delete cascade not null,
  status booking_status default 'pending_payment',
  booking_date timestamp with time zone not null,
  start_time TIME(0),
  end_time TIME(0),
  duration_minutes INTEGER,
  attendees_count integer default 1,
  total_amount numeric not null, -- What user paid
  host_earnings numeric not null, -- What host gets
  service_fee numeric not null, -- Platform fee
  commission_amount numeric not null, -- Commission
  payment_id text, -- From Iyzipay
  payment_transaction_id text,
  qr_code_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Reviews Table
create table reviews (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references bookings(id) on delete cascade not null,
  reviewer_id uuid references profiles(id) on delete cascade not null,
  reviewee_id uuid references profiles(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  type review_type not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Financial Transactions Table
create table financial_transactions (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references bookings(id) on delete set null,
  user_id uuid references profiles(id) on delete set null, -- User who paid or Host who received
  amount numeric not null,
  currency text default 'USD',
  type transaction_type not null,
  status transaction_status default 'pending',
  description text,
  metadata jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Platform Settings Table
CREATE TABLE IF NOT EXISTS platform_settings (
    key text PRIMARY KEY,
    value numeric NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add Foreign Key Constraint for Profiles -> Categories
-- (Added after table creation to avoid ordering issues)
ALTER TABLE profiles 
ADD CONSTRAINT fk_profiles_category 
FOREIGN KEY (category_id) REFERENCES categories(id);

-- Row Level Security (RLS) Policies

-- Profiles
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);
create policy "Admins can update all profiles" on profiles for update using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone." ON categories FOR SELECT USING (is_active = true OR (select role from profiles where id = auth.uid()) = 'admin');
CREATE POLICY "Admins can manage categories." ON categories FOR ALL USING ((select role from profiles where id = auth.uid()) = 'admin');

-- Experiences
alter table experiences enable row level security;
create policy "Experiences are viewable by everyone." on experiences for select using (true);
create policy "Hosts can insert their own experiences." on experiences for insert with check (auth.uid() = host_id);
create policy "Hosts can update own experiences." on experiences for update using (auth.uid() = host_id);
create policy "Hosts can delete their own experiences." on experiences for delete using (auth.uid() = host_id);
create policy "Admins can update all experiences" on experiences for update using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Bookings
alter table bookings enable row level security;
create policy "Users can view own bookings." on bookings for select using (auth.uid() = user_id or auth.uid() = host_id);
create policy "Users can create bookings." on bookings for insert with check (auth.uid() = user_id);
create policy "Users can update own bookings." on bookings for update using (auth.uid() = user_id);
create policy "Admins can view all bookings" on bookings for select using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);
create policy "Admins can update all bookings" on bookings for update using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Reviews
alter table reviews enable row level security;
create policy "Reviews are viewable by everyone." on reviews for select using (true);
create policy "Participants can create reviews." on reviews for insert with check (auth.uid() = reviewer_id);
create policy "Admins can delete reviews" on reviews for delete using ((select role from profiles where id = auth.uid()) = 'admin');

-- Financial Transactions
alter table financial_transactions enable row level security;
create policy "Users can view own transactions." on financial_transactions for select using (auth.uid() = user_id);
CREATE POLICY "Admins can insert financial transactions" ON financial_transactions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can view all financial transactions" ON financial_transactions FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Platform Settings
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON platform_settings FOR SELECT USING (true);
CREATE POLICY "Allow admin full access" ON platform_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Utility Functions (Triggers handled in triggers.sql)
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profiles_updated before update on profiles for each row execute procedure handle_updated_at();
create trigger on_experiences_updated before update on experiences for each row execute procedure handle_updated_at();
create trigger on_categories_updated before update on categories for each row execute procedure handle_updated_at();

-- Seed Data (Platform Settings & Categories)
INSERT INTO platform_settings (key, value, description) VALUES
('COMMISSION_RATE', 0.12, 'Platform commission rate taken from host earnings (0.12 = 12%)'),
('SERVICE_FEE_RATE', 0.05, 'Service fee rate charged to guests on top of base price (0.05 = 5%)')
ON CONFLICT (key) DO NOTHING;

INSERT INTO categories (name, slug) VALUES
  ('Personal Assistant & Concierge', 'personal-assistant-concierge'),
  ('Transportation', 'transportation'),
  ('Childcare', 'childcare'),
  ('Photography', 'photography'),
  ('Personal Shopper', 'personal-shopper'),
  ('Beauty & Wellness', 'beauty-wellness'),
  ('Equipment Rental', 'equipment-rental'),
  ('Translation & Guiding', 'translation-guiding'),
  ('Cultural & Historical', 'cultural-historical'),
  ('Gastronomy & Culinary', 'gastronomy-culinary'),
  ('Nature & Adventure', 'nature-adventure'),
  ('Art & Creativity', 'art-creativity'),
  ('Entertainment & Nightlife', 'entertainment-nightlife')
ON CONFLICT (name) DO NOTHING;

-- Experience Availability Table
create table if not exists experience_availability (
  id uuid default uuid_generate_v4() primary key,
  experience_id uuid references experiences(id) on delete cascade not null,
  date date not null,
  is_blocked boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Availability
alter table experience_availability enable row level security;

create policy "Availability viewable by everyone." 
  on experience_availability for select using (true);

create policy "Hosts can manage their own experience availability." 
  on experience_availability for all using (
    exists (
      select 1 from experiences 
      where experiences.id = experience_availability.experience_id 
      and experiences.host_id = auth.uid()
    )
  );

-- Add unique constraint for upsert
ALTER TABLE experience_availability
ADD CONSTRAINT experience_availability_experience_id_date_key UNIQUE (experience_id, date);
