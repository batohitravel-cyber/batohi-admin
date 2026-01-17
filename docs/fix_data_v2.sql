-- ==========================================
-- FIX DATA v2: Aggressive Auto-Link
-- ==========================================

-- 1. Link 'Patna Museum' stories
update public.audio_stories
set place_id = (select id from public.places where name ilike '%Patna Museum%' limit 1)
where title ilike '%Patna Museum%' and place_id is null;

-- 2. Link 'Golghar' stories
update public.audio_stories
set place_id = (select id from public.places where name ilike '%Golghar%' limit 1)
where title ilike '%Golghar%' and place_id is null;

-- 3. Link 'Zoo' stories
update public.audio_stories
set place_id = (select id from public.places where name ilike '%Zoo%' or name ilike '%Sanjay%' limit 1)
where title ilike '%Zoo%' or title ilike '%Sanjay%' and place_id is null;

-- 4. Set a DEFAULT place for any remaining unlinked drafts (Optional - remove if unwanted)
-- update public.audio_stories 
-- set place_id = (select id from public.places limit 1) 
-- where place_id is null;

-- 5. Verification
select title, place_id from public.audio_stories;
