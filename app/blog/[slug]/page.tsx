import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BlogPostContent } from "@/components/blog/BlogPostContent";
import { notFound } from "next/navigation";
import { getAllBlogPostSlugs, getBlogPostBySlug } from "@/lib/contentful";
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
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <Header hideMenu />
      {/* Light theme wrapper for blog post */}
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <main className="flex-1 py-24">
          <div className="container px-4 mx-auto">
            <BlogPostContent post={post} />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}