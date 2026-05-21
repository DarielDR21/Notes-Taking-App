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
      }),
    ).toEqual({
      q: "deploy notes",
      tag: "work",
      view: "archived",
      noteId: "abc",
      saved: false,
    });
  });

  it("falls back to active view for unknown view params", () => {
    expect(normalizeNotesQuery({ view: "all" }).view).toBe("active");
  });
});

describe("buildNotesHref", () => {
  it("builds compact notes URLs", () => {
    const query = normalizeNotesQuery({
      q: "hello",
      tag: "work",
      view: "archived",
      note: "note-id",
    });

    expect(buildNotesHref(query)).toBe(
      "/notes?q=hello&tag=work&view=archived&note=note-id",
    );
  });

  it("omits empty defaults", () => {
    const query = normalizeNotesQuery({});

    expect(buildNotesHref(query)).toBe("/notes");
  });
});
