-- ============================================================
-- DenteSync — Follows + Profile Stats + Community Fixes
-- Supabase SQL Editor'da çalıştır
-- ============================================================

-- 1. profiles_select_community (eğer 003 çalıştırılmadıysa yeniden ekle)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'profiles' and policyname = 'profiles_select_community'
  ) then
    execute 'create policy "profiles_select_community" on profiles for select using (true)';
  end if;
end $$;

-- 2. toggle_post_like fonksiyonu (eğer 003 çalıştırılmadıysa yeniden oluştur)
create or replace function toggle_post_like(p_post_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_existing_id uuid;
  v_current_likes integer;
  v_new_likes integer;
  v_liked boolean;
begin
  if v_user_id is null then
    return jsonb_build_object('error', 'Oturum açmanız gerekiyor.');
  end if;
  select id into v_existing_id from post_likes where post_id = p_post_id and user_id = v_user_id;
  select likes into v_current_likes from community_posts where id = p_post_id;
  if v_current_likes is null then
    return jsonb_build_object('error', 'Gönderi bulunamadı.');
  end if;
  if v_existing_id is not null then
    delete from post_likes where id = v_existing_id;
    v_new_likes := greatest(v_current_likes - 1, 0);
    v_liked := false;
  else
    insert into post_likes (post_id, user_id) values (p_post_id, v_user_id);
    v_new_likes := v_current_likes + 1;
    v_liked := true;
  end if;
  update community_posts set likes = v_new_likes where id = p_post_id;
  return jsonb_build_object('liked', v_liked, 'likes', v_new_likes);
end;
$$;

-- 3. post_likes tablosu (eğer 002 çalıştırılmadıysa)
create table if not exists post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references community_posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique (post_id, user_id)
);

alter table post_likes enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename='post_likes' and policyname='post_likes_select_all') then
    execute 'create policy "post_likes_select_all" on post_likes for select using (true)';
  end if;
  if not exists (select 1 from pg_policies where tablename='post_likes' and policyname='post_likes_insert_own') then
    execute 'create policy "post_likes_insert_own" on post_likes for insert with check (auth.uid() = user_id)';
  end if;
  if not exists (select 1 from pg_policies where tablename='post_likes' and policyname='post_likes_delete_own') then
    execute 'create policy "post_likes_delete_own" on post_likes for delete using (auth.uid() = user_id)';
  end if;
end $$;

-- 4. community_posts comment_count kolonu (eğer 002 çalıştırılmadıysa)
alter table community_posts add column if not exists comment_count integer default 0;

update community_posts cp
set comment_count = (select count(*) from community_comments cc where cc.post_id = cp.id)
where comment_count = 0;

create or replace function update_comment_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update community_posts set comment_count = comment_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update community_posts set comment_count = greatest(comment_count - 1, 0) where id = OLD.post_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_comment_change on community_comments;
create trigger on_comment_change
  after insert or delete on community_comments
  for each row execute function update_comment_count();

-- 5. Follows tablosu
create table if not exists follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references profiles(id) on delete cascade not null,
  following_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique (follower_id, following_id),
  check (follower_id != following_id)
);

alter table follows enable row level security;

create policy "follows_select_all" on follows for select using (true);
create policy "follows_insert_own" on follows for insert with check (auth.uid() = follower_id);
create policy "follows_delete_own" on follows for delete using (auth.uid() = follower_id);

alter publication supabase_realtime add table follows;

-- 6. profiles'a istatistik sütunları
alter table profiles add column if not exists followers_count integer default 0;
alter table profiles add column if not exists following_count integer default 0;
alter table profiles add column if not exists posts_count integer default 0;

-- 7. Takip trigger'ı
create or replace function update_follow_counts()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update profiles set followers_count = followers_count + 1 where id = NEW.following_id;
    update profiles set following_count = following_count + 1 where id = NEW.follower_id;
  elsif TG_OP = 'DELETE' then
    update profiles set followers_count = greatest(followers_count - 1, 0) where id = OLD.following_id;
    update profiles set following_count = greatest(following_count - 1, 0) where id = OLD.follower_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_follow_change on follows;
create trigger on_follow_change
  after insert or delete on follows
  for each row execute function update_follow_counts();

-- 8. Gönderi sayısı trigger'ı
create or replace function update_posts_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update profiles set posts_count = posts_count + 1 where id = NEW.user_id;
  elsif TG_OP = 'DELETE' then
    update profiles set posts_count = greatest(posts_count - 1, 0) where id = OLD.user_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_community_post_count on community_posts;
create trigger on_community_post_count
  after insert or delete on community_posts
  for each row execute function update_posts_count();

-- 9. Mevcut verileri senkronize et
update profiles p
set posts_count = (select count(*) from community_posts cp where cp.user_id = p.id);

update profiles p
set followers_count = (select count(*) from follows f where f.following_id = p.id);

update profiles p
set following_count = (select count(*) from follows f where f.follower_id = p.id);

-- 10. community-images bucket (eğer 002 çalıştırılmadıysa)
insert into storage.buckets (id, name, public, file_size_limit)
values ('community-images', 'community-images', true, 5242880)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'objects' and policyname = 'community_images_insert_auth'
  ) then
    execute 'create policy "community_images_insert_auth" on storage.objects
      for insert with check (bucket_id = ''community-images'' and auth.role() = ''authenticated'')';
  end if;
  if not exists (
    select 1 from pg_policies
    where tablename = 'objects' and policyname = 'community_images_select_all'
  ) then
    execute 'create policy "community_images_select_all" on storage.objects
      for select using (bucket_id = ''community-images'')';
  end if;
end $$;

-- 11. Realtime (eğer daha önce eklenmemişse)
do $$
begin
  begin
    alter publication supabase_realtime add table community_posts;
  exception when others then null;
  end;
  begin
    alter publication supabase_realtime add table community_comments;
  exception when others then null;
  end;
end $$;
