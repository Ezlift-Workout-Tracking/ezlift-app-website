import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BlogPostContent } from "@/components/blog/BlogPostContent";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { notFound } from "next/navigation";
import { getAllBlogPostSlugs, getBlogPostBySlug, getAllBlogPosts } from "@/lib/contentful";
import type { Metadata } from "next";

export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  const slugs = await getAllBlogPostSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found",
      description: "The requested article could not be found.",
    };
  }

  return {
    title: `${post.title} | EZLift Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishDate,
      authors: [post.author.name],
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([
    getBlogPostBySlug(slug),
    getAllBlogPosts()
  ]);

  if (!post) {
    notFound();
  }

  // Get related posts (excluding current post)
  const relatedPosts = allPosts
    .filter(p => p.id !== post.id)
    .slice(0, 3);

  return (
    <>
      <Header hideMenu />
      {/* Light theme wrapper for blog post */}
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <main className="flex-1 py-24">
          <div className="container px-4 mx-auto max-w-7xl">
            <div className="lg:grid lg:grid-cols-12 lg:gap-12">
              {/* Main Content - 70% on desktop */}
              <div className="lg:col-span-8">
                <BlogPostContent post={post} />
              </div>
              
              {/* Sidebar - 30% on desktop, full width on mobile */}
              <div className="lg:col-span-4 mt-12 lg:mt-0">
                <div className="lg:sticky lg:top-24">
                  <BlogSidebar 
                    currentPost={post} 
                    relatedPosts={relatedPosts}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}