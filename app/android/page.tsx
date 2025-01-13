"use client";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { FadeIn } from "@/components/animations/FadeIn";
import { Smartphone } from "lucide-react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "956eb95a-9946-42fc-af7c-e03e3ffad5ea";
const SUBMISSION_THROTTLE_MS = 30000; // 30 seconds between submissions

export default function AndroidWaitlist() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  const validateEmail = (email: string) => {
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

  const handleVerify = (token: string) => {
    setToken(token);
    setError("");
  };

  const handleExpire = () => {
    setToken("");
    setError("Captcha expired, please verify again");
  };

  const handleError = (err: any) => {
    console.error("hCaptcha Error:", err);
    setError("Error loading captcha. Please refresh the page.");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check submission throttle
    const now = Date.now();
    const timeSinceLastSubmission = now - lastSubmissionTime;
    if (timeSinceLastSubmission < SUBMISSION_THROTTLE_MS) {
      const remaining = Math.ceil((SUBMISSION_THROTTLE_MS - timeSinceLastSubmission) / 1000);
      setRemainingTime(remaining * 1000);
      setError(`Please wait ${remaining} seconds before submitting again`);
      return;
    }

    setIsSubmitting(true);
    setError("");

    // Validate email before submission
    if (!validateEmail(email.trim())) {
      setIsSubmitting(false);
      return;
    }

    if (!token) {
      setError("Please complete the captcha verification");
      setIsSubmitting(false);
      return;
    }

    try {
      const metadata = {
        timestamp: new Date().toISOString(),
        userAgent: window.navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
      };

      const response = await fetch('/.netlify/functions/waitlist', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({
          email: email.trim(),
          captchaToken: token,
          metadata
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit');
      }

      setLastSubmissionTime(now);
      setSubmitted(true);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to join waitlist. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  required
                  className="max-w-md mx-auto"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "email-error" : undefined}
                />
                
                <div className="flex justify-center">
                  <HCaptcha
                    sitekey={HCAPTCHA_SITE_KEY}
                    onVerify={handleVerify}
                    onError={handleError}
                    onExpire={handleExpire}
                  />
                </div>

                {error && (
                  <p 
                    className="text-sm text-red-500" 
                    id="email-error" 
                    role="alert"
                  >
                    {error}
                  </p>
                )}
                
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isSubmitting || !token || remainingTime > 0 || !email.trim()}
                  className="min-w-[200px]"
                >
                  {isSubmitting ? "Submitting..." : 
                   remainingTime > 0 ? `Wait ${Math.ceil(remainingTime / 1000)}s` : 
                   "Notify Me"}
                </Button>
              </form>
            )}
          </FadeIn>
        </div>
      </main>
    </>
  );
}