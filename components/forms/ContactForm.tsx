"use client";

import type React from "react";

import { useState } from "react";
import { CheckCircle, AlertCircle, Send } from "lucide-react";

// Static fallback form for Netlify to detect the form at build time
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
        throw new Error(`Form submission failed: ${response.status}`);
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
      <div
        style={{
          width: "100%",
          maxWidth: "28rem",
          margin: "0 auto",
          backgroundColor: "white",
          borderRadius: "0.5rem",
          boxShadow:
            "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          border: "1px solid #e5e7eb",
        }}
      >
        <div style={{ padding: "1.5rem", paddingTop: "1.5rem" }}>
          <div
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <CheckCircle
              style={{
                height: "4rem",
                width: "4rem",
                color: "#10b981",
                margin: "0 auto",
              }}
            />
            <div>
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  color: "#065f46",
                  marginBottom: "0.5rem",
                }}
              >
                Message Sent!
              </h2>
              <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
                Thanks for reaching out! We'll get back to you soon.
              </p>
            </div>
            <button
              onClick={() => setSubmitted(false)}
              style={{
                width: "100%",
                padding: "0.5rem 1rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                backgroundColor: "white",
                color: "#374151",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "500",
              }}
            >
              Send Another Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "28rem",
        margin: "0 auto",
        backgroundColor: "white",
        borderRadius: "0.5rem",
        boxShadow:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        border: "1px solid #e5e7eb",
      }}
    >
      {/* Header */}
      <div style={{ padding: "1.5rem", paddingBottom: "0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.5rem",
          }}
        >
          <Send style={{ height: "1.25rem", width: "1.25rem" }} />
          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", margin: 0 }}>
            Contact Us
          </h3>
        </div>
        <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: 0 }}>
          Send us a message and we'll get back to you.
        </p>
      </div>

      {/* Form Content */}
      <div style={{ padding: "1.5rem" }}>
        <form
          name="contact"
          method="POST"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          {/* Hidden fields for Netlify */}
          <input type="hidden" name="form-name" value="contact" />
          <input type="hidden" name="bot-field" style={{ display: "none" }} />

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <label
              htmlFor="name"
              style={{
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              Full Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              required
              minLength={2}
              maxLength={50}
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                backgroundColor: isSubmitting ? "#f9fafb" : "white",
                color: "#111827",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
            />
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <label
              htmlFor="email"
              style={{
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              required
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                backgroundColor: isSubmitting ? "#f9fafb" : "white",
                color: "#111827",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
            />
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <label
              htmlFor="message"
              style={{
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              placeholder="Tell us more about your inquiry..."
              required
              minLength={10}
              maxLength={1000}
              rows={4}
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                backgroundColor: isSubmitting ? "#f9fafb" : "white",
                color: "#111827",
                outline: "none",
                resize: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
            />
          </div>

          {/* Netlify reCAPTCHA */}
          <div data-netlify-recaptcha="true" />

          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                padding: "0.75rem 1rem",
                borderRadius: "0.375rem",
              }}
            >
              <AlertCircle style={{ height: "1rem", width: "1rem" }} />
              <span style={{ fontSize: "0.875rem" }}>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "0.5rem 1rem",
              backgroundColor: isSubmitting ? "#6b7280" : "#111827",
              color: "white",
              border: "none",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            {isSubmitting ? (
              <>
                <div
                  style={{
                    width: "1rem",
                    height: "1rem",
                    border: "2px solid transparent",
                    borderTop: "2px solid white",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                Sending...
              </>
            ) : (
              <>
                <Send style={{ height: "1rem", width: "1rem" }} />
                Send Message
              </>
            )}
          </button>
        </form>

        {/* Include the fallback form to help Netlify detect it */}
        <NetlifyHiddenForm />
      </div>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
