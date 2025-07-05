import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BlogCard } from "@/components/cards/BlogCard";
import { FadeIn } from "@/components/animations/FadeIn";
import { getAllBlogPosts } from "@/lib/contentful";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText } from "lucide-react";

export const revalidate = 3600; // Revalidate every hour

export default async function Blog() {
  const posts = await getAllBlogPosts();

  return (
    <>
      <Header hideMenu />
      {/* Light theme wrapper for blog section */}
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <main className="flex-1 py-24">
          <div className="container px-4 mx-auto max-w-7xl">
            <FadeIn>
              <div className="max-w-3xl mx-auto text-center mb-16">
                <h1 className="text-5xl font-bold mb-6 text-gray-900">Latest Articles</h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Discover tips, guides, and insights about strength training and fitness.
                </p>
              </div>
            </FadeIn>

            {posts.length > 0 ? (
              <div className="container max-w-6xl mx-auto">
                <div className="grid gap-8 justify-center" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 380px))' }}>
                  {posts.map((post, index) => (
                    <FadeIn key={post.id} delay={index * 100}>
                      <BlogCard post={post} />
                    </FadeIn>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <EmptyState
                  icon={<FileText className="w-12 h-12 text-gray-400" />}
                  title="No Articles Found"
                  description="We're working on creating great content for you. Check back soon for fitness tips and insights!"
                />
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}