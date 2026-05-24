import { describe, expect, it } from "vitest";

import { buildNotesHref, normalizeNotesQuery } from "./query";

describe("normalizeNotesQuery", () => {
  it("normalizes supported notes query params", () => {
    expect(
      normalizeNotesQuery({
        q: "  deploy notes  ",
        tag: " Work ",
        view: "archived",
        note: "abc",
        mode: "edit",
        page: "2",
      }),
    ).toEqual({
      q: "deploy notes",
      tag: "work",
      view: "archived",
      noteId: "abc",
      mode: "edit",
      page: 2,
      saved: false,
    });
  });

  it("falls back to active view for unknown view params", () => {
    expect(normalizeNotesQuery({ view: "all" }).view).toBe("active");
  });

  it("supports the trash view", () => {
    expect(normalizeNotesQuery({ view: "trash" }).view).toBe("trash");
  });

  it("falls back to the first page for invalid page params", () => {
    expect(normalizeNotesQuery({ page: "-2" }).page).toBe(1);
  });
});

describe("buildNotesHref", () => {
  it("builds compact notes URLs", () => {
    const query = normalizeNotesQuery({
      q: "hello",
      tag: "work",
      view: "archived",
      note: "note-id",
      mode: "edit",
      page: "3",
    });

    expect(buildNotesHref(query)).toBe(
      "/notes?q=hello&tag=work&view=archived&note=note-id&mode=edit&page=3",
    );
  });

  it("includes the trash view in built URLs", () => {
    const query = normalizeNotesQuery({
      view: "trash",
      page: "2",
    });

    expect(buildNotesHref(query)).toBe("/notes?view=trash&page=2");
  });

  it("omits empty defaults", () => {
    const query = normalizeNotesQuery({});

    expect(buildNotesHref(query)).toBe("/notes");
  });
});
