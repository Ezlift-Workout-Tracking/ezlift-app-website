import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Play, Dumbbell, ExternalLink, Download } from 'lucide-react';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FadeIn } from "@/components/animations/FadeIn";

import exerciseDataService from '../../../lib/services/exercise-data';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { RichTextRenderer } from '../../../components/blog/RichTextRenderer';

interface ExerciseDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ExerciseDetailPageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const exerciseResponse = await exerciseDataService.getExerciseBySlugOrId(resolvedParams.id);
    
    if (!exerciseResponse) {
      return {
        title: 'Exercise Not Found | EZLift',
        description: 'The requested exercise could not be found.',
      };
    }

    const { exercise } = exerciseResponse;
    const title = exercise.content?.title || exercise.name;
    const description = exercise.content?.seo_description || 
      `Learn how to perform ${exercise.name} with proper form. Target muscle: ${exercise.primaryMuscleGroup}`;

    return {
      title: `${title} | EZLift Exercise Library`,
      description,
      keywords: `${exercise.name}, ${exercise.primaryMuscleGroup}, ${exercise.exerciseType}, exercise, fitness, workout`,
      openGraph: {
        title,
        description,
        type: 'article',
        images: exercise.media?.imageUrl ? [
          {
            url: exercise.media?.imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Exercise | EZLift',
      description: 'Exercise details from EZLift.',
    };
  }
}

const ExerciseDetailPage: React.FC<ExerciseDetailPageProps> = async ({ params }) => {
  try {
    const resolvedParams = await params;
    const exerciseResponse = await exerciseDataService.getExerciseBySlugOrId(resolvedParams.id);
    
    if (!exerciseResponse) {
      notFound();
    }

    const { exercise } = exerciseResponse;
    const displayTitle = exercise.content?.title || exercise.name;
    const hasImage = exercise.media?.imageUrl && exercise.media?.imageExists;
    const hasVideo = exercise.media?.videoUrl && exercise.media?.videoExists;

    return (
      <>
        <Header hideMenu className="bg-gray-900 !bg-opacity-100 !backdrop-blur-none supports-[backdrop-filter]:bg-gray-900" />
        <div className="min-h-screen bg-gray-100 text-gray-900">
          <main className="flex-1 py-24">
            <div className="container px-4 mx-auto max-w-7xl">
              <div className="lg:grid lg:grid-cols-12 lg:gap-12">
                {/* Main Content - 70% on desktop */}
                <div className="lg:col-span-8">
                  <FadeIn>
                    {/* Back Button */}
                    <Link href="/exercise-library" className="inline-flex items-center gap-2 mb-8 text-gray-600 hover:text-gray-900 transition-colors">
                      <ChevronLeft className="h-4 w-4" />
                      Back to Exercise Library
                    </Link>

                    {/* Header Image Banner */}
                    {hasImage && (
                      <div className="relative w-full h-[400px] mb-12 rounded-2xl overflow-hidden shadow-2xl bg-gray-50">
                        <Image
                          src={exercise.media?.imageUrl || ''}
                          alt={exercise.name}
                          fill
                          className="object-contain"
                          priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        
                        {/* Title overlay on image */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{displayTitle}</h1>
                          {exercise.content?.author && (
                            <div className="flex items-center gap-4 text-white/90">
                              <div className="flex items-center gap-2">
                                <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white/20">
                                  <Image
                                    src={exercise.content.author.avatar}
                                    alt={exercise.content.author.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <span className="text-white/90 text-sm font-medium">{exercise.content.author.name}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Content without image header (fallback) */}
                    {!hasImage && (
                      <header className="mb-12 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">{displayTitle}</h1>
                        {exercise.content?.author && (
                          <div className="flex items-center justify-center gap-4 text-gray-600">
                            <div className="flex items-center gap-2">
                              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                <Image
                                  src={exercise.content.author.avatar}
                                  alt={exercise.content.author.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <span className="text-gray-900 text-sm font-medium">{exercise.content.author.name}</span>
                            </div>
                          </div>
                        )}
                      </header>
                    )}

                    {/* Main Content */}
                    <article className="max-w-4xl mx-auto">
                      {/* Exercise Details */}
                      <Card className="mb-8 bg-white border-gray-200">
                        <CardHeader>
                          <CardTitle className="text-gray-900">Exercise Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-2">Primary Muscle Group</h3>
                              <p className="text-gray-700">{exercise.primaryMuscleGroup}</p>
                            </div>
                            
                            {exercise.otherMuscleGroups && exercise.otherMuscleGroups.length > 0 && (
                              <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Secondary Muscles</h3>
                                <p className="text-gray-700">{exercise.otherMuscleGroups.join(', ')}</p>
                              </div>
                            )}
                            
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-2">Exercise Type</h3>
                              <p className="text-gray-700">{exercise.exerciseType}</p>
                            </div>
                            
                            {exercise.force && (
                              <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Force Type</h3>
                                <p className="text-gray-700">{exercise.force}</p>
                              </div>
                            )}
                            
                            {exercise.level && (
                              <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Difficulty Level</h3>
                                <p className="text-gray-700">{exercise.level}</p>
                              </div>
                            )}
                            
                            {exercise.equipment && (
                              <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Equipment</h3>
                                <p className="text-gray-700">{exercise.equipment}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Rich Content from Contentful */}
                      {exercise.content?.rich_content && (
                        <div className="prose prose-lg prose-gray max-w-none text-gray-900 mb-8">
                          <RichTextRenderer content={exercise.content.rich_content} />
                        </div>
                      )}

                      {/* Video Section */}
                      {hasVideo && (
                        <Card className="mb-8 bg-white border-gray-200">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-gray-900">
                              <Play className="h-5 w-5" />
                              Instructional Video
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
                              <video
                                controls
                                className="w-full h-full object-cover"
                                src={exercise.media?.videoUrl || ''}
                                poster={exercise.media?.imageUrl || undefined}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </article>
                  </FadeIn>
                </div>

                {/* Sidebar - 30% on desktop */}
                <div className="lg:col-span-4 mt-12 lg:mt-0">
                  <div className="lg:sticky lg:top-24 space-y-6">
                    {/* App CTA - Copied from BlogSidebar */}
                    <Card className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 text-white border-0 shadow-xl">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Download className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-xl mb-3">Ready to Transform Your Fitness Journey?</h3>
                        <p className="text-white/80 mb-6 text-sm leading-relaxed">
                          Join thousands of users who are already achieving their goals with EZLift. 
                          Track your workouts, monitor progress, and reach new personal bests.
                        </p>
                        <div className="flex flex-col gap-3">
                          <Link 
                            href="https://apps.apple.com/de/app/ezlift-pro/id6737275723?l=en-GB"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-transform hover:scale-105 duration-200"
                          >
                            <Image
                              src="/app-store-badge.svg"
                              alt="Download on the App Store"
                              width={156}
                              height={52}
                              className="h-[48px] w-auto mx-auto"
                            />
                          </Link>
                          <Link
                            href="/android"
                            className="transition-transform hover:scale-105 duration-200"
                          >
                            <Image
                              src="/play-store-badge.svg"
                              alt="Get it on Google Play"
                              width={156}
                              height={52}
                              className="h-[48px] w-auto mx-auto"
                            />
                          </Link>
                        </div>
                      </div>
                    </Card>

                    {/* Author Info */}
                    {exercise.content?.author && (
                      <Card className="bg-white border-gray-200 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-gray-900">About the Author</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-start gap-4">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                              <Image
                                src={exercise.content.author.avatar}
                                alt={exercise.content.author.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1">{exercise.content.author.name}</h4>
                              {exercise.content.author.bio && (
                                <p className="text-sm text-gray-700 leading-relaxed">{exercise.content.author.bio}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Media Links */}
                    {(hasImage || hasVideo) && (
                      <Card className="bg-white border-gray-200">
                        <CardHeader>
                          <CardTitle className="text-gray-900">Media Resources</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {hasImage && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                asChild
                                className="w-full justify-start bg-white border-gray-300 text-gray-800 hover:bg-gray-50"
                              >
                                <a href={exercise.media?.imageUrl || ''} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View Full Image
                                </a>
                              </Button>
                            )}
                            {hasVideo && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                asChild
                                className="w-full justify-start bg-white border-gray-300 text-gray-800 hover:bg-gray-50"
                              >
                                <a href={exercise.media?.videoUrl || ''} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Download Video
                                </a>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
        <Footer />
      </>
    );
  } catch (error) {
    console.error('Error loading exercise:', error);
    
    return (
      <>
        <Header hideMenu className="bg-gray-900 !bg-opacity-100 !backdrop-blur-none supports-[backdrop-filter]:bg-gray-900" />
        <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900">
          <main className="flex-1 py-24">
            <div className="container px-4 mx-auto max-w-7xl">
              <div className="max-w-4xl mx-auto">
                <Alert variant="destructive">
                  <AlertDescription>
                    Failed to load exercise details. Please check your configuration and try again.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </main>
        </div>
        <Footer />
      </>
    );
  }
};

export default ExerciseDetailPage; 