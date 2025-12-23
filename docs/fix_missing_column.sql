-- ==========================================
-- FIX: Add missing column to places
-- ==========================================

-- The error "column places_1.image_url does not exist" means your 'places' table
-- is missing the 'image_url' column.

-- 1. Add the column
alter table public.places 
add column if not exists image_url text;

-- 2. (Optional) Sync it with the first image from the 'images' array if it exists
update public.places
set image_url = images[1]
where image_url is null and images is not null and array_length(images, 1) > 0;
