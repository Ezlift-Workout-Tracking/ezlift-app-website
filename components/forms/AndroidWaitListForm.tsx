"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Send, Mail, User, MessageSquare } from 'lucide-react';

export default function AndroidWaitListForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: ''
  });

  // Google Form configuration with your actual form URL and entry ID
  const FORM_CONFIG = {
    action: 'https://docs.google.com/forms/d/e/1FAIpQLSfpiBp7aF9zVDu62aEWRJunWA9kE8qKcm18cYHEuSrET1K8DQ/formResponse',
    entries: {
      email: 'entry.194988934'    // Your email field entry ID
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Create form data for Google Forms
      const googleFormData = new FormData();
      googleFormData.append(FORM_CONFIG.entries.email, formData.email);

      // Submit to Google Forms
      await fetch(FORM_CONFIG.action, {
        method: 'POST',
        body: googleFormData,
        mode: 'no-cors' // Important: Google Forms requires no-cors mode
      });

      // Since no-cors doesn't return response data, we assume success
      setSubmitted(true);
      setFormData({ email: '' });
      
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
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="relative">
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
                <div className="absolute inset-0 h-20 w-20 mx-auto rounded-full bg-green-500 opacity-20 animate-ping"></div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-green-700 mb-2">
                  You're on the list!
                </h2>
                <p className="text-green-600 text-lg">
                  Thanks for signing up! We'll notify you as soon as EZLift launches on Android.
                </p>
              </div>
              <Button
                onClick={() => setSubmitted(false)}
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-100 px-8 py-2"
              >
                Sign Up Another Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-4xl font-bold flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <Send className="h-10 w-10 text-blue-600" />
            Coming Soon to Android
          </CardTitle>
          <CardDescription className="text-xl text-gray-600 mt-3">
            EZLift is currently available on iOS, and we're working hard to bring the same great experience to Android. Sign up to be notified when we launch!
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="space-y-8">
            
            {/* Email Field */}
            <div className="space-y-3">
              <label htmlFor="email" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Email address *
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
                className="h-14 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-lg"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-lg">
                <AlertCircle className="h-6 w-6" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              onClick={handleSubmit}
              className="w-full h-14 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg" 
              disabled={isSubmitting || !formData.email}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3" />
                  Subscribing...
                </>
              ) : (
                <>
                  <Send className="h-6 w-6 mr-3" />
                  Notify Me When Available
                </>
              )}
            </Button>

            {/* Privacy Note */}
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">
                🔒 <strong>Your privacy matters.</strong> We'll only email you about the Android launch and never share your information.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}