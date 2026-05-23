"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import type { AuthActionState } from "@/app/auth-actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme/theme-toggle";

type AuthFormProps = {
  mode: "login" | "signup";
  action: (
    state: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
};

export function AuthForm({ mode, action }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const isLogin = mode === "login";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{isLogin ? "Sign in" : "Create account"}</CardTitle>
            <CardDescription>
              {isLogin
                ? "Open your private notes workspace."
                : "Start a new private notes workspace."}
            </CardDescription>
          </div>
          <ThemeToggle />
        </div>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="grid gap-4">
          {state.error ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Authentication failed</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
          {state.message ? (
            <Alert>
              <CheckCircle2 className="size-4" />
              <AlertTitle>Confirm your email</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={6}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-3">
          <Button disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {isLogin ? "Sign in" : "Create account"}
          </Button>
          <Button asChild variant="link">
            <Link href={isLogin ? "/signup" : "/login"}>
              {isLogin
                ? "Need an account? Sign up"
                : "Already have an account? Sign in"}
            </Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
