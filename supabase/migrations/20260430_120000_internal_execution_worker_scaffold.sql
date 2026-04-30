do $$
begin
  alter type public.execution_attempt_status add value if not exists 'pending';
  alter type public.execution_attempt_status add value if not exists 'blocked';
end
$$;

alter table public.strategies
add column if not exists authorization_status text not null default 'missing',
add column if not exists authorization_reference text,
add column if not exists execution_mode text not null default 'simulation';

alter table public.strategies
drop constraint if exists strategies_authorization_status_check;

alter table public.strategies
add constraint strategies_authorization_status_check
  check (
    authorization_status in (
      'missing',
      'linked_wallet_required',
      'signature_required',
      'pending',
      'authorized',
      'expired',
      'revoked'
    )
  );

alter table public.strategies
drop constraint if exists strategies_execution_mode_check;

alter table public.strategies
add constraint strategies_execution_mode_check
  check (execution_mode in ('simulation', 'dry_run', 'live_disabled'));

alter table public.strategies
drop constraint if exists strategies_authorization_reference_length_check;

alter table public.strategies
add constraint strategies_authorization_reference_length_check
  check (
    authorization_reference is null
    or char_length(authorization_reference) <= 160
  );

alter table public.execution_attempts
add column if not exists execution_mode text not null default 'simulation',
add column if not exists prepared_payload_hash text,
add column if not exists blocked_reason text,
add column if not exists reconciliation_status text not null default 'not_started',
add column if not exists reconciliation_detail text;

alter table public.execution_attempts
drop constraint if exists execution_attempts_execution_mode_check;

alter table public.execution_attempts
add constraint execution_attempts_execution_mode_check
  check (execution_mode in ('simulation', 'dry_run', 'live_disabled'));

alter table public.execution_attempts
drop constraint if exists execution_attempts_prepared_payload_hash_format_check;

alter table public.execution_attempts
add constraint execution_attempts_prepared_payload_hash_format_check
  check (
    prepared_payload_hash is null
    or prepared_payload_hash ~ '^sha256:[a-f0-9]{64}$'
  );

alter table public.execution_attempts
drop constraint if exists execution_attempts_blocked_reason_length_check;

alter table public.execution_attempts
add constraint execution_attempts_blocked_reason_length_check
  check (
    blocked_reason is null
    or char_length(blocked_reason) <= 160
  );

alter table public.execution_attempts
drop constraint if exists execution_attempts_reconciliation_status_check;

alter table public.execution_attempts
add constraint execution_attempts_reconciliation_status_check
  check (
    reconciliation_status in (
      'not_started',
      'not_required',
      'pending',
      'confirmed',
      'failed',
      'mismatch'
    )
  );

alter table public.execution_attempts
drop constraint if exists execution_attempts_reconciliation_detail_length_check;

alter table public.execution_attempts
add constraint execution_attempts_reconciliation_detail_length_check
  check (
    reconciliation_detail is null
    or char_length(reconciliation_detail) <= 240
  );

create index if not exists strategies_authorization_status_idx
  on public.strategies (authorization_status, updated_at desc);

create index if not exists execution_attempts_execution_mode_status_idx
  on public.execution_attempts (execution_mode, status, updated_at desc);

-- Keep the disabled execution boundary intact for browser-visible clients.
drop policy if exists "strategies_insert_own" on public.strategies;
create policy "strategies_insert_own"
on public.strategies
for insert
to authenticated
with check (
  auth.uid() = user_id
  and trigger_enabled = false
  and status <> 'active'
  and authorization_status <> 'authorized'
  and execution_mode <> 'dry_run'
);

drop policy if exists "strategies_update_own" on public.strategies;
create policy "strategies_update_own"
on public.strategies
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and trigger_enabled = false
  and status <> 'active'
  and authorization_status <> 'authorized'
  and execution_mode <> 'dry_run'
);

drop policy if exists "execution_attempts_insert_own" on public.execution_attempts;
create policy "execution_attempts_insert_own"
on public.execution_attempts
for insert
to authenticated
with check (
  auth.uid() = user_id
  and simulation_mode = true
  and execution_mode = 'simulation'
  and transaction_hash is null
);

drop policy if exists "execution_attempts_update_own" on public.execution_attempts;
create policy "execution_attempts_update_own"
on public.execution_attempts
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and simulation_mode = true
  and execution_mode = 'simulation'
  and transaction_hash is null
);
