import { createClient } from 'contentful';
import { Document } from '@contentful/rich-text-types';

// Contentful client configuration
const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID! || " ",
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN! || " ",
});

// TypeScript interfaces for Contentful data
export interface ContentfulAsset {
  sys: {
    id: string;
  };
  fields: {
    title: string;
    file: {
      url: string;
      details: {
        size: number;
        image?: {
          width: number;
          height: number;
        };
      };
      fileName: string;
      contentType: string;
    };
  };
}

export interface ContentfulAuthor {
  sys: {
    id: string;
  };
  fields: {
    name: string;
    slug: string;
    bio: string;
    avatar?: ContentfulAsset;
  };
}

export interface ContentfulBlogPost {
  sys: {
    id: string;
    createdAt: string;
    updatedAt: string;
  };
  fields: {
    title: string;
    slug: string;
    author: ContentfulAuthor;
    publishDate: string;
    excerpt: string;
    content: Document;
    coverImage?: ContentfulAsset[]; // Cover image is an array of assets
  };
}

// Updated: Exercise-specific Contentful interfaces to match your content type
export interface ContentfulExercise {
  sys: {
    id: string;
    createdAt: string;
    updatedAt: string;
  };
  fields: {
    id: string; // This maps to the database exercise ID
    name: string; // Exercise name
    slug: string; // URL slug
    howTo?: Document; // Rich text content for instructions
    seoTitle?: string; // SEO title
    seoDescription?: string; // SEO description
    coverImage?: ContentfulAsset | ContentfulAsset[]; // Cover image
    author?: ContentfulAuthor; // Reference to author
  };
}

// Transformed interfaces for our application
export interface BlogAuthor {
  name: string;
  slug: string;
  bio: string;
  avatar: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author: BlogAuthor;
  publishDate: string;
  excerpt: string;
  content: Document;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

// Updated: Transformed Exercise Content for our application
export interface ExerciseContent {
  id: string;
  exercise_id: string; // Maps to the database exercise ID
  title: string; // Exercise name from Contentful
  slug: string; // URL slug
  rich_content?: Document; // How To instructions
  seo_title?: string; // SEO title
  seo_description?: string; // SEO description
  cover_image?: string; // Cover image URL
  author?: BlogAuthor; // Author information
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// Helper function to transform Contentful asset to URL
const getAssetUrl = (asset?: ContentfulAsset | ContentfulAsset[]): string => {
  // Handle array of assets - take the first one
  if (Array.isArray(asset)) {
    if (asset.length === 0) {
      return '';
    }
    asset = asset[0];
  }
  
  if (!asset?.fields?.file?.url) {
    return '';
  }
  
  const url = asset.fields.file.url.startsWith('//') 
    ? `https:${asset.fields.file.url}` 
    : asset.fields.file.url;
    
  return url;
};

// Helper function to transform Contentful author
const transformAuthor = (author?: ContentfulAuthor): BlogAuthor => {
  const avatarUrl = getAssetUrl(author?.fields?.avatar);
  
  return {
    name: author?.fields?.name || "Unknown Author",
    slug: author?.fields?.slug || "",
    bio: author?.fields?.bio || "",
    avatar: avatarUrl || '/team/default-avatar.webp',
  };
};

// Helper function to transform Contentful blog post
const transformBlogPost = (post: ContentfulBlogPost): BlogPost => {
  return {
    id: post.sys.id,
    title: post.fields.title,
    slug: post.fields.slug,
    author: transformAuthor(post.fields.author),
    publishDate: post.fields.publishDate,
    excerpt: post.fields.excerpt,
    content: post.fields.content,
    coverImage: getAssetUrl(post.fields.coverImage),
    createdAt: post.sys.createdAt,
    updatedAt: post.sys.updatedAt,
  };
};

// Updated: Helper function to transform Contentful exercise content
const transformExerciseContent = (content: ContentfulExercise): ExerciseContent => {
  return {
    id: content.sys.id,
    exercise_id: content.fields.id, // Maps to database exercise ID
    title: content.fields.name, // Exercise name
    slug: content.fields.slug,
    rich_content: content.fields.howTo, // How To instructions
    seo_title: content.fields.seoTitle,
    seo_description: content.fields.seoDescription,
    cover_image: content.fields.coverImage ? getAssetUrl(content.fields.coverImage) : undefined,
    author: content.fields.author ? transformAuthor(content.fields.author) : undefined,
    published: true, // All entries are considered published
    createdAt: content.sys.createdAt,
    updatedAt: content.sys.updatedAt,
  };
};

// Fetch all blog posts
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await client.getEntries<any>({
      content_type: 'blog',
      order: ['-fields.publishDate'],
      include: 10, // Increase to maximum to include all linked assets
    });

    return response.items.map((item: any) => transformBlogPost(item));
  } catch (error) {
    console.error('Error fetching blog posts from Contentful:', error);
    return [];
  }
}

// Fetch all blog post slugs for static generation
export async function getAllBlogPostSlugs(): Promise<string[]> {
  try {
    const response = await client.getEntries<any>({
      content_type: 'blog',
      order: ['-fields.publishDate'],
    });

    return response.items.map((item: any) => item.fields.slug).filter(Boolean);
  } catch (error) {
    console.error('Error fetching blog post slugs from Contentful:', error);
    return [];
  }
}

// Fetch a single blog post by slug
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const response = await client.getEntries<any>({
      content_type: 'blog',
      'fields.slug': slug,
      include: 10,
      limit: 1,
    });

    if (response.items.length === 0) {
      return null;
    }

    return transformBlogPost(response.items[0] as any);
  } catch (error) {
    console.error(`Error fetching blog post with slug "${slug}":`, error);
    return null;
  }
}

// Fetch all blog posts (for preview mode)
export async function getAllBlogPostsPreview(): Promise<BlogPost[]> {
  try {
    const previewClient = createClient({
      space: process.env.CONTENTFUL_SPACE_ID!,
      accessToken: process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN!,
      host: 'preview.contentful.com',
    });

    const response = await previewClient.getEntries<any>({
      content_type: 'blog',
      order: ['-fields.publishDate'],
      include: 10,
    });

    return response.items.map((item: any) => transformBlogPost(item));
  } catch (error) {
    console.error('Error fetching preview blog posts from Contentful:', error);
    return [];
  }
}

// Fetch a single blog post by slug (preview mode)
export async function getBlogPostBySlugPreview(slug: string): Promise<BlogPost | null> {
  try {
    const previewClient = createClient({
      space: process.env.CONTENTFUL_SPACE_ID!,
      accessToken: process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN!,
      host: 'preview.contentful.com',
    });

    const response = await previewClient.getEntries<any>({
      content_type: 'blog',
      'fields.slug': slug,
      include: 10,
      limit: 1,
    });

    if (response.items.length === 0) {
      return null;
    }

    return transformBlogPost(response.items[0] as any);
  } catch (error) {
    console.error(`Error fetching preview blog post with slug "${slug}":`, error);
    return null;
  }
}

// Updated: Exercise-specific Contentful functions

// Fetch exercise content by database exercise ID
export async function getExerciseContentByExerciseId(exerciseId: string): Promise<ExerciseContent | null> {
  try {
    const response = await client.getEntries<any>({
      content_type: 'exercise', // Your content type name
      'fields.id': exerciseId, // Maps to the database exercise ID
      include: 10,
      limit: 1,
    });

    if (response.items.length === 0) {
      return null;
    }

    return transformExerciseContent(response.items[0] as any);
  } catch (error) {
    console.error(`Error fetching exercise content for exercise ID "${exerciseId}":`, error);
    return null;
  }
}

// Fetch multiple exercise contents by database exercise IDs
export async function getMultipleExerciseContents(exerciseIds: string[]): Promise<Map<string, ExerciseContent>> {
  const contentMap = new Map<string, ExerciseContent>();
  
  if (exerciseIds.length === 0) {
    return contentMap;
  }

  try {
    const response = await client.getEntries<any>({
      content_type: 'exercise',
      'fields.id[in]': exerciseIds.join(','), // Maps to database exercise IDs
      include: 10,
      limit: 1000, // Adjust based on your needs
    });

    response.items.forEach((item: any) => {
      const content = transformExerciseContent(item);
      contentMap.set(content.exercise_id, content);
    });

    return contentMap;
  } catch (error) {
    console.error('Error fetching multiple exercise contents:', error);
    return contentMap;
  }
}

// Fetch all exercise content (for admin or preview purposes)
export async function getAllExerciseContents(): Promise<ExerciseContent[]> {
  try {
    const response = await client.getEntries<any>({
      content_type: 'exercise',
      include: 10,
      order: ['-sys.createdAt'],
    });

    return response.items.map((item: any) => transformExerciseContent(item));
  } catch (error) {
    console.error('Error fetching all exercise contents:', error);
    return [];
  }
}

// Fetch exercise content by slug
export async function getExerciseContentBySlug(slug: string): Promise<ExerciseContent | null> {
  try {
    const response = await client.getEntries<any>({
      content_type: 'exercise',
      'fields.slug': slug,
      include: 10,
      limit: 1,
    });

    if (response.items.length === 0) {
      return null;
    }

    return transformExerciseContent(response.items[0] as any);
  } catch (error) {
    console.error(`Error fetching exercise content with slug "${slug}":`, error);
    return null;
  }
}