/**
 * Environment Configuration for Exercise Library
 * 
 * Required environment variables:
 * - DATABASE_URL: PostgreSQL connection string
 * 
 * Optional environment variables:
 * - AWS_ACCESS_KEY_ID: AWS access key (for S3 media)
 * - AWS_SECRET_ACCESS_KEY: AWS secret key (for S3 media)
 * - AWS_REGION: AWS region (e.g., us-east-1)
 * - AWS_S3_BUCKET_NAME: S3 bucket for exercise media (images and videos)
 * - CONTENTFUL_SPACE_ID: Contentful space ID (for rich content)
 * - CONTENTFUL_ACCESS_TOKEN: Contentful access token (for rich content)
 * - CONTENTFUL_ENVIRONMENT: Contentful environment (default: master)
 */

export const config = {
  database: {
    url: process.env.DATABASE_URL || '',
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    s3: {
      bucketName: process.env.AWS_S3_BUCKET_NAME || '',
      // Legacy support for separate buckets (deprecated)
      bucketImages: process.env.AWS_S3_BUCKET_IMAGES || '',
      bucketVideos: process.env.AWS_S3_BUCKET_VIDEOS || '',
    },
  },
  contentful: {
    spaceId: process.env.CONTENTFUL_SPACE_ID, // Default from existing blog setup
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || '', // Default from existing blog setup
    previewAccessToken: process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN || '',
    environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
  },
};

export function validateEnvironment() {
  // Only DATABASE_URL is required - S3 and Contentful are optional
  const requiredVars = [
    'DATABASE_URL',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Check if S3 is configured
export function isS3Configured(): boolean {
  return !!(config.aws.accessKeyId && config.aws.secretAccessKey && config.aws.region && config.aws.s3.bucketName);
}

// Check if Contentful is configured
export function isContentfulConfigured(): boolean {
  return !!(config.contentful.spaceId && config.contentful.accessToken);
} 