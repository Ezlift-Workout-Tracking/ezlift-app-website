import { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { requireGuest } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Forgot Password - EZLift",
  description: "Reset your EZLift account password.",
};

export default async function ForgotPasswordPage() {
  // Redirect if user is already authenticated
  await requireGuest();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Reset password</h1>
          <p className="text-muted-foreground mt-2">
            Enter your email to receive reset instructions
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
} 