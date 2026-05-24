alter table public.notes
add column trashed_at timestamptz;

create index notes_trashed_idx
  on public.notes (user_id, trashed_at);
