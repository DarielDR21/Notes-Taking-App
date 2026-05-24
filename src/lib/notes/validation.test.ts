import { describe, expect, it } from "vitest";

import { parseNoteFormData, parseTags } from "./validation";

describe("parseTags", () => {
  it("normalizes, deduplicates, and limits tags", () => {
    expect(
      parseTags(" Work, ideas, work,  Reading , ai, ux, db, next, extra "),
    ).toEqual(["work", "ideas", "reading", "ai", "ux", "db", "next", "extra"]);
  });

  it("returns an empty list for missing tags", () => {
    expect(parseTags(null)).toEqual([]);
  });

  it("truncates tags longer than 32 characters", () => {
    const longTag = "a".repeat(40);
    expect(parseTags(longTag)).toEqual(["a".repeat(32)]);
  });
});

describe("parseNoteFormData", () => {
  it("parses a valid note payload", () => {
    const formData = new FormData();
    formData.set("title", "  Roadmap  ");
    formData.set("body", "Ship the MVP.");
    formData.set("tags", "planning, mvp");

    expect(parseNoteFormData(formData)).toEqual({
      title: "Roadmap",
      body: "Ship the MVP.",
    });
  });

  it("rejects an empty title", () => {
    const formData = new FormData();
    formData.set("title", " ");
    formData.set("body", "");

    expect(() => parseNoteFormData(formData)).toThrow();
  });
});
