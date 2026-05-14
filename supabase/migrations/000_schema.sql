-- ============================================================
-- DenteSync — Tam Veritabanı Şeması
-- Supabase SQL Editor'da çalıştır
-- ============================================================

-- PROFILES (auth.users'a bağlı)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  anthropic_api_key text,
  subscription_tier text check (subscription_tier in ('m1','m2','m3')) default 'm1',
  subscription_status text check (subscription_status in ('active','inactive','trial')) default 'trial',
  stripe_customer_id text,
  created_at timestamptz default now()
);

-- Yeni kullanıcı kayıt olunca otomatik profil oluştur
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- CASES
create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  status text check (status in ('open','in_progress','completed','archived')) default 'open',
  stl_file_url text,
  attachments jsonb default '[]',
  notes text,
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ERROR ANALYSES
create table if not exists error_analyses (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references cases(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade not null,
  error_description text not null,
  ai_analysis text,
  roadmap_impact text,
  severity text check (severity in ('low','medium','high','critical')) default 'medium',
  created_at timestamptz default now()
);

-- PLAN STEPS
create table if not exists plan_steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  step_number integer not null default 1,
  title text not null,
  description text,
  status text check (status in ('pending','in_progress','completed')) default 'pending',
  ai_generated boolean default true,
  parent_step_id uuid references plan_steps(id),
  created_at timestamptz default now()
);

-- PRACTICE SESSIONS
create table if not exists practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  case_data jsonb not null,
  user_answers jsonb default '{}',
  ai_feedback text,
  score integer,
  completed boolean default false,
  created_at timestamptz default now()
);

-- COMMUNITY POSTS
create table if not exists community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  content text,
  image_url text,
  likes integer default 0,
  created_at timestamptz default now()
);

-- COMMUNITY COMMENTS
create table if not exists community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references community_posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- NEWS
create table if not exists news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  excerpt text,
  content text,
  cover_image_url text,
  published_at timestamptz,
  is_published boolean default false,
  author_id uuid references profiles(id)
);

-- STORE PRODUCTS
create table if not exists store_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price decimal(10,2) not null,
  image_urls text[],
  stripe_price_id text,
  stock integer,
  category text,
  is_active boolean default true
);

-- CONSOLE SESSIONS
create table if not exists console_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  messages jsonb default '[]',
  files jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- RLS POLİTİKALARI
-- ============================================================

alter table profiles enable row level security;
alter table cases enable row level security;
alter table error_analyses enable row level security;
alter table plan_steps enable row level security;
alter table practice_sessions enable row level security;
alter table community_posts enable row level security;
alter table community_comments enable row level security;
alter table news enable row level security;
alter table store_products enable row level security;
alter table console_sessions enable row level security;

-- PROFILES
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- CASES
create policy "cases_all_own" on cases for all using (auth.uid() = user_id);

-- ERROR ANALYSES
create policy "error_analyses_all_own" on error_analyses for all using (auth.uid() = user_id);

-- PLAN STEPS
create policy "plan_steps_all_own" on plan_steps for all using (auth.uid() = user_id);

-- PRACTICE SESSIONS
create policy "practice_sessions_all_own" on practice_sessions for all using (auth.uid() = user_id);

-- COMMUNITY POSTS (herkes okur, sahibi yazar/siler)
create policy "community_posts_select_all" on community_posts for select using (true);
create policy "community_posts_insert_own" on community_posts for insert with check (auth.uid() = user_id);
create policy "community_posts_update_own" on community_posts for update using (auth.uid() = user_id);
create policy "community_posts_delete_own" on community_posts for delete using (auth.uid() = user_id);

-- COMMUNITY COMMENTS
create policy "community_comments_select_all" on community_comments for select using (true);
create policy "community_comments_insert_own" on community_comments for insert with check (auth.uid() = user_id);
create policy "community_comments_delete_own" on community_comments for delete using (auth.uid() = user_id);

-- NEWS (herkes okur)
create policy "news_select_published" on news for select using (is_published = true);

-- STORE PRODUCTS (herkes okur)
create policy "store_products_select_active" on store_products for select using (is_active = true);

-- CONSOLE SESSIONS
create policy "console_sessions_all_own" on console_sessions for all using (auth.uid() = user_id);

-- ============================================================
-- REALTIME (plan_steps için)
-- ============================================================

alter publication supabase_realtime add table plan_steps;

-- ============================================================
-- Storage bucket (case-files) — 001_storage.sql ile çakışmasın
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit)
values ('case-files', 'case-files', false, 52428800)
on conflict (id) do nothing;

-- Storage RLS
create policy "case_files_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'case-files' and
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

create policy "case_files_select_own" on storage.objects
  for select using (
    bucket_id = 'case-files' and
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

create policy "case_files_delete_own" on storage.objects
  for delete using (
    bucket_id = 'case-files' and
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );
