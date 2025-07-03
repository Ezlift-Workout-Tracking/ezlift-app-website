"use client";

import { FadeIn } from "@/components/animations/FadeIn";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { RichTextRenderer } from "./RichTextRenderer";
import type { BlogPost } from "@/lib/contentful";

interface BlogPostContentProps {
  post: BlogPost;
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  const formattedDate = format(parseISO(post.publishDate), "MMMM d, yyyy", {
    weekStartsOn: 1,
    locale: undefined,
  });

  return (
    <FadeIn key={post.slug}>
      <article className="max-w-3xl mx-auto">
        <header className="mb-8">
          {post.coverImage && (
            <div className="mb-8">
              <Image
                src={post.coverImage}
                alt={post.title}
                width={1200}
                height={675}
                className="rounded-lg w-full h-auto"
                priority
              />
            </div>
          )}
          
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={post.author.image}
                  alt={post.author.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div>
                <p className="font-medium text-foreground">{post.author.name}</p>
                <p className="text-sm">{post.author.role}</p>
              </div>
            </div>
            <span>•</span>
            <time dateTime={post.publishDate}>{formattedDate}</time>
          </div>
        </header>

        <div className="text-gray-800 dark:text-gray-200">
          <RichTextRenderer content={post.content} />
        </div>
      </article>
    </FadeIn>
  );
}