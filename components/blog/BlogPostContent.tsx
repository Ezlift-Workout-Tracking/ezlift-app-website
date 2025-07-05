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
      {/* Header Image Banner */}
      {post.coverImage && (
        <div className="relative w-full h-[400px] mb-12 rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Title overlay on image */}
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{post.title}</h1>
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-white">{post.author.name}</p>
                  {post.author.bio && <p className="text-sm text-white/80 line-clamp-1">{post.author.bio}</p>}
                </div>
              </div>
              <span className="text-white/60">•</span>
              <time dateTime={post.publishDate} className="text-white/90">{formattedDate}</time>
            </div>
          </div>
        </div>
      )}

      {/* Content without image header (fallback) */}
      {!post.coverImage && (
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">{post.title}</h1>
          <div className="flex items-center justify-center gap-4 text-gray-600">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{post.author.name}</p>
                {post.author.bio && <p className="text-sm text-gray-600 line-clamp-1">{post.author.bio}</p>}
              </div>
            </div>
            <span>•</span>
            <time dateTime={post.publishDate}>{formattedDate}</time>
          </div>
        </header>
      )}

      <article className="max-w-4xl mx-auto">
        {/* Article Content */}
        <div className="prose prose-lg prose-gray max-w-none text-gray-900">
          <RichTextRenderer content={post.content} />
        </div>
        
        {/* Share Section */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-6">If you liked this article, share it with others</p>
            <div className="flex justify-center gap-4">
              <a
                href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&media=${encodeURIComponent(post.coverImage || '')}&description=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white hover:bg-red-700 transition-colors"
                aria-label="Share on Pinterest"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.374 0 12c0 5.115 3.189 9.491 7.691 11.234-.109-.95-.206-2.405.044-3.442.225-.93 1.448-6.133 1.448-6.133s-.37-.74-.37-1.833c0-1.717.994-2.999 2.233-2.999 1.052 0 1.56.79 1.56 1.737 0 1.058-.674 2.64-1.022 4.106-.29 1.228.616 2.23 1.83 2.23 2.196 0 3.884-2.316 3.884-5.658 0-2.96-2.128-5.028-5.17-5.028-3.523 0-5.592 2.644-5.592 5.377 0 1.065.41 2.205.923 2.827.101.123.116.23.085.355-.093.39-.302 1.226-.343 1.396-.054.225-.177.272-.408.164-1.51-.704-2.456-2.915-2.456-4.69 0-3.902 2.836-7.488 8.177-7.488 4.29 0 7.624 3.056 7.624 7.145 0 4.262-2.686 7.69-6.416 7.69-1.252 0-2.433-.651-2.837-1.427 0 0-.621 2.366-.772 2.946-.28 1.075-1.038 2.417-1.547 3.237C9.45 23.798 10.693 24 12 24c6.626 0 12-5.374 12-12C24 5.374 18.626 0 12 0z"/>
                </svg>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                aria-label="Share on Facebook"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white hover:bg-gray-800 transition-colors"
                aria-label="Share on X"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href={`https://reddit.com/submit?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&title=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center text-white hover:bg-orange-700 transition-colors"
                aria-label="Share on Reddit"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </article>
    </FadeIn>
  );
}