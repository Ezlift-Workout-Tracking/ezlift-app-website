"use client";

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { Document, BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';

interface RichTextRendererProps {
  content: Document;
}

// Custom rendering options for rich text
const renderOptions = {
  renderMark: {
    [MARKS.BOLD]: (text: ReactNode) => <strong className="font-semibold">{text}</strong>,
    [MARKS.ITALIC]: (text: ReactNode) => <em className="italic">{text}</em>,
    [MARKS.UNDERLINE]: (text: ReactNode) => <u className="underline">{text}</u>,
    [MARKS.CODE]: (text: ReactNode) => (
      <code className="bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded text-sm font-mono">
        {text}
      </code>
    ),
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: any, children: ReactNode) => {
      // Check if the paragraph contains only an embedded asset (image)
      if (
        node.content.length === 1 &&
        node.content[0].nodeType === BLOCKS.EMBEDDED_ASSET
      ) {
        return <div className="my-6">{children}</div>;
      }
      return <p className="mb-4 leading-relaxed">{children}</p>;
    },
    [BLOCKS.HEADING_1]: (node: any, children: ReactNode) => (
      <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (node: any, children: ReactNode) => (
      <h2 className="text-2xl font-semibold mt-8 mb-4">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (node: any, children: ReactNode) => (
      <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>
    ),
    [BLOCKS.HEADING_4]: (node: any, children: ReactNode) => (
      <h4 className="text-lg font-semibold mt-4 mb-2">{children}</h4>
    ),
    [BLOCKS.HEADING_5]: (node: any, children: ReactNode) => (
      <h5 className="text-base font-semibold mt-4 mb-2">{children}</h5>
    ),
    [BLOCKS.HEADING_6]: (node: any, children: ReactNode) => (
      <h6 className="text-sm font-semibold mt-4 mb-2">{children}</h6>
    ),
    [BLOCKS.UL_LIST]: (node: any, children: ReactNode) => (
      <ul className="mb-6 ml-6 space-y-2 list-disc">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node: any, children: ReactNode) => (
      <ol className="mb-6 ml-6 space-y-2 list-decimal">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (node: any, children: ReactNode) => (
      <li className="leading-relaxed">{children}</li>
    ),
    [BLOCKS.QUOTE]: (node: any, children: ReactNode) => (
      <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 my-4 italic">
        {children}
      </blockquote>
    ),
    [BLOCKS.HR]: () => <hr className="my-8 border-gray-300 dark:border-gray-700" />,
    [BLOCKS.TABLE]: (node: any, children: ReactNode) => (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full border border-gray-300 dark:border-gray-700">
          <tbody>
            {children}
          </tbody>
        </table>
      </div>
    ),
    [BLOCKS.TABLE_HEADER_CELL]: (node: any, children: ReactNode) => (
      <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-800 font-semibold text-left">
        {children}
      </th>
    ),
    [BLOCKS.TABLE_CELL]: (node: any, children: ReactNode) => (
      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
        {children}
      </td>
    ),
    [BLOCKS.TABLE_ROW]: (node: any, children: ReactNode) => (
      <tr>{children}</tr>
    ),
    [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
      const { target } = node.data;
      if (!target?.fields?.file) return null;

      const { file, title } = target.fields;
      const imageUrl = file.url.startsWith('//') ? `https:${file.url}` : file.url;

      return (
        <div className="my-6">
          <Image
            src={imageUrl}
            alt={title || 'Blog image'}
            width={file.details?.image?.width || 800}
            height={file.details?.image?.height || 600}
            className="rounded-lg w-full h-auto"
            priority={false}
          />
        </div>
      );
    },
    [INLINES.HYPERLINK]: (node: any, children: ReactNode) => {
      const { uri } = node.data;
      const isExternal = uri.startsWith('http') && !uri.includes('ezlift.app');
      
      return (
        <Link
          href={uri}
          className="text-primary hover:underline"
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
        >
          {children}
        </Link>
      );
    },
    [INLINES.ENTRY_HYPERLINK]: (node: any, children: ReactNode) => {
      // Handle links to other Contentful entries
      const { target } = node.data;
      if (target?.fields?.slug) {
        return (
          <Link href={`/blog/${target.fields.slug}`} className="text-primary hover:underline">
            {children}
          </Link>
        );
      }
      return <span>{children}</span>;
    },
    [INLINES.ASSET_HYPERLINK]: (node: any, children: ReactNode) => {
      // Handle links to Contentful assets
      const { target } = node.data;
      if (target?.fields?.file?.url) {
        const url = target.fields.file.url.startsWith('//')
          ? `https:${target.fields.file.url}`
          : target.fields.file.url;
        return (
          <Link
            href={url}
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </Link>
        );
      }
      return <span>{children}</span>;
    },
  },
};

export function RichTextRenderer({ content }: RichTextRendererProps) {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none">
      {documentToReactComponents(content, renderOptions)}
    </div>
  );
}