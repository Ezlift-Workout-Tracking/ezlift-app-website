import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BlogPostContent } from "@/components/blog/BlogPostContent";
import { notFound } from "next/navigation";
import { blogPosts } from "@/lib/data/blog";

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function BlogPost({ params, searchParams }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((post) => post.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <Header hideMenu />
      <main className="flex-1 py-24">
        <div className="container px-4 mx-auto">
          <BlogPostContent post={post} />
        </div>
      </main>
      <Footer />
    </>
  );
}