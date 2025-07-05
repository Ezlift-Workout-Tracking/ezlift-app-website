import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { ArrowRight } from "lucide-react";
import type { BlogPost } from "@/lib/contentful";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const formattedDate = format(parseISO(post.publishDate), "MMMM d, yyyy");

  return (
    <Card className="group bg-white border-gray-200 hover:shadow-xl transition-all duration-300 shadow-md rounded-xl overflow-hidden h-full flex flex-col">
      <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
        {/* Featured Image */}
        {post.coverImage && (
          <div className="relative overflow-hidden h-48">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 p-6 flex flex-col">
          {/* Header */}
          <header className="mb-4">
            <h2 className="text-xl font-bold mb-3 text-gray-900 leading-tight group-hover:text-gray-800 transition-colors line-clamp-2">
              {post.title}
            </h2>
            
            {/* Author & Date */}
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-2">
                <div className="relative w-6 h-6 rounded-full overflow-hidden">
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="font-medium">{post.author.name}</span>
              </div>
              <span className="text-gray-400">•</span>
              <time dateTime={post.publishDate}>{formattedDate}</time>
            </div>
          </header>
          
          {/* Excerpt */}
          <p className="text-gray-700 leading-relaxed mb-6 flex-1 line-clamp-3">
            {post.excerpt}
          </p>
          
          {/* Read More Button */}
          <div className="mt-auto">
            <Button 
              className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 group-hover:bg-gray-700 shadow-sm hover:shadow-md w-full sm:w-auto"
            >
              Read More
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>
        </div>
      </Link>
    </Card>
  );
}