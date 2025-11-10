'use client';

import { useEffect } from 'react';
import { Header } from "@/components/layout/Header";
import { FadeIn } from "@/components/animations/FadeIn";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.ezworks.ezlift';

/**
 * @deprecated This page is deprecated. The Android app is now available on Google Play Store.
 * This page now redirects to the Google Play Store.
 */
export default function AndroidWaitList() {
  useEffect(() => {
    // Automatically redirect to Google Play Store after 3 seconds
    const timer = setTimeout(() => {
      window.location.href = GOOGLE_PLAY_URL;
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Header hideMenu />
      <main className="flex-1 py-24">
        <div className="container px-4 mx-auto">
          <FadeIn>
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold">Great News! 🎉</h1>
                <p className="text-xl text-muted-foreground">
                  EZLift is now available on the Google Play Store!
                </p>
                <p className="text-muted-foreground">
                  You'll be redirected automatically in a few seconds...
                </p>
              </div>

              <div className="pt-6">
                <Button asChild size="lg">
                  <Link href={GOOGLE_PLAY_URL} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Go to Google Play Store Now
                  </Link>
                </Button>
              </div>

              <div className="pt-6">
                <Link 
                  href="/" 
                  className="text-sm text-muted-foreground hover:text-foreground underline"
                >
                  Return to homepage
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </main>
      <Footer />
    </>
  );
}
