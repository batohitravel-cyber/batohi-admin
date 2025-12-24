-- Create the app_users table
create table if not exists public.app_users (
  id uuid not null,
  full_name text null,
  email text null,
  phone_number text null,
  address text null,
  avatar_url text null,
  status text null default 'Active'::text,
  is_verified boolean null default false,
  joined_at timestamp with time zone not null default timezone ('utc'::text, now()),
  last_seen timestamp with time zone null,
  constraint app_users_pkey primary key (id),
  constraint app_users_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint app_users_status_check check (
    (
      status = any (
        array[
          'Active'::text,
          'Banned'::text,
          'Restricted'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

-- Enable RLS
alter table public.app_users enable row level security;

-- Create policies
create policy "Public read access for app_users"
  on public.app_users for select
  using (true);

create policy "Self update access for app_users"
  on public.app_users for update
  using (auth.uid() = id);

create policy "Insert access for app_users"
  on public.app_users for insert
  with check (auth.uid() = id);
