"use client";

import { FadeIn } from "@/components/animations/FadeIn";
import ReactMarkdown from "react-markdown";
import { Components } from "react-markdown";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { BlogPost } from "@/types/blog";
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { cn } from "@/lib/utils";
import React from "react";

const customComponents: Partial<Components> = {
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl font-semibold mt-8 mb-4">{children}</h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>
  ),
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
    // Check if the paragraph contains only an image
    if (React.isValidElement(children) && (children.type === 'img' || children.type === Image)) {
      return children;
    }
    
    // Check if children is an array and contains only an image
    if (Array.isArray(children) && children.length === 1 && 
        React.isValidElement(children[0]) && 
        (children[0].type === 'img' || children[0].type === Image)) {
      return children;
    }

    // For all other cases, render as a paragraph
    return <p className="mb-4 leading-relaxed">{children}</p>;
  },
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mb-6 ml-6 space-y-2 list-disc" {...props} />
  ),
  ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => (
    <ol className="mb-6 ml-6 space-y-2 list-decimal" {...props} />
  ),
  li: (props: React.LiHTMLAttributes<HTMLLIElement>) => {
    const content = React.Children.map(props.children, child => {
      if (React.isValidElement(child) && child.type === 'p') {
        return child.props.children;
      }
      return child;
    });
    return <li className="leading-relaxed">{content}</li>;
  },
  blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 my-4 italic" {...props} />
  ),
  code: ({ inline, className, children, ...props }: any) => {
    return !inline ? (
      <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto mb-4">
        <code className={cn("block", className)} {...props}>
          {children}
        </code>
      </pre>
    ) : (
      <code className="bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    );
  },
  img: ({ src, alt }: { src?: string; alt?: string }) => (
    <div className="my-6">
      <Image
        src={src || ''}
        alt={alt || ''}
        width={1200}
        height={675}
        className="rounded-lg"
        priority
      />
    </div>
  ),
  iframe: (props: any) => (
    <div className="relative aspect-video my-6">
      <iframe
        {...props}
        className="absolute inset-0 w-full h-full rounded-lg"
        style={{ border: 'none' }}
      />
    </div>
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold">{props.children}</strong>
  ),
};

const processContent = (content: string) => {
  return content
    .trim()
    .replace(/>\s+</g, '><')
    .replace(/^\s+/gm, '')
    .replace(/\n\s*\n/g, '\n\n')
    .replace(/(\*\*.*?\*\*)/g, match => match.trim());
};

export function BlogPostContent({ post }: { post: BlogPost }) {
  const formattedDate = format(parseISO(post.date), "MMMM d, yyyy", {
    weekStartsOn: 1, // Ensure consistent week start
    locale: undefined // Use default locale to avoid locale-specific formatting
  });
  
  return (
    <FadeIn key={post.slug}>
      <article className="max-w-3xl mx-auto">
        <header className="mb-8">
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
            <time dateTime={post.date}>{formattedDate}</time>
          </div>
        </header>

        <div className="markdown-content text-gray-800 dark:text-gray-200">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={customComponents}
          >
            {processContent(post.content)}
          </ReactMarkdown>
        </div>
      </article>
    </FadeIn>
  );
}