-- ==========================================
-- FIX: Re-establish the Foreign Key link
-- ==========================================

-- 1. Ensure the place_id column exists
alter table public.audio_stories 
add column if not exists place_id bigint;

-- 2. Drop the constraint if it exists (to start fresh)
alter table public.audio_stories 
drop constraint if exists audio_stories_place_id_fkey;

-- 3. Re-add the Foreign Key constraint explicitly
alter table public.audio_stories 
add constraint audio_stories_place_id_fkey 
foreign key (place_id) 
references public.places(id) 
on delete set null;

-- 4. Reload the schema cache for Realtime (optional but good practice)
NOTIFY pgrst, 'reload config';

-- 5. (Optional) Check for existing orphans
-- This query shows stories that have a place_id but no matching place
-- select * from public.audio_stories where place_id is not null and place_id not in (select id from public.places);
