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
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-page-title text-text-primary font-bold">Welcome back to EZLift</h1>
          <p className="text-base text-text-secondary mt-2">
            Login to access your workouts
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
} 