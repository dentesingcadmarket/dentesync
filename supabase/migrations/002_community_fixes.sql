-- ============================================================
-- DenteSync — Community Fixes
-- Supabase SQL Editor'da çalıştır
-- ============================================================

-- 1. Realtime yayınına ekle
alter publication supabase_realtime add table community_posts;
alter publication supabase_realtime add table community_comments;

-- 2. post_likes tablosu (beğeni takibi, duplicate önleme)
create table if not exists post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references community_posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique (post_id, user_id)
);

alter table post_likes enable row level security;

create policy "post_likes_select_all" on post_likes for select using (true);
create policy "post_likes_insert_own" on post_likes for insert with check (auth.uid() = user_id);
create policy "post_likes_delete_own" on post_likes for delete using (auth.uid() = user_id);

-- 3. community-images bucket (public, max 5MB)
insert into storage.buckets (id, name, public, file_size_limit)
values ('community-images', 'community-images', true, 5242880)
on conflict (id) do nothing;

create policy "community_images_insert_auth" on storage.objects
  for insert with check (
    bucket_id = 'community-images' and auth.role() = 'authenticated'
  );

create policy "community_images_select_all" on storage.objects
  for select using (bucket_id = 'community-images');

create policy "community_images_delete_own" on storage.objects
  for delete using (
    bucket_id = 'community-images' and
    auth.uid()::text = (string_to_array(name, '/'))[2]
  );

-- 4. community_posts'a comment_count kolonu (denormalize, performans için)
alter table community_posts add column if not exists comment_count integer default 0;

-- Mevcut yorumların sayısını senkronize et
update community_posts cp
set comment_count = (
  select count(*) from community_comments cc where cc.post_id = cp.id
);

-- Trigger: yorum eklenince/silinince comment_count güncelle
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
