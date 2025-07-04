import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import type { BlogPost } from "@/lib/contentful";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const formattedDate = format(parseISO(post.publishDate), "MMMM d, yyyy");

  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="p-6 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm">
        <article className="flex flex-col md:flex-row gap-6">
          {post.coverImage && (
            <div className="md:w-48 md:flex-shrink-0">
              <Image
                src={post.coverImage}
                alt={post.title}
                width={192}
                height={128}
                className="rounded-lg w-full h-32 md:h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex-1">
            <header className="mb-4">
              <h2 className="text-2xl font-bold mb-2 text-gray-900 hover:text-blue-600 transition-colors">
                {post.title}
              </h2>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src={post.author.image}
                      alt={post.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span>{post.author.name}</span>
                </div>
                <span>•</span>
                <time dateTime={post.publishDate}>{formattedDate}</time>
              </div>
            </header>
            <p className="text-gray-700 leading-relaxed">{post.excerpt}</p>
          </div>
        </article>
      </Card>
    </Link>
  );
}