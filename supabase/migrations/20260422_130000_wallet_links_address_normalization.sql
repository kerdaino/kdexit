update public.wallet_links
set wallet_address = lower(wallet_address)
where wallet_address <> lower(wallet_address);

drop index if exists wallet_links_user_wallet_chain_uidx;

alter table public.wallet_links
drop constraint if exists wallet_links_wallet_address_lowercase_check;

alter table public.wallet_links
add constraint wallet_links_wallet_address_lowercase_check
  check (wallet_address = lower(wallet_address));

create unique index if not exists wallet_links_user_wallet_chain_uidx
  on public.wallet_links (user_id, wallet_address, chain_id);
