create table tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now()
);

alter table tags enable row level security;

create policy "Users can only access their own tags"
on tags for all
using (auth.uid() = user_id);
