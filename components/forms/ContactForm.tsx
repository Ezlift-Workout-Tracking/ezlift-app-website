"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Send, Mail, User, MessageSquare } from 'lucide-react';

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    message: ''
  });

  // Google Form configuration with your actual form URL and entry IDs
  const FORM_CONFIG = {
    action: 'https://docs.google.com/forms/d/e/1FAIpQLSfFOwBcTuYQT8343m9be5lROPmWgMiGxtPULe4nA4GVChgmJw/formResponse',
    entries: {
      email: 'entry.18414991',      // Your email field entry ID
      name: 'entry.2005620554',      // Your name field entry ID  
      message: 'entry.1065166488'   // Your message field entry ID
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Create form data for Google Forms
      const googleFormData = new FormData();
      googleFormData.append(FORM_CONFIG.entries.email, formData.email);
      googleFormData.append(FORM_CONFIG.entries.name, formData.name);
      googleFormData.append(FORM_CONFIG.entries.message, formData.message);

      // Submit to Google Forms
      await fetch(FORM_CONFIG.action, {
        method: 'POST',
        body: googleFormData,
        mode: 'no-cors' // Important: Google Forms requires no-cors mode
      });

      // Since no-cors doesn't return response data, we assume success
      setSubmitted(true);
      setFormData({ email: '', name: '', message: '' });
      
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="relative">
                <CheckCircle className="h-20 w-20 text-primary mx-auto" />
                <div className="absolute inset-0 h-20 w-20 mx-auto rounded-full bg-primary opacity-20 animate-ping"></div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Message Sent Successfully!
                </h2>
                <p className="text-muted-foreground text-lg">
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
              </div>
              <Button
                onClick={() => setSubmitted(false)}
                variant="outline"
                className="px-8 py-2"
              >
                Send Another Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="shadow-xl border border-gray-700 bg-card">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-4xl font-bold flex items-center justify-center gap-3 text-foreground">
            <Send className="h-10 w-10 text-primary" />
            Contact Us
          </CardTitle>
          <CardDescription className="text-xl text-muted-foreground mt-3">
            Have a question or feedback? We'd love to hear from you.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="space-y-8">
            
            {/* Email Field */}
            <div className="space-y-3">
              <label htmlFor="email" className="text-sm font-bold text-foreground flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Email Address *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                value={formData.email}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="h-14 border-2 border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-lg"
              />
            </div>

            {/* Name Field */}
            <div className="space-y-3">
              <label htmlFor="name" className="text-sm font-bold text-foreground flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Full Name *
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Your full name"
                required
                value={formData.name}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="h-14 border-2 border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-lg"
              />
            </div>

            {/* Message Field */}
            <div className="space-y-3">
              <label htmlFor="message" className="text-sm font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Message *
              </label>
              <Textarea
                id="message"
                name="message"
                placeholder="Tell us about your inquiry, feedback, or how we can help you..."
                required
                value={formData.message}
                onChange={handleInputChange}
                rows={6}
                disabled={isSubmitting}
                className="border-2 border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none text-lg"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 bg-destructive/10 border-2 border-destructive text-destructive-foreground px-6 py-4 rounded-lg">
                <AlertCircle className="h-6 w-6" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              onClick={handleSubmit}
              className="w-full h-14 text-xl font-bold transform hover:scale-105 transition-all duration-200 shadow-lg" 
              disabled={isSubmitting || !formData.email || !formData.name || !formData.message}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3" />
                  Sending Message...
                </>
              ) : (
                <>
                  <Send className="h-6 w-6 mr-3" />
                  Send Message
                </>
              )}
            </Button>

            {/* Privacy Note */}
            <div className="bg-muted border border-border rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">
                🔒 <strong className="text-foreground">Your privacy matters.</strong> We respect your privacy and will never share your information with third parties.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}