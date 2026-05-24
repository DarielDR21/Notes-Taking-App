import { z } from "zod";

const maxTags = 8;

export const noteIdSchema = z.string().uuid();

export const noteFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(160),
  body: z.string().trim().max(20000).default(""),
});

export type NoteFormInput = z.infer<typeof noteFormSchema>;

export function parseTags(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") {
    return [];
  }

  return Array.from(
    new Set(
      value
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    ),
  ).slice(0, maxTags);
}

export function parseNoteFormData(formData: FormData): NoteFormInput {
  return noteFormSchema.parse({
    title: formData.get("title"),
    body: formData.get("body") ?? "",
  });
}

export function parseNoteId(formData: FormData): string {
  return noteIdSchema.parse(formData.get("id"));
}
