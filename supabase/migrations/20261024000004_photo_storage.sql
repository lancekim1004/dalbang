-- 2-6. 사진 창고(Storage) 'photos'. 누구나 사진을 볼 수 있게 공개(public) 창고로 만든다.
-- 올리기·지우기는 서버(비밀 키)만 한다. 사진 크기·형식 제한을 창고에도 걸어 이중으로 막는다.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 3 * 1024 * 1024, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
