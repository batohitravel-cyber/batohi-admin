-- ==========================================
-- Festivals & Culture Schema
-- ==========================================

-- 1. Table: festivals
create table if not exists public.festivals (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text,
    start_date date not null,
    end_date date,
    location text,
    status text default 'Draft', -- Draft, Published, Past
    images text[],               -- Array of image URLs
    is_featured boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

alter table public.festivals enable row level security;

create policy "Public read festivals" on public.festivals for select using (true);
create policy "Auth all festivals" on public.festivals for all using (auth.role() = 'authenticated' or auth.role() = 'anon');

-- ==========================================
-- REALTIME
-- ==========================================

alter publication supabase_realtime add table public.festivals;

-- ==========================================
-- STORAGE
-- ==========================================

insert into storage.buckets (id, name, public) values ('festivals-media', 'festivals-media', true) on conflict (id) do nothing;

create policy "Public Read Festivals Media" on storage.objects for select using ( bucket_id = 'festivals-media' );
create policy "Auth Upload Festivals Media" on storage.objects for insert with check ( bucket_id = 'festivals-media' );
