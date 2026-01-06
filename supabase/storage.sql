-- Storage Buckets Setup for Tripzeo

-- 1. Create 'avatars' bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Create 'public_assets' bucket
insert into storage.buckets (id, name, public)
values ('public_assets', 'public_assets', true)
on conflict (id) do nothing;

-- 3. RLS Policies for 'avatars'

-- Allow public access to view avatars
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Allow authenticated users to upload avatars
create policy "Authenticated users can upload avatars."
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'avatars' );

-- Allow users to update their own avatars (optional, depends on file naming strategy)
create policy "Users can update their own avatars."
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'avatars' and auth.uid() = owner );

-- 4. RLS Policies for 'public_assets' (Experience Images)

-- Allow public access to view assets
create policy "Experience images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'public_assets' );

-- Allow authenticated hosts (users) to upload experience images
create policy "Hosts can upload experience images."
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'public_assets' );

-- Allow hosts to delete their own images
create policy "Hosts can delete their own experience images."
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'public_assets' and auth.uid() = owner );

-- Allow admins to delete any image in public_assets
create policy "Admins can delete any experience image."
  on storage.objects for delete
  to authenticated
  using ( 
    bucket_id = 'public_assets' 
    and exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin') 
  );
