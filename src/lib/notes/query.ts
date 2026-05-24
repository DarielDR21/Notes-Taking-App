export type NotesSearchParams = {
  q?: string | string[];
  tag?: string | string[];
  view?: string | string[];
  note?: string | string[];
  mode?: string | string[];
  page?: string | string[];
  saved?: string | string[];
};

export type NormalizedNotesQuery = {
  q: string;
  tag: string;
  view: "active" | "archived" | "trash";
  noteId: string;
  mode: "browse" | "edit";
  page: number;
  saved: boolean;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function normalizeNotesQuery(
  params: NotesSearchParams,
): NormalizedNotesQuery {
  const rawView = first(params.view);
  const view =
    rawView === "archived" || rawView === "trash" ? rawView : "active";
  const page = Number.parseInt(first(params.page) ?? "1", 10);

  return {
    q: (first(params.q) ?? "").trim().slice(0, 120),
    tag: (first(params.tag) ?? "").trim().toLowerCase().slice(0, 32),
    view,
    noteId: (first(params.note) ?? "").trim(),
    mode: first(params.mode) === "edit" ? "edit" : "browse",
    page: Number.isFinite(page) && page > 0 ? page : 1,
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
  if (next.view !== "active") params.set("view", next.view);
  if (next.noteId) params.set("note", next.noteId);
  if (next.mode === "edit") params.set("mode", "edit");
  if (next.page > 1) params.set("page", String(next.page));

  const search = params.toString();
  return `/notes${search ? `?${search}` : ""}`;
}
