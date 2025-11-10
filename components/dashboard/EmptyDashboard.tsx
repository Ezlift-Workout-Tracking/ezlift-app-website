/**
 * Empty Dashboard Component
 * 
 * Displayed for new users with no workout data.
 * Provides CTAs to start tracking.
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export function EmptyDashboard() {
  return (
    <Card className="col-span-full">
      <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <TrendingUp className="h-16 w-16 text-muted-foreground mb-6" />
        
        <h2 className="text-section-header text-text-primary mb-2">
          Start Your Fitness Journey
        </h2>
        
        <p className="text-base text-text-secondary mb-8 max-w-md">
          Track your first workout to see personalized analytics, progress charts, 
          and performance insights.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="bg-brand-orange hover:bg-[#E55F00]">
            <a 
              href="https://apps.apple.com/de/app/ezlift-pro/id6737275723?l=en-GB"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Mobile App
            </a>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/app/import">
              <Upload className="mr-2 h-4 w-4" />
              Import Workout History
            </Link>
          </Button>
        </div>

        <p className="text-sm text-text-secondary mt-8">
          Your dashboard will come alive with insights once you start tracking
        </p>
      </CardContent>
    </Card>
  );
}



