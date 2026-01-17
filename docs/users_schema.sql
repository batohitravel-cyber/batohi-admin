-- Users/Profiles Schema

create table if not exists public.app_users (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  email text,
  phone_number text,
  address text,
  avatar_url text,
  status text default 'Active' check (status in ('Active', 'Banned', 'Restricted')),
  is_verified boolean default false,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_seen timestamp with time zone
);

-- Enable RLS
alter table public.app_users enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone" on public.app_users for select using (true);
create policy "Users can insert their own profile" on public.app_users for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.app_users for update using (auth.uid() = id);
create policy "Admins can do everything" on public.app_users for all using (true);

-- Realtime
alter publication supabase_realtime add table public.app_users;

-- Trigger to handle new user signup (Optional, but good practice if using Supabase Auth)
-- This assumes you have access to create functions and triggers on auth.users
-- create or replace function public.handle_new_user() 
-- returns trigger as $$
-- begin
--   insert into public.app_users (id, full_name, email, avatar_url)
--   values (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'avatar_url');
--   return new;
-- end;
-- $$ language plpgsql security definer;
--
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();
