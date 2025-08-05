/**
 * Environment Configuration for Exercise Library
 * 
 * Note: For static exports, all environment variables are baked in at build time.
 * Make sure all required variables are available during the build process.
 * 
 * Required environment variables:
 * - DATABASE_URL: PostgreSQL connection string
 * 
 * Optional environment variables:
 * - EZLIFT_AWS_ACCESS_KEY_ID: AWS access key (for S3 media)
 * - EZLIFT_AWS_SECRET_ACCESS_KEY: AWS secret key (for S3 media)
 * - EZLIFT_AWS_REGION: AWS region (e.g., us-east-1)
 * - EZLIFT_AWS_S3_BUCKET_NAME: S3 bucket for exercise media (images and videos)
 * - CONTENTFUL_SPACE_ID: Contentful space ID (for rich content)
 * - CONTENTFUL_ACCESS_TOKEN: Contentful access token (for rich content)
 * - CONTENTFUL_ENVIRONMENT: Contentful environment (default: master)
 */

// For static exports, check both process.env and the baked-in env values
const getEnvVar = (key: string, fallback = '') => {
  // In static exports, process.env might not be available at runtime
  // but the values should be baked in via next.config.js env property
  if (typeof window !== 'undefined') {
    // Client-side: use the baked-in values
    return process.env[key] || fallback;
  } else {
    // Server-side/build-time: use process.env directly
    return process.env[key] || fallback;
  }
};

export const config = {
  database: {
    url: getEnvVar('DATABASE_URL'),
  },
  aws: {
    accessKeyId: getEnvVar('EZLIFT_AWS_ACCESS_KEY_ID'),
    secretAccessKey: getEnvVar('EZLIFT_AWS_SECRET_ACCESS_KEY'),
    region: getEnvVar('EZLIFT_AWS_REGION', 'us-east-1'),
    s3: {
      bucketName: getEnvVar('EZLIFT_AWS_S3_BUCKET_NAME'),
      // Legacy support for separate buckets (deprecated)
      bucketImages: getEnvVar('AWS_S3_BUCKET_IMAGES'),
      bucketVideos: getEnvVar('AWS_S3_BUCKET_VIDEOS'),
    },
  },
  contentful: {
    spaceId: getEnvVar('CONTENTFUL_SPACE_ID'),
    accessToken: getEnvVar('CONTENTFUL_ACCESS_TOKEN'),
    previewAccessToken: getEnvVar('CONTENTFUL_PREVIEW_ACCESS_TOKEN'),
    environment: getEnvVar('CONTENTFUL_ENVIRONMENT', 'master'),
  },
};

export function validateEnvironment() {
  // Only DATABASE_URL is required - S3 and Contentful are optional
  const requiredVars = [
    'DATABASE_URL',
  ];

  const missing = requiredVars.filter(varName => !getEnvVar(varName));
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
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