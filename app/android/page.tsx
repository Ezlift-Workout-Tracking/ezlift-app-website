"use client";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { FadeIn } from "@/components/animations/FadeIn";
import { Smartphone } from "lucide-react";

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function AndroidWaitlist() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string): boolean => {
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Validate email before submission
    if (!validateEmail(email.trim())) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/waitlist', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit');
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to join waitlist. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(""); // Clear error when user starts typing
  };

  return (
    <>
      <Header hideMenu />
      <main className="min-h-screen pt-24 bg-black">
        <div className="container px-4 mx-auto">
          <FadeIn className="max-w-2xl mx-auto text-center">
            <Smartphone className="h-16 w-16 mx-auto mb-8 text-brand-primary animate-pulse" />
            <h1 className="text-4xl font-bold mb-6 text-white">
              Coming Soon to Android
            </h1>
            <p className="text-xl mb-12 text-gray-400">
              EZLift is currently available on iOS, and we're working hard to bring
              the same great experience to Android. Sign up to be notified when
              we launch!
            </p>
            {submitted ? (
              <div className="bg-brand-primary/10 p-6 rounded-lg border border-brand-primary/20">
                <h2 className="text-xl font-semibold mb-2 text-white">
                  Thanks for your interest!
                </h2>
                <p className="text-gray-400">
                  We'll notify you as soon as EZLift is available on Android.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  className="max-w-md mx-auto"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "email-error" : undefined}
                />
                {error && (
                  <p className="text-sm text-red-500" id="email-error" role="alert">
                    {error}
                  </p>
                )}
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isSubmitting || !email.trim()}
                >
                  {isSubmitting ? "Submitting..." : "Notify Me"}
                </Button>
              </form>
            )}
          </FadeIn>
        </div>
      </main>
    </>
  );
}