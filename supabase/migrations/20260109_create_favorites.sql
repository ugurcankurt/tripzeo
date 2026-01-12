-- Create favorites table
create table if not exists public.favorites (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  experience_id uuid not null references public.experiences(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  primary key (id),
  unique(user_id, experience_id)
);

-- RLS Policies
alter table public.favorites enable row level security;

-- Policy: Users can view their own favorites
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'favorites' 
        AND policyname = 'Users can view their own favorites'
    ) THEN
        create policy "Users can view their own favorites"
          on public.favorites for select
          using (auth.uid() = user_id);
    END IF;
END $$;

-- Policy: Users can insert their own favorites
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'favorites' 
        AND policyname = 'Users can insert their own favorites'
    ) THEN
        create policy "Users can insert their own favorites"
          on public.favorites for insert
          with check (auth.uid() = user_id);
    END IF;
END $$;

-- Policy: Users can delete their own favorites
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'favorites' 
        AND policyname = 'Users can delete their own favorites'
    ) THEN
        create policy "Users can delete their own favorites"
          on public.favorites for delete
          using (auth.uid() = user_id);
    END IF;
END $$;
