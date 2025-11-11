import { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";
import { requireGuest } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Sign Up - EZLift",
  description: "Create your EZLift account to start your personalized fitness journey.",
};

export default async function SignupPage() {
  // Redirect if user is already authenticated
  await requireGuest();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-page-title text-text-primary font-bold">Create your EZLift account</h1>
          <p className="text-base text-text-secondary mt-2">
            Start tracking smarter today
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
} 