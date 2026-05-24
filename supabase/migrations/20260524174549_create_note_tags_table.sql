create table note_tags (
  note_id uuid references notes(id) on delete cascade not null,
  tag_id uuid references tags(id) on delete cascade not null,
  primary key (note_id, tag_id)
);

alter table note_tags enable row level security;

create policy "Users can only access their own note_tags"
on note_tags for all
using (
  exists (
    select 1 from notes
    where notes.id = note_tags.note_id
    and notes.user_id = auth.uid()
  )
);
