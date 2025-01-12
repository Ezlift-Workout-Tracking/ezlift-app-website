"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import sanitizeHtml from 'sanitize-html';
import {Filter} from 'bad-words';
import { spamWords } from "@/lib/spamWordsConfig";
import { checkSensitiveContent, isSuspiciousURL } from "@/lib/contentFilters";

const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "956eb95a-9946-42fc-af7c-e03e3ffad5ea";
const SUBMISSION_THROTTLE_MS = 30000; // 30 seconds between submissions
const SPAM_THRESHOLD = 0.5;

// Initialize bad-words filter with custom words
const filter = new Filter();
filter.addWords(...spamWords);

// Sanitization options
const sanitizeOptions = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: 'recursiveEscape' as 'discard' | 'escape' | 'recursiveEscape'
};

// Suspicious patterns to check
const suspiciousPatterns = {
  script: /<script/i,
  javascript: /javascript:/i,
  eventHandlers: /on\w+=/i,
  dataUrls: /data:/i,
  vbscript: /vbscript:/i,
  escapeSequences: /\\\w+/i,
  markdown: /\[\w+\]/i,
  executables: /\.(exe|dll|bat|sh)$/i,
  commandLine: /^(cmd|powershell)/i,
  sqlInjection: /(union|select|insert|delete|update|drop|alter)\s+/i,
  phpTags: /<\?php/i,
  base64: /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/
};

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface SpamCheckResult {
  isSpam: boolean;
  confidence: number;
  reasons: string[];
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({ 
    name: "", 
    email: "", 
    message: "" 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  // Countdown timer for throttling
  useEffect(() => {
    if (remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime(prev => Math.max(0, prev - 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [remainingTime]);

  // Check for spam content
  const checkForSpam = (text: string): SpamCheckResult => {
    const result: SpamCheckResult = {
      isSpam: false,
      confidence: 0,
      reasons: [],
    };

    // Check for profanity using bad-words
    if (filter.isProfane(text)) {
      result.reasons.push('Inappropriate content detected');
      result.confidence += 0.6;
    }

    // Check for suspicious URLs
    const urls = text.match(/(https?:\/\/[^\s]+)/g) || [];
    for (const url of urls) {
      if (isSuspiciousURL(url)) {
        result.reasons.push('Contains suspicious URLs');
        result.confidence += 0.4;
      }
    }

    // Check for suspicious patterns
    Object.entries(suspiciousPatterns).forEach(([key, pattern]) => {
      if (pattern.test(text)) {
        result.reasons.push(`Contains suspicious ${key} pattern`);
        result.confidence += 0.5;
      }
    });

    // Check character repetition
    if (/(.)\1{4,}/.test(text)) {
      result.reasons.push('Contains excessive repeated characters');
      result.confidence += 0.3;
    }

    // Check for excessive uppercase
    const upperCasePercentage = (text.match(/[A-Z]/g) || []).length / text.length;
    if (upperCasePercentage > 0.5 && text.length > 10) {
      result.reasons.push('Contains excessive uppercase characters');
      result.confidence += 0.3;
    }

    result.isSpam = result.confidence > SPAM_THRESHOLD;
    return result;
  };

  // Validate form data
  const validateForm = () => {
    // Name validation
    if (formData.name.length < 2 || formData.name.length > 50) {
      throw new Error("Name must be between 2 and 50 characters");
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      throw new Error("Please enter a valid email address");
    }

    // Message validation
    if (formData.message.length < 10 || formData.message.length > 1000) {
      throw new Error("Message must be between 10 and 1000 characters");
    }

    // Check for sensitive content
    const messageContent = checkSensitiveContent(formData.message);
    const nameContent = checkSensitiveContent(formData.name);

    if (messageContent.isBlocked || nameContent.isBlocked) {
      const reasons = [...messageContent.reasons, ...nameContent.reasons];
      throw new Error(`Content not allowed: ${reasons.join(', ')}`);
    }

    // Spam detection
    const messageSpamCheck = checkForSpam(formData.message);
    const nameSpamCheck = checkForSpam(formData.name);

    if (messageSpamCheck.isSpam) {
      throw new Error(`Message appears to be spam: ${messageSpamCheck.reasons.join(', ')}`);
    }

    if (nameSpamCheck.isSpam) {
      throw new Error("Please enter a valid name");
    }
  };

  // Handle captcha verification
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      // Validate form
      validateForm();

      // Sanitize inputs
      const sanitizedData = {
        name: sanitizeHtml(formData.name.trim(), sanitizeOptions),
        email: sanitizeHtml(formData.email.toLowerCase().trim(), sanitizeOptions),
        message: sanitizeHtml(formData.message.trim(), sanitizeOptions),
      };

      if (!token) {
        throw new Error("Please complete the captcha verification");
      }

      // Collect metadata for security analysis
      const metadata = {
        timestamp: new Date().toISOString(),
        userAgent: window.navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        isSecureContext: window.isSecureContext,
        hasWebGL: !!document.createElement('canvas').getContext('webgl'),
        touchPoints: navigator.maxTouchPoints,
      };

      // Submit the form
      const response = await fetch('/.netlify/functions/contact',{
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({
          ...sanitizedData,
          captchaToken: token,
          metadata
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to submit form");
      }

      // Clear form and show success message
      setLastSubmissionTime(now);
      setFormData({ name: "", email: "", message: "" });
      setToken("");
      setSubmitted(true);
      
    } catch (error) {
      console.error("Form submission error:", error);
      if (error instanceof Error) {
        setError(error.message || "Failed to submit form. Please try again.");
      } else {
        setError("Failed to submit form. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success message after submission
  if (submitted) {
    return (
      <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
        <h2 className="text-xl font-semibold mb-2">Thanks for reaching out!</h2>
        <p className="text-muted-foreground">
          We'll get back to you as soon as possible.
        </p>
      </div>
    );
  }

  // Render form
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Name * <span className="text-xs text-muted-foreground">(2-50 characters)</span>
        </label>
        <Input
          id="name"
          type="text"
          required
          minLength={2}
          maxLength={50}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={isSubmitting}
          pattern="[A-Za-z0-9\s\-']+"
          title="Name can only contain letters, numbers, spaces, hyphens, and apostrophes"
          className="bg-background"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email *
        </label>
        <Input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={isSubmitting}
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
          title="Please enter a valid email address"
          className="bg-background"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium">
          Message * <span className="text-xs text-muted-foreground">(10-1000 characters)</span>
        </label>
        <Textarea
          id="message"
          required
          minLength={10}
          maxLength={1000}
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          disabled={isSubmitting}
          className="bg-background resize-none"
        />
        <div className="text-xs text-muted-foreground text-right">
          {formData.message.length}/1000
        </div>
      </div>

      <div className="my-4">
        <HCaptcha
          sitekey={HCAPTCHA_SITE_KEY}
          onVerify={handleVerify}
          onError={handleError}
          onExpire={handleExpire}
        />
      </div>

      {error && (
        <div className="p-3 rounded bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Button 
        type="submit" 
        disabled={isSubmitting || !token || remainingTime > 0}
        className="w-full"
      >
        {isSubmitting ? "Sending..." : remainingTime > 0 
          ? `Wait ${Math.ceil(remainingTime / 1000)}s` 
          : "Send Message"}
      </Button>
    </form>
  );
}
