alter table public.execution_attempts enable row level security;

drop policy if exists "execution_attempts_select_own" on public.execution_attempts;
create policy "execution_attempts_select_own"
on public.execution_attempts
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "execution_attempts_insert_own" on public.execution_attempts;
create policy "execution_attempts_insert_own"
on public.execution_attempts
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "execution_attempts_update_own" on public.execution_attempts;
create policy "execution_attempts_update_own"
on public.execution_attempts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "execution_attempts_delete_own" on public.execution_attempts;
create policy "execution_attempts_delete_own"
on public.execution_attempts
for delete
to authenticated
using (auth.uid() = user_id);
