-- 1-2. 표 전체 만들기 (docs/PLAN.md 3-1 ~ 3-8)
-- 금액은 모두 원(KRW) 정수. 날짜는 시각 없는 date 형식(서울 기준).

-- 날짜 겹침 금지 제약에 필요한 확장 기능
create extension if not exists btree_gist with schema extensions;

-- 선택지 목록
create type public.listing_type as enum ('sharehouse', 'studio', 'apartment');
create type public.room_type as enum ('private', 'shared', 'entire');
create type public.booking_status as enum (
  'pending', 'approved', 'rejected', 'cancelled', 'expired',
  'awaiting_payment', 'paid' -- 결제 도입 시 사용
);
create type public.email_type as enum ('received', 'approved', 'rejected', 'cancelled', 'admin_new_request');
create type public.email_status as enum ('sent', 'failed');

-- 고친 시각(updated_at) 자동 갱신
create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 3-1. 지역
create table public.districts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name_en text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3-2. 숙소(건물)
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  district_id uuid not null references public.districts (id) on delete restrict,
  type public.listing_type not null,
  title text not null,
  description text not null default '',
  address_en text not null default '',
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  amenities text[] not null default '{}',
  nearest_station text not null default '',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index listings_district_id_idx on public.listings (district_id);

-- 3-3. 방 (예약 단위)
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete restrict,
  name text not null,
  room_type public.room_type not null,
  monthly_price integer not null check (monthly_price > 0),
  deposit integer not null default 0 check (deposit >= 0),
  maintenance_fee integer not null default 0 check (maintenance_fee >= 0),
  min_nights integer not null default 30 check (min_nights >= 30),
  max_guests integer not null default 1 check (max_guests >= 1),
  size_m2 numeric(6, 1) check (size_m2 > 0),
  features text[] not null default '{}',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index rooms_listing_id_idx on public.rooms (listing_id);

-- 3-4. 사진 (숙소 또는 방 중 정확히 하나에 연결)
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings (id) on delete cascade,
  room_id uuid references public.rooms (id) on delete cascade,
  storage_path text not null, -- 사진 창고 안 위치. 예시 자료는 외부 사진 주소(https://...)
  alt_text text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint photos_one_owner check (num_nonnulls(listing_id, room_id) = 1)
);
create index photos_listing_id_idx on public.photos (listing_id);
create index photos_room_id_idx on public.photos (room_id);

-- 3-5. 예약 요청
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^DB-[A-Z0-9]{6}$'),
  room_id uuid not null references public.rooms (id) on delete restrict,
  check_in date not null,
  check_out date not null, -- 이 날 밤은 숙박에 포함 안 됨
  status public.booking_status not null default 'pending',
  guest_name text not null,
  guest_email text not null,
  guest_phone text,
  nationality text,
  guests_count integer not null default 1 check (guests_count >= 1),
  message text,
  price_snapshot jsonb not null, -- 요청 시점 금액 내역 전체
  total_amount integer not null check (total_amount >= 0),
  admin_note text,
  reject_reason text,
  decided_at timestamptz,
  decided_by uuid references auth.users (id) on delete set null,
  privacy_consent_at timestamptz,
  locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_dates_order check (check_out > check_in),
  -- 핵심 규칙(PLAN 4-4): 확정된 예약끼리는 같은 방에서 날짜가 겹칠 수 없다.
  -- '[)' = 퇴실일 당일은 비어 있음 → 3/31 퇴실, 3/31 입주는 허용
  constraint bookings_no_overlap exclude using gist (
    room_id with =,
    daterange(check_in, check_out, '[)') with &&
  ) where (status in ('approved', 'awaiting_payment', 'paid'))
);
create index bookings_room_id_idx on public.bookings (room_id);
create index bookings_status_idx on public.bookings (status);
create index bookings_guest_email_idx on public.bookings (lower(guest_email));

-- 3-6. 예약 처리 기록
create table public.booking_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  from_status public.booking_status,
  to_status public.booking_status not null,
  actor text not null, -- 'guest' / 'admin:이메일' / 'system'
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index booking_events_booking_id_idx on public.booking_events (booking_id);

-- 3-7. 관리자 명단
create table public.admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3-8. 메일 발송 기록
create table public.email_logs (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings (id) on delete cascade,
  type public.email_type not null,
  status public.email_status not null,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index email_logs_booking_id_idx on public.email_logs (booking_id);

-- 모든 표에 updated_at 자동 갱신 연결
do $$
declare t text;
begin
  foreach t in array array['districts','listings','rooms','photos','bookings','booking_events','admins','email_logs'] loop
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end;
$$;
