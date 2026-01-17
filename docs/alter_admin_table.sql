-- Safely update the 'admins' table schema without deleting data

-- 1. Add missing columns if they don't exist
alter table public.admins 
  add column if not exists full_name text not null default 'Admin User',
  add column if not exists avatar_url text,
  add column if not exists role text default 'Content Admin',
  add column if not exists permissions text[] default '{}',
  add column if not exists last_login timestamp with time zone,
  add column if not exists avg_time_spent interval default '00:00:00',
  add column if not exists status text default 'Active';

-- 2. Alter columns to ensure correct types and constraints
alter table public.admins 
  alter column full_name drop default, -- Remove the temporary default after adding
  alter column email set not null,
  alter column password set not null,
  alter column created_at set default timezone('utc'::text, now()),
  alter column created_at set not null;

-- 3. Add or update Unique Email Constraint
do $$ 
begin
  if not exists (select 1 from pg_constraint where conname = 'admins_email_key') then
    alter table public.admins add constraint admins_email_key unique (email);
  end if;
end $$;

-- 4. Add or update Role Check Constraint
-- We drop the constraint first if it exists to ensure it's updated with the new values
alter table public.admins drop constraint if exists admins_role_check;
alter table public.admins add constraint admins_role_check 
  check (role in ('Super Admin', 'Content Admin', 'Support', 'Viewer', 'Custom'));

-- 5. Add or update Status Check Constraint
alter table public.admins drop constraint if exists admins_status_check;
alter table public.admins add constraint admins_status_check 
  check (status in ('Active', 'Invited', 'Deactivated'));

-- 6. Ensure RLS is enabled
alter table public.admins enable row level security;
