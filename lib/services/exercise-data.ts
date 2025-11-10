import databaseService from './database';
import { isS3Configured, isContentfulConfigured } from '../config/environment';
import { DEFAULT_PAGE_SIZE } from '../constants/pagination';
import {
  Exercise,
  ExerciseFilters,
  ExerciseListResponse,
  ExerciseDetailResponse,
  FilterOptions,
} from '../../types/exercise';

// Optional S3 and Contentful imports - only use if configured
let s3Service: any = null;
let getExerciseContentByExerciseId: any = null;
let getMultipleExerciseContents: any = null;

// Try to import S3 service if configured
if (isS3Configured()) {
  try {
    s3Service = require('./s3').default;
    console.log('✅ S3 service loaded for exercise media');
  } catch (error) {
    console.log('⚠️ S3 service not available despite configuration');
  }
} else {
  console.log('ℹ️ S3 not configured - exercise media will not be available');
}

// Try to import Contentful service if configured (or use defaults)
if (isContentfulConfigured()) {
  try {
    const contentful = require('../contentful');
    getExerciseContentByExerciseId = contentful.getExerciseContentByExerciseId;
    getMultipleExerciseContents = contentful.getMultipleExerciseContents;
    console.log('✅ Contentful service loaded for exercise content');
  } catch (error) {
    console.log('⚠️ Contentful service not available despite configuration');
  }
} else {
  // Try to load with defaults (existing blog setup)
  try {
    const contentful = require('../contentful');
    getExerciseContentByExerciseId = contentful.getExerciseContentByExerciseId;
    getMultipleExerciseContents = contentful.getMultipleExerciseContents;
    console.log('✅ Contentful service loaded with default credentials');
  } catch (error) {
    console.log('ℹ️ Contentful service not available - rich content will not be available');
  }
}

class ExerciseDataService {
  // Get exercises with all data sources combined
  async getExercises(
    filters: ExerciseFilters = {},
    page: number = 1,
    limit: number = DEFAULT_PAGE_SIZE
  ): Promise<ExerciseListResponse> {
    try {
      // Fetch exercises from database (always available)
      const { exercises: dbExercises, total } = await databaseService.getExercises(
        filters,
        page,
        limit
      );

      if (dbExercises.length === 0) {
        return {
          exercises: [],
          total: 0,
          page,
          limit,
        };
      }

      // Convert database exercises to Exercise type
      const exercises: Exercise[] = dbExercises.map(dbExercise => {
        const exercise: Exercise = {
          ...dbExercise,
        };

        // Add media placeholder if S3 is not configured
        if (!s3Service) {
          exercise.media = {
            imageUrl: null,
            videoUrl: null,
            imageExists: false,
            videoExists: false,
          };
        }

        return exercise;
      });

      // Optionally fetch external data if services are available
      if (s3Service || getMultipleExerciseContents) {
        const exerciseIds = dbExercises.map(exercise => exercise.id);
        
        // Fetch media and content in parallel if available
        const promises: Promise<any>[] = [];
        
        if (s3Service) {
          promises.push(s3Service.getMultipleExerciseMedia(exerciseIds));
        } else {
          promises.push(Promise.resolve(new Map()));
        }

        if (getMultipleExerciseContents) {
          console.log(`[ExerciseData] Fetching Contentful content for ${exerciseIds.length} exercises`);
          promises.push(getMultipleExerciseContents(exerciseIds));
        } else {
          console.log('[ExerciseData] Contentful service not available, skipping content loading');
          promises.push(Promise.resolve(new Map()));
        }

        const [mediaMap, contentMap] = await Promise.all(promises);
        
        console.log(`[ExerciseData] Received ${contentMap.size} Contentful entries`);

        // Enhance exercises with external data
        exercises.forEach(exercise => {
          if (s3Service && mediaMap.has(exercise.id)) {
            exercise.media = mediaMap.get(exercise.id);
          }

          if (getMultipleExerciseContents && contentMap.has(exercise.id)) {
            const contentfulContent = contentMap.get(exercise.id);
            exercise.content = {
              id: contentfulContent.id,
              exercise_id: contentfulContent.exercise_id,
              title: contentfulContent.title,
              slug: contentfulContent.slug,
              rich_content: contentfulContent.rich_content,
              cover_image: contentfulContent.cover_image,
              seo_title: contentfulContent.seo_title,
              seo_description: contentfulContent.seo_description,
              author: contentfulContent.author,
              published: contentfulContent.published,
              createdAt: contentfulContent.createdAt,
              updatedAt: contentfulContent.updatedAt,
            };
          }
        });
      }

      return {
        exercises,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error fetching exercises:', error);
      console.log('⚠️ Database unavailable, returning empty results');
      return {
        exercises: [],
        total: 0,
        page,
        limit,
      };
    }
  }

  // Get single exercise by ID with all data sources
  async getExerciseById(id: string): Promise<ExerciseDetailResponse | null> {
    try {
      // Fetch exercise from database
      const dbExercise = await databaseService.getExerciseById(id);
      
      if (!dbExercise) {
        return null;
      }

      const exercise: Exercise = {
        ...dbExercise,
      };

      // Optionally fetch external data if services are available
      const promises: Promise<any>[] = [];
      
      if (s3Service) {
        promises.push(s3Service.getExerciseMedia(id));
      } else {
        promises.push(Promise.resolve({
          imageUrl: null,
          videoUrl: null,
          imageExists: false,
          videoExists: false,
        }));
      }

      if (getExerciseContentByExerciseId) {
        promises.push(getExerciseContentByExerciseId(id));
      } else {
        promises.push(Promise.resolve(null));
      }

      const [media, content] = await Promise.all(promises);

      exercise.media = media;

      if (content) {
        exercise.content = {
          id: content.id,
          exercise_id: content.exercise_id,
          title: content.title,
          slug: content.slug,
          rich_content: content.rich_content,
          cover_image: content.cover_image,
          seo_title: content.seo_title,
          seo_description: content.seo_description,
          author: content.author,
          published: content.published,
          createdAt: content.createdAt,
          updatedAt: content.updatedAt,
        };
      }

      return { exercise };
    } catch (error) {
      console.error(`Error fetching exercise with ID ${id}:`, error);
      console.log('⚠️ Database unavailable, returning null');
      return null;
    }
  }

  // Get single exercise by slug (from Contentful) or ID (from database)
  async getExerciseBySlugOrId(slugOrId: string): Promise<ExerciseDetailResponse | null> {
    try {
      // First, try to get exercise content by slug from Contentful
      let exerciseId = slugOrId;
      let contentfulContent = null;
      
      if (typeof require !== 'undefined') {
        try {
          const contentful = require('../contentful');
          if (contentful.getExerciseContentBySlug) {
            contentfulContent = await contentful.getExerciseContentBySlug(slugOrId);
            if (contentfulContent) {
              exerciseId = contentfulContent.exercise_id;
            }
          }
        } catch (error) {
          console.log('Contentful service not available for slug lookup');
        }
      }

      // If no content found by slug, try direct ID lookup
      if (!contentfulContent) {
        // Try to get exercise by ID directly (slugOrId is actually an ID)
        return await this.getExerciseById(slugOrId);
      }

      // If we found content by slug, get the exercise by the mapped ID
      const dbExercise = await databaseService.getExerciseById(exerciseId);
      
      if (!dbExercise) {
        return null;
      }

      const exercise: Exercise = {
        ...dbExercise,
      };

      // Optionally fetch external data if services are available
      const promises: Promise<any>[] = [];
      
      if (s3Service) {
        promises.push(s3Service.getExerciseMedia(exerciseId));
      } else {
        promises.push(Promise.resolve({
          imageUrl: null,
          videoUrl: null,
          imageExists: false,
          videoExists: false,
        }));
      }

      // We already have the content from the slug lookup
      promises.push(Promise.resolve(contentfulContent));

      const [media, content] = await Promise.all(promises);

      exercise.media = media;

      if (content) {
        exercise.content = {
          id: content.id,
          exercise_id: content.exercise_id,
          title: content.title,
          slug: content.slug,
          rich_content: content.rich_content,
          cover_image: content.cover_image,
          seo_title: content.seo_title,
          seo_description: content.seo_description,
          author: content.author,
          published: content.published,
          createdAt: content.createdAt,
          updatedAt: content.updatedAt,
        };
      }

      return { exercise };
    } catch (error) {
      console.error(`Error fetching exercise with slug or ID ${slugOrId}:`, error);
      console.log('⚠️ Database unavailable, returning null');
      return null;
    }
  }

  // Get filter options for the UI
  async getFilterOptions(): Promise<FilterOptions> {
    try {
      return await databaseService.getFilterOptions();
    } catch (error) {
      console.error('Error fetching filter options:', error);
      console.log('⚠️ Database unavailable, returning empty filter options');
      return {
        primaryMuscleGroups: [],
        exerciseTypes: [],
        levels: [],
        forces: [],
        categories: [],
        equipment: [],
        mechanics: [],
      };
    }
  }

  // Search exercises by name and aliases
  async searchExercises(
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ExerciseListResponse> {
    const filters: ExerciseFilters = {
      search: query,
    };

    return this.getExercises(filters, page, limit);
  }

  // Get exercises by primary muscle group
  async getExercisesByMuscleGroup(
    muscleGroup: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ExerciseListResponse> {
    const filters: ExerciseFilters = {
      primaryMuscleGroup: muscleGroup,
    };

    return this.getExercises(filters, page, limit);
  }

  // Get exercises by type
  async getExercisesByType(
    exerciseType: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ExerciseListResponse> {
    const filters: ExerciseFilters = {
      exerciseType,
    };

    return this.getExercises(filters, page, limit);
  }

  // Get exercises by force/movement pattern
  async getExercisesByForce(
    force: 'Push' | 'Pull' | 'Static',
    page: number = 1,
    limit: number = 20
  ): Promise<ExerciseListResponse> {
    const filters: ExerciseFilters = {
      force,
    };

    return this.getExercises(filters, page, limit);
  }

  // Get user-created exercises
  async getUserCreatedExercises(
    page: number = 1,
    limit: number = 20
  ): Promise<ExerciseListResponse> {
    try {
      const { exercises: dbExercises, total } = await databaseService.getUserCreatedExercises(
        page,
        limit
      );

      const exercises: Exercise[] = dbExercises.map(dbExercise => ({
        ...dbExercise,
        media: {
          imageUrl: null,
          videoUrl: null,
          imageExists: false,
          videoExists: false,
        },
      }));

      return {
        exercises,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error fetching user-created exercises:', error);
      throw new Error('Failed to fetch user-created exercises');
    }
  }

  // Get placeholder image URL
  getPlaceholderImageUrl(): string {
    return '/images/exercise-placeholder.svg';
  }

  // Test all data source connections
  async testConnections(): Promise<{
    database: boolean;
    s3: boolean;
    contentful: boolean;
  }> {
    try {
      const results = await Promise.all([
        databaseService.testConnection(),
        s3Service ? s3Service.testConnection() : Promise.resolve(false),
        getMultipleExerciseContents ? 
          getMultipleExerciseContents([]).then(() => true).catch(() => false) : 
          Promise.resolve(false),
      ]);

      return {
        database: results[0],
        s3: results[1],
        contentful: results[2],
      };
    } catch (error) {
      console.error('Error testing connections:', error);
      return {
        database: false,
        s3: false,
        contentful: false,
      };
    }
  }

  // Get exercise statistics
  async getExerciseStats() {
    try {
      return await databaseService.getExerciseStats();
    } catch (error) {
      console.error('Error getting exercise stats:', error);
      throw new Error('Failed to get exercise statistics');
    }
  }

  // Get service status
  getServiceStatus(): {
    database: boolean;
    s3: boolean;
    contentful: boolean;
  } {
    return {
      database: true, // Always available
      s3: !!s3Service,
      contentful: !!getMultipleExerciseContents,
    };
  }
}

export default new ExerciseDataService(); 