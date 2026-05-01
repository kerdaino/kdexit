alter table public.strategies
add column if not exists authorization_signature text,
add column if not exists authorization_digest text,
add column if not exists authorization_nonce text,
add column if not exists authorization_deadline text,
add column if not exists authorization_adapter text,
add column if not exists authorization_max_amount text,
add column if not exists authorization_wallet_address text,
add column if not exists authorization_signed_at timestamptz,
add column if not exists authorization_cancelled_at timestamptz;

alter table public.strategies
drop constraint if exists strategies_authorization_status_check;

alter table public.strategies
add constraint strategies_authorization_status_check
  check (
    authorization_status in (
      'missing',
      'linked_wallet_required',
      'signature_required',
      'signed',
      'pending',
      'authorized',
      'expired',
      'cancelled',
      'revoked'
    )
  );

alter table public.strategies
drop constraint if exists strategies_authorization_signature_format_check;

alter table public.strategies
add constraint strategies_authorization_signature_format_check
  check (
    authorization_signature is null
    or authorization_signature ~ '^0x[a-fA-F0-9]{130}$'
  );

alter table public.strategies
drop constraint if exists strategies_authorization_digest_format_check;

alter table public.strategies
add constraint strategies_authorization_digest_format_check
  check (
    authorization_digest is null
    or authorization_digest ~ '^0x[a-fA-F0-9]{64}$'
  );

alter table public.strategies
drop constraint if exists strategies_authorization_nonce_format_check;

alter table public.strategies
add constraint strategies_authorization_nonce_format_check
  check (
    authorization_nonce is null
    or authorization_nonce ~ '^(0|[1-9][0-9]*)$'
  );

alter table public.strategies
drop constraint if exists strategies_authorization_deadline_format_check;

alter table public.strategies
add constraint strategies_authorization_deadline_format_check
  check (
    authorization_deadline is null
    or authorization_deadline ~ '^(0|[1-9][0-9]*)$'
  );

alter table public.strategies
drop constraint if exists strategies_authorization_adapter_format_check;

alter table public.strategies
add constraint strategies_authorization_adapter_format_check
  check (
    authorization_adapter is null
    or authorization_adapter ~ '^0x[a-fA-F0-9]{40}$'
  );

alter table public.strategies
drop constraint if exists strategies_authorization_wallet_address_format_check;

alter table public.strategies
add constraint strategies_authorization_wallet_address_format_check
  check (
    authorization_wallet_address is null
    or authorization_wallet_address ~ '^0x[a-fA-F0-9]{40}$'
  );

alter table public.strategies
drop constraint if exists strategies_authorization_max_amount_format_check;

alter table public.strategies
add constraint strategies_authorization_max_amount_format_check
  check (
    authorization_max_amount is null
    or authorization_max_amount ~ '^[1-9][0-9]*$'
  );

alter table public.strategies
drop constraint if exists strategies_signed_authorization_metadata_check;

alter table public.strategies
add constraint strategies_signed_authorization_metadata_check
  check (
    authorization_status <> 'signed'
    or (
      authorization_signature is not null
      and authorization_digest is not null
      and authorization_nonce is not null
      and authorization_deadline is not null
      and authorization_adapter is not null
      and authorization_max_amount is not null
      and authorization_wallet_address is not null
      and authorization_signed_at is not null
    )
  );

create index if not exists strategies_authorization_digest_idx
  on public.strategies (authorization_digest)
  where authorization_digest is not null;

create index if not exists strategies_authorization_deadline_idx
  on public.strategies (authorization_status, authorization_deadline);
