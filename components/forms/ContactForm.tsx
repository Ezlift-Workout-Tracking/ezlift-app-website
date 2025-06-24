"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// 👇 Static fallback form for Netlify to detect the form at build time
// You can put this at the bottom of the file or in the parent page (outside use client)
export function NetlifyHiddenForm() {
  return (
    <form name="contact" data-netlify="true" hidden>
      <input type="text" name="name" />
      <input type="email" name="email" />
      <textarea name="message" />
    </form>
  );
}

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData as any).toString(),
      });

      if (response.ok) {
        setSubmitted(true);
        form.reset();
      } else {
        throw new Error("Form submission failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error("Form submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
        <h2 className="text-xl font-semibold mb-2">Thanks for reaching out!</h2>
        <p>We'll get back to you soon.</p>
        <Button
          onClick={() => setSubmitted(false)}
          variant="outline"
          className="mt-4"
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <>
      <form
        name="contact"
        method="POST"
        data-netlify="true"
        data-netlify-honeypot="bot-field"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <input type="hidden" name="form-name" value="contact" />
        <input type="hidden" name="bot-field" style={{ display: "none" }} />

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
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email *
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            disabled={isSubmitting}
          />
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
            className="resize-none"
            disabled={isSubmitting}
          />
        </div>

        <div data-netlify-recaptcha="true" />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Message"}
        </Button>
      </form>

      {/* Include the fallback form to help Netlify detect it */}
      <NetlifyHiddenForm />
    </>
  );
}
