"use client";

import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function NotesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Alert className="max-w-lg" variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Notes could not load</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>{error.message}</p>
          <Button onClick={reset} variant="secondary">
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    </main>
  );
}
