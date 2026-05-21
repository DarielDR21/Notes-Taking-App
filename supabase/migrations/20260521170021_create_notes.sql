create extension if not exists pgcrypto;

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  body text not null default '' check (char_length(body) <= 20000),
  tags text[] not null default '{}',
  is_pinned boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(body, '')), 'B')
  ) stored
);

create index notes_user_updated_idx
  on public.notes (user_id, is_pinned desc, updated_at desc);

create index notes_archived_idx
  on public.notes (user_id, archived_at);

create index notes_tags_idx
  on public.notes using gin (tags);

create index notes_search_idx
  on public.notes using gin (search_vector);

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_current_timestamp_updated_at() from anon, authenticated;

create trigger notes_set_updated_at
before update on public.notes
for each row
execute function public.set_current_timestamp_updated_at();

alter table public.notes enable row level security;

revoke all on public.notes from anon;
grant select, insert, update, delete on public.notes to authenticated;

create policy "Users can read their own notes"
on public.notes
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own notes"
on public.notes
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own notes"
on public.notes
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own notes"
on public.notes
for delete
to authenticated
using ((select auth.uid()) = user_id);
