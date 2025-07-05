import { createClient } from 'contentful';
import { Document } from '@contentful/rich-text-types';

// Contentful client configuration
const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID! || "m0q6glsfsko5",
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN! || "RfjMR3puy8VANK1CsXpNff-dpCWnFN8qxZiP-HRwQjI",
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
    avatar: avatarUrl || '/team/default-avatar.webp', // Now using the proper default avatar
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

// Fetch a single blog post by slug
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const response = await client.getEntries<any>({
      content_type: 'blog',
      'fields.slug': slug,
      include: 10, // Increase to maximum to include all linked assets
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

// Get all blog post slugs for static generation
export async function getAllBlogPostSlugs(): Promise<string[]> {
  try {
    const response = await client.getEntries<any>({
      content_type: 'blog',
      select: ['fields.slug'],
    });

    return response.items.map((item: any) => item.fields.slug);
  } catch (error) {
    console.error('Error fetching blog post slugs:', error);
    return [];
  }
}

// Preview mode helper (for draft content)
export async function getPreviewBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const previewClient = createClient({
      space: process.env.CONTENTFUL_SPACE_ID!,
      accessToken: process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN!,
      host: 'preview.contentful.com',
    });

    const response = await previewClient.getEntries<any>({
      content_type: 'blog',
      'fields.slug': slug,
      include: 2,
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