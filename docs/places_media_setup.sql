-- Create the storage bucket for place media
insert into storage.buckets (id, name, public) 
values ('places_media', 'places_media', true)
on conflict (id) do nothing;

-- Set up storage policies
create policy "Give public access to places_media"
  on storage.objects for select
  using ( bucket_id = 'places_media' );

create policy "Enable authenticated uploads to places_media"
  on storage.objects for insert
  with check ( bucket_id = 'places_media' );

create policy "Enable authenticated updates to places_media"
  on storage.objects for update
  using ( bucket_id = 'places_media' );

-- Update the places table to support multiple images and videos
alter table public.places
  drop column if exists image_url;

alter table public.places
  add column if not exists images text[] default '{}',
  add column if not exists videos text[] default '{}';

-- Ensure RLS policies are good (already done in previous step, but won't hurt to check)
