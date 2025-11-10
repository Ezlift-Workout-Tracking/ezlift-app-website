import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Dumbbell } from "lucide-react";
import { useState, useEffect } from "react";
import type { Exercise } from "@/types/exercise";

interface ExerciseCardProps {
  exercise: Exercise;
}

export default function ExerciseCard({ exercise }: ExerciseCardProps) {
  const imageUrl = exercise.media?.imageUrl || '';
  const hasImage = Boolean(imageUrl && exercise.media?.imageExists);
  
  // Check if exercise already has Contentful data (from SSR or previous fetch)
  const [contentfulData, setContentfulData] = useState<{ title?: string; slug?: string } | null>(
    exercise.content ? { title: exercise.content.title, slug: exercise.content.slug } : null
  );
  
  useEffect(() => {
    // If we don't have Contentful data yet and exercise doesn't have content, try to fetch it
    if (!contentfulData && !exercise.content) {
      let isMounted = true;
      
      const fetchContentfulData = async () => {
        try {
          const response = await fetch(`/api/exercises/${exercise.id}/content`);
          if (response.ok) {
            const data = await response.json();
            if (isMounted && data) {
              setContentfulData({ title: data.title, slug: data.slug });
            }
          }
        } catch (error) {
          // Silently fail - just use database name
          console.debug('No Contentful data for exercise:', exercise.id);
        }
      };
      
      fetchContentfulData();
      
      return () => {
        isMounted = false;
      };
    }
  }, [exercise.id, exercise.content, contentfulData]);
  
  // Use Contentful title if available, otherwise fallback to database name
  const displayTitle = contentfulData?.title || exercise.content?.title || exercise.name;
  
  // Use Contentful slug if available, otherwise fallback to database ID
  const linkUrl = contentfulData?.slug || exercise.content?.slug
    ? `/exercise-library/${contentfulData?.slug || exercise.content?.slug}` 
    : `/exercise-library/${exercise.id}`;

  return (
    <Card className="group bg-white border-gray-200 hover:shadow-xl transition-shadow duration-200 shadow-md rounded-xl overflow-hidden h-full flex flex-col">
      <Link href={linkUrl} className="flex flex-col h-full">
        {/* Exercise Image */}
        <div className="relative overflow-hidden h-48 bg-gray-50">
          {hasImage ? (
            <Image
              src={imageUrl}
              alt={displayTitle}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-200">
              <Dumbbell className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 p-6 flex flex-col">
          {/* Header */}
          <header className="mb-4">
            <h2 className="text-xl font-bold mb-3 text-gray-900 leading-tight group-hover:text-gray-800 transition-colors line-clamp-2">
              {displayTitle}
            </h2>
            
            {/* Exercise Metadata */}
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center">
                  <Dumbbell className="w-3 h-3 text-white" />
                </div>
                <span className="font-medium">{exercise.primaryMuscleGroup}</span>
              </div>
              <span className="text-gray-400">•</span>
              <span>{exercise.exerciseType}</span>
            </div>
          </header>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="text-xs bg-gray-800 text-white">
              {exercise.primaryMuscleGroup}
            </Badge>
            {exercise.force && (
              <Badge variant="outline" className="text-xs bg-white border-gray-300 text-gray-700">
                {exercise.force}
              </Badge>
            )}
            {exercise.level && (
              <Badge variant="outline" className="text-xs bg-white border-gray-300 text-gray-700">
                {exercise.level}
              </Badge>
            )}
          </div>
          
          {/* Description */}
          <div className="text-gray-700 leading-relaxed mb-6 flex-1 line-clamp-3">
            <p className="line-clamp-3">
              {exercise.content?.seo_description || `Learn proper form and technique for ${displayTitle}. Target your ${exercise.primaryMuscleGroup} with this effective exercise.`}
            </p>
          </div>
          
          {/* View Details Button */}
          <div className="mt-auto">
            <Button 
              className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md w-full sm:w-auto"
            >
              View Details
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </Link>
    </Card>
  );
} 