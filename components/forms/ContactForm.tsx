"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 5000); 

      return () => clearTimeout(timer);
    }
  }, [submitted, router]);

  if (submitted) {
    return (
      <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
        <h2 className="text-xl font-semibold mb-2">Thanks for reaching out!</h2>
        <p>We'll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form
      name="contact"
      method="POST"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      onSubmit={() => setSubmitted(true)}
      className="space-y-6"
    >
      <input type="hidden" name="form-name" value="contact" />
      <input type="hidden" name="bot-field" />

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Name *
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={50}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email *
        </label>
        <Input id="email" name="email" type="email" required />
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium">
          Message *
        </label>
        <Textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={1000}
          rows={5}
        />
      </div>

      <div data-netlify-recaptcha="true" />

      {error && (
        <div className="p-3 rounded bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Button type="submit" className="w-full">
        Send Message
      </Button>
    </form>
  );
}
