'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FIELD_ACCENT } from '@/lib/beta-testers/constants';

/**
 * Calm markdown renderer for the field's doctrine pages. Styled to match the
 * field aesthetic without depending on the typography plugin.
 */
export function Markdown({ content }: { content: string }) {
  return (
    <div className="space-y-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h2 className="text-xl font-light text-zinc-100">{children}</h2>,
          h2: ({ children }) => <h3 className="mt-8 text-lg font-normal text-zinc-100">{children}</h3>,
          h3: ({ children }) => <h4 className="mt-6 text-base font-medium text-zinc-200">{children}</h4>,
          p: ({ children }) => <p className="text-[15px] leading-relaxed text-zinc-400">{children}</p>,
          ul: ({ children }) => <ul className="space-y-2">{children}</ul>,
          li: ({ children }) => (
            <li className="flex items-start gap-3 text-[15px] text-zinc-300">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
              <span>{children}</span>
            </li>
          ),
          strong: ({ children }) => <strong className="font-medium text-zinc-100">{children}</strong>,
          em: ({ children }) => <em className="text-zinc-500">{children}</em>,
          a: ({ href, children }) => (
            <a href={href} className="underline" style={{ color: FIELD_ACCENT }}>
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 pl-4 text-zinc-400" style={{ borderColor: `${FIELD_ACCENT}55` }}>
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-white/10" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
