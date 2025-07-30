import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../config/environment';
import { ExerciseMedia } from '../../types/exercise';

class S3Service {
  private s3Client: S3Client;
  
  constructor() {
    this.s3Client = new S3Client({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    });
  }

  // Check if an object exists in S3
  private async objectExists(bucket: string, key: string): Promise<boolean> {
    try {
      await this.s3Client.send(new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      }));
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      // Log other errors but don't throw - treat as file not found
      console.error(`S3 error checking ${bucket}/${key}:`, error);
      return false;
    }
  }

  // Generate a signed S3 URL for an object
  private async generateS3Url(bucket: string, key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    
    // Generate signed URL with 1 hour expiration
    return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  // Get media URLs for an exercise by its UUID
  async getExerciseMedia(exerciseId: string): Promise<ExerciseMedia> {
    const bucket = config.aws.s3.bucketName;
    
    if (!bucket) {
      return {
        imageUrl: null,
        videoUrl: null,
        imageExists: false,
        videoExists: false,
      };
    }

    const imageKey = `images/${exerciseId}.png`;
    const videoKeys = [
      `videos/${exerciseId}.mp4`,
      `videos/${exerciseId}.gif`
    ];
    
    // Check if image exists
    const imageExists = await this.objectExists(bucket, imageKey);
    
    // Check for video with different extensions
    let videoUrl: string | null = null;
    let videoExists = false;
    
    for (const videoKey of videoKeys) {
      const exists = await this.objectExists(bucket, videoKey);
      if (exists) {
        videoUrl = await this.generateS3Url(bucket, videoKey);
        videoExists = true;
        break;
      }
    }

    return {
      imageUrl: imageExists ? await this.generateS3Url(bucket, imageKey) : null,
      videoUrl,
      imageExists,
      videoExists,
    };
  }

  // Get media for multiple exercises
  async getMultipleExerciseMedia(exerciseIds: string[]): Promise<Map<string, ExerciseMedia>> {
    const mediaMap = new Map<string, ExerciseMedia>();
    
    // Process in batches to avoid overwhelming S3
    const batchSize = 10;
    for (let i = 0; i < exerciseIds.length; i += batchSize) {
      const batch = exerciseIds.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (id) => {
        const media = await this.getExerciseMedia(id);
        return [id, media] as [string, ExerciseMedia];
      });
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(([id, media]) => {
        mediaMap.set(id, media);
      });
    }
    
    return mediaMap;
  }

  // Get placeholder image URL
  getPlaceholderImageUrl(): string {
    return '/images/exercise-placeholder.svg';
  }

  // Test S3 connection
  async testConnection(): Promise<boolean> {
    try {
      const bucket = config.aws.s3.bucketName;
      if (!bucket) {
        return false;
      }

      // Try to access a test object in the bucket
      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: 'test-connection', // This key doesn't need to exist
      });
      
      await this.s3Client.send(command);
      return true;
    } catch (error: any) {
      // If we get a 404, that means we can connect but the file doesn't exist
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return true;
      }
      console.error('S3 connection test error:', error);
      return false;
    }
  }

  // Alternative method with more file format support (legacy support)
  async getExerciseMediaWithMultipleFormats(exerciseId: string): Promise<ExerciseMedia> {
    const bucket = config.aws.s3.bucketName;
    
    if (!bucket) {
      return {
        imageUrl: null,
        videoUrl: null,
        imageExists: false,
        videoExists: false,
      };
    }

    const imageExtensions = ['png', 'jpg', 'jpeg', 'webp'];
    const videoExtensions = ['mp4', 'gif', 'mov', 'avi'];

    let imageUrl: string | null = null;
    let videoUrl: string | null = null;
    let imageExists = false;
    let videoExists = false;

    // Check for image with different extensions in images folder
    for (const ext of imageExtensions) {
      const key = `images/${exerciseId}.${ext}`;
      const exists = await this.objectExists(bucket, key);
      if (exists) {
        imageUrl = await this.generateS3Url(bucket, key);
        imageExists = true;
        break;
      }
    }

    // Check for video with different extensions in videos folder
    for (const ext of videoExtensions) {
      const key = `videos/${exerciseId}.${ext}`;
      const exists = await this.objectExists(bucket, key);
      if (exists) {
        videoUrl = await this.generateS3Url(bucket, key);
        videoExists = true;
        break;
      }
    }

    return {
      imageUrl,
      videoUrl,
      imageExists,
      videoExists,
    };
  }
}

export default new S3Service(); 