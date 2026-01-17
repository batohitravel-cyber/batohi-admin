-- ==========================================
-- DEBUG & FIX: Link Audio Stories to Places
-- ==========================================

-- 1. Ensure RLS allows reading places (Just to be safe)
drop policy if exists "Public read access for places" on public.places;
create policy "Public read access for places" on public.places for select using (true);

-- 2. Data Patch: Auto-link stories to places based on text match
-- This tries to find a place with a similar name to the story title (e.g., 'Golghar') and links them.
update public.audio_stories
set place_id = (
    select id from public.places 
    where public.places.name ilike '%' || split_part(public.audio_stories.title, ' ', 3) || '%' 
    limit 1
)
where place_id is null;

-- Specific fix for 'Golghar' if the above generic one misses
update public.audio_stories
set place_id = (select id from public.places where name ilike '%Golghar%' limit 1)
where title ilike '%Golghar%';

-- 3. Check what is currently in the DB (for your verification in SQL Editor)
select 
    a.title, 
    a.place_id, 
    p.name as place_name 
from public.audio_stories a
left join public.places p on a.place_id = p.id;
