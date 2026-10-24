-- 3-2. 오래된 개인정보 자동 삭제 (PLAN 5장 보관 기간)
-- 승인·취소·결제된 예약: 퇴실 후 1년 / 거절·만료: 처리 후 6개월이 지나면
-- 이름·이메일·전화·국적·메시지를 지운다. 날짜·금액 기록은 남겨 달력·통계가 깨지지 않게 한다.
alter table public.bookings add column personal_data_deleted_at timestamptz;

create function public.purge_old_personal_data()
returns integer
language sql security definer set search_path = '' as $$
  with purged as (
    update public.bookings
       set guest_name = 'Deleted guest',
           guest_email = 'deleted+' || code || '@invalid.local',
           guest_phone = null,
           nationality = null,
           message = null,
           admin_note = null,
           personal_data_deleted_at = now()
     where personal_data_deleted_at is null
       and (
         (status in ('approved', 'cancelled', 'paid', 'awaiting_payment')
            and check_out < (now() at time zone 'Asia/Seoul')::date - interval '1 year')
         or (status in ('rejected', 'expired')
            and coalesce(decided_at, created_at) < now() - interval '6 months')
       )
    returning 1
  )
  select count(*)::integer from purged;
$$;

revoke execute on function public.purge_old_personal_data() from public, anon, authenticated;
grant execute on function public.purge_old_personal_data() to service_role;
