"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  parseNoteFormData,
  parseNoteId,
  parseTags,
} from "@/lib/notes/validation";
import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return { supabase, user };
}

export async function createNote(formData: FormData) {
  const title = String(formData.get("title") ?? "Untitled note");
  formData.set("title", title.trim() || "Untitled note");

  const input = parseNoteFormData(formData);
  const tags = parseTags(formData.get("tags"));
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("notes")
    .insert({ ...input, user_id: user.id })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await syncNoteTags(supabase, user.id, data.id, tags);

  revalidatePath("/notes");
  redirect(`/notes?note=${data.id}&mode=edit`);
}

export async function updateNote(formData: FormData) {
  const id = parseNoteId(formData);
  const input = parseNoteFormData(formData);
  const tags = parseTags(formData.get("tags"));
  const { supabase, user } = await requireUser();

  const { error } = await supabase.from("notes").update(input).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await syncNoteTags(supabase, user.id, id, tags);

  revalidatePath("/notes");
  redirect(`/notes?note=${id}&mode=edit&saved=1`);
}

async function syncNoteTags(
  supabase: SupabaseServerClient,
  userId: string,
  noteId: string,
  tagNames: string[],
) {
  const tagIds = await ensureTagIds(supabase, userId, tagNames);
  const { error: deleteError } = await supabase
    .from("note_tags")
    .delete()
    .eq("note_id", noteId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (tagIds.length === 0) {
    return;
  }

  const { error: insertError } = await supabase.from("note_tags").insert(
    tagIds.map((tagId) => ({
      note_id: noteId,
      tag_id: tagId,
    })),
  );

  if (insertError) {
    throw new Error(insertError.message);
  }
}

async function ensureTagIds(
  supabase: SupabaseServerClient,
  userId: string,
  tagNames: string[],
) {
  if (tagNames.length === 0) {
    return [];
  }

  const { data: existingTags, error: existingTagsError } = await supabase
    .from("tags")
    .select("id, name")
    .eq("user_id", userId)
    .in("name", tagNames);

  if (existingTagsError) {
    throw new Error(existingTagsError.message);
  }

  const existingNames = new Set(existingTags.map((tag) => tag.name));
  const missingNames = tagNames.filter((tag) => !existingNames.has(tag));
  const createdTags =
    missingNames.length > 0
      ? await createMissingTags(supabase, userId, missingNames)
      : [];
  const tagsByName = new Map(
    [...existingTags, ...createdTags].map((tag) => [tag.name, tag.id]),
  );

  return tagNames.flatMap((tag) => {
    const id = tagsByName.get(tag);
    return id ? [id] : [];
  });
}

async function createMissingTags(
  supabase: SupabaseServerClient,
  userId: string,
  tagNames: string[],
) {
  const { data, error } = await supabase
    .from("tags")
    .insert(tagNames.map((name) => ({ user_id: userId, name })))
    .select("id, name");

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function trashNote(formData: FormData) {
  const id = parseNoteId(formData);
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("notes")
    .update({ trashed_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/notes");
  redirect("/notes");
}

export async function deleteNotePermanently(formData: FormData) {
  const id = parseNoteId(formData);
  const { supabase } = await requireUser();
  const { error } = await supabase.from("notes").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/notes");
  redirect("/notes?view=trash");
}

export async function deleteAllTrashedNotes() {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("notes")
    .delete()
    .not("trashed_at", "is", null);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/notes");
  redirect("/notes?view=trash");
}

export async function toggleFavorite(formData: FormData) {
  const id = parseNoteId(formData);
  const isFavorite = formData.get("is_favorite") === "true";
  const returnTo = formData.get("return_to");
  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("notes")
    .update({ is_pinned: !isFavorite })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/notes");
  if (typeof returnTo === "string" && returnTo.startsWith("/notes")) {
    redirect(returnTo);
  }

  redirect(`/notes?note=${id}&mode=edit`);
}

export async function archiveNote(formData: FormData) {
  const id = parseNoteId(formData);
  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("notes")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/notes");
  redirect("/notes");
}

export async function restoreNote(formData: FormData) {
  const id = parseNoteId(formData);
  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("notes")
    .update({ archived_at: null, trashed_at: null })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/notes");
  redirect(`/notes?note=${id}&mode=edit`);
}
