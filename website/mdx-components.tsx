import type { MDXComponents } from "mdx/types";
import { DocsLink } from "@/components/docs/docs-link";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold mt-8 mb-3 pb-2 border-b border-base-300">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold mt-6 mb-2">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-semibold mt-4 mb-1">{children}</h4>
    ),
    a: ({ children, href }) => (
      <DocsLink href={href}>{children}</DocsLink>
    ),
    code: ({ children }) => (
      <code className="bg-base-200 px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-base-200 p-4 rounded-lg mb-4 overflow-x-auto text-sm">
        {children}
      </pre>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 my-4 opacity-75 italic">
        {children}
      </blockquote>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="table table-zebra w-full">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className="bg-base-200 font-semibold">{children}</th>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
    hr: () => <hr className="my-6 border-base-300" />,
    ...components,
  };
}
