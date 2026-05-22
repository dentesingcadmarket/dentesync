-- ============================================================
-- 017_fix_rls_policies.sql
-- Kök sorun: 000_schema.sql'de "for all using (...)" formundaki RLS
-- policy'leri WITH CHECK clause'u olmadan tanımlandığı için PostgreSQL
-- INSERT ve UPDATE'leri sessizce reddediyor. Tüm kullanıcı verilerinin
-- (cases, plan_steps, vb.) DB'ye düşmemesinin ana nedeni budur.
--
-- Bu migration:
--  1) Etkilenen tablolardaki eski tek-policy'leri kaldırır
--  2) SELECT / INSERT / UPDATE / DELETE için ayrı, doğru policy'ler ekler
--  3) profiles UPDATE'e WITH CHECK ekler
--  4) community_comments için eksik UPDATE policy'sini ekler
-- Tüm CREATE'lerin önünde DROP IF EXISTS — idempotent.
-- ============================================================

-- ----- CASES -----
drop policy if exists "cases_all_own"     on cases;
drop policy if exists "cases_select_own"  on cases;
drop policy if exists "cases_insert_own"  on cases;
drop policy if exists "cases_update_own"  on cases;
drop policy if exists "cases_delete_own"  on cases;

create policy "cases_select_own" on cases
  for select using (auth.uid() = user_id);
create policy "cases_insert_own" on cases
  for insert with check (auth.uid() = user_id);
create policy "cases_update_own" on cases
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cases_delete_own" on cases
  for delete using (auth.uid() = user_id);

-- ----- ERROR ANALYSES -----
drop policy if exists "error_analyses_all_own"     on error_analyses;
drop policy if exists "error_analyses_select_own"  on error_analyses;
drop policy if exists "error_analyses_insert_own"  on error_analyses;
drop policy if exists "error_analyses_update_own"  on error_analyses;
drop policy if exists "error_analyses_delete_own"  on error_analyses;

create policy "error_analyses_select_own" on error_analyses
  for select using (auth.uid() = user_id);
create policy "error_analyses_insert_own" on error_analyses
  for insert with check (auth.uid() = user_id);
create policy "error_analyses_update_own" on error_analyses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "error_analyses_delete_own" on error_analyses
  for delete using (auth.uid() = user_id);

-- ----- PLAN STEPS -----
drop policy if exists "plan_steps_all_own"     on plan_steps;
drop policy if exists "plan_steps_select_own"  on plan_steps;
drop policy if exists "plan_steps_insert_own"  on plan_steps;
drop policy if exists "plan_steps_update_own"  on plan_steps;
drop policy if exists "plan_steps_delete_own"  on plan_steps;

create policy "plan_steps_select_own" on plan_steps
  for select using (auth.uid() = user_id);
create policy "plan_steps_insert_own" on plan_steps
  for insert with check (auth.uid() = user_id);
create policy "plan_steps_update_own" on plan_steps
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "plan_steps_delete_own" on plan_steps
  for delete using (auth.uid() = user_id);

-- ----- PRACTICE SESSIONS -----
drop policy if exists "practice_sessions_all_own"     on practice_sessions;
drop policy if exists "practice_sessions_select_own"  on practice_sessions;
drop policy if exists "practice_sessions_insert_own"  on practice_sessions;
drop policy if exists "practice_sessions_update_own"  on practice_sessions;
drop policy if exists "practice_sessions_delete_own"  on practice_sessions;

create policy "practice_sessions_select_own" on practice_sessions
  for select using (auth.uid() = user_id);
create policy "practice_sessions_insert_own" on practice_sessions
  for insert with check (auth.uid() = user_id);
create policy "practice_sessions_update_own" on practice_sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "practice_sessions_delete_own" on practice_sessions
  for delete using (auth.uid() = user_id);

-- ----- CONSOLE SESSIONS -----
drop policy if exists "console_sessions_all_own"     on console_sessions;
drop policy if exists "console_sessions_select_own"  on console_sessions;
drop policy if exists "console_sessions_insert_own"  on console_sessions;
drop policy if exists "console_sessions_update_own"  on console_sessions;
drop policy if exists "console_sessions_delete_own"  on console_sessions;

create policy "console_sessions_select_own" on console_sessions
  for select using (auth.uid() = user_id);
create policy "console_sessions_insert_own" on console_sessions
  for insert with check (auth.uid() = user_id);
create policy "console_sessions_update_own" on console_sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "console_sessions_delete_own" on console_sessions
  for delete using (auth.uid() = user_id);

-- ----- PROFILES (UPDATE'e WITH CHECK ekle) -----
drop policy if exists "profiles_update_own" on profiles;

create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ----- COMMUNITY COMMENTS (eksik UPDATE policy'sini ekle) -----
drop policy if exists "community_comments_update_own" on community_comments;

create policy "community_comments_update_own" on community_comments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
