import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Note } from "@/lib/database.types";
import type { NormalizedNotesQuery } from "@/lib/notes/query";

type NoteRecord = Database["public"]["Tables"]["notes"]["Row"];
type NoteRecordWithTags = NoteRecord & {
  note_tags?: { tags: { name: string } | null }[] | null;
};

export function isRenderableNote(note: Pick<Note, "title" | "body">) {
  return note.title.trim().length > 0 || note.body.trim().length > 0;
}

export async function listNotes(
  supabase: SupabaseClient<Database>,
  query: NormalizedNotesQuery,
) {
  const noteIds = query.tag ? await listNoteIdsForTag(supabase, query.tag) : [];

  if (query.tag && noteIds.length === 0) {
    return [];
  }

  let request = supabase
    .from("notes")
    .select("*, note_tags(tags(name))")
    .order("is_pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  if (query.view === "trash") {
    request = request.not("trashed_at", "is", null);
  } else {
    request = request.is("trashed_at", null);
    request =
      query.view === "archived"
        ? request.not("archived_at", "is", null)
        : request.is("archived_at", null);
  }

  if (query.tag) {
    request = request.in("id", noteIds);
  }

  if (query.q) {
    request = request.textSearch("search_vector", query.q, {
      type: "websearch",
      config: "english",
    });
  }

  const { data, error } = await request;

  if (error) {
    throw new Error(error.message);
  }

  const notes = (data satisfies NoteRecordWithTags[]).map(toNote);

  return notes.filter(isRenderableNote);
}

export async function listTags(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("tags")
    .select("name")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return Array.from(new Set(data.map((tag) => tag.name)));
}

async function listNoteIdsForTag(
  supabase: SupabaseClient<Database>,
  tagName: string,
) {
  const { data: tags, error: tagError } = await supabase
    .from("tags")
    .select("id")
    .eq("name", tagName);

  if (tagError) {
    throw new Error(tagError.message);
  }

  const tagIds = tags.map((tag) => tag.id);

  if (tagIds.length === 0) {
    return [];
  }

  const { data: noteTags, error: noteTagsError } = await supabase
    .from("note_tags")
    .select("note_id")
    .in("tag_id", tagIds);

  if (noteTagsError) {
    throw new Error(noteTagsError.message);
  }

  return Array.from(new Set(noteTags.map((noteTag) => noteTag.note_id)));
}

function toNote(record: NoteRecordWithTags): Note {
  const { note_tags: noteTags, ...note } = record;
  const tags =
    noteTags
      ?.map((noteTag) => noteTag.tags?.name)
      .filter((tag): tag is string => typeof tag === "string")
      .sort((a, b) => a.localeCompare(b)) ?? [];

  return { ...note, tags };
}
