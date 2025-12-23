-- Create the audio_stories table
create table if not exists public.audio_stories (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  audio_url text not null,
  place_id bigint references public.places(id) on delete set null,
  language text not null,
  transcript text,
  status text default 'Draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.audio_stories enable row level security;

-- Create policies (Adjust based on your auth setup)
create policy "Public read access"
  on public.audio_stories for select
  using (true);

create policy "Authenticated insert access"
  on public.audio_stories for insert
  with check (auth.role() = 'authenticated' or auth.role() = 'anon'); -- Allowing anon for demo purposes if needed, preferably authenticated only

create policy "Authenticated update access"
  on public.audio_stories for update
  using (auth.role() = 'authenticated' or auth.role() = 'anon');

-- Storage Bucket Policy (You need to create a bucket named 'audio-stories' first)
-- insert into storage.buckets (id, name, public) values ('audio-stories', 'audio-stories', true);
-- create policy "Public Access" on storage.objects for select using ( bucket_id = 'audio-stories' );
-- create policy "Auth Upload" on storage.objects for insert with check ( bucket_id = 'audio-stories' );
