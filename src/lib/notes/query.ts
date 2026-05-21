export type NotesSearchParams = {
  q?: string | string[];
  tag?: string | string[];
  view?: string | string[];
  note?: string | string[];
  saved?: string | string[];
};

export type NormalizedNotesQuery = {
  q: string;
  tag: string;
  view: "active" | "archived";
  noteId: string;
  saved: boolean;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function normalizeNotesQuery(
  params: NotesSearchParams,
): NormalizedNotesQuery {
  const view = first(params.view) === "archived" ? "archived" : "active";

  return {
    q: (first(params.q) ?? "").trim().slice(0, 120),
    tag: (first(params.tag) ?? "").trim().toLowerCase().slice(0, 32),
    view,
    noteId: (first(params.note) ?? "").trim(),
    saved: first(params.saved) === "1",
  };
}

export function buildNotesHref(
  query: NormalizedNotesQuery,
  overrides: Partial<NormalizedNotesQuery> = {},
) {
  const next = { ...query, ...overrides };
  const params = new URLSearchParams();

  if (next.q) params.set("q", next.q);
  if (next.tag) params.set("tag", next.tag);
  if (next.view === "archived") params.set("view", "archived");
  if (next.noteId) params.set("note", next.noteId);

  const search = params.toString();
  return `/notes${search ? `?${search}` : ""}`;
}
