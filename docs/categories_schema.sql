create table public.categories (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  slug text not null,
  icon text null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint categories_pkey primary key (id),
  constraint categories_slug_key unique (slug)
) TABLESPACE pg_default;