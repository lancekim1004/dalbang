-- 예시 자료 (포트폴리오 데모용 가상 숙소). 이 파일은 DB를 처음 채울 때 한 번 실행.
-- 다시 실행해도 같은 ID라 중복되지 않음 (이미 있으면 덮어씀).
-- 지도 좌표는 정확한 집이 아니라 동네 근처. 사진은 Unsplash 무료 사진.
begin;

insert into public.districts (id, slug, name_en, sort_order) values
  ('06e198b9-3c8d-5a33-b955-c800e9c95a42', 'mapo', 'Mapo · Hongdae', 1),
  ('367d0512-ddbb-5c17-9736-d4c4aa5908f4', 'seodaemun', 'Seodaemun · Sinchon', 2),
  ('3f23dd5c-9ae7-565a-911b-d83a1cf0c09b', 'jongno', 'Jongno · Bukchon', 3),
  ('add627fc-a909-5290-ae75-a138b416524a', 'yongsan', 'Yongsan · Itaewon', 4),
  ('343fb6f3-a58e-54e5-9717-8de3d6089285', 'seongdong', 'Seongdong · Seongsu', 5),
  ('52e39ed2-e9a0-57a2-8a8d-264362878675', 'gangnam', 'Gangnam', 6),
  ('3d804249-f6a8-555c-a3e0-81aeba600af6', 'songpa', 'Songpa · Jamsil', 7)
on conflict (id) do update set slug = excluded.slug, name_en = excluded.name_en, sort_order = excluded.sort_order;

insert into public.listings (id, district_id, type, title, description, address_en, lat, lng, amenities, nearest_station, is_published) values
  ('c8cfbff6-6fa1-55e5-b8f6-9125ec12c058', '06e198b9-3c8d-5a33-b955-c800e9c95a42', 'sharehouse', 'Hongdae Garden House',
   'A bright four-room share house on a quiet street, five minutes from Hongik Univ. Station. Shared kitchen, rooftop garden, and a friendly mix of students and creatives.',
   'Seogyo-dong, Mapo-gu, Seoul', 37.5546, 126.9203, array['wifi', 'washer', 'kitchen', 'rooftop', 'airConditioning']::text[], 'Hongik Univ. (Line 2) · 5 min walk', true),
  ('1f60d651-926e-5293-9810-a8917d92b8d6', '06e198b9-3c8d-5a33-b955-c800e9c95a42', 'studio', 'Yeonnam Park Studios',
   'Compact studios next to Gyeongui Line Forest Park. Each studio has its own bathroom and kitchenette — ideal for remote workers who want cafés on their doorstep.',
   'Yeonnam-dong, Mapo-gu, Seoul', 37.5625, 126.925, array['wifi', 'washer', 'airConditioning', 'workspace']::text[], 'Hongik Univ. (Line 2) · 8 min walk', true),
  ('5f8cad71-0d7d-5ec5-ac97-2f0ca20a006b', '367d0512-ddbb-5c17-9736-d4c4aa5908f4', 'sharehouse', 'Sinchon Campus Share',
   'Popular with language students at Yonsei and Sogang. Study lounge, weekly cleaning of shared spaces, and English-speaking house manager.',
   'Changcheon-dong, Seodaemun-gu, Seoul', 37.559, 126.938, array['wifi', 'washer', 'kitchen', 'cleaning', 'studyLounge']::text[], 'Sinchon (Line 2) · 4 min walk', true),
  ('71556b68-a7ab-567d-8919-a1556bc5dfb0', '3f23dd5c-9ae7-565a-911b-d83a1cf0c09b', 'sharehouse', 'Bukchon Hanok Stay',
   'Live in a renovated traditional hanok with a courtyard, between Gyeongbokgung and Changdeokgung palaces. Modern heating, shared kitchen, and a slower pace of Seoul life.',
   'Gahoe-dong, Jongno-gu, Seoul', 37.582, 126.9845, array['wifi', 'washer', 'kitchen', 'courtyard', 'floorHeating']::text[], 'Anguk (Line 3) · 7 min walk', true),
  ('17bc2e65-fca3-50fc-81ba-13fe814ee5a9', 'add627fc-a909-5290-ae75-a138b416524a', 'apartment', 'Itaewon Hill Lofts',
   'Spacious one-bedroom lofts on Itaewon''s hillside with city views. Walk to international restaurants, Namsan trails, and Line 6.',
   'Itaewon-dong, Yongsan-gu, Seoul', 37.5355, 126.9925, array['wifi', 'washer', 'kitchen', 'airConditioning', 'elevator']::text[], 'Itaewon (Line 6) · 6 min walk', true),
  ('655b52ae-ac43-5b61-b5ac-cac761e69a2d', '343fb6f3-a58e-54e5-9717-8de3d6089285', 'sharehouse', 'Seongsu Co-living',
   'A design-forward co-living building in Seoul''s ''Brooklyn''. Private rooms with shared coworking floor, gym, and monthly community dinners.',
   'Seongsu-dong, Seongdong-gu, Seoul', 37.544, 127.056, array['wifi', 'washer', 'kitchen', 'gym', 'workspace', 'elevator']::text[], 'Seongsu (Line 2) · 3 min walk', true),
  ('de57e612-6d35-516c-8463-5fbffa48a98e', '52e39ed2-e9a0-57a2-8a8d-264362878675', 'studio', 'Gangnam Station Residence',
   'Fully furnished officetel studios two minutes from Gangnam Station. Security desk, parcel room, and fast transit to anywhere in Seoul.',
   'Yeoksam-dong, Gangnam-gu, Seoul', 37.4985, 127.03, array['wifi', 'washer', 'airConditioning', 'elevator', 'security']::text[], 'Gangnam (Line 2, Shinbundang) · 2 min walk', true),
  ('9de64ffc-b71a-5925-8e8d-7a7841e1defa', '3d804249-f6a8-555c-a3e0-81aeba600af6', 'apartment', 'Jamsil Lakeside Apartment',
   'Family-size apartment rooms near Seokchon Lake and Lotte World Tower. Quiet residential area, big supermarket nearby, and easy airport bus access.',
   'Jamsil-dong, Songpa-gu, Seoul', 37.511, 127.098, array['wifi', 'washer', 'kitchen', 'elevator', 'parking']::text[], 'Jamsil (Line 2, 8) · 6 min walk', true)
on conflict (id) do update set district_id = excluded.district_id, type = excluded.type, title = excluded.title, description = excluded.description, address_en = excluded.address_en, lat = excluded.lat, lng = excluded.lng, amenities = excluded.amenities, nearest_station = excluded.nearest_station, is_published = excluded.is_published;

insert into public.rooms (id, listing_id, name, room_type, monthly_price, deposit, maintenance_fee, min_nights, max_guests, size_m2, features, is_published) values
  ('cffec1dc-da44-5f56-8173-0d4665b109f3', 'c8cfbff6-6fa1-55e5-b8f6-9125ec12c058', 'Room A · Sunny corner', 'private', 750000, 500000, 80000, 30, 1, 11, array['desk', 'wardrobe', 'window']::text[], true),
  ('2db67473-9c0e-5b15-b9f2-0d52668674e0', 'c8cfbff6-6fa1-55e5-b8f6-9125ec12c058', 'Room B · Private bathroom', 'private', 890000, 500000, 80000, 30, 1, 13, array['privateBathroom', 'desk', 'wardrobe']::text[], true),
  ('d2c684ff-ca51-5b6c-98ac-d3d7c659c66d', 'c8cfbff6-6fa1-55e5-b8f6-9125ec12c058', 'Room C · Double bed', 'private', 820000, 500000, 80000, 30, 2, 14, array['doubleBed', 'desk']::text[], true),
  ('2bdd8139-2060-5e1c-9490-99c07f4fb2a8', 'c8cfbff6-6fa1-55e5-b8f6-9125ec12c058', 'Shared room · Bed 1', 'shared', 480000, 300000, 60000, 30, 1, 18, array['locker', 'readingLight']::text[], true),
  ('ebdbc3e0-f049-5966-a006-eba9578b75ba', '1f60d651-926e-5293-9810-a8917d92b8d6', 'Studio 201', 'entire', 1150000, 1000000, 100000, 30, 1, 20, array['privateBathroom', 'kitchenette', 'desk']::text[], true),
  ('f32b5d10-f12d-5656-b50e-dcf973d6fab1', '1f60d651-926e-5293-9810-a8917d92b8d6', 'Studio 302 · Park view', 'entire', 1290000, 1000000, 100000, 30, 2, 23, array['privateBathroom', 'kitchenette', 'parkView', 'doubleBed']::text[], true),
  ('c2535330-fa7e-58af-beb0-84ea6b665f51', '5f8cad71-0d7d-5ec5-ac97-2f0ca20a006b', 'Room 1', 'private', 650000, 300000, 70000, 30, 1, 9, array['desk', 'wardrobe']::text[], true),
  ('91e821b5-0bf7-55d2-a5f4-49fad97fa4cd', '5f8cad71-0d7d-5ec5-ac97-2f0ca20a006b', 'Room 2 · Balcony', 'private', 720000, 300000, 70000, 30, 1, 10, array['balcony', 'desk']::text[], true),
  ('2356a451-d83b-5298-b6bf-01295b40795d', '5f8cad71-0d7d-5ec5-ac97-2f0ca20a006b', 'Shared room · Bed 2', 'shared', 450000, 200000, 60000, 30, 1, 16, array['locker']::text[], true),
  ('882c0b79-a7ba-5121-8b9e-2ea054e60ee2', '71556b68-a7ab-567d-8919-a1556bc5dfb0', 'Moon Room · Courtyard view', 'private', 980000, 700000, 90000, 60, 2, 12, array['courtyardView', 'floorBed', 'floorHeating']::text[], true),
  ('38a6e6f9-28f4-53e8-a315-72ec4c5a2762', '71556b68-a7ab-567d-8919-a1556bc5dfb0', 'Pine Room', 'private', 920000, 700000, 90000, 30, 1, 10, array['floorBed', 'floorHeating']::text[], true),
  ('25be8950-91dc-509b-a08f-a48459f31909', '17bc2e65-fca3-50fc-81ba-13fe814ee5a9', 'Loft A · City view', 'entire', 2100000, 2000000, 150000, 30, 2, 38, array['privateBathroom', 'fullKitchen', 'cityView', 'doubleBed']::text[], true),
  ('47ecfa4d-1cf8-54c1-8833-6273154d534c', '17bc2e65-fca3-50fc-81ba-13fe814ee5a9', 'Loft B', 'entire', 1850000, 2000000, 150000, 30, 2, 33, array['privateBathroom', 'fullKitchen', 'doubleBed']::text[], true),
  ('0acf3895-af04-5f04-af48-73f38e40f3b6', '655b52ae-ac43-5b61-b5ac-cac761e69a2d', 'Room 501', 'private', 870000, 500000, 120000, 30, 1, 12, array['privateBathroom', 'desk']::text[], true),
  ('052b428c-9d33-5c35-b196-bcc2c53ac73c', '655b52ae-ac43-5b61-b5ac-cac761e69a2d', 'Room 502 · Corner', 'private', 940000, 500000, 120000, 30, 1, 14, array['privateBathroom', 'desk', 'window']::text[], true),
  ('1a57e389-2c11-583c-a156-66b1a696a0ea', '655b52ae-ac43-5b61-b5ac-cac761e69a2d', 'Room 601 · Double', 'private', 1050000, 500000, 120000, 30, 2, 16, array['privateBathroom', 'doubleBed', 'desk']::text[], true),
  ('6c360d6d-c26f-5569-a8d4-6b3b9c4681be', 'de57e612-6d35-516c-8463-5fbffa48a98e', 'Studio 1203', 'entire', 1450000, 1500000, 130000, 30, 1, 21, array['privateBathroom', 'kitchenette', 'desk']::text[], true),
  ('64a3c696-8edf-5e8c-8ba7-e0dd76c4a56b', 'de57e612-6d35-516c-8463-5fbffa48a98e', 'Studio 1507 · High floor', 'entire', 1590000, 1500000, 130000, 30, 2, 24, array['privateBathroom', 'kitchenette', 'cityView', 'doubleBed']::text[], true),
  ('615dbf26-d1ee-527d-950a-dccedc4c1fb6', '9de64ffc-b71a-5925-8e8d-7a7841e1defa', 'Master bedroom', 'private', 1100000, 1000000, 100000, 30, 2, 15, array['privateBathroom', 'doubleBed', 'wardrobe']::text[], true),
  ('5786095b-04f0-5b4c-afe4-80a5bff80c2c', '9de64ffc-b71a-5925-8e8d-7a7841e1defa', 'Small bedroom', 'private', 790000, 1000000, 100000, 30, 1, 9, array['desk', 'wardrobe']::text[], true)
on conflict (id) do update set listing_id = excluded.listing_id, name = excluded.name, room_type = excluded.room_type, monthly_price = excluded.monthly_price, deposit = excluded.deposit, maintenance_fee = excluded.maintenance_fee, min_nights = excluded.min_nights, max_guests = excluded.max_guests, size_m2 = excluded.size_m2, features = excluded.features, is_published = excluded.is_published;

insert into public.photos (id, listing_id, room_id, storage_path, alt_text, sort_order) values
  ('c8943834-9de8-5f47-80f1-6a8bca88f8f7', 'c8cfbff6-6fa1-55e5-b8f6-9125ec12c058', null, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=75', 'Hongdae Garden House — photo 1', 0),
  ('c6b23ea7-5959-570b-9ee9-79b938c59b26', 'c8cfbff6-6fa1-55e5-b8f6-9125ec12c058', null, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=75', 'Hongdae Garden House — photo 2', 1),
  ('24a5876b-b93e-590d-bbc1-9c30c846d722', 'c8cfbff6-6fa1-55e5-b8f6-9125ec12c058', null, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=75', 'Hongdae Garden House — photo 3', 2),
  ('19c20462-4d51-5432-89a8-d2552f197f9a', '1f60d651-926e-5293-9810-a8917d92b8d6', null, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=75', 'Yeonnam Park Studios — photo 1', 0),
  ('ee87c023-b7a5-5759-8bbb-b752fe10af1a', '1f60d651-926e-5293-9810-a8917d92b8d6', null, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=75', 'Yeonnam Park Studios — photo 2', 1),
  ('5ba64446-538f-54c1-a830-bddaa856fdc4', '5f8cad71-0d7d-5ec5-ac97-2f0ca20a006b', null, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=75', 'Sinchon Campus Share — photo 1', 0),
  ('2bfec994-b54d-57d4-8d0e-6188e83d173b', '5f8cad71-0d7d-5ec5-ac97-2f0ca20a006b', null, 'https://images.unsplash.com/photo-1556020685-ae41abfc9365?auto=format&fit=crop&w=1200&q=75', 'Sinchon Campus Share — photo 2', 1),
  ('d5a096af-f98e-5fe5-b292-5ecf4499c6d4', '71556b68-a7ab-567d-8919-a1556bc5dfb0', null, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=75', 'Bukchon Hanok Stay — photo 1', 0),
  ('64ad3500-2276-5174-a11c-eb786ff60b4a', '71556b68-a7ab-567d-8919-a1556bc5dfb0', null, 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=75', 'Bukchon Hanok Stay — photo 2', 1),
  ('989aa49f-5229-517b-8275-7fef7476f58c', '71556b68-a7ab-567d-8919-a1556bc5dfb0', null, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=75', 'Bukchon Hanok Stay — photo 3', 2),
  ('04a6aa95-1810-5f99-8527-17cc586e3c68', '17bc2e65-fca3-50fc-81ba-13fe814ee5a9', null, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=75', 'Itaewon Hill Lofts — photo 1', 0),
  ('3f7e2186-bd91-5b13-ba2d-8699e6f04b04', '17bc2e65-fca3-50fc-81ba-13fe814ee5a9', null, 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=75', 'Itaewon Hill Lofts — photo 2', 1),
  ('55b4b573-46a3-55fe-97cf-f5470de4e509', '655b52ae-ac43-5b61-b5ac-cac761e69a2d', null, 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=75', 'Seongsu Co-living — photo 1', 0),
  ('491ec1b6-35ae-55f6-8175-7d9e4741687c', '655b52ae-ac43-5b61-b5ac-cac761e69a2d', null, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=75', 'Seongsu Co-living — photo 2', 1),
  ('5a4594ad-5bee-5837-b7b7-d47ed8ad2fd3', '655b52ae-ac43-5b61-b5ac-cac761e69a2d', null, 'https://images.unsplash.com/photo-1556020685-ae41abfc9365?auto=format&fit=crop&w=1200&q=75', 'Seongsu Co-living — photo 3', 2),
  ('ec4e0c72-7b12-5dfe-96e5-0aed811fca80', 'de57e612-6d35-516c-8463-5fbffa48a98e', null, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=75', 'Gangnam Station Residence — photo 1', 0),
  ('1fa13b48-af05-501c-b0f6-c35e54a4270c', 'de57e612-6d35-516c-8463-5fbffa48a98e', null, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=75', 'Gangnam Station Residence — photo 2', 1),
  ('a3d08ff2-eb49-5d33-8441-3aade6b6dbeb', '9de64ffc-b71a-5925-8e8d-7a7841e1defa', null, 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=75', 'Jamsil Lakeside Apartment — photo 1', 0),
  ('bd1834da-d369-5502-a42c-8e19245ef8b4', '9de64ffc-b71a-5925-8e8d-7a7841e1defa', null, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=75', 'Jamsil Lakeside Apartment — photo 2', 1),
  ('4786fd27-7934-5565-b4b8-59cf901554e5', null, 'cffec1dc-da44-5f56-8173-0d4665b109f3', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=75', 'Room A · Sunny corner, Hongdae Garden House — photo 1', 0),
  ('70b675ff-1973-510e-ba46-0a3fadcacf41', null, 'cffec1dc-da44-5f56-8173-0d4665b109f3', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=75', 'Room A · Sunny corner, Hongdae Garden House — photo 2', 1),
  ('e02b51f5-b90e-5ae0-9777-438dbf73040a', null, '2db67473-9c0e-5b15-b9f2-0d52668674e0', 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=75', 'Room B · Private bathroom, Hongdae Garden House — photo 1', 0),
  ('cb854422-44eb-5a55-a1fd-05c9690124e5', null, 'd2c684ff-ca51-5b6c-98ac-d3d7c659c66d', 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=75', 'Room C · Double bed, Hongdae Garden House — photo 1', 0),
  ('046c9485-8aeb-5233-aa34-9002b48581af', null, '2bdd8139-2060-5e1c-9490-99c07f4fb2a8', 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1200&q=75', 'Shared room · Bed 1, Hongdae Garden House — photo 1', 0),
  ('65fb86b8-c205-567d-8743-ba1b0b24a3da', null, 'ebdbc3e0-f049-5966-a006-eba9578b75ba', 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?auto=format&fit=crop&w=1200&q=75', 'Studio 201, Yeonnam Park Studios — photo 1', 0),
  ('6154d91c-006e-5a0b-a403-53c19fc20d8c', null, 'ebdbc3e0-f049-5966-a006-eba9578b75ba', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=75', 'Studio 201, Yeonnam Park Studios — photo 2', 1),
  ('4e81e441-46f7-5667-83e9-d217ab3e5a86', null, 'f32b5d10-f12d-5656-b50e-dcf973d6fab1', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=75', 'Studio 302 · Park view, Yeonnam Park Studios — photo 1', 0),
  ('f9864507-8bc1-52ba-b10a-d9e93de43dbe', null, 'c2535330-fa7e-58af-beb0-84ea6b665f51', 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=75', 'Room 1, Sinchon Campus Share — photo 1', 0),
  ('63514eac-2de3-5d76-80de-5e4eed5f0c35', null, '91e821b5-0bf7-55d2-a5f4-49fad97fa4cd', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=75', 'Room 2 · Balcony, Sinchon Campus Share — photo 1', 0),
  ('fd94256b-c0aa-56d2-a2d2-e963ef60d16f', null, '2356a451-d83b-5298-b6bf-01295b40795d', 'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?auto=format&fit=crop&w=1200&q=75', 'Shared room · Bed 2, Sinchon Campus Share — photo 1', 0),
  ('4d9835cd-4ec7-545f-bd43-4e212cd0066a', null, '882c0b79-a7ba-5121-8b9e-2ea054e60ee2', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=75', 'Moon Room · Courtyard view, Bukchon Hanok Stay — photo 1', 0),
  ('8be99b9a-2c67-5fc3-af62-ecb4cf619699', null, '882c0b79-a7ba-5121-8b9e-2ea054e60ee2', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=75', 'Moon Room · Courtyard view, Bukchon Hanok Stay — photo 2', 1),
  ('4e00d141-5e0f-5005-9383-197ce10f02d0', null, '38a6e6f9-28f4-53e8-a315-72ec4c5a2762', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=75', 'Pine Room, Bukchon Hanok Stay — photo 1', 0),
  ('9ffa8dc2-6f44-56ae-bd05-84f4c3008cb2', null, '25be8950-91dc-509b-a08f-a48459f31909', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=75', 'Loft A · City view, Itaewon Hill Lofts — photo 1', 0),
  ('61e4f32d-d128-56cc-8155-2c6144fb8bf5', null, '25be8950-91dc-509b-a08f-a48459f31909', 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=75', 'Loft A · City view, Itaewon Hill Lofts — photo 2', 1),
  ('ebdde854-5010-5247-a335-f0f9196533d4', null, '47ecfa4d-1cf8-54c1-8833-6273154d534c', 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=75', 'Loft B, Itaewon Hill Lofts — photo 1', 0),
  ('83ac1628-69df-5f1f-9469-1a840c3998e9', null, '0acf3895-af04-5f04-af48-73f38e40f3b6', 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?auto=format&fit=crop&w=1200&q=75', 'Room 501, Seongsu Co-living — photo 1', 0),
  ('7ed629d7-3839-5ec1-8942-efc8ff643bb8', null, '052b428c-9d33-5c35-b196-bcc2c53ac73c', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=75', 'Room 502 · Corner, Seongsu Co-living — photo 1', 0),
  ('f98aee08-035e-5459-88fd-3a8d4b9fb013', null, '1a57e389-2c11-583c-a156-66b1a696a0ea', 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=75', 'Room 601 · Double, Seongsu Co-living — photo 1', 0),
  ('e1246424-26fa-5c9f-b8fd-67b382bfe60d', null, '6c360d6d-c26f-5569-a8d4-6b3b9c4681be', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=75', 'Studio 1203, Gangnam Station Residence — photo 1', 0),
  ('5c0a4da3-2a61-54bb-959c-480224f23f46', null, '64a3c696-8edf-5e8c-8ba7-e0dd76c4a56b', 'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?auto=format&fit=crop&w=1200&q=75', 'Studio 1507 · High floor, Gangnam Station Residence — photo 1', 0),
  ('f8a2adf1-99a6-5018-9303-5bf0d058e4bd', null, '615dbf26-d1ee-527d-950a-dccedc4c1fb6', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=75', 'Master bedroom, Jamsil Lakeside Apartment — photo 1', 0),
  ('75f35bab-b4aa-5cb0-bd02-5571b29e2fa8', null, '5786095b-04f0-5b4c-afe4-80a5bff80c2c', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=75', 'Small bedroom, Jamsil Lakeside Apartment — photo 1', 0)
on conflict (id) do update set storage_path = excluded.storage_path, alt_text = excluded.alt_text, sort_order = excluded.sort_order;

-- 데모 예약: 실행한 날(서울 기준) 기준 상대 날짜. 가상 손님, 금액 내역은 데모 표시만.
-- 오래되면 이 파일을 다시 실행해 날짜를 새로 맞춘다.
insert into public.bookings (id, code, room_id, check_in, check_out, status, guest_name, guest_email, guests_count, price_snapshot, total_amount, privacy_consent_at) values
  ('422959c7-6833-5643-9994-d9d8f3f0b6fd', 'DB-DEMO01', 'cffec1dc-da44-5f56-8173-0d4665b109f3', (now() at time zone 'Asia/Seoul')::date + 3, (now() at time zone 'Asia/Seoul')::date + 63, 'approved', 'Demo Guest 1', 'demo-guest-1@example.com', 1, '{"demo": true}'::jsonb, 0, now()),
  ('7ef31ec6-8a5b-5ba7-a8d8-8186d191bd2d', 'DB-DEMO02', '2db67473-9c0e-5b15-b9f2-0d52668674e0', (now() at time zone 'Asia/Seoul')::date + -20, (now() at time zone 'Asia/Seoul')::date + 40, 'approved', 'Demo Guest 2', 'demo-guest-2@example.com', 1, '{"demo": true}'::jsonb, 0, now()),
  ('2e8dfd4d-7782-523f-ad48-e9d8c4ed232a', 'DB-DEMO03', 'c2535330-fa7e-58af-beb0-84ea6b665f51', (now() at time zone 'Asia/Seoul')::date + 10, (now() at time zone 'Asia/Seoul')::date + 100, 'approved', 'Demo Guest 3', 'demo-guest-3@example.com', 1, '{"demo": true}'::jsonb, 0, now()),
  ('88ce738e-f343-523c-acc0-30ca2e82753f', 'DB-DEMO04', '882c0b79-a7ba-5121-8b9e-2ea054e60ee2', (now() at time zone 'Asia/Seoul')::date + 30, (now() at time zone 'Asia/Seoul')::date + 120, 'approved', 'Demo Guest 4', 'demo-guest-4@example.com', 1, '{"demo": true}'::jsonb, 0, now()),
  ('9246ef54-1748-5081-b665-4e60716c8798', 'DB-DEMO05', '0acf3895-af04-5f04-af48-73f38e40f3b6', (now() at time zone 'Asia/Seoul')::date + -5, (now() at time zone 'Asia/Seoul')::date + 25, 'approved', 'Demo Guest 5', 'demo-guest-5@example.com', 1, '{"demo": true}'::jsonb, 0, now()),
  ('9169e76c-dd36-544f-816e-310b8c5b0b0a', 'DB-DEMO06', '6c360d6d-c26f-5569-a8d4-6b3b9c4681be', (now() at time zone 'Asia/Seoul')::date + 14, (now() at time zone 'Asia/Seoul')::date + 74, 'pending', 'Demo Guest 6', 'demo-guest-6@example.com', 1, '{"demo": true}'::jsonb, 0, now()),
  ('365a875d-51f5-5810-8b07-6ee2300b84d5', 'DB-DEMO07', '25be8950-91dc-509b-a08f-a48459f31909', (now() at time zone 'Asia/Seoul')::date + 45, (now() at time zone 'Asia/Seoul')::date + 135, 'approved', 'Demo Guest 7', 'demo-guest-7@example.com', 1, '{"demo": true}'::jsonb, 0, now())
on conflict (id) do update set check_in = excluded.check_in, check_out = excluded.check_out, status = excluded.status;

commit;
