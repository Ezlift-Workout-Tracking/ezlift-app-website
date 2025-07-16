/**
 * Exercise data types for the Exercise Library
 * Updated to match production database schema
 */

// Production Database Exercise Schema (READ-ONLY)
export interface DatabaseExercise {
  id: string; // UUID
  name: string; // NOT NULL
  primaryMuscleGroup: string; // NOT NULL - camelCase
  i18n: any; // JSONB - internationalization data
  aliases: string[]; // ARRAY - alternative names
  otherMuscleGroups: string[]; // ARRAY - secondary muscle groups
  category: string | null; // exercise category
  level: string | null; // difficulty level (Beginner, Intermediate, Advanced, Expert)
  mechanic: string | null; // Compound, Isolation, Static
  force: string | null; // Push, Pull, Static
  image: Buffer | null; // BYTEA - binary image data
  exerciseType: string; // NOT NULL - type of exercise
  equipment: string; // NOT NULL - required equipment
  userId: string | null; // for user-created exercises
}

// S3 Media Assets (if S3 integration is used)
export interface ExerciseMedia {
  imageUrl: string | null;
  videoUrl: string | null;
  imageExists: boolean;
  videoExists: boolean;
}

// Author information from Contentful
export interface BlogAuthor {
  name: string;
  slug: string;
  bio: string;
  avatar: string;
}

// Contentful Exercise Content (using the transformed version from contentful.ts)
export interface ContentfulExerciseContent {
  id: string;
  exercise_id: string;
  title?: string;
  slug?: string; // URL slug for the exercise
  rich_content?: any; // Rich text content from Contentful
  cover_image?: string; // URL of the cover image
  seo_title?: string;
  seo_description?: string;
  author?: BlogAuthor; // Author information from Contentful
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// Combined Exercise Data (with optional external data)
export interface Exercise extends DatabaseExercise {
  media?: ExerciseMedia; // Optional S3 media
  content?: ContentfulExerciseContent; // Optional Contentful content
}

// API Response Types
export interface ExerciseListResponse {
  exercises: Exercise[];
  total: number;
  page: number;
  limit: number;
}

export interface ExerciseDetailResponse {
  exercise: Exercise;
}

// Search and Filter Types (updated to match production schema)
export interface ExerciseFilters {
  search?: string; // Search in name and aliases
  exerciseType?: string; // Production field name
  primaryMuscleGroup?: string; // Production field name
  otherMuscleGroups?: string; // Filter by secondary muscle groups
  force?: 'Push' | 'Pull' | 'Static'; // Production values
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'; // Production values
  category?: string; // Production field
  equipment?: string; // Production field
  mechanic?: 'Compound' | 'Isolation' | 'Static'; // Production values
  userId?: string; // Filter user-created exercises
}

export interface ExerciseSearchParams {
  filters: ExerciseFilters;
  page: number;
  limit: number;
}

// Filter Options (updated to match production data)
export interface FilterOptions {
  primaryMuscleGroups: string[]; // All unique primary muscle groups
  exerciseTypes: string[]; // All unique exercise types
  levels: string[]; // All unique difficulty levels
  forces: string[]; // All unique force types
  categories: string[]; // All unique categories
  equipment: string[]; // All unique equipment types
  mechanics: string[]; // All unique mechanics
}

// Error handling
export interface ExerciseError {
  code: string;
  message: string;
  details?: any;
}

// Exercise Statistics
export interface ExerciseStats {
  total: number;
  byExerciseType: Record<string, number>;
  byPrimaryMuscleGroup: Record<string, number>;
  byLevel: Record<string, number>;
  byForce: Record<string, number>;
  byCategory: Record<string, number>;
  byEquipment: Record<string, number>;
  withImages: number;
  userCreated: number;
} 