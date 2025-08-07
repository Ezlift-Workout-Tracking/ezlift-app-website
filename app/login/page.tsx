import { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { requireGuest } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Login - EZLift",
  description: "Sign in to your EZLift account to access your personalized workout experience.",
};

export default async function LoginPage() {
  // Redirect if user is already authenticated
  await requireGuest();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to continue your fitness journey
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
} 