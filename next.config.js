/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // For static export to ./out directory
  trailingSlash: true,
  images: {
    unoptimized: true, // Required for static export
  },
  
  // Environment variables available to the application
  env: {
    CONTENTFUL_SPACE_ID: process.env.CONTENTFUL_SPACE_ID,
    CONTENTFUL_ACCESS_TOKEN: process.env.CONTENTFUL_ACCESS_TOKEN,
    DATABASE_URL: process.env.DATABASE_URL,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
  },

  // Webpack configuration for better error handling
  webpack: (config, { dev, isServer }) => {
    if (dev && isServer) {
      // Validate environment variables during development
      const requiredEnvVars = [
        'CONTENTFUL_SPACE_ID',
        'CONTENTFUL_ACCESS_TOKEN',
        'DATABASE_URL',
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'AWS_REGION',
        'AWS_S3_BUCKET_NAME'
      ];

      const missingVars = requiredEnvVars.filter(
        varName => !process.env[varName] || process.env[varName].trim() === ''
      );

      if (missingVars.length > 0) {
        console.error('\n🚨 Missing required environment variables:');
        missingVars.forEach(varName => console.error(`  - ${varName}`));
        console.error('\n💡 Add these to your .env.local file\n');
      }
    }
    
    return config;
  },
};

module.exports = nextConfig;