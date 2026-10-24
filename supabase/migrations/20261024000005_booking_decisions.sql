-- 2-7. 예약 승인·거절·취소, 2-10. 자동 만료.
-- 상태 변경과 처리 기록을 한 번에(트랜잭션) 처리해서, 중간에 실패하면 아무것도 바뀌지 않게 한다.
-- 서버(비밀 키)만 부를 수 있다. 서버는 부르기 전에 관리자인지 확인한다.

create function public.decide_booking(
  p_booking_id uuid,
  p_action text,          -- 'approve' | 'reject' | 'cancel'
  p_actor text,           -- 'admin:이메일'
  p_reason text,          -- 거절·취소 사유 (손님 메일에 들어감)
  p_auto_reject_reason text, -- 승인 때 겹쳐서 자동 거절되는 요청에 넣을 사유
  p_decided_by uuid
)
returns table (booking_id uuid, new_status public.booking_status, auto boolean)
language plpgsql security definer set search_path = '' as $$
declare
  b public.bookings%rowtype;
  target public.booking_status;
begin
  -- 같은 예약을 두 관리자가 동시에 처리하지 못하게 잠금
  select * into b from public.bookings where id = p_booking_id for update;
  if not found then
    raise exception 'booking_not_found';
  end if;

  if p_action = 'approve' and b.status = 'pending' then
    target := 'approved';
  elsif p_action = 'reject' and b.status = 'pending' then
    target := 'rejected';
  elsif p_action = 'cancel' and b.status in ('approved', 'awaiting_payment', 'paid') then
    target := 'cancelled';
  else
    raise exception 'invalid_transition';
  end if;

  -- 승인 시 확정 예약과 겹치면 여기서 겹침 금지 제약(23P01)이 오류를 낸다
  update public.bookings
     set status = target,
         reject_reason = case when target in ('rejected', 'cancelled') then p_reason else reject_reason end,
         decided_at = now(),
         decided_by = p_decided_by
   where id = p_booking_id;
  insert into public.booking_events (booking_id, from_status, to_status, actor, note)
  values (p_booking_id, b.status, target, p_actor, p_reason);
  booking_id := p_booking_id; new_status := target; auto := false;
  return next;

  -- 승인하면 같은 방·겹치는 날짜의 다른 대기 요청은 자동 거절 (PLAN 4-4)
  if target = 'approved' then
    return query
    with rejected as (
      update public.bookings o
         set status = 'rejected', reject_reason = p_auto_reject_reason, decided_at = now()
       where o.room_id = b.room_id
         and o.id <> b.id
         and o.status = 'pending'
         and daterange(o.check_in, o.check_out, '[)') && daterange(b.check_in, b.check_out, '[)')
      returning o.id
    ), logged as (
      insert into public.booking_events (booking_id, from_status, to_status, actor, note)
      select r.id, 'pending', 'rejected', 'system', 'auto: overlapping booking approved'
        from rejected r
      returning booking_events.booking_id
    )
    select l.booking_id, 'rejected'::public.booking_status, true from logged l;
  end if;
end;
$$;

-- 2-10. 3일 넘게 처리 안 된 요청, 또는 입주일이 지난 대기 요청을 만료 처리
create function public.expire_stale_bookings()
returns table (booking_id uuid)
language sql security definer set search_path = '' as $$
  with expired as (
    update public.bookings
       set status = 'expired', decided_at = now()
     where status = 'pending'
       and (created_at < now() - interval '3 days'
            or check_in <= (now() at time zone 'Asia/Seoul')::date)
    returning id
  )
  insert into public.booking_events (booking_id, from_status, to_status, actor, note)
  select id, 'pending', 'expired', 'system', 'auto: not reviewed in time'
    from expired
  returning booking_events.booking_id;
$$;

-- 방문자·로그인 사용자는 부를 수 없고 서버(service_role)만
revoke execute on function public.decide_booking(uuid, text, text, text, text, uuid) from public, anon, authenticated;
revoke execute on function public.expire_stale_bookings() from public, anon, authenticated;
grant execute on function public.decide_booking(uuid, text, text, text, text, uuid) to service_role;
grant execute on function public.expire_stale_bookings() to service_role;
