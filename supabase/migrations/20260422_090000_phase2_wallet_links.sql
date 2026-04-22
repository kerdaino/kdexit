create table if not exists public.wallet_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  wallet_address text not null,
  chain_id bigint not null,
  connector_name text,
  label text,
  is_primary boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint wallet_links_wallet_address_format_check
    check (wallet_address ~ '^0x[a-fA-F0-9]{40}$'),
  constraint wallet_links_chain_id_positive_check
    check (chain_id > 0),
  constraint wallet_links_connector_name_length_check
    check (
      connector_name is null
      or char_length(trim(connector_name)) between 1 and 80
    ),
  constraint wallet_links_label_length_check
    check (
      label is null
      or char_length(trim(label)) between 1 and 80
    )
);

create index if not exists wallet_links_user_id_created_at_idx
  on public.wallet_links (user_id, created_at desc);

create index if not exists wallet_links_user_id_is_primary_idx
  on public.wallet_links (user_id, is_primary);

create unique index if not exists wallet_links_user_wallet_chain_uidx
  on public.wallet_links (user_id, wallet_address, chain_id);

create unique index if not exists wallet_links_one_primary_per_user_uidx
  on public.wallet_links (user_id)
  where is_primary;

drop trigger if exists set_wallet_links_updated_at on public.wallet_links;
create trigger set_wallet_links_updated_at
before update on public.wallet_links
for each row
execute function public.set_updated_at();

alter table public.wallet_links enable row level security;

drop policy if exists "wallet_links_select_own" on public.wallet_links;
create policy "wallet_links_select_own"
on public.wallet_links
for select
using (auth.uid() = user_id);

drop policy if exists "wallet_links_insert_own" on public.wallet_links;
create policy "wallet_links_insert_own"
on public.wallet_links
for insert
with check (auth.uid() = user_id);

drop policy if exists "wallet_links_update_own" on public.wallet_links;
create policy "wallet_links_update_own"
on public.wallet_links
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "wallet_links_delete_own" on public.wallet_links;
create policy "wallet_links_delete_own"
on public.wallet_links
for delete
using (auth.uid() = user_id);
