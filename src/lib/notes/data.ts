import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Note } from "@/lib/database.types";
import type { NormalizedNotesQuery } from "@/lib/notes/query";

export function isRenderableNote(note: Pick<Note, "title" | "body">) {
  return note.title.trim().length > 0 || note.body.trim().length > 0;
}

export async function listNotes(
  supabase: SupabaseClient<Database>,
  query: NormalizedNotesQuery,
) {
  let request = supabase
    .from("notes")
    .select("*")
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
    request = request.contains("tags", [query.tag]);
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

  const notes = data satisfies Note[];

  return notes.filter(isRenderableNote);
}

export function collectTags(notes: Note[]) {
  return Array.from(new Set(notes.flatMap((note) => note.tags))).sort((a, b) =>
    a.localeCompare(b),
  );
}
