import { Skeleton } from "@/components/ui/skeleton";

export default function NotesLoading() {
  return (
    <main className="grid min-h-screen gap-4 p-4 lg:grid-cols-[22rem_1fr]">
      <Skeleton className="min-h-[calc(100vh-2rem)]" />
      <Skeleton className="min-h-[calc(100vh-2rem)]" />
    </main>
  );
}
