"use client";

import type React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Send } from "lucide-react";

export function ContactForm() {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Contact Us
        </CardTitle>
        <CardDescription>
          Send us a message and we'll get back to you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-hidden rounded-lg border">
          <iframe 
            src="https://docs.google.com/forms/d/e/1FAIpQLSfFOwBcTuYQT8343m9be5lROPmWgMiGxtPULe4nA4GVChgmJw/viewform?embedded=true" 
            width="100%" 
            height="959" 
            frameBorder="0" 
            marginHeight={0} 
            marginWidth={0}
            className="w-full"
            title="Contact Form"
          >
            Loading…
          </iframe>
        </div>
      </CardContent>
    </Card>
  );
}