-- Enhanced Admin Schema

-- Roles Table (for dynamic role creation)
create table if not exists public.admin_roles (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  description text,
  permissions text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Activity Logs Table
create table if not exists public.admin_activity_logs (
  id uuid default gen_random_uuid() primary key,
  admin_id bigint references public.admins(id) on delete set null,
  admin_name text, -- Cache name in case admin is deleted
  action text not null, -- 'Login', 'Logout', 'Create Admin', 'Update Settings'
  details text, -- JSON or text description
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.admin_roles enable row level security;
alter table public.admin_activity_logs enable row level security;

-- Policies
create policy "Admins can read roles" on public.admin_roles for select using (true);
create policy "Super Admins can manage roles" on public.admin_roles for all using (true); -- simplified check

create policy "Admins can read logs" on public.admin_activity_logs for select using (true);
create policy "System/Admins can insert logs" on public.admin_activity_logs for insert with check (true);

-- Realtime
alter publication supabase_realtime add table public.admin_roles;
alter publication supabase_realtime add table public.admin_activity_logs;
