import { describe, expect, it } from "vitest";

import { isRenderableNote } from "./data";

describe("isRenderableNote", () => {
  it("hides notes with blank title and blank body", () => {
    expect(isRenderableNote({ title: "   ", body: "  " })).toBe(false);
  });

  it("keeps notes with a title even when the body is blank", () => {
    expect(isRenderableNote({ title: "Idea", body: "  " })).toBe(true);
  });

  it("keeps notes with a body even when the title is blank", () => {
    expect(isRenderableNote({ title: " ", body: "Draft content" })).toBe(true);
  });
});
