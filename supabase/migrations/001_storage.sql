-- Supabase Storage: case-files bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'case-files',
  'case-files',
  false,
  52428800, -- 50MB (STL için max)
  array[
    'model/stl',
    'application/octet-stream',
    'application/pdf',
    'image/png',
    'image/jpeg',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
) on conflict do nothing;

-- RLS: Sadece dosyanın sahibi erişebilir
-- Dosya yolu: {user_id}/{case_id}/{filename}

create policy "Kullanıcı kendi dosyalarını yükler"
on storage.objects for insert
to authenticated
with check (bucket_id = 'case-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Kullanıcı kendi dosyalarını okur"
on storage.objects for select
to authenticated
using (bucket_id = 'case-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Kullanıcı kendi dosyalarını siler"
on storage.objects for delete
to authenticated
using (bucket_id = 'case-files' and (storage.foldername(name))[1] = auth.uid()::text);
