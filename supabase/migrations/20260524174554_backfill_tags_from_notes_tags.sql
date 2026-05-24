-- Copy legacy notes.tags arrays into tags / note_tags before the column is dropped.
insert into tags (user_id, name)
select distinct n.user_id, left(lower(trim(tag)), 32) as name
from notes n
cross join lateral unnest(n.tags) as tag
where trim(tag) <> ''
  and not exists (
    select 1
    from tags existing
    where existing.user_id = n.user_id
      and existing.name = left(lower(trim(tag)), 32)
  );

insert into note_tags (note_id, tag_id)
select distinct n.id, t.id
from notes n
cross join lateral unnest(n.tags) as tag
join tags t
  on t.user_id = n.user_id
  and t.name = left(lower(trim(tag)), 32)
where trim(tag) <> ''
on conflict (note_id, tag_id) do nothing;
