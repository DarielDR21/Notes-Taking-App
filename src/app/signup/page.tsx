import { signUp } from "@/app/auth-actions";
import { AuthForm } from "@/components/auth/auth-form";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <AuthForm action={signUp} mode="signup" />
    </main>
  );
}
