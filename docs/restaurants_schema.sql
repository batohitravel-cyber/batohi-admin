-- ==========================================
-- Restaurants & Festival Foods Schema
-- ==========================================

-- 1. Table: restaurants
create table if not exists public.restaurants (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    address text,
    latitude double precision,
    longitude double precision,
    rating numeric(2,1) default 0.0,
    price_category text check (price_category in ('budget', 'mid-range', 'fine-dining')), -- $, $$, $$$
    images text[],          -- Array of restaurant photos
    menu_images text[],     -- Array of menu page photos
    must_try_dishes text[], -- Array of dish names
    status text default 'Draft',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Table: festival_foods
create table if not exists public.festival_foods (
    id uuid default gen_random_uuid() primary key,
    name text not null,  -- Dish Name
    festival_name text not null, -- e.g. Chhath Puja, Holi
    description text,
    image_url text,
    price numeric(10,2),
    restaurant_id uuid references public.restaurants(id) on delete set null, -- Link to a specific restaurant (optional)
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

alter table public.restaurants enable row level security;
alter table public.festival_foods enable row level security;

-- Policies for restaurants
create policy "Public read restaurants" on public.restaurants for select using (true);
create policy "Auth insert restaurants" on public.restaurants for insert with check (auth.role() = 'authenticated' or auth.role() = 'anon');
create policy "Auth update restaurants" on public.restaurants for update using (auth.role() = 'authenticated' or auth.role() = 'anon');
create policy "Auth delete restaurants" on public.restaurants for delete using (auth.role() = 'authenticated' or auth.role() = 'anon');

-- Policies for festival_foods
create policy "Public read festival_foods" on public.festival_foods for select using (true);
create policy "Auth insert festival_foods" on public.festival_foods for insert with check (auth.role() = 'authenticated' or auth.role() = 'anon');
create policy "Auth update festival_foods" on public.festival_foods for update using (auth.role() = 'authenticated' or auth.role() = 'anon');
create policy "Auth delete festival_foods" on public.festival_foods for delete using (auth.role() = 'authenticated' or auth.role() = 'anon');


-- ==========================================
-- REALTIME REPLICATION
-- ==========================================
alter publication supabase_realtime add table public.restaurants;
alter publication supabase_realtime add table public.festival_foods;


-- ==========================================
-- STORAGE BUCKETS
-- ==========================================

-- Bucket for restaurant images
insert into storage.buckets (id, name, public) values ('restaurants-media', 'restaurants-media', true) on conflict (id) do nothing;

create policy "Public Read Restaurants Media" on storage.objects for select using ( bucket_id = 'restaurants-media' );
create policy "Auth Upload Restaurants Media" on storage.objects for insert with check ( bucket_id = 'restaurants-media' AND (auth.role() = 'authenticated' OR auth.role() = 'anon') );
