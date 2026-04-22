do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'strategy_evaluation_state'
  ) then
    create type public.strategy_evaluation_state as enum (
      'idle',
      'ready',
      'watching',
      'blocked'
    );
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'execution_attempt_status'
  ) then
    create type public.execution_attempt_status as enum (
      'queued',
      'evaluating',
      'simulated',
      'submitted',
      'confirmed',
      'failed',
      'aborted'
    );
  end if;
end
$$;

alter table public.strategies
add column if not exists evaluation_state public.strategy_evaluation_state not null default 'idle',
add column if not exists last_evaluated_at timestamptz,
add column if not exists next_evaluation_at timestamptz,
add column if not exists simulation_mode boolean not null default true;

create index if not exists strategies_watcher_schedule_idx
  on public.strategies (status, trigger_enabled, next_evaluation_at);

create index if not exists strategies_evaluation_state_idx
  on public.strategies (evaluation_state, updated_at desc);

create table if not exists public.execution_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  strategy_id uuid not null references public.strategies (id) on delete cascade,
  trigger_type public.execution_trigger_type not null,
  status public.execution_attempt_status not null default 'queued',
  simulation_mode boolean not null default true,
  attempt_number integer not null default 1,
  retry_count integer not null default 0,
  failure_reason text,
  transaction_hash text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint execution_attempts_attempt_number_positive_check
    check (attempt_number > 0),
  constraint execution_attempts_retry_count_nonnegative_check
    check (retry_count >= 0),
  constraint execution_attempts_transaction_hash_format_check
    check (
      transaction_hash is null
      or transaction_hash ~ '^0x([A-Fa-f0-9]{64})$'
    )
);

create index if not exists execution_attempts_user_id_created_at_idx
  on public.execution_attempts (user_id, created_at desc);

create index if not exists execution_attempts_strategy_id_created_at_idx
  on public.execution_attempts (strategy_id, created_at desc);

create index if not exists execution_attempts_status_simulation_idx
  on public.execution_attempts (status, simulation_mode, updated_at desc);

create unique index if not exists execution_attempts_strategy_attempt_number_uidx
  on public.execution_attempts (strategy_id, attempt_number);

drop trigger if exists set_execution_attempts_updated_at on public.execution_attempts;
create trigger set_execution_attempts_updated_at
before update on public.execution_attempts
for each row
execute function public.set_updated_at();

alter table public.execution_attempts enable row level security;

drop policy if exists "execution_attempts_select_own" on public.execution_attempts;
create policy "execution_attempts_select_own"
on public.execution_attempts
for select
using (auth.uid() = user_id);

drop policy if exists "execution_attempts_insert_own" on public.execution_attempts;
create policy "execution_attempts_insert_own"
on public.execution_attempts
for insert
with check (auth.uid() = user_id);

drop policy if exists "execution_attempts_update_own" on public.execution_attempts;
create policy "execution_attempts_update_own"
on public.execution_attempts
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "execution_attempts_delete_own" on public.execution_attempts;
create policy "execution_attempts_delete_own"
on public.execution_attempts
for delete
using (auth.uid() = user_id);
