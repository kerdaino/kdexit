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

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
on public.profiles
for delete
using (auth.uid() = id);

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
