create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  email text not null,
  password text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists users_email_lower_unique
  on public.users (lower(email));

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 100),
  description text,
  color text not null default '#8B5CF6' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists collections_user_name_lower_unique
  on public.collections (user_id, lower(name));

create table if not exists public.snippets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  collection_id uuid references public.collections(id) on delete set null,
  title text not null check (char_length(trim(title)) between 1 and 200),
  code text not null,
  language text,
  description text,
  tags text[] not null default '{}',
  is_favorite boolean not null default false,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint snippets_tags_max_count check (cardinality(tags) <= 20)
);

create index if not exists snippets_user_updated_idx
  on public.snippets (user_id, updated_at desc, created_at desc);

create index if not exists snippets_tags_gin_idx
  on public.snippets using gin (tags);

create index if not exists snippets_public_updated_idx
  on public.snippets (updated_at desc)
  where is_public = true;

alter table public.users enable row level security;
alter table public.collections enable row level security;
alter table public.snippets enable row level security;
