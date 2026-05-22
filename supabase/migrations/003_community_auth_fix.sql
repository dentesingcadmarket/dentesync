-- ============================================================
-- DenteSync — Community Auth Fix
-- Supabase SQL Editor'da çalıştır
-- ============================================================

-- 1. Profiles public read politikası
-- Önceki: profiles_select_own → sadece kendi profilini okuyabiliyordu
-- Sorun: Community'de başkalarının gönderilerinde yazar adı/avatarı görünmüyordu
--        ve createPost içindeki embedded profiles select RLS'e takılıyordu
create policy "profiles_select_community" on profiles
  for select using (true);

-- 2. toggle_post_like SECURITY DEFINER fonksiyonu
-- Sorun: community_posts_update_own RLS'i başkasının postundaki likes counter güncellemesini bloklıyor
-- Bu fonksiyon security definer ile çalışarak RLS'i bypass eder ama auth.uid() ile kullanıcıyı doğrular
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

  select id into v_existing_id
  from post_likes
  where post_id = p_post_id and user_id = v_user_id;

  select likes into v_current_likes
  from community_posts
  where id = p_post_id;

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
