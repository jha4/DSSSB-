import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Check, Copy } from 'lucide-react';
import { slugifyHeading } from '../utils/markdownHelpers';

interface MarkdownRendererProps {
  content: string;
  fontSize?: 'sm' | 'md' | 'lg';
}

function flattenChildrenText(children: React.ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(flattenChildrenText).join('');
  }
  if (React.isValidElement<{ children?: React.ReactNode }>(children)) {
    return flattenChildrenText(children.props.children);
  }
  return '';
}

const PreBlock: React.FC<React.HTMLAttributes<HTMLPreElement>> = ({
  children,
  ...props
}) => {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    const text = preRef.current?.textContent ?? '';
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard fallback ignored
    }
  };

  return (
    <div className="group relative my-4">
      <button
        type="button"
        onClick={handleCopyCode}
        aria-label="Copy code block"
        className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white/90 px-2 py-1 text-xs font-medium text-slate-600 opacity-90 transition-opacity hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:text-white"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            <span>Copy</span>
          </>
        )}
      </button>
      <pre ref={preRef} {...props}>
        {children}
      </pre>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  fontSize = 'md',
}) => {
  const slugCounts = new Map<string, number>();

  const makeHeadingId = (children: React.ReactNode): string => {
    const base = slugifyHeading(flattenChildrenText(children)) || 'section';
    const seen = slugCounts.get(base) ?? 0;
    slugCounts.set(base, seen + 1);
    return seen === 0 ? base : `${base}-${seen}`;
  };

  const sizeClass =
    fontSize === 'sm'
      ? 'text-[14px]'
      : fontSize === 'lg'
        ? 'text-[17px]'
        : 'text-[15.5px]';

  if (!content.trim()) {
    return (
      <p className="text-sm italic text-slate-400 dark:text-slate-500">
        No Markdown content added yet.
      </p>
    );
  }

  return (
    <div className={`markdown-body ${sizeClass}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children, ...props }) => (
            <h1 id={makeHeadingId(children)} {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 id={makeHeadingId(children)} {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 id={makeHeadingId(children)} {...props}>
              {children}
            </h3>
          ),
          pre: PreBlock,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
