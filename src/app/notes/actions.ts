"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { parseNoteFormData, parseNoteId } from "@/lib/notes/validation";
import { createClient } from "@/lib/supabase/server";

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
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("notes")
    .insert({ ...input, user_id: user.id })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/notes");
  redirect(`/notes?note=${data.id}&mode=edit`);
}

export async function updateNote(formData: FormData) {
  const id = parseNoteId(formData);
  const input = parseNoteFormData(formData);
  const { supabase } = await requireUser();

  const { error } = await supabase.from("notes").update(input).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/notes");
  redirect(`/notes?note=${id}&mode=edit&saved=1`);
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

export async function togglePinned(formData: FormData) {
  const id = parseNoteId(formData);
  const isPinned = formData.get("is_pinned") === "true";
  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("notes")
    .update({ is_pinned: !isPinned })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/notes");
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
