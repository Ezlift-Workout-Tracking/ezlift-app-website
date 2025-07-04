"use client";

import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { 
  Download,
  ExternalLink,
  Clock,
  User
} from "lucide-react";
import type { BlogPost } from "@/lib/contentful";

interface BlogSidebarProps {
  currentPost: BlogPost;
  relatedPosts?: BlogPost[];
}

export function BlogSidebar({ currentPost, relatedPosts = [] }: BlogSidebarProps) {

  return (
    <div className="space-y-8">


      {/* App CTA */}
      <Card className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 text-white border-0 shadow-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-xl mb-3">Ready to Transform Your Fitness Journey?</h3>
          <p className="text-white/80 mb-6 text-sm leading-relaxed">
            Join thousands of users who are already achieving their goals with EZLift. 
            Track your workouts, monitor progress, and reach new personal bests.
          </p>
          <div className="flex flex-col gap-3">
            <Link 
              href="https://apps.apple.com/de/app/ezlift-pro/id6737275723?l=en-GB"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105 duration-200"
            >
              <Image
                src="/app-store-badge.svg"
                alt="Download on the App Store"
                width={156}
                height={52}
                className="h-[48px] w-auto mx-auto"
              />
            </Link>
            <Link
              href="/android"
              className="transition-transform hover:scale-105 duration-200"
            >
              <Image
                src="/play-store-badge.svg"
                alt="Get it on Google Play"
                width={156}
                height={52}
                className="h-[48px] w-auto mx-auto"
              />
            </Link>
          </div>
        </div>
      </Card>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <Card className="p-6 bg-white border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Related Articles</h3>
          <div className="space-y-4">
            {relatedPosts.slice(0, 3).map((post) => (
              <Link 
                key={post.id} 
                href={`/blog/${post.slug}`}
                className="block group"
              >
                <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  {post.coverImage && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 group-hover:text-gray-700 line-clamp-2 leading-tight">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <User className="w-3 h-3" />
                      <span>{post.author.name}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{new Date(post.publishDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Author Info */}
      <Card className="p-6 bg-white border-gray-200 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">About the Author</h3>
        <div className="flex items-start gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={currentPost.author.avatar}
              alt={currentPost.author.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">{currentPost.author.name}</h4>
            {currentPost.author.bio && (
              <p className="text-sm text-gray-700 leading-relaxed">{currentPost.author.bio}</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
} 