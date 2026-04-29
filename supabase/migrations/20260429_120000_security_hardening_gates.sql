-- Harden client-visible Supabase policies so direct public-client writes cannot
-- bypass the current no-live-execution product boundary.

drop policy if exists "strategies_insert_own" on public.strategies;
create policy "strategies_insert_own"
on public.strategies
for insert
to authenticated
with check (
  auth.uid() = user_id
  and trigger_enabled = false
  and status <> 'active'
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
);

drop policy if exists "executions_insert_own" on public.executions;
create policy "executions_insert_own"
on public.executions
for insert
to authenticated
with check (
  auth.uid() = user_id
  and transaction_hash is null
);

drop policy if exists "executions_update_own" on public.executions;
create policy "executions_update_own"
on public.executions
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and transaction_hash is null
);

drop policy if exists "execution_attempts_insert_own" on public.execution_attempts;
create policy "execution_attempts_insert_own"
on public.execution_attempts
for insert
to authenticated
with check (
  auth.uid() = user_id
  and simulation_mode = true
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
  and transaction_hash is null
);
