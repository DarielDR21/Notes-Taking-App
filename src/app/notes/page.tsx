import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  BookOpenText,
  LogOut,
  Pin,
  PinOff,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  UserCircle,
  CheckCircle2,
} from "lucide-react";

import { signOut } from "@/app/auth-actions";
import {
  archiveNote,
  createNote,
  deleteNote,
  restoreNote,
  togglePinned,
  updateNote,
} from "@/app/notes/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SaveNoteButton } from "@/components/notes/save-note-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { Note } from "@/lib/database.types";
import { collectTags, listNotes } from "@/lib/notes/data";
import {
  buildNotesHref,
  normalizeNotesQuery,
  type NotesSearchParams,
} from "@/lib/notes/query";
import { MissingSupabaseConfigError } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type NotesPageProps = {
  searchParams: Promise<NotesSearchParams>;
};

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const query = normalizeNotesQuery(await searchParams);
  let model: Awaited<ReturnType<typeof getNotesPageModel>>;

  try {
    model = await getNotesPageModel(query);
  } catch (error) {
    if (error instanceof MissingSupabaseConfigError) {
      return <SupabaseSetupNotice />;
    }

    throw error;
  }

  return <NotesWorkspace {...model} />;
}

async function getNotesPageModel(query: ReturnType<typeof normalizeNotesQuery>) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const notes = await listNotes(supabase, query);
  const selected =
    notes.find((note) => note.id === query.noteId) ?? notes[0] ?? null;
  const tags = collectTags(notes);

  return {
    notes,
    query,
    selected,
    tags,
    userEmail: user.email ?? "Signed in",
  };
}

function NotesWorkspace({
  notes,
  query,
  selected,
  tags,
  userEmail,
}: Awaited<ReturnType<typeof getNotesPageModel>>) {
  return (
    <main className="min-h-screen bg-background">
      <div className="grid min-h-screen gap-4 p-4 lg:grid-cols-[22rem_1fr]">
        <aside className="flex min-h-[calc(100vh-2rem)] flex-col rounded-lg border bg-card">
          <div className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold">Notes</h1>
              <p className="truncate text-xs text-muted-foreground">
                Private workspace
              </p>
            </div>
          </div>
          <Separator />
          <div className="grid gap-3 p-4">
            <form action="/notes" className="grid gap-2">
              <Label className="sr-only" htmlFor="q">
                Search notes
              </Label>
              <div className="flex gap-2">
                <Input
                  className="min-w-0"
                  defaultValue={query.q}
                  id="q"
                  name="q"
                  placeholder="Search title or body"
                />
                {query.view === "archived" ? (
                  <input name="view" type="hidden" value="archived" />
                ) : null}
                {query.tag ? (
                  <input name="tag" type="hidden" value={query.tag} />
                ) : null}
                <Button size="icon" type="submit" variant="secondary">
                  <Search className="size-4" />
                </Button>
              </div>
            </form>
            <div className="grid grid-cols-2 gap-2">
              <Button
                asChild
                variant={query.view === "active" ? "default" : "secondary"}
              >
                <Link href={buildNotesHref(query, { view: "active", noteId: "" })}>
                  Active
                </Link>
              </Button>
              <Button
                asChild
                variant={query.view === "archived" ? "default" : "secondary"}
              >
                <Link
                  href={buildNotesHref(query, {
                    view: "archived",
                    noteId: "",
                  })}
                >
                  Archived
                </Link>
              </Button>
            </div>
            <form action={createNote}>
              <input name="title" type="hidden" value="Untitled note" />
              <input name="body" type="hidden" value="" />
              <input name="tags" type="hidden" value="" />
              <Button className="w-full" type="submit">
                <Plus className="size-4" />
                New note
              </Button>
            </form>
          </div>
          <Separator />
          {tags.length ? (
            <div className="flex flex-wrap gap-2 p-4">
              {query.tag ? (
                <Button asChild size="sm" variant="secondary">
                  <Link href={buildNotesHref(query, { tag: "", noteId: "" })}>
                    <RotateCcw className="size-3" />
                    All tags
                  </Link>
                </Button>
              ) : null}
              {tags.map((tag) => (
                <Badge
                  asChild
                  key={tag}
                  variant={query.tag === tag ? "default" : "secondary"}
                >
                  <Link href={buildNotesHref(query, { tag, noteId: "" })}>
                    {tag}
                  </Link>
                </Badge>
              ))}
            </div>
          ) : null}
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {notes.length ? (
              <div className="grid gap-2">
                {notes.map((note) => (
                  <NoteListItem
                    href={buildNotesHref(query, { noteId: note.id })}
                    key={note.id}
                    note={note}
                    selected={selected?.id === note.id}
                  />
                ))}
              </div>
            ) : (
              <EmptyList query={query} />
            )}
          </div>
          <Separator />
          <ProfileMenu userEmail={userEmail} />
        </aside>
        <section className="min-h-[calc(100vh-2rem)]">
          {selected ? (
            <NoteEditor note={selected} saved={query.saved} />
          ) : (
            <EmptyEditor />
          )}
        </section>
      </div>
    </main>
  );
}

function ProfileMenu({ userEmail }: { userEmail: string }) {
  return (
    <details className="group relative p-3">
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-md px-2 py-2 text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
        <UserCircle className="size-8 text-primary" />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">Profile</span>
          <span className="block truncate text-xs text-muted-foreground">
            {userEmail}
          </span>
        </span>
      </summary>
      <div className="absolute bottom-16 left-3 right-3 z-10 rounded-md border bg-popover p-2 text-popover-foreground shadow-lg">
        <div className="px-2 py-2">
          <p className="truncate text-sm font-medium">{userEmail}</p>
          <p className="text-xs text-muted-foreground">Signed in</p>
        </div>
        <Separator className="my-2" />
        <form action={signOut}>
          <Button className="w-full justify-start" type="submit" variant="ghost">
            <LogOut className="size-4" />
            Sign out
          </Button>
        </form>
      </div>
    </details>
  );
}

function NoteListItem({
  href,
  note,
  selected,
}: {
  href: string;
  note: Note;
  selected: boolean;
}) {
  return (
    <Link
      className={`grid gap-2 rounded-md border p-3 transition-colors ${
        selected
          ? "border-primary bg-primary/10"
          : "border-transparent hover:bg-muted"
      }`}
      href={href}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="line-clamp-1 text-sm font-medium">{note.title}</h2>
        {note.is_pinned ? <Pin className="mt-0.5 size-3 text-primary" /> : null}
      </div>
      <p className="line-clamp-2 min-h-8 text-xs text-muted-foreground">
        {note.body || "No body yet."}
      </p>
      <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
        <span>{formatDate(note.updated_at)}</span>
        {note.tags.length ? <span>{note.tags.length} tags</span> : null}
      </div>
    </Link>
  );
}

function NoteEditor({ note, saved }: { note: Note; saved: boolean }) {
  const tagText = note.tags.join(", ");

  return (
    <Card className="min-h-full">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BookOpenText className="size-5 text-primary" />
              Editor
            </CardTitle>
            <CardDescription>Updated {formatDate(note.updated_at)}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <form action={togglePinned}>
              <input name="id" type="hidden" value={note.id} />
              <input
                name="is_pinned"
                type="hidden"
                value={String(note.is_pinned)}
              />
              <Button size="sm" type="submit" variant="secondary">
                {note.is_pinned ? (
                  <PinOff className="size-4" />
                ) : (
                  <Pin className="size-4" />
                )}
                {note.is_pinned ? "Unpin" : "Pin"}
              </Button>
            </form>
            <form action={note.archived_at ? restoreNote : archiveNote}>
              <input name="id" type="hidden" value={note.id} />
              <Button size="sm" type="submit" variant="secondary">
                {note.archived_at ? (
                  <ArchiveRestore className="size-4" />
                ) : (
                  <Archive className="size-4" />
                )}
                {note.archived_at ? "Restore" : "Archive"}
              </Button>
            </form>
            <form action={deleteNote}>
              <input name="id" type="hidden" value={note.id} />
              <Button size="sm" type="submit" variant="destructive">
                <Trash2 className="size-4" />
                Delete
              </Button>
            </form>
          </div>
        </div>
        {note.tags.length ? (
          <div className="flex flex-wrap gap-2">
            {note.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardHeader>
      <CardContent>
        <form action={updateNote} className="grid gap-5">
          <input name="id" type="hidden" value={note.id} />
          {saved ? (
            <Alert className="border-primary/40 bg-primary/10">
              <CheckCircle2 className="size-4 text-primary" />
              <AlertTitle>Saved</AlertTitle>
              <AlertDescription>
                Your note changes are in Supabase.
              </AlertDescription>
            </Alert>
          ) : null}
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              defaultValue={note.title}
              id="title"
              maxLength={160}
              name="title"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="body">Body</Label>
            <Textarea
              className="min-h-[45vh] resize-y"
              defaultValue={note.body}
              id="body"
              maxLength={20000}
              name="body"
              placeholder="Write the thing down while it still has shape."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              defaultValue={tagText}
              id="tags"
              name="tags"
              placeholder="ideas, work, reading"
            />
          </div>
          <div className="flex justify-end">
            <SaveNoteButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function EmptyList({ query }: { query: ReturnType<typeof normalizeNotesQuery> }) {
  return (
    <div className="grid gap-3 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
      <p>
        {query.q || query.tag || query.view === "archived"
          ? "No notes match this view."
          : "No notes yet."}
      </p>
      {query.q || query.tag ? (
        <Button asChild size="sm" variant="secondary">
          <Link href={buildNotesHref(query, { q: "", tag: "", noteId: "" })}>
            Clear filters
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

function EmptyEditor() {
  return (
    <Card className="flex min-h-full items-center justify-center">
      <CardContent className="grid max-w-sm gap-3 p-8 text-center">
        <BookOpenText className="mx-auto size-10 text-primary" />
        <h2 className="text-lg font-semibold">Select or create a note</h2>
        <p className="text-sm text-muted-foreground">
          Your editor appears here once a note is available.
        </p>
      </CardContent>
    </Card>
  );
}

function SupabaseSetupNotice() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Alert className="max-w-xl">
        <BookOpenText className="size-4" />
        <AlertTitle>Connect Supabase to continue</AlertTitle>
        <AlertDescription>
          Copy <code>.env.local.example</code> to <code>.env.local</code>, fill in
          the local Supabase URL and publishable key, then restart the dev server.
        </AlertDescription>
      </Alert>
    </main>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
