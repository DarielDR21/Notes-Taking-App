import Link from "next/link";
import { redirect } from "next/navigation";
import { BookMarked, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  if (getSupabaseConfig()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect("/notes");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookMarked className="size-5" />
            </div>
            <ThemeToggle />
          </div>
          <div>
            <CardTitle className="text-2xl">Notes</CardTitle>
            <CardDescription>
              Private notes with Supabase auth, RLS, tags, and full-text search.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Button asChild>
            <Link href="/login">
              <LogIn className="size-4" />
              Sign in
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/signup">Create account</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
