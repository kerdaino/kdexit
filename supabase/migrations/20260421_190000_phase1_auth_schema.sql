create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'strategy_status'
  ) then
    create type public.strategy_status as enum (
      'active',
      'paused',
      'triggered',
      'completed'
    );
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'execution_trigger_type'
  ) then
    create type public.execution_trigger_type as enum (
      'take_profit',
      'stop_loss',
      'strategy_created',
      'strategy_updated',
      'strategy_paused',
      'strategy_resumed',
      'strategy_deleted'
    );
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'execution_status'
  ) then
    create type public.execution_status as enum (
      'success',
      'failed',
      'pending'
    );
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  primary_wallet_address text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_primary_wallet_address_format_check
    check (
      primary_wallet_address is null
      or primary_wallet_address ~ '^0x[a-fA-F0-9]{40}$'
    )
);

create table if not exists public.strategies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  token_name text not null,
  token_symbol text not null,
  token_address text not null default '',
  chain text not null,
  chain_id bigint not null,
  sell_percentage numeric(5, 2) not null,
  take_profit_price numeric(20, 8),
  stop_loss_price numeric(20, 8),
  trigger_enabled boolean not null default true,
  slippage numeric(5, 2) not null default 1.00,
  notes text,
  status public.strategy_status not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint strategies_token_name_length_check
    check (char_length(token_name) between 1 and 80),
  constraint strategies_token_symbol_length_check
    check (char_length(token_symbol) between 1 and 10),
  constraint strategies_token_address_format_check
    check (
      token_address = ''
      or token_address ~ '^0x[a-fA-F0-9]{40}$'
    ),
  constraint strategies_chain_id_positive_check
    check (chain_id > 0),
  constraint strategies_sell_percentage_range_check
    check (sell_percentage >= 1 and sell_percentage <= 100),
  constraint strategies_slippage_range_check
    check (slippage >= 0.10 and slippage <= 50.00),
  constraint strategies_notes_length_check
    check (notes is null or char_length(notes) <= 240),
  constraint strategies_price_presence_check
    check (take_profit_price is not null or stop_loss_price is not null),
  constraint strategies_take_profit_positive_check
    check (take_profit_price is null or take_profit_price > 0),
  constraint strategies_stop_loss_positive_check
    check (stop_loss_price is null or stop_loss_price > 0),
  constraint strategies_trigger_price_order_check
    check (
      take_profit_price is null
      or stop_loss_price is null
      or take_profit_price > stop_loss_price
    )
);

create table if not exists public.executions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  strategy_id uuid references public.strategies (id) on delete set null,
  token_symbol text not null,
  trigger_type public.execution_trigger_type not null,
  amount_sold numeric(20, 8),
  status public.execution_status not null default 'pending',
  transaction_hash text,
  error_message text,
  executed_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint executions_token_symbol_length_check
    check (char_length(token_symbol) between 1 and 10),
  constraint executions_amount_sold_nonnegative_check
    check (amount_sold is null or amount_sold >= 0),
  constraint executions_transaction_hash_format_check
    check (
      transaction_hash is null
      or transaction_hash ~ '^0x([A-Fa-f0-9]{64})$'
    )
);

create index if not exists strategies_user_id_created_at_idx
  on public.strategies (user_id, created_at desc);

create index if not exists strategies_user_id_status_idx
  on public.strategies (user_id, status);

create index if not exists executions_user_id_executed_at_idx
  on public.executions (user_id, executed_at desc);

create index if not exists executions_strategy_id_idx
  on public.executions (strategy_id);

create index if not exists executions_user_id_status_idx
  on public.executions (user_id, status);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_strategies_updated_at on public.strategies;
create trigger set_strategies_updated_at
before update on public.strategies
for each row
execute function public.set_updated_at();

drop trigger if exists set_executions_updated_at on public.executions;
create trigger set_executions_updated_at
before update on public.executions
for each row
execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.strategies enable row level security;
alter table public.executions enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "strategies_select_own" on public.strategies;
create policy "strategies_select_own"
on public.strategies
for select
using (auth.uid() = user_id);

drop policy if exists "strategies_insert_own" on public.strategies;
create policy "strategies_insert_own"
on public.strategies
for insert
with check (auth.uid() = user_id);

drop policy if exists "strategies_update_own" on public.strategies;
create policy "strategies_update_own"
on public.strategies
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "strategies_delete_own" on public.strategies;
create policy "strategies_delete_own"
on public.strategies
for delete
using (auth.uid() = user_id);

drop policy if exists "executions_select_own" on public.executions;
create policy "executions_select_own"
on public.executions
for select
using (auth.uid() = user_id);

drop policy if exists "executions_insert_own" on public.executions;
create policy "executions_insert_own"
on public.executions
for insert
with check (auth.uid() = user_id);

drop policy if exists "executions_update_own" on public.executions;
create policy "executions_update_own"
on public.executions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "executions_delete_own" on public.executions;
create policy "executions_delete_own"
on public.executions
for delete
using (auth.uid() = user_id);
