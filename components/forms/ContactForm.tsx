"use client";

import type React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

export function ContactForm() {
  return (
    <Card className="w-full max-w-4xl mx-auto p-0 ">
      <CardContent className="p-0">
        <div className="w-full overflow-hidden rounded-lg border p-0">
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