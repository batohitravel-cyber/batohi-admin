-- Reviews Schema

create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  user_name text,
  user_avatar text,
  target_id uuid not null, -- ID of the place/restaurant being reviewed
  target_type text not null, -- 'Place', 'Restaurant', 'Guide'
  target_name text, -- Name of the item being reviewed (for display)
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  status text default 'Pending' check (status in ('Pending', 'Approved', 'Rejected', 'Spam')),
  reply text,
  reply_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.reviews enable row level security;

-- Policies
create policy "Public read approved reviews" on public.reviews for select using (status = 'Approved');
create policy "Users can insert reviews" on public.reviews for insert with check (auth.role() = 'authenticated');
create policy "Users can update own reviews" on public.reviews for update using (auth.uid() = user_id);
create policy "Admins can do everything" on public.reviews for all using (true); -- In a real app, check for admin claim

-- Realtime
alter publication supabase_realtime add table public.reviews;
